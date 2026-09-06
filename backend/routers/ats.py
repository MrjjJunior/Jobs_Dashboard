from fastapi import APIRouter
from ..models import AtsCalculateRequest, AtsMatchResult
from ..services.ats_service import calculate_ats_match

router = APIRouter(prefix="/api/ats", tags=["ats"])

@router.post("/calculate", response_model=AtsMatchResult)
def calculate_score(req: AtsCalculateRequest):
    """
    Run keyword analysis, structural checks, and calculate ATS compatibility score.
    """
    return calculate_ats_match(
        resume_text=req.resumeText,
        job_description_text=req.jobDescriptionText,
        target_job_role=req.targetJobRole or ""
    )
