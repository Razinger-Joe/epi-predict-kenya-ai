"""
Operators Router
================
API endpoints for managing health operators.
Includes registration, approval workflow, and listing.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List

from app.models.insight import (
    HealthOperatorCreate, 
    HealthOperatorResponse, 
    OperatorApprovalRequest
)
from app.services import health_operators

router = APIRouter(prefix="/api/operators", tags=["Health Operators"])


# ═══════════════════════════════════════════════════════════════════════════════
# GET Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("", response_model=List[dict])
async def list_operators(
    status: Optional[str] = Query(None, enum=["pending", "verified"])
):
    """
    List all health operators.
    
    Query Parameters:
        - status: Filter by 'pending' or 'verified'
    """
    operators = await health_operators.get_all_operators(status)
    return operators


@router.get("/pending", response_model=List[dict])
async def list_pending_operators():
    """List all pending operator applications awaiting approval."""
    return await health_operators.get_all_operators("pending")


@router.get("/verified", response_model=List[dict])
async def list_verified_operators():
    """List all verified health operators."""
    return await health_operators.get_all_operators("verified")


@router.get("/{operator_id}")
async def get_operator(operator_id: str):
    """Get a specific operator by ID."""
    operators = await health_operators.get_all_operators()
    operator = next((op for op in operators if op["id"] == operator_id), None)
    
    if not operator:
        raise HTTPException(status_code=404, detail="Operator not found")
    
    return operator


# ═══════════════════════════════════════════════════════════════════════════════
# POST Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/register")
async def register_operator(operator_data: HealthOperatorCreate):
    """
    Register a new health operator.
    
    The operator will be in 'pending' status until approved by admin.
    Email must be a verified Gmail account.
    """
    # Validate Gmail requirement
    if not operator_data.email.endswith("@gmail.com") and not operator_data.email.endswith(".go.ke"):
        raise HTTPException(
            status_code=400, 
            detail="Email must be a Gmail account or official .go.ke domain"
        )
    
    result = await health_operators.create_operator(
        user_id=operator_data.user_id,
        email=operator_data.email,
        full_name=operator_data.full_name,
        phone=operator_data.phone,
        organization=operator_data.organization,
        license_number=operator_data.license_number,
        county=operator_data.county,
        role=operator_data.role.value
    )
    
    return {
        "success": True,
        "message": "Registration submitted. Awaiting admin approval.",
        "operator": result
    }


@router.post("/{operator_id}/approve")
async def approve_operator(
    operator_id: str,
    admin_email: str = Query(..., description="Admin email for authorization")
):
    """
    Approve a pending health operator.
    
    Only the admin (razingerjosef@gmail.com) can approve operators.
    """
    # Verify admin authorization
    if not await health_operators.is_admin(admin_email):
        raise HTTPException(
            status_code=403, 
            detail="Unauthorized. Only admin can approve operators."
        )
    
    result = await health_operators.approve_operator(operator_id, "admin")
    
    if not result.get("success"):
        raise HTTPException(status_code=404, detail=result.get("message", "Operation failed"))
    
    return {
        "success": True,
        "message": "Operator approved successfully. Onboarding notification sent.",
        "operator": result.get("operator")
    }


@router.post("/{operator_id}/reject")
async def reject_operator(
    operator_id: str,
    admin_email: str = Query(..., description="Admin email for authorization"),
    reason: str = Query("", description="Reason for rejection")
):
    """
    Reject a pending health operator application.
    
    Only the admin can reject operators.
    """
    # Verify admin authorization
    if not await health_operators.is_admin(admin_email):
        raise HTTPException(
            status_code=403, 
            detail="Unauthorized. Only admin can reject operators."
        )
    
    result = await health_operators.reject_operator(operator_id, reason)
    
    return {
        "success": True,
        "message": "Operator application rejected.",
        "reason": reason if reason else "No reason provided"
    }


@router.get("/check-admin/{email}")
async def check_admin_status(email: str):
    """Check if an email is the admin account."""
    is_admin = await health_operators.is_admin(email)
    return {"email": email, "is_admin": is_admin}
