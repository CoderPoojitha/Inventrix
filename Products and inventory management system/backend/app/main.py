from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import settings

def get_application() -> FastAPI:
    """
    Initialize FastAPI application with settings and routers.
    """
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url="/api/openapi.json",
    )

    # Set all CORS enabled origins
    if settings.BACKEND_CORS_ORIGINS:
        application.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Register Logging Middleware
    from app.core.logging import LoggingMiddleware
    application.add_middleware(LoggingMiddleware)

    # Include main API router
    application.include_router(api_router, prefix="/api")

    # Register global exception handlers
    from app.core.exceptions import register_exception_handlers
    register_exception_handlers(application)

    return application

app = get_application()
