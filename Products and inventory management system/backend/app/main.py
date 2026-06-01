from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import api_router
from app.core.config import settings

def get_application() -> FastAPI:
    application = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url="/api/openapi.json",
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://inventrix-ruby.vercel.app",
            "http://localhost:5173",
            "http://localhost:3000",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from app.core.logging import LoggingMiddleware
    application.add_middleware(LoggingMiddleware)

    application.include_router(api_router, prefix="/api")

    from app.core.exceptions import register_exception_handlers
    register_exception_handlers(application)

    return application

app = get_application()