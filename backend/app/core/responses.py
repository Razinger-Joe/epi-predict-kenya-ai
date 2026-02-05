"""
API Response Models

Standard response formats for all API endpoints.
"""

from typing import Generic, TypeVar, List, Optional, Any
from pydantic import BaseModel


DataT = TypeVar("DataT")


class APIResponse(BaseModel, Generic[DataT]):
    """Standard API response wrapper"""
    success: bool = True
    message: str = "Success"
    data: Optional[DataT] = None
    
    @classmethod
    def success_response(
        cls,
        data: Optional[DataT] = None,
        message: str = "Success"
    ) -> "APIResponse[DataT]":
        """Create a success response"""
        return cls(success=True, message=message, data=data)
    
    @classmethod
    def error_response(
        cls,
        message: str,
        data: Optional[DataT] = None
    ) -> "APIResponse[DataT]":
        """Create an error response"""
        return cls(success=False, message=message, data=data)
    
    @classmethod
    def list_response(
        cls,
        data: List[Any],
        count: int,
        message: str = "Success"
    ) -> "APIResponse[List[Any]]":
        """Create a list response"""
        return cls(success=True, message=message, data=data)


class ListResponse(BaseModel, Generic[DataT]):
    """Response for list endpoints with pagination"""
    success: bool = True
    message: str = "Success"
    data: List[DataT] = []
    total: int = 0
    page: int = 1
    page_size: int = 50
    has_more: bool = False


class ErrorResponse(BaseModel):
    """Error response format"""
    success: bool = False
    message: str
    error_code: Optional[str] = None
    details: Optional[Any] = None
