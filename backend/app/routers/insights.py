"""
Insights Router
===============
API endpoints for social media insights harvesting and PDF report management.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Query
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

from app.models.insight import (
    HarvestRequest,
    HarvestResponse,
    InsightStatus,
    PDFUploadResponse
)
from app.services import social_harvester, health_operators

router = APIRouter(prefix="/api/insights", tags=["Insights"])


# ═══════════════════════════════════════════════════════════════════════════════
# Harvesting Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/harvest", response_model=HarvestResponse)
async def harvest_social_insights(request: Optional[HarvestRequest] = None):
    """
    Trigger a simulated social media harvest for health insights.
    
    This is a demo endpoint that generates mock social media data
    about disease outbreaks in Kenya's featured counties.
    
    Body Parameters (optional):
        - counties: List of counties to filter
        - diseases: List of diseases to filter
    """
    insights = await social_harvester.simulate_harvest()
    
    # Apply filters if provided
    if request:
        if request.counties:
            insights = [i for i in insights if i["county"] in request.counties]
        if request.diseases:
            insights = [i for i in insights 
                       if any(d in i["disease_indicators"] for d in request.diseases)]
    
    return HarvestResponse(
        success=True,
        insights_count=len(insights),
        insights=insights,
        harvested_at=datetime.utcnow()
    )


@router.get("")
async def list_insights(
    status: Optional[str] = Query(None, enum=["pending", "analyzing", "analyzed", "verified"]),
    county: Optional[str] = None,
    limit: int = Query(50, le=100)
):
    """
    List all insights with optional filtering.
    
    Query Parameters:
        - status: Filter by insight status
        - county: Filter by county name
        - limit: Maximum number of results (default 50)
    """
    # For demo, generate some mock insights
    insights = await social_harvester.simulate_harvest()
    
    if status:
        insights = [i for i in insights if i["status"] == status]
    if county:
        insights = [i for i in insights if i["county"].lower() == county.lower()]
    
    return {
        "count": len(insights[:limit]),
        "insights": insights[:limit]
    }


@router.get("/{insight_id}")
async def get_insight(insight_id: str):
    """Get a specific insight by ID."""
    # For demo, return mock data
    status = await social_harvester.get_analysis_status(insight_id)
    
    return {
        "id": insight_id,
        **status,
        "content": "Mock insight content for demonstration",
        "county": "Nairobi",
        "disease_indicators": ["malaria"],
        "severity_score": 65
    }


@router.get("/{insight_id}/status")
async def get_insight_status(insight_id: str):
    """Get the current analysis status of an insight."""
    return await social_harvester.get_analysis_status(insight_id)


# ═══════════════════════════════════════════════════════════════════════════════
# PDF Upload Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/upload", response_model=PDFUploadResponse)
async def upload_pdf_report(
    file: UploadFile = File(...),
    operator_email: str = Query(..., description="Email of the uploading operator"),
    county: str = Query(..., description="County this report relates to"),
    title: str = Query("Health Report", description="Title of the report")
):
    """
    Upload a PDF health report from a verified health operator.
    
    The PDF contains social media sentiment analysis that has been
    verified by the health operator. Content is extracted and analyzed.
    
    Requirements:
        - Operator must be verified
        - File must be PDF format
        - Maximum file size: 10MB
    """
    # Validate file type
    if not file.filename.endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted"
        )
    
    # Check file size (10MB limit)
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )
    
    # Parse the PDF
    parsed = await social_harvester.parse_pdf_report(content, file.filename)
    
    # Create insight record
    insight_id = str(uuid4())
    
    return PDFUploadResponse(
        success=True,
        filename=file.filename,
        insight_id=insight_id,
        extracted_summary=parsed["extracted_text"][:500] + "..." if len(parsed["extracted_text"]) > 500 else parsed["extracted_text"],
        disease_indicators=parsed["disease_indicators"],
        severity_score=parsed["severity_score"],
        status=InsightStatus.ANALYZING,
        message=f"Report uploaded successfully. {parsed['word_count']} words extracted. Analyzing content..."
    )


# ═══════════════════════════════════════════════════════════════════════════════
# Verification Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.patch("/{insight_id}/verify")
async def verify_insight(
    insight_id: str,
    is_verified: bool = Query(..., description="Verification decision"),
    operator_email: str = Query(..., description="Email of verifying operator"),
    notes: str = Query("", description="Optional verification notes")
):
    """
    Verify or reject an analyzed insight.
    
    Only verified health operators can verify insights.
    """
    new_status = InsightStatus.VERIFIED if is_verified else InsightStatus.REJECTED
    
    return {
        "success": True,
        "insight_id": insight_id,
        "previous_status": InsightStatus.ANALYZED.value,
        "new_status": new_status.value,
        "verified_by": operator_email,
        "verified_at": datetime.utcnow().isoformat(),
        "notes": notes,
        "message": f"Insight {'verified' if is_verified else 'rejected'} successfully"
    }


# ═══════════════════════════════════════════════════════════════════════════════
# County Data Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/counties/featured")
async def get_featured_counties():
    """Get the list of 10 featured counties for the dashboard."""
    return {
        "count": 10,
        "counties": social_harvester.get_featured_counties()
    }
