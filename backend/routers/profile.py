from fastapi import APIRouter
from ..models import UserProfile, UserGoals
from .. import database as db

router = APIRouter(prefix="/api", tags=["profile_and_goals"])

@router.get("/profile", response_model=UserProfile)
def get_profile():
    """Retrieve user profile data."""
    return db.get_user_profile()

@router.put("/profile", response_model=UserProfile)
def update_profile(profile: UserProfile):
    """Save or update user profile."""
    return db.save_user_profile(profile)

@router.get("/goals", response_model=UserGoals)
def get_goals():
    """Retrieve user search targets & monthly goals."""
    return db.get_user_goals()

@router.put("/goals", response_model=UserGoals)
def update_goals(goals: UserGoals):
    """Save or update user search targets & monthly goals."""
    return db.save_user_goals(goals)

@router.post("/reset-demo")
def reset_demo_data():
    """Reset jobs and resumes data."""
    db.reset_all_data()
    return {"status": "success", "message": "Database reset successfully."}
