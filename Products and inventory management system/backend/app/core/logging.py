import os
import time
import logging
from logging.handlers import RotatingFileHandler
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Ensure logs directory exists at the root of the project
LOG_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "logs")
os.makedirs(LOG_DIR, exist_ok=True)

# Create custom logger
logger = logging.getLogger("app_logger")
logger.setLevel(logging.INFO)

# Prevent duplicate handlers if module is reloaded
if not logger.handlers:
    # Custom format matching requirement: timestamp | message
    formatter = logging.Formatter('%(asctime)s | %(message)s', datefmt='%Y-%m-%d %H:%M:%S')

    # 1. Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    # 2. Rotating File Handler (10MB max size, keep 5 backups)
    file_handler = RotatingFileHandler(
        os.path.join(LOG_DIR, "app.log"),
        maxBytes=10 * 1024 * 1024,
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

class LoggingMiddleware(BaseHTTPMiddleware):
    """
    Middleware to log every HTTP request, its response status, and execution time.
    Also acts as a catch-all for unhandled exceptions to ensure they are logged.
    """
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            execution_time = time.time() - start_time
            
            # Log format: method | path | status | execution_time
            logger.info(f"{request.method} | {request.url.path} | {response.status_code} | {execution_time:.4f}s")
            
            return response
            
        except Exception as e:
            execution_time = time.time() - start_time
            
            # Log format: method | path | status | execution_time | exception
            logger.error(
                f"{request.method} | {request.url.path} | 500 | {execution_time:.4f}s | UNHANDLED EXCEPTION: {str(e)}", 
                exc_info=True
            )
            
            # Re-raise the exception so it propagates to the global exception handler
            raise e
