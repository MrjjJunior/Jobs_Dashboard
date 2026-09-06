from fastapi import APIRouter
from ..models import EmailDraftRequest
from ..services.ai_service import generate_email_draft

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/draft-email")
def draft_email(req: EmailDraftRequest):
    """
    Generate professional follow-up, thank you, negotiation, or withdrawal email.
    """
    draft = generate_email_draft(req)
    return {
        "draft": draft,
        "emailType": req.emailType,
        "company": req.company,
        "role": req.role
    }
