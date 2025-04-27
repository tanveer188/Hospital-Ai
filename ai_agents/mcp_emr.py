from mcp.server.fastmcp import FastMCP
import psycopg2
from psycopg2.extras import DictCursor  # Use DictCursor for easier column access
from datetime import datetime, date, timedelta
import uuid
from typing import List, Dict, Optional, Union, Any
import json  # Import json for handling potential JSON data if needed

mcp = FastMCP("EMRService")

# Define allowed record types based on schema
ALLOWED_RECORD_TYPES = [
    'consultation', 'lab_result', 'imaging', 'prescription',
    'vaccination', 'surgery', 'allergy', 'chronic_condition'
]


def get_db_connection():
    """Establishes a database connection and returns connection and cursor."""
    conn = psycopg2.connect(
        dbname="hospital_db",
        user="admin1",
        password="root",
        host="localhost",
        port=5433  # Added port
    )
    # Use DictCursor to get results as dictionaries
    return conn, conn.cursor(cursor_factory=DictCursor)


def serialize_datetime(obj: Any) -> str:
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))


def get_patient_id_by_name(patient_name: str) -> Optional[int]:
    """Helper function to get patient ID from full name, first name, or last name."""
    conn, cursor = get_db_connection()
    patient_id = None
    try:
        # Split the name for potential first/last name search
        name_parts = patient_name.split()
        first_name_guess = name_parts[0] if name_parts else ''
        last_name_guess = name_parts[-1] if len(name_parts) > 1 else ''

        cursor.execute(
            """
            SELECT p.patient_id
            FROM patients p
            JOIN users u ON p.user_id = u.user_id
            WHERE u.role = 'patient' AND (
                u.first_name ILIKE %s OR
                u.last_name ILIKE %s OR
                u.first_name || ' ' || u.last_name ILIKE %s
            )
            LIMIT 1; -- Assuming name uniquely identifies a patient for simplicity
            """,
            (f"%{first_name_guess}%", f"%{last_name_guess}%", f"%{patient_name}%")
        )
        result = cursor.fetchone()
        patient_id = result['patient_id'] if result else None
    except psycopg2.Error as e:
        print(f"Database error in get_patient_id_by_name: {e}")
    finally:
        cursor.close()
        conn.close()
    return patient_id


@mcp.tool()
async def get_emr_record(record_id: int) -> Dict:
    """Fetch a specific EMR record by its ID, including basic patient info and creator username."""
    conn, cursor = get_db_connection()
    record_data = {}
    try:
        cursor.execute(
            """
            SELECT
                r.record_id, r.patient_id, r.created_by, r.record_type, r.record_date,
                r.title, r.description, r.is_sensitive, r.created_at, r.updated_at,
                p_user.first_name AS patient_first_name,
                p_user.last_name AS patient_last_name,
                p_user.date_of_birth AS patient_dob,
                p_user.gender AS patient_gender,
                creator.username AS created_by_username
            FROM emrrecords r
            JOIN patients p ON r.patient_id = p.patient_id
            JOIN users p_user ON p.user_id = p_user.user_id
            LEFT JOIN users creator ON r.created_by = creator.user_id
            WHERE r.record_id = %s
            """, [record_id]
        )
        row = cursor.fetchone()
        if row:
            record_data = dict(row)  # Convert DictRow to dict
            # Serialize datetime objects
            for key, value in record_data.items():
                if isinstance(value, (datetime, date)):
                    record_data[key] = value.isoformat()
        else:
            record_data = {"error": f"EMR Record with ID {record_id} not found."}

    except psycopg2.Error as e:
        print(f"Database error in get_emr_record: {e}")
        record_data = {"error": "Database error occurred."}
    finally:
        cursor.close()
        conn.close()
    return record_data


@mcp.tool()
async def list_emr_records(patient_name: str, record_type: Optional[str] = None) -> List[Dict]:
    """List EMR records for a patient (found by name), optionally filtered by type."""
    patient_id = get_patient_id_by_name(patient_name)
    if not patient_id:
        return [{"error": f"Patient matching '{patient_name}' not found"}]

    conn, cursor = get_db_connection()
    records_list = []
    try:
        base_query = """
            SELECT r.record_id, r.record_type, r.title, r.record_date,
                   creator.username AS created_by_username
            FROM emrrecords r
            LEFT JOIN users creator ON r.created_by = creator.user_id
            WHERE r.patient_id = %s
        """
        params = [patient_id]

        if record_type:
            if record_type in ALLOWED_RECORD_TYPES:
                base_query += " AND r.record_type = %s"
                params.append(record_type)
            else:
                return [{"error": f"Invalid record_type '{record_type}'. Allowed types: {ALLOWED_RECORD_TYPES}"}]

        base_query += " ORDER BY r.record_date DESC"
        cursor.execute(base_query, params)

        for row in cursor.fetchall():
            record = dict(row)
            # Serialize datetime objects
            for key, value in record.items():
                if isinstance(value, (datetime, date)):
                    record[key] = value.isoformat()
            records_list.append(record)

    except psycopg2.Error as e:
        print(f"Database error in list_emr_records: {e}")
        return [{"error": "Database error occurred."}]
    finally:
        cursor.close()
        conn.close()
    return records_list


@mcp.tool()
async def get_patient_complete_emr(patient_name: str) -> Dict:
    """Get complete EMR history for a patient (found by name) including demographics, all records, medications, allergies, and conditions."""
    patient_id = get_patient_id_by_name(patient_name)
    if not patient_id:
        return {"error": f"Patient matching '{patient_name}' not found"}

    conn, cursor = get_db_connection()
    result = {
        "patient_info": {},
        "emr_records": [],
        "medications": [],
        "allergies": [],
        "chronic_conditions": []
        # Note: Lab results are typically part of emrrecords with type 'lab_result'
    }

    try:
        # --- 1. Get Patient Information (Users and Patients tables) ---
        cursor.execute("""
            SELECT
                u.user_id, u.first_name, u.last_name, u.date_of_birth, u.gender,
                u.phone, u.alternate_phone, u.email, u.street, u.city, u.state,
                u.zip_code, u.country, u.username, u.role, u.is_active,
                u.account_created, u.profile_picture_url,
                p.patient_id, p.blood_type, p.preferred_language
            FROM users u
            JOIN patients p ON u.user_id = p.user_id
            WHERE p.patient_id = %s;
        """, (patient_id,))
        patient_info_raw = cursor.fetchone()
        if not patient_info_raw:
            # Should not happen if patient_id was found, but good practice
            return {"error": "Patient details not found after ID lookup."}
        result["patient_info"] = dict(patient_info_raw)

        # --- 2. Get EMR Records (with creator username) ---
        cursor.execute(
            """
            SELECT
                r.record_id, r.created_by, r.record_type, r.record_date,
                r.title, r.description, r.is_sensitive, r.created_at, r.updated_at,
                creator.username AS created_by_username
            FROM emrrecords r
            LEFT JOIN users creator ON r.created_by = creator.user_id
            WHERE r.patient_id = %s
            ORDER BY r.record_date DESC
            """, [patient_id]
        )
        for row in cursor.fetchall():
            result["emr_records"].append(dict(row))

        # --- 3. Get Medications (with prescriber name if available) ---
        cursor.execute(
            """
            SELECT
                m.medication_id, m.name, m.dosage, m.frequency, m.start_date, m.end_date,
                m.notes, m.created_at, m.prescribed_by as prescribed_by_doctor_id,
                doc_user.first_name as prescriber_first_name,
                doc_user.last_name as prescriber_last_name
            FROM patientmedications m
            LEFT JOIN doctors doc ON m.prescribed_by = doc.doctor_id
            LEFT JOIN users doc_user ON doc.user_id = doc_user.user_id
            WHERE m.patient_id = %s
            ORDER BY m.start_date DESC
            """, [patient_id]
        )
        for row in cursor.fetchall():
            result["medications"].append(dict(row))

        # --- 4. Get Allergies ---
        cursor.execute("""
            SELECT allergy_id, name, severity, reaction, created_at
            FROM patientallergies
            WHERE patient_id = %s;
        """, (patient_id,))
        for row in cursor.fetchall():
            result["allergies"].append(dict(row))

        # --- 5. Get Chronic Conditions ---
        cursor.execute("""
            SELECT condition_id, condition_name, diagnosed_date, notes, created_at
            FROM patientchronicconditions
            WHERE patient_id = %s;
        """, (patient_id,))
        for row in cursor.fetchall():
            result["chronic_conditions"].append(dict(row))

        # Serialize all date/datetime objects before returning
        return json.loads(json.dumps(result, default=serialize_datetime))

    except psycopg2.Error as e:
        print(f"Database error in get_patient_complete_emr: {e}")
        return {"error": "Database error occurred while fetching complete EMR."}
    finally:
        cursor.close()
        conn.close()


if __name__ == "__main__":
    # Initialize and run the MCP server
    print("Starting MCP EMR Service...")
    mcp.run(transport='stdio')