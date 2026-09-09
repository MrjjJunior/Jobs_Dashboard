from fastapi import APIRouter, Header, HTTPException, status, Request
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
from ..models import UserProfile, UserGoals, SignupRequest, LoginRequest, AuthResponse
from .. import database as db

router = APIRouter(prefix="/api", tags=["profile_and_goals"])

@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
def signup(request: Request, req: SignupRequest):
    """Register a new user account with hashed password."""
    if not req.email or not req.email.strip() or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    if not req.password or len(req.password.strip()) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long.")
    if not req.name or not req.name.strip():
        raise HTTPException(status_code=400, detail="Please enter your full name.")
    
    try:
        profile = db.create_user_account(
            name=req.name,
            email=req.email,
            password=req.password,
            role=req.role
        )
        return AuthResponse(user=profile, token=f"token-{profile.id}")
    except ValueError as err:
        raise HTTPException(status_code=400, detail=str(err))

@router.post("/auth/login", response_model=AuthResponse)
@limiter.limit("10/minute")
def login(request: Request, req: LoginRequest):
    """Authenticate user with email and password."""
    if not req.email or not req.password:
        raise HTTPException(status_code=400, detail="Email and password are required.")
    
    user = db.authenticate_user(email=req.email, password=req.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password. Please check your credentials.")
    
    return AuthResponse(user=user, token=f"token-{user.id}")

@router.get("/profile", response_model=Optional[UserProfile])
def get_profile(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    """Retrieve user profile data."""
    profile = db.get_user_profile(user_id=x_user_id)
    if not profile:
        return UserProfile(id=x_user_id or "", isLoggedIn=False)
    return profile

@router.put("/profile", response_model=UserProfile)
def update_profile(profile: UserProfile):
    """Save or update user profile."""
    return db.save_user_profile(profile)

@router.get("/goals", response_model=UserGoals)
def get_goals(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    """Retrieve user search targets & monthly goals."""
    return db.get_user_goals(user_id=x_user_id)

@router.put("/goals", response_model=UserGoals)
def update_goals(
    goals: UserGoals,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Save or update user search targets & monthly goals."""
    return db.save_user_goals(goals, user_id=x_user_id or goals.userId)

@router.post("/reset-demo")
def reset_demo_data(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    """Reset jobs and resumes data."""
    db.reset_all_data(user_id=x_user_id)
    return {"status": "success", "message": "Database reset successfully."}


@router.delete("/users/me")
def delete_user_account(x_user_id: Optional[str] = Header(None, alias="X-User-Id")):
    """Hard delete user account and all associated data."""
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")
    success = db.delete_account_and_data(x_user_id)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to delete account.")
    return {"status": "success", "message": "Account deleted."}
