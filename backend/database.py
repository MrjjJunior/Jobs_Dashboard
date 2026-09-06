import sqlite3
import json
import os
from typing import List, Optional, Dict, Any
from .models import (
    JobApplication,
    ResumeItem,
    UserProfile,
    UserGoals,
    JobStage
)

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "jobs_dashboard.db"))

def get_connection() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Create database tables and populate defaults if empty."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # Jobs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                company TEXT NOT NULL,
                role TEXT NOT NULL,
                stage TEXT NOT NULL,
                priority TEXT NOT NULL,
                workplace_type TEXT,
                rating INTEGER DEFAULT 0,
                applied_date TEXT,
                last_activity_date TEXT,
                ats_score INTEGER,
                data_json TEXT NOT NULL
            )
        """)

        # Resumes table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                target_role TEXT,
                is_default INTEGER DEFAULT 0,
                data_json TEXT NOT NULL
            )
        """)

        # User Profile table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profile (
                id TEXT PRIMARY KEY,
                data_json TEXT NOT NULL
            )
        """)

        # User Goals table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_goals (
                id TEXT PRIMARY KEY,
                data_json TEXT NOT NULL
            )
        """)

        conn.commit()

        # Seed default profile if empty
        cursor.execute("SELECT COUNT(*) FROM user_profile")
        if cursor.fetchone()[0] == 0:
            default_profile = UserProfile()
            cursor.execute(
                "INSERT INTO user_profile (id, data_json) VALUES (?, ?)",
                (default_profile.id, default_profile.model_dump_json())
            )

        # Seed default goals if empty
        cursor.execute("SELECT COUNT(*) FROM user_goals")
        if cursor.fetchone()[0] == 0:
            default_goals = UserGoals()
            cursor.execute(
                "INSERT INTO user_goals (id, data_json) VALUES (?, ?)",
                ("default", default_goals.model_dump_json())
            )

        conn.commit()


# ==========================================
# Jobs CRUD Operations
# ==========================================

def get_all_jobs(
    stage: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None
) -> List[JobApplication]:
    with get_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT data_json FROM jobs"
        params = []
        conditions = []

        if stage and stage != 'all':
            if stage == 'active':
                conditions.append("stage NOT IN ('rejected', 'withdrawn', 'wishlist')")
            else:
                conditions.append("stage = ?")
                params.append(stage)

        if priority and priority != 'all':
            conditions.append("priority = ?")
            params.append(priority)

        if conditions:
            query += " WHERE " + " AND ".join(conditions)

        query += " ORDER BY rowid DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        jobs: List[JobApplication] = []
        for r in rows:
            data = json.loads(r["data_json"])
            # Apply client-like search filter if query string provided
            if search and search.strip():
                q = search.lower()
                company_match = q in data.get("company", "").lower()
                role_match = q in data.get("role", "").lower()
                notes_match = q in data.get("notes", "").lower()
                location_match = q in data.get("location", "").lower()
                tags_match = any(q in t.lower() for t in data.get("tags", []))
                if not (company_match or role_match or notes_match or location_match or tags_match):
                    continue
            jobs.append(JobApplication(**data))
        return jobs

def get_job_by_id(job_id: str) -> Optional[JobApplication]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        if row:
            return JobApplication(**json.loads(row["data_json"]))
        return None

def upsert_job(job: JobApplication) -> JobApplication:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO jobs (id, company, role, stage, priority, workplace_type, rating, applied_date, last_activity_date, ats_score, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                company = excluded.company,
                role = excluded.role,
                stage = excluded.stage,
                priority = excluded.priority,
                workplace_type = excluded.workplace_type,
                rating = excluded.rating,
                applied_date = excluded.applied_date,
                last_activity_date = excluded.last_activity_date,
                ats_score = excluded.ats_score,
                data_json = excluded.data_json
        """, (
            job.id,
            job.company,
            job.role,
            job.stage,
            job.priority,
            job.workplaceType,
            job.rating,
            job.appliedDate,
            job.lastActivityDate,
            job.atsScore,
            job.model_dump_json()
        ))
        conn.commit()
    return job

def delete_job_by_id(job_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        conn.commit()
        return cursor.rowcount > 0

def batch_delete_jobs(ids: List[str]) -> int:
    if not ids:
        return 0
    with get_connection() as conn:
        cursor = conn.cursor()
        placeholders = ",".join("?" for _ in ids)
        cursor.execute(f"DELETE FROM jobs WHERE id IN ({placeholders})", ids)
        conn.commit()
        return cursor.rowcount

def batch_update_stages(ids: List[str], new_stage: JobStage) -> int:
    if not ids:
        return 0
    from datetime import date
    today = date.today().isoformat()
    updated_count = 0

    with get_connection() as conn:
        cursor = conn.cursor()
        for jid in ids:
            cursor.execute("SELECT data_json FROM jobs WHERE id = ?", (jid,))
            row = cursor.fetchone()
            if row:
                data = json.loads(row["data_json"])
                data["stage"] = new_stage
                data["lastActivityDate"] = today
                job = JobApplication(**data)
                cursor.execute("""
                    UPDATE jobs SET stage = ?, last_activity_date = ?, data_json = ? WHERE id = ?
                """, (new_stage, today, job.model_dump_json(), jid))
                updated_count += 1
        conn.commit()
    return updated_count


# ==========================================
# Resumes CRUD Operations
# ==========================================

def get_all_resumes() -> List[ResumeItem]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM resumes ORDER BY rowid DESC")
        rows = cursor.fetchall()
        return [ResumeItem(**json.loads(r["data_json"])) for r in rows]

def get_resume_by_id(resume_id: str) -> Optional[ResumeItem]:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        if row:
            return ResumeItem(**json.loads(row["data_json"]))
        return None

def upsert_resume(resume: ResumeItem) -> ResumeItem:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO resumes (id, name, target_role, is_default, data_json)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                target_role = excluded.target_role,
                is_default = excluded.is_default,
                data_json = excluded.data_json
        """, (
            resume.id,
            resume.name,
            resume.targetRole,
            1 if resume.isDefault else 0,
            resume.model_dump_json()
        ))
        conn.commit()
    return resume

def delete_resume_by_id(resume_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
        conn.commit()
        return cursor.rowcount > 0


# ==========================================
# User Profile & Goals
# ==========================================

def get_user_profile() -> UserProfile:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM user_profile LIMIT 1")
        row = cursor.fetchone()
        if row:
            return UserProfile(**json.loads(row["data_json"]))
        return UserProfile()

def save_user_profile(profile: UserProfile) -> UserProfile:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_profile (id, data_json)
            VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json
        """, (profile.id, profile.model_dump_json()))
        conn.commit()
    return profile

def get_user_goals() -> UserGoals:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM user_goals LIMIT 1")
        row = cursor.fetchone()
        if row:
            return UserGoals(**json.loads(row["data_json"]))
        return UserGoals()

def save_user_goals(goals: UserGoals) -> UserGoals:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_goals (id, data_json)
            VALUES (?, ?)
            ON CONFLICT(id) DO UPDATE SET data_json = excluded.data_json
        """, ("default", goals.model_dump_json()))
        conn.commit()
    return goals

def reset_all_data():
    """Clear and reinitialize empty state."""
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM jobs")
        cursor.execute("DELETE FROM resumes")
        conn.commit()
