from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from typing import List, Optional
import uuid
from datetime import date
from ..models import ResumeItem
from ..services.file_service import parse_uploaded_document
from ..services.ats_service import extract_keywords
from .. import database as db

router = APIRouter(prefix="/api/resumes", tags=["resumes"])

@router.get("", response_model=List[ResumeItem])
def list_resumes():
    """List all stored resume versions."""
    return db.get_all_resumes()

@router.post("", response_model=ResumeItem, status_code=201)
def create_or_update_resume(resume: ResumeItem):
    """Create or update a resume item."""
    return db.upsert_resume(resume)

@router.get("/{resume_id}", response_model=ResumeItem)
def get_resume(resume_id: str):
    """Retrieve a specific resume version by ID."""
    resume = db.get_resume_by_id(resume_id)
    if not resume:
        raise HTTPException(status_code=404, detail="Resume not found")
    return resume

@router.put("/{resume_id}", response_model=ResumeItem)
def update_resume(resume_id: str, resume: ResumeItem):
    """Update resume content and metadata."""
    resume.id = resume_id
    return db.upsert_resume(resume)

@router.delete("/{resume_id}")
def delete_resume(resume_id: str):
    """Delete a resume version."""
    success = db.delete_resume_by_id(resume_id)
    if not success:
        raise HTTPException(status_code=404, detail="Resume not found")
    return {"status": "success", "deleted_id": resume_id}

@router.post("/upload", response_model=ResumeItem)
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    targetRole: Optional[str] = Form(None)
):
    """
    Upload a resume file (PDF, DOCX, TXT, RTF) to parse and save directly.
    """
    contents = await file.read()
    parse_result = parse_uploaded_document(file.filename, contents)
    
    if parse_result.get("error") and not parse_result.get("text"):
        raise HTTPException(status_code=400, detail=parse_result["error"])

    text = parse_result.get("text", "")
    extracted_skills = extract_keywords(text)

    # Human-friendly file size
    size_kb = len(contents) / 1024.0
    size_str = f"{size_kb:.1f} KB" if size_kb < 1024 else f"{(size_kb/1024):.1f} MB"

    resume_item = ResumeItem(
        id=f"resume-{uuid.uuid4().hex[:8]}",
        name=file.filename,
        fileName=file.filename,
        fileSize=size_str,
        uploadDate=date.today().isoformat(),
        targetRole=targetRole or "Software Professional",
        content=text,
        skills=extracted_skills,
        isDefault=False
    )

    return db.upsert_resume(resume_item)
