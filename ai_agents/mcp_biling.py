from mcp.server.fastmcp import FastMCP
import psycopg2
from psycopg2.extras import DictCursor  # Use DictCursor for easier column access
from datetime import datetime, date, timedelta
import uuid
from typing import List, Dict, Optional, Union, Any
import json  # Import json for handling potential JSON data if needed

mcp = FastMCP("BilingService")


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


@mcp.tool()
async def get_billing_by_username(username: str, include_details: bool = True) -> Dict:
    """Fetch billing information for a patient identified by username.
    
    Args:
        username: The username of the patient
        include_details: Whether to include detailed billing items
        
    Returns:
        Dictionary containing billing information and optionally billing items
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Step 1: Get user_id from username
        cursor.execute(
            """
            SELECT user_id
            FROM Users
            WHERE first_name = %s
            """, [username]
        )
        user_row = cursor.fetchone()
        if not user_row:
            return {"error": "User not found"}
        
        user_id = user_row[0]
        
        # Step 2: Get patient_id from user_id
        cursor.execute(
            """
            SELECT patient_id
            FROM Patients
            WHERE user_id = %s
            """, [user_id]
        )
        patient_row = cursor.fetchone()
        if not patient_row:
            return {"error": "Patient record not found for this user"}
        
        patient_id = patient_row[0]
        
        # Step 3: Get all billing information for this patient
        cursor.execute(
            """
            SELECT billing_id, appointment_id, invoice_number, date_issued, due_date,
                   subtotal, tax, discount, total, amount_paid, balance, status,
                   payment_method, payment_details, notes, created_by, created_at, updated_at
            FROM Billings
            WHERE patient_id = %s
            ORDER BY date_issued DESC
            """, [patient_id]
        )
        
        billings = []
        for row in cursor.fetchall():
            billing = {
                "billing_id": row[0],
                "appointment_id": row[1],
                "invoice_number": row[2],
                "date_issued": row[3].isoformat(),
                "due_date": row[4].isoformat() if row[4] else None,
                "subtotal": float(row[5]),
                "tax": float(row[6]),
                "discount": float(row[7]),
                "total": float(row[8]),
                "amount_paid": float(row[9]),
                "balance": float(row[10]),
                "status": row[11],
                "payment_method": row[12],
                "payment_details": row[13],
                "notes": row[14],
                "created_by": row[15],
                "created_at": row[16].isoformat(),
                "updated_at": row[17].isoformat()
            }
            
            # Step 4: If requested, get billing items for each billing
            if include_details:
                cursor.execute(
                    """
                    SELECT item_id, description, quantity, unit_price, tax, discount, line_total, created_at
                    FROM BillingItems
                    WHERE billing_id = %s
                    """, [row[0]]  # Using billing_id from the current billing
                )
                
                items = []
                for item_row in cursor.fetchall():
                    items.append({
                        "item_id": item_row[0],
                        "description": item_row[1],
                        "quantity": float(item_row[2]),
                        "unit_price": float(item_row[3]),
                        "tax": float(item_row[4]),
                        "discount": float(item_row[5]),
                        "line_total": float(item_row[6]),
                        "created_at": item_row[7].isoformat()
                    })
                
                billing["items"] = items
            
            billings.append(billing)
            
        return {
            "username": username,
            "user_id": user_id,
            "patient_id": patient_id,
            "billing_count": len(billings),
            "billings": billings
        }
    finally:
        cursor.close()
        conn.close()
        

if __name__ == "__main__":
    mcp.run(transport='stdio')