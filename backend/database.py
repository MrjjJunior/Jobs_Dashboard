import sqlite3
import json
import os
import time
import hashlib
import secrets
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
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def hash_password(password: str, salt: Optional[str] = None) -> tuple[str, str]:
    if not salt:
        salt = secrets.token_hex(16)
    pw_hash = hashlib.pbkdf2_hmac(
        'sha256',
        password.encode('utf-8'),
        salt.encode('utf-8'),
        100000
    ).hex()
    return pw_hash, salt

def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    pw_hash, _ = hash_password(password, salt)
    return secrets.compare_digest(pw_hash, stored_hash)

def ensure_user_profile_exists(conn: sqlite3.Connection, user_id: str):
    """Ensure parent user_profile record exists so foreign key constraint passes."""
    if not user_id:
        user_id = "user-default"
    cursor = conn.cursor()
    cursor.execute("SELECT 1 FROM user_profile WHERE id = ?", (user_id,))
    if not cursor.fetchone():
        placeholder_profile = UserProfile(id=user_id, name="", email=f"{user_id}@example.com", role="", isLoggedIn=True)
        cursor.execute(
            "INSERT INTO user_profile (id, name, email, data_json) VALUES (?, ?, ?, ?)",
            (user_id, placeholder_profile.name, placeholder_profile.email, placeholder_profile.model_dump_json())
        )

def init_db():
    """Create database tables with foreign keys and do NOT auto-populate user_profile."""
    with get_connection() as conn:
        cursor = conn.cursor()
        
        # User Profile table (parent table for foreign keys)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profile (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                role TEXT,
                password_hash TEXT,
                salt TEXT,
                data_json TEXT NOT NULL
            )
        """)

        # Migration check: inspect existing user_profile table for missing columns
        cursor.execute("PRAGMA table_info(user_profile)")
        up_columns = [row[1] for row in cursor.fetchall()]
        if up_columns:
            if "name" not in up_columns:
                try:
                    cursor.execute("ALTER TABLE user_profile ADD COLUMN name TEXT")
                except Exception:
                    pass
            if "email" not in up_columns:
                try:
                    cursor.execute("ALTER TABLE user_profile ADD COLUMN email TEXT")
                except Exception:
                    pass
            if "role" not in up_columns:
                try:
                    cursor.execute("ALTER TABLE user_profile ADD COLUMN role TEXT")
                except Exception:
                    pass
            if "password_hash" not in up_columns:
                try:
                    cursor.execute("ALTER TABLE user_profile ADD COLUMN password_hash TEXT")
                except Exception:
                    pass
            if "salt" not in up_columns:
                try:
                    cursor.execute("ALTER TABLE user_profile ADD COLUMN salt TEXT")
                except Exception:
                    pass

        # Migration check: inspect existing jobs table for user_id column
        cursor.execute("PRAGMA table_info(jobs)")
        columns = [row[1] for row in cursor.fetchall()]
        if columns and "user_id" not in columns:
            cursor.execute("DROP TABLE jobs")
            cursor.execute("DROP TABLE IF EXISTS resumes")
            cursor.execute("DROP TABLE IF EXISTS user_goals")

        # Jobs table (FOREIGN KEY -> user_profile)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                company TEXT NOT NULL,
                role TEXT NOT NULL,
                stage TEXT NOT NULL,
                priority TEXT NOT NULL,
                workplace_type TEXT,
                rating INTEGER DEFAULT 0,
                applied_date TEXT,
                last_activity_date TEXT,
                ats_score INTEGER,
                data_json TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
            )
        """)

        # Resumes table (FOREIGN KEY -> user_profile)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                target_role TEXT,
                is_default INTEGER DEFAULT 0,
                data_json TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
            )
        """)

        # User Goals table (FOREIGN KEY -> user_profile)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_goals (
                user_id TEXT PRIMARY KEY,
                data_json TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user_profile(id) ON DELETE CASCADE
            )
        """)

        conn.commit()


# ==========================================
# Jobs CRUD Operations
# ==========================================

def get_all_jobs(
    user_id: Optional[str] = None,
    stage: Optional[str] = None,
    priority: Optional[str] = None,
    search: Optional[str] = None
) -> List[JobApplication]:
    if not user_id:
        return []
    with get_connection() as conn:
        cursor = conn.cursor()
        query = "SELECT data_json FROM jobs WHERE user_id = ?"
        params = [user_id]

        if stage and stage != 'all':
            if stage == 'active':
                query += " AND stage NOT IN ('rejected', 'withdrawn', 'wishlist')"
            else:
                query += " AND stage = ?"
                params.append(stage)

        if priority and priority != 'all':
            query += " AND priority = ?"
            params.append(priority)

        query += " ORDER BY rowid DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        
        jobs: List[JobApplication] = []
        for r in rows:
            data = json.loads(r["data_json"])
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

def get_job_by_id(job_id: str, user_id: Optional[str] = None) -> Optional[JobApplication]:
    with get_connection() as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("SELECT data_json FROM jobs WHERE id = ? AND user_id = ?", (job_id, user_id))
        else:
            cursor.execute("SELECT data_json FROM jobs WHERE id = ?", (job_id,))
        row = cursor.fetchone()
        if row:
            return JobApplication(**json.loads(row["data_json"]))
        return None

def upsert_job(job: JobApplication, user_id: Optional[str] = None) -> JobApplication:
    target_user_id = user_id or getattr(job, "userId", None) or "user-default"
    job.userId = target_user_id
    with get_connection() as conn:
        ensure_user_profile_exists(conn, target_user_id)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO jobs (id, user_id, company, role, stage, priority, workplace_type, rating, applied_date, last_activity_date, ats_score, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                user_id = excluded.user_id,
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
            target_user_id,
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

def delete_job_by_id(job_id: str, user_id: Optional[str] = None) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("DELETE FROM jobs WHERE id = ? AND user_id = ?", (job_id, user_id))
        else:
            cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
        conn.commit()
        return cursor.rowcount > 0

def batch_delete_jobs(ids: List[str], user_id: Optional[str] = None) -> int:
    if not ids:
        return 0
    with get_connection() as conn:
        cursor = conn.cursor()
        placeholders = ",".join("?" for _ in ids)
        if user_id:
            cursor.execute(f"DELETE FROM jobs WHERE id IN ({placeholders}) AND user_id = ?", (*ids, user_id))
        else:
            cursor.execute(f"DELETE FROM jobs WHERE id IN ({placeholders})", ids)
        conn.commit()
        return cursor.rowcount

def batch_update_stages(ids: List[str], new_stage: JobStage, user_id: Optional[str] = None) -> int:
    if not ids:
        return 0
    from datetime import date
    today = date.today().isoformat()
    updated_count = 0

    with get_connection() as conn:
        cursor = conn.cursor()
        for jid in ids:
            if user_id:
                cursor.execute("SELECT data_json FROM jobs WHERE id = ? AND user_id = ?", (jid, user_id))
            else:
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

def get_all_resumes(user_id: Optional[str] = None) -> List[ResumeItem]:
    if not user_id:
        return []
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM resumes WHERE user_id = ? ORDER BY rowid DESC", (user_id,))
        rows = cursor.fetchall()
        return [ResumeItem(**json.loads(r["data_json"])) for r in rows]

def get_resume_by_id(resume_id: str, user_id: Optional[str] = None) -> Optional[ResumeItem]:
    with get_connection() as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("SELECT data_json FROM resumes WHERE id = ? AND user_id = ?", (resume_id, user_id))
        else:
            cursor.execute("SELECT data_json FROM resumes WHERE id = ?", (resume_id,))
        row = cursor.fetchone()
        if row:
            return ResumeItem(**json.loads(row["data_json"]))
        return None

def upsert_resume(resume: ResumeItem, user_id: Optional[str] = None) -> ResumeItem:
    target_user_id = user_id or getattr(resume, "userId", None) or "user-default"
    resume.userId = target_user_id
    with get_connection() as conn:
        ensure_user_profile_exists(conn, target_user_id)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO resumes (id, user_id, name, target_role, is_default, data_json)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                user_id = excluded.user_id,
                name = excluded.name,
                target_role = excluded.target_role,
                is_default = excluded.is_default,
                data_json = excluded.data_json
        """, (
            resume.id,
            target_user_id,
            resume.name,
            resume.targetRole,
            1 if resume.isDefault else 0,
            resume.model_dump_json()
        ))
        conn.commit()
    return resume

def delete_resume_by_id(resume_id: str, user_id: Optional[str] = None) -> bool:
    with get_connection() as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("DELETE FROM resumes WHERE id = ? AND user_id = ?", (resume_id, user_id))
        else:
            cursor.execute("DELETE FROM resumes WHERE id = ?", (resume_id,))
        conn.commit()
        return cursor.rowcount > 0


# ==========================================
# User Profile & Goals
# ==========================================

def get_user_profile(user_id: Optional[str] = None) -> Optional[UserProfile]:
    with get_connection() as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("SELECT data_json FROM user_profile WHERE id = ?", (user_id,))
        else:
            cursor.execute("SELECT data_json FROM user_profile LIMIT 1")
        row = cursor.fetchone()
        if row:
            return UserProfile(**json.loads(row["data_json"]))
        return None

def create_user_account(name: str, email: str, password: str, role: Optional[str] = "Job Seeker") -> UserProfile:
    email_clean = email.strip().lower()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM user_profile WHERE LOWER(email) = ?", (email_clean,))
        if cursor.fetchone():
            raise ValueError("An account with this email address already exists. Please sign in instead.")
        
        user_id = f"user-{secrets.token_hex(8)}"
        pw_hash, salt = hash_password(password)
        
        profile = UserProfile(
            id=user_id,
            name=name.strip(),
            email=email_clean,
            role=role.strip() if role else "Job Seeker",
            isLoggedIn=True
        )

        cursor.execute("""
            INSERT INTO user_profile (id, name, email, role, password_hash, salt, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            profile.name,
            profile.email,
            profile.role,
            pw_hash,
            salt,
            profile.model_dump_json()
        ))
        conn.commit()
        return profile

def authenticate_user(email: str, password: str) -> Optional[UserProfile]:
    email_clean = email.strip().lower()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash, salt, data_json FROM user_profile WHERE LOWER(email) = ?", (email_clean,))
        row = cursor.fetchone()
        if not row:
            return None
        
        stored_hash = row["password_hash"]
        salt = row["salt"]
        if not stored_hash or not salt:
            # Cannot authenticate account without password
            return None

        if not verify_password(password, stored_hash, salt):
            return None

        data = json.loads(row["data_json"])
        data["isLoggedIn"] = True
        profile = UserProfile(**data)
        save_user_profile(profile)
        return profile

def save_user_profile(profile: UserProfile) -> UserProfile:
    if not profile.id:
        profile.id = f"user-{int(time.time() * 1000)}"
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_profile (id, name, email, role, data_json)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                name = excluded.name,
                email = excluded.email,
                role = excluded.role,
                data_json = excluded.data_json
        """, (profile.id, profile.name, profile.email, profile.role, profile.model_dump_json()))
        conn.commit()
    return profile

def get_user_goals(user_id: Optional[str] = None) -> UserGoals:
    if not user_id:
        return UserGoals()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT data_json FROM user_goals WHERE user_id = ?", (user_id,))
        row = cursor.fetchone()
        if row:
            return UserGoals(**json.loads(row["data_json"]))
        return UserGoals(userId=user_id)

def save_user_goals(goals: UserGoals, user_id: Optional[str] = None) -> UserGoals:
    target_user_id = user_id or getattr(goals, "userId", None) or "user-default"
    goals.userId = target_user_id
    with get_connection() as conn:
        ensure_user_profile_exists(conn, target_user_id)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO user_goals (user_id, data_json)
            VALUES (?, ?)
            ON CONFLICT(user_id) DO UPDATE SET data_json = excluded.data_json
        """, (target_user_id, goals.model_dump_json()))
        conn.commit()
    return goals

def reset_all_data(user_id: Optional[str] = None):
    """Clear jobs and resumes for user or all."""
    with get_connection() as conn:
        cursor = conn.cursor()
        if user_id:
            cursor.execute("DELETE FROM jobs WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM resumes WHERE user_id = ?", (user_id,))
        else:
            cursor.execute("DELETE FROM jobs")
            cursor.execute("DELETE FROM resumes")
        conn.commit()


def delete_account_and_data(user_id: str) -> bool:
    """Hard delete a user account and cascade delete all their data (jobs, resumes, profile, goals)."""
    if not user_id: return False
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            # Foreign keys usually cascade if PRAGMA foreign_keys = ON is set, but manual deletion is safer for now.
            cursor.execute("DELETE FROM jobs WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM resumes WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM user_goals WHERE user_id = ?", (user_id,))
            cursor.execute("DELETE FROM user_profiles WHERE id = ?", (user_id,))
            conn.commit()
            return cursor.rowcount > 0 or True # Return true since the user might not have all rows
    except sqlite3.Error as e:
        print(f"Error deleting account data: {e}")
        return False
