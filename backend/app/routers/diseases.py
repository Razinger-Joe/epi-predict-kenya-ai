"""
🎓 LEARNING: diseases.py - Disease CRUD Router

This router handles all disease-related endpoints.
CRUD = Create, Read, Update, Delete - the four basic operations.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime

from app.models.disease import (
    Disease, 
    DiseaseCreate, 
    DiseaseUpdate, 
    DiseaseListResponse,
    DiseaseCategory
)
from app.database import supabase

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: Mock Data
# ═══════════════════════════════════════════════════════════════════════════════
# Until we connect to real database, we use mock data.
# This lets us test the API structure without Supabase.

MOCK_DISEASES = [
    {
        "id": "disease-001",
        "name": "Malaria",
        "category": "vector_borne",
        "description": "Mosquito-borne parasitic disease common in tropical regions",
        "symptoms": ["fever", "chills", "headache", "muscle pain", "fatigue"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": None
    },
    {
        "id": "disease-002",
        "name": "Cholera",
        "category": "waterborne",
        "description": "Acute diarrheal infection caused by contaminated water",
        "symptoms": ["severe diarrhea", "dehydration", "vomiting"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": None
    },
    {
        "id": "disease-003",
        "name": "Dengue Fever",
        "category": "vector_borne",
        "description": "Viral disease transmitted by Aedes mosquitoes",
        "symptoms": ["high fever", "severe headache", "joint pain", "rash"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": None
    },
    {
        "id": "disease-004",
        "name": "Typhoid",
        "category": "bacterial",
        "description": "Bacterial infection from contaminated food/water",
        "symptoms": ["prolonged fever", "weakness", "abdominal pain", "constipation"],
        "created_at": "2024-01-01T00:00:00Z",
        "updated_at": None
    },
]


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: GET (Read) Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("", response_model=DiseaseListResponse)
async def list_diseases(
    category: Optional[DiseaseCategory] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search by name"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=100, description="Maximum records to return")
):
    """
    List all diseases with optional filtering.
    
    🎓 LEARNING: Query Parameters
    - Defined as function parameters with Query()
    - FastAPI auto-validates (ge=0 means >= 0)
    - Shows in docs with descriptions
    
    🎓 LEARNING: Pagination
    - skip/limit pattern is standard for APIs
    - Prevents returning millions of records
    """
    result = MOCK_DISEASES.copy()
    
    # Apply filters
    if category:
        result = [d for d in result if d["category"] == category.value]
    
    if search:
        search_lower = search.lower()
        result = [d for d in result if search_lower in d["name"].lower()]
    
    # Apply pagination
    total = len(result)
    result = result[skip:skip + limit]
    
    return DiseaseListResponse(data=result, count=total)


@router.get("/{disease_id}", response_model=Disease)
async def get_disease(disease_id: str):
    """
    Get a specific disease by ID.
    
    🎓 LEARNING: Path Parameters
    - {disease_id} in the path becomes a function parameter
    - FastAPI extracts it from the URL automatically
    
    🎓 LEARNING: HTTPException
    - Use this to return error responses
    - status_code: HTTP status (404 = Not Found)
    - detail: Error message
    """
    for disease in MOCK_DISEASES:
        if disease["id"] == disease_id:
            return disease
    
    raise HTTPException(
        status_code=404,
        detail=f"Disease with id '{disease_id}' not found"
    )


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: POST (Create) Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("", response_model=Disease, status_code=201)
async def create_disease(disease: DiseaseCreate):
    """
    Create a new disease.
    
    🎓 LEARNING: Request Body
    - disease: DiseaseCreate tells FastAPI to expect JSON body
    - Pydantic validates the data automatically
    - If validation fails, returns 422 with error details
    
    🎓 LEARNING: status_code=201
    - 201 = Created (standard for POST that creates resources)
    - 200 = OK (default, but 201 is more semantically correct)
    """
    # In real app: insert into database
    new_disease = {
        "id": f"disease-{len(MOCK_DISEASES) + 1:03d}",
        **disease.model_dump(),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": None
    }
    
    MOCK_DISEASES.append(new_disease)
    return new_disease


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: PATCH (Update) Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.patch("/{disease_id}", response_model=Disease)
async def update_disease(disease_id: str, updates: DiseaseUpdate):
    """
    Update a disease partially.
    
    🎓 LEARNING: PATCH vs PUT
    - PATCH: Partial update (only send fields to change)
    - PUT: Full replacement (send entire object)
    
    🎓 LEARNING: exclude_unset=True
    - Only includes fields that were explicitly set in request
    - None vs not-sent are different!
    """
    for i, disease in enumerate(MOCK_DISEASES):
        if disease["id"] == disease_id:
            # Get only the fields that were actually sent
            update_data = updates.model_dump(exclude_unset=True)
            
            # Apply updates
            MOCK_DISEASES[i] = {
                **disease,
                **update_data,
                "updated_at": datetime.utcnow().isoformat()
            }
            return MOCK_DISEASES[i]
    
    raise HTTPException(status_code=404, detail="Disease not found")


# ═══════════════════════════════════════════════════════════════════════════════
# 🎓 LEARNING: DELETE Endpoints
# ═══════════════════════════════════════════════════════════════════════════════

@router.delete("/{disease_id}", status_code=204)
async def delete_disease(disease_id: str):
    """
    Delete a disease.
    
    🎓 LEARNING: status_code=204
    - 204 = No Content (standard for successful DELETE)
    - Returns no body, just the status code
    """
    for i, disease in enumerate(MOCK_DISEASES):
        if disease["id"] == disease_id:
            MOCK_DISEASES.pop(i)
            return  # 204 returns nothing
    
    raise HTTPException(status_code=404, detail="Disease not found")
