# HCI Principles Integration Guide - Backend API
## Aligning Backend with Frontend User Experience

**Created:** February 3, 2026  
**Audience:** Backend developers, product team  
**Purpose:** Ensure API responses support excellent user experience

---

## Table of Contents

1. [HCI Principles Overview](#hci-principles-overview)
2. [Frontend Patterns Analysis](#frontend-patterns-analysis)
3. [Backend API Alignment](#backend-api-alignment)
4. [Response Format Guidelines](#response-format-guidelines)
5. [Error Messaging Best Practices](#error-messaging-best-practices)
6. [Real-Time Updates](#real-time-updates)
7. [Loading States & Progress](#loading-states--progress)

---

## HCI Principles Overview

Human-Computer Interaction focuses on making systems that are:

| Principle | Frontend Example | Backend Implementation |
|-----------|-----------------|----------------------|
| **Feedback** | Loading spinners | Quick responses, status codes |
| **Visibility** | Clear error messages | Descriptive error codes |
| **Control** | User can cancel action | Async operations with status |
| **Consistency** | Same UI patterns | Same API response format |
| **Efficiency** | Keyboard shortcuts | Optimized endpoints |
| **Help** | Tooltips & docs | Swagger UI with examples |

---

## Frontend Patterns Analysis

### Pattern 1: Loading States

The dashboard shows loading states for:
- List loading
- Item detail loading
- Operation progress

```typescript
// Frontend expects this pattern
const { data, isLoading, error } = useQuery(...)

if (isLoading) return <Spinner />
if (error) return <ErrorAlert />
return <Content data={data} />
```

**Backend Requirement:** Respond quickly or provide progress endpoints

### Pattern 2: Error Handling

Frontend displays error messages with context:
```typescript
// From src/services/api.ts
if (!response.ok) {
    const error = await response.json().catch(() => 
        ({ detail: 'Unknown error' })
    );
    throw new Error(error.detail || `HTTP ${response.status}`);
}
```

**Backend Requirement:** Include `detail` or `message` field in error responses

### Pattern 3: Data Display

Dashboard cards show:
- Current value (animated)
- Trend indicator (↑ up, ↓ down)
- Last updated timestamp

```typescript
// StatCards component expects:
{
  title: "Active Alerts",
  value: 7,
  change: "+2 from yesterday",
  trend: "up",
  lastUpdated: "2 hours ago"
}
```

**Backend Requirement:** Include metadata with data

### Pattern 4: List Navigation

Counties/diseases lists support:
- Pagination
- Filtering (by category, region, risk level)
- Searching
- Sorting

```typescript
// Frontend makes requests like:
GET /api/v1/diseases?
  category=vector_borne&
  search=malaria&
  skip=0&
  limit=10&
  sort=name:asc
```

**Backend Requirement:** Support query parameters for all above

### Pattern 5: Real-Time Updates

Dashboard updates disease statistics in real-time.

**Backend Requirement:** Provide WebSocket or SSE endpoint for updates

---

## Backend API Alignment

### Alignment Goal: API responses enable excellent UX

```
User Action → Frontend Request → Backend Response → UI Update
```

Each step requires proper support:

1. **User Action:** Clear UI (frontend responsibility)
2. **Request:** Well-formed, documented (frontend responsibility)
3. **Response:** Includes all needed data, predictable format (BACKEND)
4. **UI Update:** Smooth animation, feedback (frontend responsibility)

### Key Backend Responsibilities

#### 1. Response Completeness
Include all data needed to display and update UI:

```json
{
  "success": true,
  "data": {
    "id": "001",
    "name": "Mombasa",
    "active_cases": 123,
    "risk_level": "high",
    "trend": "+5%",
    "last_updated": "2026-02-03T10:30:00Z"
  },
  "timestamp": "2026-02-03T10:35:00Z"
}
```

**Include:** Timestamp for "last updated" display

#### 2. Response Speed
Frontend shows spinners during loading. Backend should:
- Respond within 200ms for list endpoints
- Respond within 500ms for complex queries
- Provide async endpoints for long operations

#### 3. Error Clarity
Users need to understand what went wrong:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {
        "field": "name",
        "message": "Name is required"
      }
    ]
  },
  "timestamp": "2026-02-03T10:35:00Z"
}
```

**Not Good:**
```json
{
  "error": "500: Internal Server Error"
}
```

#### 4. Consistency
Same response format for all endpoints = easier frontend code:

```python
# Backend: ALWAYS return same structure
@router.get("/diseases")
async def list_diseases(...) -> ListResponse:
    return list_response(...)

@router.get("/counties")
async def list_counties(...) -> ListResponse:
    return list_response(...)

# Frontend: Same handling code for both
const { data, pagination } = await api.get('/api/v1/diseases')
const { data, pagination } = await api.get('/api/v1/counties')
// Same response structure works for both!
```

---

## Response Format Guidelines

### Rule 1: Always Wrap Responses

```python
# ❌ BAD: No wrapper
@router.get("/diseases")
async def list_diseases():
    return [...]  # Can't tell if success or error

# ✅ GOOD: Wrapped response
@router.get("/diseases")
async def list_diseases():
    return list_response(items=[], total=0)
```

### Rule 2: Include Timestamps

```python
# ✅ GOOD: Includes timestamp
{
    "success": true,
    "data": {...},
    "timestamp": "2026-02-03T10:30:00Z"
}

# Frontend can display "Updated 5 minutes ago"
```

### Rule 3: Provide Request ID for Debugging

```python
# ✅ GOOD: Includes request_id
{
    "success": false,
    "error": {...},
    "request_id": "abc-123-def",
    "timestamp": "2026-02-03T10:30:00Z"
}

# Frontend/user can share request_id for support
# Backend can search logs with request_id
```

### Rule 4: Pagination Metadata for Navigation

```python
# ✅ GOOD: Includes pagination info
{
    "success": true,
    "data": [...],
    "pagination": {
        "skip": 0,
        "limit": 10,
        "total": 47,
        "pages": 5,
        "current_page": 1,
        "has_next": true,
        "has_previous": false
    }
}

# Frontend can:
# - Show "1 of 5" pages
# - Enable/disable next/previous buttons
# - Calculate progress
```

### Rule 5: Include Filters Applied

```python
# ✅ GOOD: Shows what filters were applied
{
    "success": true,
    "data": [...],
    "filters": {
        "category": "vector_borne",
        "search": "malaria",
        "risk_level": "high"
    },
    "pagination": {...}
}

# Frontend can display:
# "Showing vector_borne diseases with 'malaria'"
```

---

## Error Messaging Best Practices

### Be User-Centric

```python
# ❌ BAD: Technical jargon
{
    "error": {
        "code": "CONSTRAINT_VIOLATION",
        "message": "Foreign key constraint failed"
    }
}

# ✅ GOOD: User-friendly
{
    "error": {
        "code": "INVALID_COUNTY",
        "message": "The selected county does not exist"
    }
}
```

### Provide Actionable Guidance

```python
# ❌ BAD: Problem only
{
    "error": {
        "message": "Invalid parameter"
    }
}

# ✅ GOOD: Problem + Solution
{
    "error": {
        "code": "INVALID_PARAMETER",
        "message": "Invalid limit parameter",
        "details": [
            {
                "field": "limit",
                "message": "Limit must be between 1 and 100"
            }
        ]
    }
}
```

### Use Correct HTTP Status Codes

```python
# Common codes and what they mean to frontend
200 OK              # Success
201 Created         # New resource created
204 No Content      # Success, no data returned
400 Bad Request     # User error (invalid input)
401 Unauthorized    # Need to log in
403 Forbidden       # Logged in but no permission
404 Not Found       # Resource doesn't exist
409 Conflict        # Data conflict (duplicate, etc.)
422 Unprocessable   # Validation failed
429 Too Many        # Rate limited
500 Server Error    # Something went wrong
503 Unavailable     # Temporary outage
```

### HCI Response by Status

```json
// 400 Bad Request
{
    "success": false,
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Please check your input"
    }
}

// 404 Not Found
{
    "success": false,
    "error": {
        "code": "NOT_FOUND",
        "message": "County not found"
    }
}

// 429 Too Many Requests
{
    "success": false,
    "error": {
        "code": "RATE_LIMITED",
        "message": "Too many requests. Please wait 60 seconds."
    }
}

// 503 Service Unavailable
{
    "success": false,
    "error": {
        "code": "SERVICE_UNAVAILABLE",
        "message": "Database is temporarily unavailable. Please try again in a moment."
    }
}
```

---

## Real-Time Updates

### Pattern 1: Server-Sent Events (SSE)

For streaming updates without WebSocket complexity:

```python
@router.get("/api/v1/predictions/stream/{county_id}")
async def stream_predictions(county_id: str):
    """Stream prediction updates as they're generated"""
    async def generate():
        # Simulate prediction generation
        for progress in range(0, 101, 10):
            yield f"data: {json.dumps({\
                'type': 'progress',\
                'progress': progress,\
                'message': f'Generating predictions... {progress}%'\
            })}\n\n"
            await asyncio.sleep(1)
        
        # Send final result
        yield f"data: {json.dumps({\
            'type': 'complete',\
            'data': {...}\
        })}\n\n"
    
    return StreamingResponse(generate(), media_type="text/event-stream")
```

Frontend usage:
```typescript
const eventSource = new EventSource('/api/v1/predictions/stream/047');

eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.type === 'progress') {
        setProgress(data.progress);
    } else if (data.type === 'complete') {
        setPredictions(data.data);
    }
};
```

### Pattern 2: Polling with Efficient Headers

For simple updates, client polls but backend minimizes data:

```python
@router.get("/api/v1/diseases/{id}")
async def get_disease(
    id: str,
    if_modified_since: Optional[str] = Header(None)
):
    """Get disease, return 304 if not modified"""
    disease = await service.get_disease(id)
    
    # Check if client has current version
    if if_modified_since:
        client_time = parse_date(if_modified_since)
        if disease.updated_at <= client_time:
            return Response(status_code=304)  # Not Modified
    
    return success_response(disease)
```

---

## Loading States & Progress

### Pattern 1: Indicating Long Operations

```python
@router.post("/api/v1/predictions/generate")
async def generate_predictions(request: PredictionRequest):
    """
    Generate predictions asynchronously.
    Return immediately with task ID.
    """
    task_id = str(uuid.uuid4())
    
    # Start background task
    background_tasks.add_task(
        generate_predictions_task,
        task_id=task_id,
        county_id=request.county_id
    )
    
    # Return immediately with task ID
    return success_response({
        "task_id": task_id,
        "status": "processing",
        "message": "Generating predictions...",
        "check_status_url": f"/api/v1/predictions/{task_id}/status"
    })

@router.get("/api/v1/predictions/{task_id}/status")
async def check_prediction_status(task_id: str):
    """Check status of long-running prediction"""
    task = await task_service.get_task(task_id)
    
    if task.status == "completed":
        return success_response({
            "status": "completed",
            "data": task.result
        })
    elif task.status == "failed":
        return error_response(
            code=ErrorCode.INTERNAL_ERROR,
            message="Prediction generation failed"
        )
    else:
        return success_response({
            "status": "processing",
            "progress": task.progress,
            "message": task.message
        })
```

Frontend usage:
```typescript
// Start long operation
const response = await api.post('/api/v1/predictions/generate', data);
const taskId = response.data.task_id;

// Poll for completion
const pollTask = setInterval(async () => {
    const status = await api.get(`/api/v1/predictions/${taskId}/status`);
    
    if (status.data.status === 'completed') {
        clearInterval(pollTask);
        setPredictions(status.data.data);
    } else {
        setProgress(status.data.progress);
    }
}, 1000);
```

### Pattern 2: Batch Operations

```python
@router.post("/api/v1/counties/bulk-update")
async def bulk_update_counties(updates: List[CountyUpdate]):
    """Update multiple counties, return partial results"""
    results = []
    errors = []
    
    for update in updates:
        try:
            result = await service.update_county(update.id, update)
            results.append(result)
        except Exception as e:
            errors.append({
                "county_id": update.id,
                "error": str(e)
            })
    
    return success_response({
        "updated": len(results),
        "failed": len(errors),
        "results": results,
        "errors": errors
    })
```

---

## Implementation Checklist

### Response Format
- [x] All endpoints return wrapped responses (success_response, error_response, list_response)
- [x] All errors include user-friendly messages
- [x] All timestamps in ISO 8601 format with Z suffix
- [x] All list responses include pagination metadata
- [x] All error responses include error code for programmatic handling

### API Documentation
- [ ] Swagger UI includes example responses
- [ ] Error codes documented in API docs
- [ ] Response time SLAs documented
- [ ] Rate limits documented

### Real-Time Patterns
- [ ] SSE endpoint for streaming updates (optional, phase 2)
- [ ] Polling-friendly endpoints with 304 Not Modified support
- [ ] Task status endpoints for long operations

### Monitoring
- [ ] Response time metrics collected
- [ ] Error rate tracked by error code
- [ ] User feedback loop established
- [ ] Frontend error logs reviewed weekly

---

## Testing: HCI Alignment

### Test: Response Format Consistency

```python
def test_all_endpoints_return_wrapped_response():
    """Verify all endpoints follow response wrapper pattern"""
    endpoints = [
        ("/api/v1/diseases", "GET"),
        ("/api/v1/counties", "GET"),
        ("/api/v1/predictions", "GET"),
    ]
    
    for path, method in endpoints:
        response = client.request(method, path)
        data = response.json()
        
        assert "success" in data, f"{path} missing 'success' field"
        assert "timestamp" in data, f"{path} missing 'timestamp' field"
```

### Test: Error Messages Are User-Friendly

```python
def test_error_messages_are_understandable():
    """Verify error messages don't include technical jargon"""
    response = client.get("/api/v1/diseases/invalid")
    data = response.json()
    
    message = data["error"]["message"]
    
    # Should be understandable by non-technical users
    assert "FK constraint" not in message
    assert "database" not in message.lower()
    assert "null" not in message.lower()
```

---

## References

- [Nielsen Norman Group: Usability 101](https://www.nngroup.com/articles/usability-101/)
- [API Design Best Practices](https://www.smashingmagazine.com/2018/01/api-design-best-practices/)
- [Stripe API Design Lessons](https://stripe.com/blog/api-versioning)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)

---

**Version:** 1.0  
**Last Updated:** February 3, 2026  
**Next Review:** March 3, 2026
