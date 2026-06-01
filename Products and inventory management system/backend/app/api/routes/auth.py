from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.schemas.auth import AdminCreate, AdminResponse, Token
from app.services.auth_service import AuthService
from app.core.security import create_access_token
from app.api.deps import get_current_admin, get_auth_service
from app.models.admin import Admin

router = APIRouter()

@router.post("/register", response_model=AdminResponse, status_code=status.HTTP_201_CREATED, summary="Register a new Admin")
async def register_admin(
    admin_in: AdminCreate,
    auth_service: AuthService = Depends(get_auth_service)
) -> Any:
    """
    Registers a new admin user and hashes their password using bcrypt.
    """
    return await auth_service.create_admin(admin_in)

@router.post("/login", response_model=Token, summary="Login to get JWT Access Token")
async def login_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service)
) -> Any:
    """
    OAuth2 compatible token login, required for Swagger UI authentication.
    Pass email as the username.
    """
    admin = await auth_service.authenticate_admin(email=form_data.username, password=form_data.password)
    if not admin:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
    
    # Encode the user's email into the JWT sub claim
    access_token = create_access_token(subject=admin.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=AdminResponse, summary="Get Current Admin Profile")
async def read_admin_me(
    current_admin: Admin = Depends(get_current_admin)
) -> Any:
    """
    Returns the currently authenticated admin profile.
    Requires a valid JWT Bearer token in the Authorization header.
    """
    return current_admin
