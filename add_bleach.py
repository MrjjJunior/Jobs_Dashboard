import re
with open('backend/routers/jobs.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
'''from typing import List, Optional''',
'''from typing import List, Optional
import bleach'''
)

target = '''@router.post("", response_model=JobApplication, status_code=201)
def create_or_update_job(
    job: JobApplication,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Create or update a job application for the user."""
    return db.upsert_job(job, user_id=x_user_id or job.userId)'''

new_content = '''@router.post("", response_model=JobApplication, status_code=201)
def create_or_update_job(
    job: JobApplication,
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
):
    """Create or update a job application for the user."""
    # Input sanitization for rich text
    if job.notes:
        job.notes = bleach.clean(job.notes, tags=bleach.sanitizer.ALLOWED_TAGS + ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'ul', 'ol', 'li'])
    if job.description:
        job.description = bleach.clean(job.description, tags=bleach.sanitizer.ALLOWED_TAGS + ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'ul', 'ol', 'li'])
    
    return db.upsert_job(job, user_id=x_user_id or job.userId)'''

content = content.replace(target, new_content)

with open('backend/routers/jobs.py', 'w', encoding='utf-8') as f:
    f.write(content)
