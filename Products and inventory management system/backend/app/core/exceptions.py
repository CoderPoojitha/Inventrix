from typing import Any, Optional
from fastapi import Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

class CustomBaseException(Exception):
    """Base class for all custom exceptions"""
    def __init__(self, message: str, details: Optional[Any] = None):
        self.message = message
        self.details = details

class ResourceNotFoundException(CustomBaseException):
    """Raised when a requested resource is not found (404)"""
    pass

class DuplicateResourceException(CustomBaseException):
    """Raised when attempting to create a resource that already exists (409)"""
    pass

class BusinessValidationException(CustomBaseException):
    """Raised when a business rule or validation fails (400)"""
    pass

def register_exception_handlers(app):
    """
    Registers custom exception handlers on the FastAPI application
    to ensure a consistent JSON response format.
    """
    
    def _create_response(status_code: int, message: str, details: Any = None):
        return JSONResponse(
            status_code=status_code,
            content={
                "success": False,
                "message": message,
                "details": details
            }
        )

    @app.exception_handler(ResourceNotFoundException)
    async def resource_not_found_handler(request: Request, exc: ResourceNotFoundException):
        return _create_response(status.HTTP_404_NOT_FOUND, exc.message, exc.details)

    @app.exception_handler(DuplicateResourceException)
    async def duplicate_resource_handler(request: Request, exc: DuplicateResourceException):
        return _create_response(status.HTTP_409_CONFLICT, exc.message, exc.details)

    @app.exception_handler(BusinessValidationException)
    async def business_validation_handler(request: Request, exc: BusinessValidationException):
        return _create_response(status.HTTP_400_BAD_REQUEST, exc.message, exc.details)

    # Catch standard FastAPI HTTP exceptions to maintain the consistent response schema
    @app.exception_handler(HTTPException)
    async def custom_http_exception_handler(request: Request, exc: HTTPException):
        return _create_response(exc.status_code, exc.detail)

    # Catch FastAPI request validation errors to maintain the consistent response schema
    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        return _create_response(
            status.HTTP_422_UNPROCESSABLE_ENTITY, 
            "Data validation failed", 
            exc.errors()
        )
