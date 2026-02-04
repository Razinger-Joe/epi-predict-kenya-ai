# EpiPredict Kenya AI - Backend SDLC & HCI Integration Plan

## Executive Summary

This document outlines a comprehensive refactoring strategy for the backend to align with SDLC best practices while integrating HCI principles from the frontend. The goal is to create a robust, maintainable, and user-centric API.

---

## 1. CURRENT STATE ASSESSMENT

### Strengths
- ✅ Well-structured routing with FastAPI (organized by domains)
- ✅ Pydantic models for data validation
- ✅ CORS configuration for frontend integration
- ✅ Clear separation of concerns (models, routers, config)
- ✅ Comprehensive mock data for development
- ✅ Good documentation in code comments

### Areas for Improvement
- ⚠️ No centralized error handling/response formatting
- ⚠️ Missing request/response logging middleware
- ⚠️ No input sanitization or security headers
- ⚠️ Limited validation on database operations
- ⚠️ No API versioning strategy
- ⚠️ Missing comprehensive exception handling
- ⚠️ No health check metrics/monitoring
- ⚠️ Inconsistent HTTP status codes
- ⚠️ No rate limiting or throttling
- ⚠️ Services layer not fully implemented

---

## 2. SDLC ALIGNMENT STRATEGY

### 2.1 Architecture Pattern: Layered + Service-Oriented

```
┌─────────────────────────────────────────────────┐
│         API Layer (FastAPI Routers)              │
├─────────────────────────────────────────────────┤
│         Business Logic Layer (Services)          │
├─────────────────────────────────────────────────┤
│         Data Access Layer (Repositories)         │
├─────────────────────────────────────────────────┤
│         Database/Cache Layer (Supabase)          │
└─────────────────────────────────────────────────┘
```

### 2.2 Core SDLC Principles to Implement

1. **Single Responsibility Principle (SRP)**
   - Each class/function has ONE reason to change
   - Routers: Handle HTTP concerns only
   - Services: Contain business logic
   - Repositories: Handle data access

2. **Dependency Injection**
   - Use FastAPI's `Depends()` for injecting services
   - Makes testing easier (mock services)
   - Reduces tight coupling

3. **Error Handling & Validation**
   - Centralized exception handling
   - Standardized error response format
   - Input validation at API boundary
   - Graceful degradation

4. **Testing Strategy**
   - Unit tests for services
   - Integration tests for routers
   - Mock database for testing
   - Test fixtures for common data

5. **Logging & Observability**
   - Structured logging (JSON format)
   - Request/response logging
   - Performance metrics
   - Error tracking

---

## 3. HCI PRINCIPLES FROM FRONTEND

The frontend uses these HCI patterns that the backend should support:

### 3.1 From Frontend Architecture
- **Clear Data Contracts**: TypeScript interfaces match Pydantic models ✅
- **Error Messaging**: User-friendly error descriptions
- **Loading States**: Need `isLoading`, `error`, `data` patterns
- **Pagination**: Skip/limit pattern for list endpoints ✅
- **Filtering**: Query parameter filtering ✅
- **Sorting**: Not yet implemented in backend

### 3.2 HCI-Aligned Response Format

```typescript
// Frontend expects this pattern (from services/api.ts)
{
    data: T,           // The actual data
    error?: string,    // User-friendly error message
    statusCode: number,
    timestamp: string
}
```

### 3.3 Real-Time Updates
- Dashboard expects live updates
- Need WebSocket support or polling optimization
- Consider: Server-Sent Events (SSE) or gRPC

---

## 4. DETAILED REFACTORING ROADMAP

### Phase 1: Foundation (Weeks 1-2)

#### 4.1 Centralized Response & Error Handling

Create `app/core/responses.py`:
```python
from dataclasses import dataclass
from typing import Generic, TypeVar, Optional
from enum import Enum

T = TypeVar('T')

class ErrorCode(str, Enum):
    """Standard error codes for frontend"""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    CONFLICT = "CONFLICT"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"

@dataclass
class APIResponse(Generic[T]):
    """Standard response format for all endpoints"""
    success: bool
    data: Optional[T] = None
    error: Optional[dict] = None
    code: Optional[ErrorCode] = None
    timestamp: str = Field(default_factory=datetime.utcnow)
    path: str = ""
    request_id: str = ""
```

#### 4.2 Exception Middleware

Create `app/core/exceptions.py`:
- Custom exception classes (APIException, ValidationException, etc.)
- Global exception handler middleware
- Converts all exceptions to APIResponse format
- Logs errors with request context

#### 4.3 Request/Response Logging

Create `app/core/middleware.py`:
- Log incoming requests (method, path, params)
- Log outgoing responses (status, duration)
- Generate request IDs for tracing
- Performance metrics tracking

### Phase 2: Business Logic & Data Layer (Weeks 2-3)

#### 4.4 Service Layer Implementation

Create `app/services/disease_service.py`:
```python
class DiseaseService:
    def __init__(self, db: Database = Depends()):
        self.db = db
    
    async def list_diseases(self, filters: DiseaseFilterParams) -> DiseaseListResponse:
        """Retrieve diseases with filtering"""
        # Validation
        # Database query
        # Error handling
        # Return response
    
    async def create_disease(self, disease: DiseaseCreate) -> Disease:
        """Create new disease"""
    
    async def get_disease(self, disease_id: str) -> Disease:
        """Get single disease"""
    
    async def update_disease(self, id: str, data: DiseaseUpdate) -> Disease:
        """Update disease"""
    
    async def delete_disease(self, disease_id: str) -> None:
        """Delete disease"""
```

Similar services for: CountyService, PredictionService, HealthService

#### 4.5 Repository Layer (Data Access)

Create `app/repositories/disease_repository.py`:
```python
class DiseaseRepository:
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    async def find_all(self, filters: dict) -> List[Disease]:
        """Query all diseases"""
    
    async def find_by_id(self, id: str) -> Optional[Disease]:
        """Query single disease"""
    
    async def insert(self, data: dict) -> Disease:
        """Insert new disease"""
    
    async def update(self, id: str, data: dict) -> Disease:
        """Update disease"""
    
    async def delete(self, id: str) -> None:
        """Delete disease"""
```

### Phase 3: API Enhancement (Weeks 3-4)

#### 4.6 API Versioning

```
/api/v1/diseases      # Current
/api/v2/diseases      # Future improvements
```

#### 4.7 Enhanced Query Parameters

```
GET /api/v1/diseases?
  filter[category]=vector_borne &
  filter[name]=malaria &
  sort=name:asc,created_at:desc &
  include=related_counties &
  page=1 &
  limit=10
```

#### 4.8 Request Validation Models

```python
class PaginationParams(BaseModel):
    skip: int = Field(0, ge=0)
    limit: int = Field(10, ge=1, le=100)

class SortParam(BaseModel):
    field: str
    direction: Literal["asc", "desc"] = "asc"

class ListDiseaseParams(PaginationParams):
    category: Optional[DiseaseCategory] = None
    search: Optional[str] = None
    sort: Optional[List[SortParam]] = None
```

### Phase 4: Testing & Documentation (Weeks 4-5)

#### 4.9 Unit Tests

```
tests/
  unit/
    services/
      test_disease_service.py
      test_county_service.py
      test_prediction_service.py
    repositories/
      test_disease_repository.py
  integration/
    routers/
      test_diseases_router.py
      test_counties_router.py
  fixtures/
    disease_fixtures.py
    county_fixtures.py
```

#### 4.10 Integration Tests

```python
@pytest.mark.asyncio
async def test_list_diseases():
    """Test disease listing endpoint"""
    response = await client.get("/api/v1/diseases")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "data" in response.json()
```

---

## 5. HCI INTEGRATION PATTERNS

### 5.1 Error Response Format (User-Centric)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  },
  "timestamp": "2026-02-03T10:30:00Z"
}
```

### 5.2 List Response Format (Frontend-Compatible)

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "skip": 0,
      "limit": 10,
      "total": 47,
      "pages": 5,
      "current_page": 1,
      "has_next": true
    },
    "timestamp": "2026-02-03T10:30:00Z"
  }
}
```

### 5.3 Async Operation Pattern (For Long-Running Tasks)

```json
{
  "success": true,
  "data": {
    "task_id": "abc-123",
    "status": "processing",
    "progress": 45,
    "message": "Generating predictions...",
    "estimated_completion": "2026-02-03T10:35:00Z"
  }
}
```

### 5.4 Real-Time Updates via SSE

```python
@router.get("/api/v1/predictions/stream/{county_id}")
async def stream_predictions(county_id: str):
    """Stream prediction updates as they're generated"""
    async def generate():
        for update in prediction_generator(county_id):
            yield f"data: {json.dumps(update)}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

---

## 6. JSON PACKAGE AUDIT & OPTIMIZATION

### 6.1 Current Dependencies (Backend)

```
fastapi==0.109.2              ✅ Latest, stable
uvicorn[standard]==0.27.1     ✅ Good
python-dotenv==1.0.1          ✅ Good
pydantic==2.6.1               ✅ Good (v2 is faster)
pydantic-settings==2.1.0      ✅ Good
supabase==2.3.4               ✅ Good
python-dateutil==2.8.2        ✅ Good
```

### 6.2 Missing but Recommended Packages

```python
# Logging & Observability
python-json-logger==2.0.7     # Structured JSON logging

# Testing
pytest==7.4.3
pytest-asyncio==0.23.2
httpx==0.25.2                 # Async HTTP client for testing

# Validation & Security
python-jose==3.3.0            # JWT tokens
passlib==1.7.4                # Password hashing
python-multipart==0.0.6       # File upload support

# Performance & Caching
redis==5.0.1                  # Caching layer (optional)

# Database
sqlalchemy==2.0.23            # ORM (if moving from Supabase)
alembic==1.13.1               # Database migrations

# API Documentation
python-multipart==0.0.6

# Monitoring
prometheus-client==0.19.0     # Metrics collection
```

### 6.3 Frontend JSON Packages

```json
{
  "@hookform/resolvers": "^3.10.0",     ✅ Form validation
  "@supabase/supabase-js": "^2.81.1",   ✅ DB client
  "@tanstack/react-query": "^5.83.0",   ✅ Data fetching
  "axios": "^1.13.4",                    ⚠️ Can use fetch instead
  "zod": "RECOMMENDED"                    📦 TypeScript validation
}
```

### 6.4 Package Management Best Practices

**Backend** (requirements.txt):
```
# Pin to minor version for stability
fastapi==0.109.2

# Allow patch updates for security
uvicorn[standard]>=0.27.1,<0.28
```

**Frontend** (package.json):
```json
{
  "dependencies": {
    "react": "^18.0.0",      // Allow minor updates
    "axios": "^1.13.4"
  },
  "devDependencies": {
    "typescript": "~5.3.0"    // Lock patch version
  }
}
```

---

## 7. IMPLEMENTATION CHECKLIST

### Phase 1: Foundation
- [ ] Create centralized response format (`app/core/responses.py`)
- [ ] Implement exception handling middleware (`app/core/exceptions.py`)
- [ ] Add request/response logging (`app/core/middleware.py`)
- [ ] Create request ID tracking for debugging
- [ ] Document all response formats

### Phase 2: Business Logic
- [ ] Implement DiseaseService
- [ ] Implement CountyService
- [ ] Implement PredictionService
- [ ] Create repository layer for each service
- [ ] Add dependency injection setup

### Phase 3: API Enhancements
- [ ] Implement API versioning (`/api/v1/`)
- [ ] Add advanced filtering support
- [ ] Add sorting capability
- [ ] Implement cursor-based pagination
- [ ] Add data validation models

### Phase 4: Testing
- [ ] Create test fixtures
- [ ] Write unit tests for services
- [ ] Write integration tests for routers
- [ ] Achieve 80%+ code coverage
- [ ] Document testing strategy

### Phase 5: Performance
- [ ] Implement caching strategy
- [ ] Add database query optimization
- [ ] Profile API endpoints
- [ ] Set up monitoring/metrics
- [ ] Document performance benchmarks

### Phase 6: Security
- [ ] Add input sanitization
- [ ] Implement CORS policy review
- [ ] Add rate limiting
- [ ] Add request size limits
- [ ] Security audit of dependencies

### Phase 7: Documentation
- [ ] API documentation (Swagger/OpenAPI)
- [ ] Architecture documentation
- [ ] Deployment guide
- [ ] Contributing guidelines
- [ ] Performance tuning guide

---

## 8. QUICK WINS (Can Implement Immediately)

1. **Add standardized error handling** (2 hours)
2. **Implement logging middleware** (2 hours)
3. **Add input validation** (3 hours)
4. **Create response wrapper** (2 hours)
5. **Add health check endpoint with metrics** (2 hours)
6. **Document API contracts** (3 hours)
7. **Add request ID tracking** (1 hour)

---

## 9. METRICS & SUCCESS CRITERIA

### Code Quality
- [ ] Cyclomatic complexity < 5 per function
- [ ] Functions < 30 lines of code (avg)
- [ ] Test coverage >= 80%
- [ ] Type hints on all functions (mypy clean)

### API Performance
- [ ] 95th percentile response time < 200ms
- [ ] Error rate < 0.5%
- [ ] Uptime >= 99.5%

### Developer Experience
- [ ] API fully documented in Swagger UI
- [ ] New developers onboard in < 1 hour
- [ ] Clear error messages guide users
- [ ] Logs enable easy debugging

### User Experience (from Frontend)
- [ ] Consistent error handling across app
- [ ] Loading states work reliably
- [ ] No unexpected API errors
- [ ] Data formats match frontend expectations

---

## 10. RECOMMENDED TOOLS & TECHNOLOGIES

### Development
- **FastAPI**: Already using ✅
- **Pydantic**: Data validation ✅
- **Python 3.11+**: Latest features

### Database
- **Supabase**: Current choice ✅
- **SQLAlchemy**: ORM alternative (if needed)
- **Alembic**: Migration management

### Testing
- **pytest**: Unit/integration tests
- **pytest-cov**: Coverage tracking
- **httpx**: Async HTTP testing

### Logging & Monitoring
- **structlog**: Structured logging
- **prometheus**: Metrics
- **Sentry**: Error tracking (optional)

### Deployment
- **Docker**: Containerization
- **Railway.app**: Current platform ✅
- **GitHub Actions**: CI/CD

---

## 11. REFERENCES

- [FastAPI Best Practices](https://fastapi.tiangolo.com/)
- [Clean Code in Python](https://www.pyoptotech.com/clean-code-in-python/)
- [API Design Best Practices](https://restfulapi.net/)
- [HCI Principles](https://www.nngroup.com/articles/usability-101/)

---

## Next Steps

1. **Review** this document with team
2. **Prioritize** phases based on requirements
3. **Create** GitHub issues for each task
4. **Assign** team members to tasks
5. **Start** Phase 1 (Foundation)

