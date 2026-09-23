import json
import os
import time
import hashlib
import secrets
import logging
import sqlite3
from contextlib import contextmanager
from typing import List, Optional, Dict, Any
from urllib.parse import urlparse

from .models import (
    JobApplication,
    ResumeItem,
    UserProfile,
    UserGoals,
    JobStage
)

logger = logging.getLogger("jobs_dashboard.database")

# ==========================================
# Database Configuration & Driver Detection
# ==========================================

DB_PATH = os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "jobs_dashboard.db"))

def get_postgres_conninfo() -> Optional[str]:
    """Retrieve and normalize PostgreSQL connection URI or configuration."""
    url = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL") or os.environ.get("POSTGRES_DATABASE_URL")
    if url:
        url = url.strip()
        # Normalise postgres:// -> postgresql:// for compatibility
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://"):]
        if url.startswith("postgresql://"):
            return url

    # Alternatively inspect standard individual PG environment variables
    pghost = os.environ.get("PGHOST")
    pgdatabase = os.environ.get("PGDATABASE")
    if pghost and pgdatabase:
        pguser = os.environ.get("PGUSER", "postgres")
        pgpassword = os.environ.get("PGPASSWORD", "")
        pgport = os.environ.get("PGPORT", "5432")
        auth = f"{pguser}:{pgpassword}@" if pgpassword else f"{pguser}@"
        return f"postgresql://{auth}{pghost}:{pgport}/{pgdatabase}"

    return None

def is_postgres() -> bool:
    """Check whether the active database backend is PostgreSQL."""
    return get_postgres_conninfo() is not None

_pg_pool = None

def get_postgres_pool():
    """Retrieve or initialize the PostgreSQL connection pool."""
    global _pg_pool
    if _pg_pool is None:
        try:
            from psycopg_pool import ConnectionPool
        except ImportError:
            raise RuntimeError(
                "PostgreSQL requested but 'psycopg' / 'psycopg-pool' is not installed. "
                "Run 'pip install \"psycopg[binary]\" psycopg-pool' to install."
            )
        conninfo = get_postgres_conninfo()
        if not conninfo:
            raise RuntimeError("PostgreSQL conninfo is not configured.")

        _pg_pool = ConnectionPool(
            conninfo=conninfo,
            min_size=1,
            max_size=int(os.environ.get("DB_POOL_MAX_SIZE", "15")),
            timeout=float(os.environ.get("DB_TIMEOUT", "10.0")),
            open=False
        )
        _pg_pool.open()
        logger.info("PostgreSQL connection pool initialized.")
    return _pg_pool

def close_db():
    """Close PostgreSQL connection pool and release resources on shutdown."""
    global _pg_pool
    if _pg_pool is not None:
        try:
            _pg_pool.close()
            logger.info("PostgreSQL connection pool closed.")
        except Exception as e:
            logger.warning(f"Error closing PostgreSQL connection pool: {e}")
        _pg_pool = None

def get_db_info() -> Dict[str, Any]:
    """Return runtime database connection metadata for health/monitoring."""
    if is_postgres():
        conninfo = get_postgres_conninfo()
        masked_url = "postgresql://[configured]"
        if conninfo:
            try:
                parsed = urlparse(conninfo)
                user = parsed.username or "postgres"
                masked_url = f"postgresql://{user}@{parsed.hostname}:{parsed.port or 5432}{parsed.path}"
            except Exception:
                pass
        return {
            "type": "postgresql",
            "url": masked_url,
            "connected": _pg_pool is not None
        }
    return {
        "type": "sqlite",
        "path": DB_PATH,
        "connected": True
    }

def _format_query(sql: str) -> str:
    """
    Format SQL queries for the target engine:
    - Replaces SQLite '?' parameter markers with PostgreSQL '%s'
    - Replaces SQLite 'ORDER BY rowid DESC' with PostgreSQL 'ORDER BY created_at DESC, id DESC'
    """
    if is_postgres():
        formatted = sql.replace("?", "%s")
        formatted = formatted.replace("ORDER BY rowid DESC", "ORDER BY created_at DESC, id DESC")
        return formatted
    return sql

@contextmanager
def get_db_cursor():
    """
    Yields an active database cursor with dictionary-like row access (dict_row or sqlite3.Row).
    Automatically commits on clean block exit, or rolls back on exception.
    """
    if is_postgres():
        from psycopg.rows import dict_row
        pool = get_postgres_pool()
        with pool.connection() as conn:
            with conn.cursor(row_factory=dict_row) as cursor:
                yield cursor
            conn.commit()
    else:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON;")
        try:
            with conn:
                cursor = conn.cursor()
                yield cursor
        finally:
            conn.close()

def get_connection():
    """Legacy backward compatibility helper for raw sqlite3 connection."""
    if is_postgres():
        return get_postgres_pool().getconn()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


# ==========================================
# Password Hashing & Authentication Helpers
# ==========================================

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

def ensure_user_profile_exists(cursor, user_id: str):
    """Ensure parent user_profile record exists so foreign key constraints pass."""
    if not user_id:
        user_id = "user-default"
    cursor.execute(_format_query("SELECT 1 FROM user_profile WHERE id = ?"), (user_id,))
    if not cursor.fetchone():
        placeholder_profile = UserProfile(id=user_id, name="", email=f"{user_id}@example.com", role="", isLoggedIn=True)
        cursor.execute(
            _format_query("INSERT INTO user_profile (id, name, email, data_json) VALUES (?, ?, ?, ?)"),
            (user_id, placeholder_profile.name, placeholder_profile.email, placeholder_profile.model_dump_json())
        )


# ==========================================
# Schema Initialization
# ==========================================

def init_db():
    """Create database tables and indexes with foreign keys."""
    if is_postgres():
        _init_postgres_db()
    else:
        _init_sqlite_db()

def _init_postgres_db():
    """Initialize PostgreSQL database schema with indexes and cascade foreign keys."""
    logger.info("Initializing PostgreSQL schema...")
    with get_db_cursor() as cursor:
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS user_profile (
                id TEXT PRIMARY KEY,
                name TEXT,
                email TEXT UNIQUE,
                role TEXT,
                password_hash TEXT,
                salt TEXT,
                data_json TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
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
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                target_role TEXT,
                is_default INTEGER DEFAULT 0,
                data_json TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS user_goals (
                user_id TEXT PRIMARY KEY REFERENCES user_profile(id) ON DELETE CASCADE,
                data_json TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
            CREATE INDEX IF NOT EXISTS idx_jobs_stage ON jobs(stage);
            CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);
            CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
        """)
    logger.info("PostgreSQL schema initialization completed.")

def _init_sqlite_db():
    """Initialize SQLite database schema and perform column migrations."""
    with get_db_cursor() as cursor:
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
        up_columns = [row["name"] if isinstance(row, dict) else row[1] for row in cursor.fetchall()]
        if up_columns:
            for col in ["name", "email", "role", "password_hash", "salt"]:
                if col not in up_columns:
                    try:
                        cursor.execute(f"ALTER TABLE user_profile ADD COLUMN {col} TEXT")
                    except Exception:
                        pass

        # Migration check: inspect existing jobs table for user_id column
        cursor.execute("PRAGMA table_info(jobs)")
        columns = [row["name"] if isinstance(row, dict) else row[1] for row in cursor.fetchall()]
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
    with get_db_cursor() as cursor:
        query = "SELECT data_json FROM jobs WHERE user_id = ?"
        params: List[Any] = [user_id]

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
        cursor.execute(_format_query(query), tuple(params))
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
    with get_db_cursor() as cursor:
        if user_id:
            cursor.execute(_format_query("SELECT data_json FROM jobs WHERE id = ? AND user_id = ?"), (job_id, user_id))
        else:
            cursor.execute(_format_query("SELECT data_json FROM jobs WHERE id = ?"), (job_id,))
        row = cursor.fetchone()
        if row:
            return JobApplication(**json.loads(row["data_json"]))
        return None

def upsert_job(job: JobApplication, user_id: Optional[str] = None) -> JobApplication:
    target_user_id = user_id or getattr(job, "userId", None) or "user-default"
    job.userId = target_user_id
    with get_db_cursor() as cursor:
        ensure_user_profile_exists(cursor, target_user_id)
        query = """
            INSERT INTO jobs (id, user_id, company, role, stage, priority, workplace_type, rating, applied_date, last_activity_date, ats_score, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                company = EXCLUDED.company,
                role = EXCLUDED.role,
                stage = EXCLUDED.stage,
                priority = EXCLUDED.priority,
                workplace_type = EXCLUDED.workplace_type,
                rating = EXCLUDED.rating,
                applied_date = EXCLUDED.applied_date,
                last_activity_date = EXCLUDED.last_activity_date,
                ats_score = EXCLUDED.ats_score,
                data_json = EXCLUDED.data_json
        """
        cursor.execute(_format_query(query), (
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
    return job

def delete_job_by_id(job_id: str, user_id: Optional[str] = None) -> bool:
    with get_db_cursor() as cursor:
        if user_id:
            cursor.execute(_format_query("DELETE FROM jobs WHERE id = ? AND user_id = ?"), (job_id, user_id))
        else:
            cursor.execute(_format_query("DELETE FROM jobs WHERE id = ?"), (job_id,))
        return cursor.rowcount > 0

def batch_delete_jobs(ids: List[str], user_id: Optional[str] = None) -> int:
    if not ids:
        return 0
    with get_db_cursor() as cursor:
        placeholders = ",".join("?" for _ in ids)
        if user_id:
            cursor.execute(_format_query(f"DELETE FROM jobs WHERE id IN ({placeholders}) AND user_id = ?"), (*ids, user_id))
        else:
            cursor.execute(_format_query(f"DELETE FROM jobs WHERE id IN ({placeholders})"), tuple(ids))
        return cursor.rowcount

def batch_update_stages(ids: List[str], new_stage: JobStage, user_id: Optional[str] = None) -> int:
    if not ids:
        return 0
    from datetime import date
    today = date.today().isoformat()
    updated_count = 0

    with get_db_cursor() as cursor:
        for jid in ids:
            if user_id:
                cursor.execute(_format_query("SELECT data_json FROM jobs WHERE id = ? AND user_id = ?"), (jid, user_id))
            else:
                cursor.execute(_format_query("SELECT data_json FROM jobs WHERE id = ?"), (jid,))
            row = cursor.fetchone()
            if row:
                data = json.loads(row["data_json"])
                data["stage"] = new_stage
                data["lastActivityDate"] = today
                job = JobApplication(**data)
                cursor.execute(_format_query("""
                    UPDATE jobs SET stage = ?, last_activity_date = ?, data_json = ? WHERE id = ?
                """), (new_stage, today, job.model_dump_json(), jid))
                updated_count += 1
    return updated_count


# ==========================================
# Resumes CRUD Operations
# ==========================================

def get_all_resumes(user_id: Optional[str] = None) -> List[ResumeItem]:
    if not user_id:
        return []
    with get_db_cursor() as cursor:
        cursor.execute(_format_query("SELECT data_json FROM resumes WHERE user_id = ? ORDER BY rowid DESC"), (user_id,))
        rows = cursor.fetchall()
        return [ResumeItem(**json.loads(r["data_json"])) for r in rows]

def get_resume_by_id(resume_id: str, user_id: Optional[str] = None) -> Optional[ResumeItem]:
    with get_db_cursor() as cursor:
        if user_id:
            cursor.execute(_format_query("SELECT data_json FROM resumes WHERE id = ? AND user_id = ?"), (resume_id, user_id))
        else:
            cursor.execute(_format_query("SELECT data_json FROM resumes WHERE id = ?"), (resume_id,))
        row = cursor.fetchone()
        if row:
            return ResumeItem(**json.loads(row["data_json"]))
        return None

def upsert_resume(resume: ResumeItem, user_id: Optional[str] = None) -> ResumeItem:
    target_user_id = user_id or getattr(resume, "userId", None) or "user-default"
    resume.userId = target_user_id
    with get_db_cursor() as cursor:
        ensure_user_profile_exists(cursor, target_user_id)
        query = """
            INSERT INTO resumes (id, user_id, name, target_role, is_default, data_json)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                user_id = EXCLUDED.user_id,
                name = EXCLUDED.name,
                target_role = EXCLUDED.target_role,
                is_default = EXCLUDED.is_default,
                data_json = EXCLUDED.data_json
        """
        cursor.execute(_format_query(query), (
            resume.id,
            target_user_id,
            resume.name,
            resume.targetRole,
            1 if resume.isDefault else 0,
            resume.model_dump_json()
        ))
    return resume

def delete_resume_by_id(resume_id: str, user_id: Optional[str] = None) -> bool:
    with get_db_cursor() as cursor:
        if user_id:
            cursor.execute(_format_query("DELETE FROM resumes WHERE id = ? AND user_id = ?"), (resume_id, user_id))
        else:
            cursor.execute(_format_query("DELETE FROM resumes WHERE id = ?"), (resume_id,))
        return cursor.rowcount > 0


# ==========================================
# User Profile & Goals
# ==========================================

def get_user_profile(user_id: Optional[str] = None) -> Optional[UserProfile]:
    with get_db_cursor() as cursor:
        if user_id:
            cursor.execute(_format_query("SELECT data_json FROM user_profile WHERE id = ?"), (user_id,))
        else:
            cursor.execute(_format_query("SELECT data_json FROM user_profile LIMIT 1"))
        row = cursor.fetchone()
        if row:
            return UserProfile(**json.loads(row["data_json"]))
        return None

def create_user_account(name: str, email: str, password: str, role: Optional[str] = "Job Seeker") -> UserProfile:
    email_clean = email.strip().lower()
    with get_db_cursor() as cursor:
        cursor.execute(_format_query("SELECT id FROM user_profile WHERE LOWER(email) = ?"), (email_clean,))
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

        cursor.execute(_format_query("""
            INSERT INTO user_profile (id, name, email, role, password_hash, salt, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """), (
            user_id,
            profile.name,
            profile.email,
            profile.role,
            pw_hash,
            salt,
            profile.model_dump_json()
        ))
        return profile

def authenticate_user(email: str, password: str) -> Optional[UserProfile]:
    email_clean = email.strip().lower()
    with get_db_cursor() as cursor:
        cursor.execute(_format_query("SELECT password_hash, salt, data_json FROM user_profile WHERE LOWER(email) = ?"), (email_clean,))
        row = cursor.fetchone()
        if not row:
            return None
        
        stored_hash = row["password_hash"]
        salt = row["salt"]
        if not stored_hash or not salt:
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
    with get_db_cursor() as cursor:
        cursor.execute(_format_query("""
            INSERT INTO user_profile (id, name, email, role, data_json)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                email = EXCLUDED.email,
                role = EXCLUDED.role,
                data_json = EXCLUDED.data_json
        """), (profile.id, profile.name, profile.email, profile.role, profile.model_dump_json()))
    return profile

def get_user_goals(user_id: Optional[str] = None) -> UserGoals:
    if not user_id:
        return UserGoals()
    with get_db_cursor() as cursor:
        cursor.execute(_format_query("SELECT data_json FROM user_goals WHERE user_id = ?"), (user_id,))
        row = cursor.fetchone()
        if row:
            return UserGoals(**json.loads(row["data_json"]))
        return UserGoals(userId=user_id)

def save_user_goals(goals: UserGoals, user_id: Optional[str] = None) -> UserGoals:
    target_user_id = user_id or getattr(goals, "userId", None) or "user-default"
    goals.userId = target_user_id
    with get_db_cursor() as cursor:
        ensure_user_profile_exists(cursor, target_user_id)
        cursor.execute(_format_query("""
            INSERT INTO user_goals (user_id, data_json)
            VALUES (?, ?)
            ON CONFLICT (user_id) DO UPDATE SET data_json = EXCLUDED.data_json
        """), (target_user_id, goals.model_dump_json()))
    return goals

def reset_all_data(user_id: Optional[str] = None):
    """Clear jobs and resumes for user or all."""
    with get_db_cursor() as cursor:
        if user_id:
            cursor.execute(_format_query("DELETE FROM jobs WHERE user_id = ?"), (user_id,))
            cursor.execute(_format_query("DELETE FROM resumes WHERE user_id = ?"), (user_id,))
        else:
            cursor.execute(_format_query("DELETE FROM jobs"))
            cursor.execute(_format_query("DELETE FROM resumes"))

def delete_account_and_data(user_id: str) -> bool:
    """Hard delete a user account and cascade delete all their data (jobs, resumes, profile, goals)."""
    if not user_id:
        return False
    try:
        with get_db_cursor() as cursor:
            cursor.execute(_format_query("DELETE FROM jobs WHERE user_id = ?"), (user_id,))
            cursor.execute(_format_query("DELETE FROM resumes WHERE user_id = ?"), (user_id,))
            cursor.execute(_format_query("DELETE FROM user_goals WHERE user_id = ?"), (user_id,))
            cursor.execute(_format_query("DELETE FROM user_profile WHERE id = ?"), (user_id,))
            return True
    except Exception as e:
        logger.error(f"Error deleting account data: {e}")
        return False
