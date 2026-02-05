"""
Health Operators Service
========================
Manages health operators (doctors, nurses, pharmacists) who verify social media insights
and upload PDF reports to the EpiPredict system.
"""

from datetime import datetime
from typing import Optional, List
from uuid import uuid4
from app.database import supabase


# Admin configuration
ADMIN_EMAIL = "razingerjosef@gmail.com"


async def get_all_operators(status_filter: Optional[str] = None) -> List[dict]:
    """
    Get all health operators, optionally filtered by verification status.
    
    Args:
        status_filter: 'pending', 'verified', or None for all
    """
    if not supabase:
        # Return mock data if Supabase not configured
        return get_mock_operators(status_filter)
    
    query = supabase.table("health_operators").select("*")
    
    if status_filter == "pending":
        query = query.eq("is_verified", False)
    elif status_filter == "verified":
        query = query.eq("is_verified", True)
    
    result = query.order("created_at", desc=True).execute()
    return result.data if result.data else []


async def get_operator_by_user_id(user_id: str) -> Optional[dict]:
    """Get a health operator by their user ID."""
    if not supabase:
        return None
    
    result = supabase.table("health_operators").select("*").eq("user_id", user_id).single().execute()
    return result.data


async def create_operator(
    user_id: str,
    email: str,
    full_name: str,
    phone: str,
    organization: str,
    license_number: str,
    county: str,
    role: str = "doctor"
) -> dict:
    """
    Create a new health operator (pending verification).
    """
    operator_data = {
        "id": str(uuid4()),
        "user_id": user_id,
        "email": email,
        "full_name": full_name,
        "phone": phone,
        "organization": organization,
        "license_number": license_number,
        "county": county,
        "role": role,
        "is_verified": False,
        "verified_by": None,
        "verified_at": None,
        "created_at": datetime.utcnow().isoformat()
    }
    
    if not supabase:
        return operator_data
    
    result = supabase.table("health_operators").insert(operator_data).execute()
    return result.data[0] if result.data else operator_data


async def approve_operator(operator_id: str, admin_user_id: str) -> dict:
    """
    Approve a pending health operator.
    Only the admin (razingerjosef@gmail.com) can approve operators.
    """
    if not supabase:
        return {"success": True, "message": "Operator approved (mock)"}
    
    update_data = {
        "is_verified": True,
        "verified_by": admin_user_id,
        "verified_at": datetime.utcnow().isoformat()
    }
    
    result = supabase.table("health_operators").update(update_data).eq("id", operator_id).execute()
    
    if result.data:
        # Get operator details for sending welcome email
        operator = result.data[0]
        await send_onboarding_notification(operator)
        return {"success": True, "operator": operator}
    
    return {"success": False, "message": "Operator not found"}


async def reject_operator(operator_id: str, reason: str = "") -> dict:
    """Reject a pending health operator."""
    if not supabase:
        return {"success": True, "message": "Operator rejected (mock)"}
    
    # Delete the operator record
    result = supabase.table("health_operators").delete().eq("id", operator_id).execute()
    
    return {"success": True, "message": "Operator application rejected"}


async def send_onboarding_notification(operator: dict) -> None:
    """
    Send onboarding notification to newly verified health operator.
    In production, this would integrate with an email service.
    """
    # For now, we log the notification. 
    # TODO: Integrate with email service (SendGrid, Resend, etc.)
    print(f"""
    ╔══════════════════════════════════════════════════════════════╗
    ║          🎉 EpiPredict Team Onboarding Notification          ║
    ╠══════════════════════════════════════════════════════════════╣
    ║ To: {operator.get('email', 'N/A'):<52} ║
    ║ Name: {operator.get('full_name', 'N/A'):<50} ║
    ║                                                              ║
    ║ Congratulations! You have been verified as a health          ║
    ║ operator on the EpiPredict Kenya AI platform.                ║
    ║                                                              ║
    ║ You can now:                                                 ║
    ║ • Upload PDF reports from social media sentiment analysis    ║
    ║ • Verify health insights for disease predictions             ║
    ║ • Contribute to Kenya's disease surveillance network         ║
    ║                                                              ║
    ║ Welcome to the EpiPredict team!                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)


async def is_admin(email: str) -> bool:
    """Check if the user is an admin."""
    return email.lower() == ADMIN_EMAIL.lower()


async def is_verified_operator(user_id: str) -> bool:
    """Check if a user is a verified health operator."""
    if not supabase:
        return True  # Allow in dev mode
    
    result = supabase.table("health_operators").select("is_verified").eq("user_id", user_id).single().execute()
    return result.data.get("is_verified", False) if result.data else False


def get_mock_operators(status_filter: Optional[str] = None) -> List[dict]:
    """Return mock operator data for development."""
    mock_data = [
        {
            "id": "op-001",
            "user_id": "user-001",
            "email": "dr.mwangi@knh.go.ke",
            "full_name": "Dr. James Mwangi",
            "phone": "+254712345678",
            "organization": "Kenyatta National Hospital",
            "license_number": "KMB-12345",
            "county": "Nairobi",
            "role": "doctor",
            "is_verified": True,
            "verified_by": "admin-001",
            "verified_at": "2025-12-01T10:00:00Z",
            "created_at": "2025-11-15T08:30:00Z"
        },
        {
            "id": "op-002",
            "user_id": "user-002",
            "email": "nurse.otieno@mtrh.go.ke",
            "full_name": "Nurse Grace Otieno",
            "phone": "+254723456789",
            "organization": "Moi Teaching and Referral Hospital",
            "license_number": "NCK-67890",
            "county": "Nakuru",
            "role": "nurse",
            "is_verified": False,
            "verified_by": None,
            "verified_at": None,
            "created_at": "2026-01-20T14:15:00Z"
        },
        {
            "id": "op-003",
            "user_id": "user-003",
            "email": "pharm.wanjiku@coastgh.go.ke",
            "full_name": "Dr. Faith Wanjiku",
            "phone": "+254734567890",
            "organization": "Coast General Hospital",
            "license_number": "PPB-54321",
            "county": "Mombasa",
            "role": "pharmacist",
            "is_verified": False,
            "verified_by": None,
            "verified_at": None,
            "created_at": "2026-02-01T09:45:00Z"
        }
    ]
    
    if status_filter == "pending":
        return [op for op in mock_data if not op["is_verified"]]
    elif status_filter == "verified":
        return [op for op in mock_data if op["is_verified"]]
    
    return mock_data
