from fastapi import APIRouter, HTTPException, Query, Header
from typing import List, Optional
from datetime import date
from ..models import (
    JobApplication,
    JobStage,
    BatchDeleteRequest,
    BatchStageUpdateRequest,
    StageUpdatePayload,
    RatingUpdatePayload,
    JobImportRequest,
    ExtractedJobPreview
)
from .. import database as db
from ..services.job_importer import import_job_from_url

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

@router.post("/import", response_model=ExtractedJobPreview)
async def import_job(req: JobImportRequest):
    """
    Import job listing metadata from a remote URL.
    Parses JSON-LD (JobPosting), HTML elements, and optional AI extraction.
    Returns a preview object for user review/confirmation before saving.
    """
    if not req.url or not req.url.strip():
        raise HTTPException(status_code=400, detail="Job listing URL is required.")
    return await import_job_from_url(req.url.strip())


@router.get("", response_model=List[JobApplication])
def list_jobs(
    stage: Optional[str] = Query(None, description="Filter by stage or 'active' / 'all'"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    search: Optional[str] = Query(None, description="Search query string"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Retrieve all jobs for the authenticated user with optional filtering."""
    return db.get_all_jobs(user_id=x_user_id, stage=stage, priority=priority, search=search)

@router.post("", response_model=JobApplication, status_code=201)
def create_or_update_job(
    job: JobApplication,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Create or update a job application for the user."""
    return db.upsert_job(job, user_id=x_user_id or job.userId)

@router.get("/{job_id}", response_model=JobApplication)
def get_job(
    job_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Retrieve a single job application by ID."""
    job = db.get_job_by_id(job_id, user_id=x_user_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job application not found")
    return job

@router.put("/{job_id}", response_model=JobApplication)
def update_job(
    job_id: str,
    job: JobApplication,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Update an existing job application."""
    job.id = job_id
    return db.upsert_job(job, user_id=x_user_id or job.userId)

@router.delete("/{job_id}")
def delete_job(
    job_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Delete a job application by ID."""
    success = db.delete_job_by_id(job_id, user_id=x_user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Job application not found")
    return {"status": "success", "deleted_id": job_id}

@router.post("/batch-delete")
def batch_delete(
    req: BatchDeleteRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Delete multiple job applications by ID list."""
    count = db.batch_delete_jobs(req.ids, user_id=x_user_id)
    return {"status": "success", "deleted_count": count}

@router.post("/batch-stage")
def batch_update_stage(
    req: BatchStageUpdateRequest,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Update stage for multiple job applications."""
    count = db.batch_update_stages(req.ids, req.stage, user_id=x_user_id)
    return {"status": "success", "updated_count": count}

@router.patch("/{job_id}/stage", response_model=JobApplication)
def quick_update_stage(
    job_id: str,
    payload: StageUpdatePayload,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Quickly move job to another stage (Kanban drag-and-drop or table actions)."""
    job = db.get_job_by_id(job_id, user_id=x_user_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.stage = payload.stage
    job.lastActivityDate = date.today().isoformat()
    return db.upsert_job(job, user_id=x_user_id or job.userId)

@router.patch("/{job_id}/rating", response_model=JobApplication)
def quick_update_rating(
    job_id: str,
    payload: RatingUpdatePayload,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Update job priority/interest rating (1-5)."""
    job = db.get_job_by_id(job_id, user_id=x_user_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    job.rating = payload.rating
    return db.upsert_job(job, user_id=x_user_id or job.userId)

@router.post("/{job_id}/interviews/{interview_id}/complete", response_model=JobApplication)
def mark_interview_completed(
    job_id: str,
    interview_id: str,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Mark a scheduled interview round as completed."""
    job = db.get_job_by_id(job_id, user_id=x_user_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    found = False
    for interview in job.interviews:
        if interview.id == interview_id:
            interview.completed = True
            found = True
            break
            
    if not found:
        raise HTTPException(status_code=404, detail="Interview round not found")

    job.lastActivityDate = date.today().isoformat()
    return db.upsert_job(job, user_id=x_user_id or job.userId)

