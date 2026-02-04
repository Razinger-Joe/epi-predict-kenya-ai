# Backend Refactoring Implementation Guide
## SDLC & HCI Integration for EpiPredict Kenya AI

**Created:** February 3, 2026  
**Target Completion:** March 31, 2026  
**Team Size:** 1-2 developers

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Phase 1: Foundation (Week 1-2)](#phase-1-foundation-week-1-2)
3. [Phase 2: Business Logic (Week 2-3)](#phase-2-business-logic-week-2-3)
4. [Phase 3: API Enhancements (Week 3-4)](#phase-3-api-enhancements-week-3-4)
5. [Testing Strategy](#testing-strategy)
6. [Deployment & Monitoring](#deployment--monitoring)

---

## Quick Start

### 1. Create Core Modules

The core modules have been created:
- ✅ `app/core/__init__.py` - Response formats
- ✅ `app/core/responses.py` - Standard response wrapper
- ✅ `app/core/exceptions.py` - Exception handling
- ✅ `app/core/middleware.py` - Logging and tracking
- ✅ `app/core/models.py` - Common models and validators

### 2. Update Main.py

The `app/main.py` has been updated to:
- ✅ Include all middleware
- ✅ Register exception handlers
- ✅ Configure logging
- ✅ Use API versioning (/api/v1/)

### 3. Next Steps

1. **Test current setup** (should work with no breaking changes)
2. **Create service layer** for each router
3. **Refactor routers** to use services
4. **Add unit tests**
5. **Deploy to staging**

---

## Phase 1: Foundation (Week 1-2)

### ✅ Completed This Week

1. **Response Format Standardization** ✅
   - Created `APIResponse` wrapper class
   - Created `ListResponse` for pagination
   - Created `ErrorResponse` for consistent error format
   - All endpoints will use these templates

2. **Exception Handling** ✅
   - Created custom exception classes
   - Global exception handler middleware
   - Pydantic validation error handling
   - Maps all exceptions to standard format

3. **Request Tracking** ✅
   - Request ID generation (UUID)
   - Structured logging (JSON format)
   - Performance monitoring (slow request detection)
   - Security headers added automatically

4. **API Versioning** ✅
   - Changed endpoints from `/api/diseases` to `/api/v1/diseases`
   - Allows future `/api/v2/` without breaking existing clients
   - Documented in main.py

### Tasks for Week 2

#### Task 1.1: Test Current Setup (2 hours)

```bash
cd /workspaces/epi-predict-kenya-ai/backend
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```

Check that:
- [ ] Server starts without errors
- [ ] GET `/docs` works and shows all endpoints
- [ ] Response format matches new standards
- [ ] Errors are properly formatted
- [ ] Request IDs appear in responses

#### Task 1.2: Add Logging Package (1 hour)

```bash
pip install python-json-logger==2.0.7
pip freeze > requirements-updated.txt
```

Update `app/core/middleware.py` to use JSON logging:
```python
from pythonjsonlogger import jsonlogger

# Configure JSON logging
```

#### Task 1.3: Create Request/Response Logging Tests (2 hours)

Create `tests/test_middleware.py`:
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_request_id_is_generated():
    response = client.get("/docs")
    assert "x-request-id" in response.headers
    
def test_error_response_format():
    response = client.get("/api/v1/diseases/invalid-id")
    data = response.json()
    assert "success" in data
    assert "error" in data or "data" in data
```

#### Task 1.4: Document Response Formats (2 hours)

Create `docs/API_RESPONSE_FORMAT.md`:
- Document all response formats
- Provide examples
- Explain pagination
- Explain error handling

---

## Phase 2: Business Logic (Week 2-3)

### Overview

Replace mock data with proper service layer:
```
Router ↓ (HTTP)
Service ↓ (Business Logic)
Repository ↓ (Data Access)
Database (Supabase)
```

### Task 2.1: Create DiseaseService (3 hours)

Create `app/services/disease_service.py`:

```python
from typing import List, Optional
from app.models.disease import Disease, DiseaseCreate
from app.repositories.disease_repository import DiseaseRepository

class DiseaseService:
    """Service layer for disease operations"""
    
    def __init__(self, repository: DiseaseRepository):
        self.repo = repository
    
    async def list_diseases(
        self,
        skip: int = 0,
        limit: int = 10,
        category: Optional[str] = None,
        search: Optional[str] = None
    ) -> tuple[List[Disease], int]:
        """
        List diseases with filtering and pagination.
        
        Returns:
            Tuple of (diseases_list, total_count)
        """
        return await self.repo.find_all(
            skip=skip,
            limit=limit,
            filters={"category": category, "search": search}
        )
    
    async def get_disease(self, disease_id: str) -> Disease:
        """Get single disease or raise NotFoundException"""
        disease = await self.repo.find_by_id(disease_id)
        if not disease:
            raise NotFoundException("Disease", disease_id)
        return disease
    
    async def create_disease(self, disease_data: DiseaseCreate) -> Disease:
        """Create new disease"""
        # Validate business rules
        existing = await self.repo.find_by_name(disease_data.name)
        if existing:
            raise ConflictException(f"Disease '{disease_data.name}' already exists")
        
        return await self.repo.insert(disease_data.model_dump())
    
    async def update_disease(self, id: str, data: DiseaseUpdate) -> Disease:
        """Update disease"""
        existing = await self.get_disease(id)  # Validates exists
        updated_data = data.model_dump(exclude_unset=True)
        return await self.repo.update(id, updated_data)
    
    async def delete_disease(self, id: str) -> None:
        """Delete disease"""
        await self.get_disease(id)  # Validates exists
        await self.repo.delete(id)
```

### Task 2.2: Create DiseaseRepository (2 hours)

Create `app/repositories/disease_repository.py`:

```python
from typing import List, Optional, Dict, Any
from app.database import supabase
from app.models.disease import Disease

class DiseaseRepository:
    """Data access layer for diseases"""
    
    TABLE_NAME = "diseases"
    
    async def find_all(
        self,
        skip: int = 0,
        limit: int = 10,
        filters: Optional[Dict[str, Any]] = None
    ) -> tuple[List[dict], int]:
        """Query all diseases with filters"""
        query = supabase.table(self.TABLE_NAME).select("*")
        
        # Apply filters
        if filters:
            if filters.get("category"):
                query = query.eq("category", filters["category"])
            if filters.get("search"):
                # Search across name and description
                query = query.or_(
                    f"name.ilike.%{filters['search']}%,"
                    f"description.ilike.%{filters['search']}%"
                )
        
        # Get total count
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Apply pagination
        response = query.range(skip, skip + limit - 1).execute()
        
        return response.data or [], total
    
    async def find_by_id(self, disease_id: str) -> Optional[dict]:
        """Query single disease"""
        response = supabase.table(self.TABLE_NAME).select("*").eq(
            "id", disease_id
        ).execute()
        
        return response.data[0] if response.data else None
    
    async def insert(self, data: dict) -> dict:
        """Insert new disease"""
        response = supabase.table(self.TABLE_NAME).insert(data).execute()
        return response.data[0] if response.data else {}
    
    async def update(self, id: str, data: dict) -> dict:
        """Update disease"""
        response = supabase.table(self.TABLE_NAME).update(data).eq(
            "id", id
        ).execute()
        return response.data[0] if response.data else {}
    
    async def delete(self, id: str) -> None:
        """Delete disease"""
        supabase.table(self.TABLE_NAME).delete().eq("id", id).execute()
```

### Task 2.3: Refactor Diseases Router (2 hours)

Update `app/routers/diseases.py`:

```python
from fastapi import APIRouter, Depends
from app.services.disease_service import DiseaseService
from app.repositories.disease_repository import DiseaseRepository
from app.core.responses import success_response, list_response, error_response
from app.core.exceptions import NotFoundException

router = APIRouter()

# Dependency injection
def get_disease_service() -> DiseaseService:
    repo = DiseaseRepository()
    return DiseaseService(repo)

@router.get("")
async def list_diseases(
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    service: DiseaseService = Depends(get_disease_service)
):
    """List diseases"""
    diseases, total = await service.list_diseases(
        skip=skip, limit=limit, category=category
    )
    return list_response(
        items=diseases,
        total=total,
        skip=skip,
        limit=limit,
        filters={"category": category}
    )

@router.get("/{disease_id}")
async def get_disease(
    disease_id: str,
    service: DiseaseService = Depends(get_disease_service)
):
    """Get disease"""
    disease = await service.get_disease(disease_id)
    return success_response(disease)

@router.post("")
async def create_disease(
    disease: DiseaseCreate,
    service: DiseaseService = Depends(get_disease_service)
):
    """Create disease"""
    created = await service.create_disease(disease)
    return success_response(created)
```

### Task 2.4: Repeat for Counties & Predictions (4 hours)

Follow same pattern for:
- [ ] CountyService + CountyRepository
- [ ] PredictionService + PredictionRepository

---

## Phase 3: API Enhancements (Week 3-4)

### Task 3.1: Advanced Filtering (2 hours)

Support complex queries:
```
GET /api/v1/diseases?
  filter[category]=vector_borne&
  filter[severity]=high&
  sort=name:asc&
  limit=20
```

### Task 3.2: Sorting Implementation (2 hours)

Add sort parameter parsing:
```python
class SortParam(BaseModel):
    field: str
    direction: Literal["asc", "desc"] = "asc"

# Parse ?sort=name:asc,created_at:desc
```

### Task 3.3: Include Relations (2 hours)

Support related data:
```
GET /api/v1/counties/047?include=diseases,statistics
```

### Task 3.4: Cursor-Based Pagination (2 hours)

Replace skip/limit with more efficient cursor:
```json
{
  "data": [...],
  "pagination": {
    "next_cursor": "abc123",
    "prev_cursor": "xyz789",
    "has_next": true
  }
}
```

---

## Testing Strategy

### Unit Tests (Services)

```python
# tests/unit/services/test_disease_service.py
import pytest
from app.services.disease_service import DiseaseService
from app.core.exceptions import NotFoundException

@pytest.fixture
def mock_repository():
    """Mock repository for testing"""
    return MagicMock(spec=DiseaseRepository)

@pytest.mark.asyncio
async def test_get_disease_not_found(mock_repository):
    """Test getting non-existent disease"""
    mock_repository.find_by_id.return_value = None
    service = DiseaseService(mock_repository)
    
    with pytest.raises(NotFoundException):
        await service.get_disease("invalid-id")
```

### Integration Tests (Routers)

```python
# tests/integration/routers/test_diseases.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_list_diseases():
    """Test diseases listing endpoint"""
    response = client.get("/api/v1/diseases?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "pagination" in data
```

### Coverage Target: 80%

```bash
pip install pytest-cov
pytest --cov=app --cov-report=html
```

---

## Deployment & Monitoring

### Before Deploying to Production

1. **Run Full Test Suite**
   ```bash
   pytest --cov=app
   ```

2. **Check Code Quality**
   ```bash
   black app/
   isort app/
   flake8 app/
   mypy app/
   ```

3. **Performance Testing**
   ```bash
   # Load test with 100 concurrent users
   locust -f tests/load_test.py
   ```

### Monitoring Setup

Add to `app/routers/health.py`:

```python
from prometheus_client import Counter, Histogram
import time

# Define metrics
request_count = Counter(
    'api_requests_total',
    'Total API requests',
    ['method', 'endpoint', 'status']
)

request_duration = Histogram(
    'api_request_duration_seconds',
    'API request duration',
    ['method', 'endpoint']
)

@router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    from prometheus_client import generate_latest
    return Response(generate_latest(), media_type="text/plain")
```

### Logging Verification

Check logs are JSON formatted:
```bash
curl http://localhost:8000/api/v1/diseases | jq .
# Response should include x-request-id header
```

---

## Checklist for Completion

### Week 1
- [ ] Create core modules (responses, exceptions, middleware)
- [ ] Update main.py with middleware and exception handlers
- [ ] Update API routes to use /api/v1/ prefix
- [ ] Test baseline functionality

### Week 2
- [ ] Add python-json-logger package
- [ ] Implement request/response logging tests
- [ ] Create DiseaseService & Repository
- [ ] Create CountyService & Repository
- [ ] Refactor disease and county routers

### Week 3
- [ ] Create PredictionService & Repository
- [ ] Implement advanced filtering
- [ ] Implement sorting
- [ ] Add unit tests for services

### Week 4
- [ ] Add integration tests for routers
- [ ] Implement monitoring/metrics
- [ ] Documentation updates
- [ ] Performance testing & optimization

### Week 5
- [ ] Code review
- [ ] Security audit
- [ ] Staging deployment
- [ ] Production deployment

---

## Git Workflow

```bash
# Feature branches per task
git checkout -b feat/add-logging-middleware

# Commit with clear messages
git commit -m "feat: add structured logging middleware with request ID tracking"

# Push and create PR
git push origin feat/add-logging-middleware
```

---

## Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'app.core'"

**Solution:** Ensure `app/core/__init__.py` exists with proper imports

### Issue: Response format doesn't match in old endpoints

**Solution:** Manually refactor old routers to use `success_response()` and `error_response()` helpers

### Issue: Tests fail with "Supabase not configured"

**Solution:** Use pytest fixtures to mock Supabase client
```python
@pytest.fixture
def mock_supabase(monkeypatch):
    monkeypatch.setenv("SUPABASE_URL", "http://mock")
    monkeypatch.setenv("SUPABASE_KEY", "mock-key")
```

---

## References

- [FastAPI Dependency Injection](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Pydantic Validation](https://docs.pydantic.dev/)
- [Pytest Best Practices](https://docs.pytest.org/)
- [Clean Code Principles](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)

---

**Next Review:** Weekly stand-ups on Mondays  
**Emergency Contact:** Alert on main branch failures
