from mcp.server.fastmcp import FastMCP
import psycopg2
from psycopg2.extras import DictCursor
from datetime import datetime, timedelta, date
import uuid
from typing import List, Dict, Optional, Union, Any
import json

mcp = FastMCP("hospitalMCP")

# Database connection function
def get_db_connection():
    """Establishes a database connection and returns connection and cursor."""
    conn = psycopg2.connect(
        dbname="hospital_db",
        user="admin1",
        password="root",
        host="localhost",
        port=5433
    )
    return conn, conn.cursor(cursor_factory=DictCursor)

def serialize_datetime(obj: Any) -> str:
    """JSON serializer for objects not serializable by default json code"""
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError("Type %s not serializable" % type(obj))

@mcp.tool()
async def find_doctor_slots(doctor_name: str, date: Optional[str] = None) -> List[Dict]:
    """Find the next 5-7 available time slots for a doctor by name, starting from now.

    Args:
        doctor_name: The name of the doctor (first name, last name, or partial name).
        date: This argument is ignored. The function always finds the next available slots from the current time.

    Returns:
        List of the next 5-7 available time slots with their IDs, doctor details, and times.
        Returns an empty list or a message if no upcoming slots are found.
    """
    conn, cursor = get_db_connection()
    doctor_slots = []
    limit = 7 # Number of upcoming slots to return
    try:
        # First find the doctor(s) by name (joining with users table)
        cursor.execute("""
            SELECT d.doctor_id, u.first_name, u.last_name, d.specialization
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            WHERE u.first_name ILIKE %s OR u.last_name ILIKE %s OR
                  u.first_name || ' ' || u.last_name ILIKE %s
        """, [f"%{doctor_name}%", f"%{doctor_name}%", f"%{doctor_name}%"])

        doctors = cursor.fetchall()
        if not doctors:
            return [{"error": f"No doctors found matching name '{doctor_name}'"}]

        # Collect slots for all matching doctors, sort them, and take the earliest ones
        all_possible_slots = []
        for doctor in doctors:
            doctor_id = doctor['doctor_id']
            first_name = doctor['first_name']
            last_name = doctor['last_name']
            specialty = doctor['specialization']

            # Query for available slots starting from the current timestamp
            query = """
            SELECT slot_id, start_time, end_time
            FROM time_slots
            WHERE doctor_id = %s
              AND is_available = TRUE
              AND start_time >= CURRENT_TIMESTAMP -- Find slots from now onwards
            ORDER BY start_time
            LIMIT %s; -- Limit per doctor initially to optimize, will re-limit later
            """
            params = [doctor_id, limit]

            cursor.execute(query, params)

            for slot in cursor.fetchall():
                start_time = slot['start_time']
                end_time = slot['end_time']
                all_possible_slots.append({
                    "slot_id": str(slot['slot_id']),
                    "doctor_id": str(doctor_id),
                    "doctor_name": f"{first_name} {last_name}",
                    "specialty": specialty,
                    "date": start_time.strftime('%Y-%m-%d'),
                    "start_time": start_time.strftime('%H:%M'),
                    "end_time": end_time.strftime('%H:%M'),
                    "full_start_time": start_time.isoformat(),
                    "full_end_time": end_time.isoformat(),
                    "_sort_key": start_time # Add key for sorting
                })

        # Sort all collected slots by start time and take the top 'limit'
        all_possible_slots.sort(key=lambda x: x['_sort_key'])
        doctor_slots = all_possible_slots[:limit]

        # Remove the temporary sort key
        for slot in doctor_slots:
            del slot['_sort_key']

        if not doctor_slots:
             # Updated message for no upcoming slots
             return [{"message": f"No upcoming available slots found for doctors matching '{doctor_name}'."}]

        return doctor_slots

    except psycopg2.Error as e:
        print(f"Database error in find_doctor_slots: {e}")
        return [{"error": "Database error occurred."}]
    finally:
        cursor.close()
        conn.close()

@mcp.tool()
async def check_slot_availability(doctor_name: str, appointment_date: str, appointment_time: str) -> Dict:
    """Check if a specific time slot is available and suggest alternatives if not.

    Args:
        doctor_name: The name of the doctor (first name, last name, or partial name)
        appointment_date: Date in format YYYY-MM-DD
        appointment_time: Time in format HH:MM

    Returns:
        Dictionary with availability status and alternative slots if needed
    """
    conn, cursor = get_db_connection()

    try:
        # First find the doctor by name (joining with users table)
        cursor.execute("""
            SELECT d.doctor_id
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            WHERE u.first_name ILIKE %s OR u.last_name ILIKE %s OR
                  u.first_name || ' ' || u.last_name ILIKE %s
            LIMIT 1;
        """, [f"%{doctor_name}%", f"%{doctor_name}%", f"%{doctor_name}%"])

        doctor_result = cursor.fetchone()
        if not doctor_result:
            return {"available": False, "message": f"Doctor matching '{doctor_name}' not found", "alternatives": []}

        doctor_id = doctor_result['doctor_id']

        # Parse the target date and time
        try:
            if ":" not in appointment_time:
                 return {"available": False, "message": "Invalid time format. Please use HH:MM", "alternatives": []}
            target_datetime = datetime.strptime(f"{appointment_date} {appointment_time}", '%Y-%m-%d %H:%M')
        except ValueError:
            return {"available": False, "message": "Invalid date or time format. Use YYYY-MM-DD and HH:MM", "alternatives": []}

        # Find if there's an available slot exactly at the requested time
        cursor.execute("""
            SELECT slot_id, start_time, end_time
            FROM time_slots
            WHERE doctor_id = %s
            AND is_available = TRUE
            AND start_time = %s
        """, [
            doctor_id,
            target_datetime
        ])

        result = cursor.fetchone()

        if result:
            start_time = result['start_time']
            end_time = result['end_time']
            return {
                "available": True,
                "slot_id": str(result['slot_id']),
                "message": "Slot is available",
                "date": start_time.strftime('%Y-%m-%d'),
                "start_time": start_time.strftime('%H:%M'),
                "end_time": end_time.strftime('%H:%M')
            }

        # If no exact slot available, find alternatives on the same day or later
        cursor.execute("""
            SELECT slot_id, start_time, end_time
            FROM time_slots
            WHERE doctor_id = %s
            AND is_available = TRUE
            AND start_time >= %s
            ORDER BY start_time
            LIMIT 5
        """, [doctor_id, target_datetime])

        alternatives = []
        for alt_slot in cursor.fetchall():
            alt_start = alt_slot['start_time']
            alt_end = alt_slot['end_time']
            alternatives.append({
                "slot_id": str(alt_slot['slot_id']),
                "date": alt_start.strftime('%Y-%m-%d'),
                "start_time": alt_start.strftime('%H:%M'),
                "end_time": alt_end.strftime('%H:%M'),
                "full_start_time": alt_start.isoformat(),
                "full_end_time": alt_end.isoformat()
            })

        return {
            "available": False,
            "message": f"No available slot at {appointment_time} on {appointment_date}. See alternatives.",
            "alternatives": alternatives
        }
    except psycopg2.Error as e:
        print(f"Database error in check_slot_availability: {e}")
        return {"available": False, "message": "Database error occurred.", "alternatives": []}
    finally:
        cursor.close()
        conn.close()

@mcp.tool()
async def suggest_doctor_by_specialty(specialty: str) -> List[Dict]:
    """Suggest doctors based on their specialty.

    Args:
        specialty: The medical specialty to search for (e.g., Cardiology, Pediatrics).

    Returns:
        A list of dictionaries, each containing details of a doctor matching the specialty.
        Returns an empty list if no doctors are found for that specialty.
    """
    conn, cursor = get_db_connection()
    suggested_doctors = []
    try:
        cursor.execute("""
            SELECT
                d.doctor_id,
                u.first_name,
                u.last_name,
                d.specialization,
                d.years_of_experience,
                d.average_rating,
                d.bio
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            WHERE d.specialization ILIKE %s
            ORDER BY d.average_rating DESC, d.years_of_experience DESC;
        """, (f"%{specialty}%",))

        doctors = cursor.fetchall()

        for doctor in doctors:
            suggested_doctors.append({
                "doctor_id": doctor['doctor_id'],
                "name": f"{doctor['first_name']} {doctor['last_name']}",
                "specialty": doctor['specialization'],
                "years_of_experience": doctor['years_of_experience'],
                "average_rating": float(doctor['average_rating']) if doctor['average_rating'] is not None else None,
                "bio": doctor['bio']
            })

        return suggested_doctors

    except psycopg2.Error as e:
        print(f"Database error in suggest_doctor_by_specialty: {e}")
        return [{"error": "Database error occurred while searching for doctors."}]
    finally:
        cursor.close()
        conn.close()

@mcp.tool()
async def book_appointment(patient_name: str, phone_number: str, doctor_name: str, appointment_date: str, appointment_time: str) -> Dict:
    """Book an available appointment slot for a patient with a specific doctor using their phone number.
       Verifies doctor, patient, and slot availability before booking.

    Args:
        patient_name: Full name of the patient.
        phone_number: Phone number of the patient (used for identification).
        doctor_name: The name of the doctor (first name, last name, or partial name).
        appointment_date: Date in format YYYY-MM-DD.
        appointment_time: Time in format HH:MM.

    Returns:
        Dictionary with booking status and appointment details, or an error message.
    """
    print(f"\n--- Attempting to book appointment ---")
    print(f"  Patient: {patient_name}")
    print(f"  Phone: {phone_number}")
    print(f"  Doctor: {doctor_name}")
    print(f"  Date: {appointment_date}")
    print(f"  Time: {appointment_time}")
    print("--------------------------------------")

    conn, cursor = get_db_connection()
    print("[DEBUG] Database connection established.")

    try:
        # Start transaction
        conn.autocommit = False
        print("[DEBUG] Transaction started (autocommit disabled).")

        # --- STEP 1: Find Doctor ---
        print("[DEBUG] STEP 1: Finding Doctor...")
        cursor.execute("""
            SELECT d.doctor_id, u.first_name, u.last_name
            FROM doctors d
            JOIN users u ON d.user_id = u.user_id
            WHERE (u.first_name ILIKE %s OR u.last_name ILIKE %s OR
                   u.first_name || ' ' || u.last_name ILIKE %s)
              AND u.role = 'doctor'
            LIMIT 1; -- Assume unique doctor for booking simplicity
        """, [f"%{doctor_name}%", f"%{doctor_name}%", f"%{doctor_name}%"])

        doctor_result = cursor.fetchone()
        if not doctor_result:
            conn.rollback()
            print(f"[ERROR] Doctor matching '{doctor_name}' not found. Rolling back.")
            return {"success": False, "message": f"Doctor matching '{doctor_name}' not found"}

        doctor_id = doctor_result['doctor_id']
        full_doctor_name = f"{doctor_result['first_name']} {doctor_result['last_name']}"
        print(f"[DEBUG] Found Doctor ID: {doctor_id} ({full_doctor_name})")

        # --- STEP 2: Find Patient ---
        print("[DEBUG] STEP 2: Finding Patient...")
        cursor.execute("""
            SELECT p.patient_id, u.user_id, u.first_name, u.last_name
            FROM patients p
            JOIN users u ON p.user_id = u.user_id
            WHERE u.phone = %s AND u.role = 'patient'
            LIMIT 1;
        """, [phone_number])
        patient_result = cursor.fetchone()

        if not patient_result:
            conn.rollback()
            print(f"[ERROR] Patient with phone number {phone_number} not found. Rolling back.")
            # Note: We are not creating patients on the fly here.
            return {"success": False, "message": f"Patient with phone number {phone_number} not found."}

        patient_id = patient_result['patient_id']
        # Use the name from the database record for consistency, though patient_name was passed in
        db_patient_name = f"{patient_result['first_name']} {patient_result['last_name']}"
        print(f"[DEBUG] Found Patient ID: {patient_id} ({db_patient_name}) for phone: {phone_number}")


        # --- STEP 3: Verify and Lock Slot Availability ---
        print("[DEBUG] STEP 3: Verifying and Locking Slot...")
        try:
            # Validate time format
            if ":" not in appointment_time:
                 conn.rollback()
                 print(f"[ERROR] Invalid time format: {appointment_time}. Rolling back.")
                 return {"success": False, "message": "Invalid time format. Please use HH:MM"}
            # Combine date and time
            target_datetime = datetime.strptime(f"{appointment_date} {appointment_time}", '%Y-%m-%d %H:%M')
            print(f"[DEBUG] Target datetime parsed: {target_datetime}")
        except ValueError:
            conn.rollback()
            print(f"[ERROR] Invalid date/time format: {appointment_date} {appointment_time}. Rolling back.")
            return {"success": False, "message": "Invalid date or time format. Use YYYY-MM-DD and HH:MM"}

        # Find the available slot at the requested time FOR UPDATE (locks the row)
        cursor.execute("""
            SELECT slot_id, start_time, end_time
            FROM time_slots
            WHERE doctor_id = %s
            AND start_time = %s
            AND is_available = TRUE
            FOR UPDATE; -- Lock the row to prevent others from booking simultaneously
        """, [
            doctor_id,
            target_datetime
        ])

        slot_result = cursor.fetchone()

        # Check if the slot was found and locked
        if not slot_result:
            conn.rollback() # Release any potential locks if the query failed early
            print(f"[ERROR] Slot not found or not available/lockable at {target_datetime} for Dr. ID {doctor_id}.")
            # Check *why* it wasn't found (already booked vs doesn't exist)
            cursor.execute("""
                SELECT is_available
                FROM time_slots
                WHERE doctor_id = %s AND start_time = %s
            """, [doctor_id, target_datetime])
            existing_slot = cursor.fetchone()
            if existing_slot and not existing_slot['is_available']:
                print(f"[ERROR] Slot exists but is already booked. Rolling back.")
                return {"success": False, "message": f"Slot at {appointment_time} on {appointment_date} with Dr. {full_doctor_name} is already booked."}
            else: # Slot doesn't exist at all for this doctor/time
                print(f"[ERROR] Slot does not exist for this doctor/time. Rolling back.")
                return {"success": False, "message": f"Slot at {appointment_time} on {appointment_date} with Dr. {full_doctor_name} does not exist or is unavailable."}

        # Slot is available and locked, proceed with booking
        slot_id = slot_result['slot_id']
        start_time = slot_result['start_time']
        end_time = slot_result['end_time']
        print(f"[DEBUG] Found available Slot ID: {slot_id} and locked it.")

        # --- STEP 4: Update Slot to Unavailable ---
        print("[DEBUG] STEP 4: Updating Slot to Unavailable...")
        cursor.execute("""
            UPDATE time_slots SET is_available = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE slot_id = %s
        """, [slot_id])
        print(f"[DEBUG] Updated Slot ID: {slot_id} to unavailable (Rows affected: {cursor.rowcount}).")

        # --- STEP 5: Create Appointment Record ---
        print("[DEBUG] STEP 5: Creating Appointment Record...")
        # Using denormalized names as per schema, but using IDs found earlier
        cursor.execute("""
            INSERT INTO appointments (
                patient_id, slot_id, patient_name, phone_number, doctor_name,
                appointment_date, appointment_time, status, reason, created_by
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, 'scheduled', %s, %s)
            RETURNING appointment_id
        """, [
            patient_id, slot_id, db_patient_name, # Use name from DB record
            phone_number, full_doctor_name,
            start_time.date(), start_time.time(),
            'Booked via MCP', # Example reason - changed from test script
            patient_result['user_id'] # Assume patient booked it for themselves
        ])

        appointment_id = cursor.fetchone()['appointment_id']
        print(f"[DEBUG] Created Appointment ID: {appointment_id}")

        # --- STEP 6: Prepare Response ---
        print("[DEBUG] STEP 6: Preparing Response...")
        appointment_details = {
            "appointment_id": str(appointment_id),
            "patient_id": str(patient_id),
            "patient_name": db_patient_name, # Return the name from DB
            "phone_number": phone_number,
            "doctor_name": full_doctor_name,
            "doctor_id": str(doctor_id),
            "slot_id": str(slot_id),
            "date": start_time.strftime('%Y-%m-%d'),
            "start_time": start_time.strftime('%H:%M'),
            "end_time": end_time.strftime('%H:%M'),
            "status": "scheduled"
        }

        # --- Commit Transaction ---
        print("[DEBUG] Committing transaction...")
        conn.commit()
        print("[SUCCESS] Transaction committed.")

        return {
            "success": True,
            "message": "Appointment booked successfully", # Changed from test script message
            "appointment": appointment_details
        }

    except psycopg2.Error as db_err:
        print(f"[FATAL DB ERROR] Rolling back transaction due to: {db_err}")
        conn.rollback() # Rollback on any database error during the process
        return {"success": False, "message": f"Database error: {db_err}"}
    except Exception as e:
        print(f"[FATAL UNEXPECTED ERROR] Rolling back transaction due to: {e}")
        conn.rollback() # Rollback on any other unexpected error
        return {"success": False, "message": f"An unexpected error occurred: {str(e)}"}

    finally:
        # Ensure autocommit is reset and connection is closed
        if 'conn' in locals() and conn is not None:
            conn.autocommit = True # Reset to default
            cursor.close()
            conn.close()
            print("[DEBUG] Database connection closed.")


if __name__ == "__main__":
    # Initialize and run the server
    print("Starting Hospital MCP Service...")
    mcp.run(transport='stdio')