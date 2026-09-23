#!/usr/bin/env python3
"""
Data Migration Script: SQLite -> PostgreSQL for Jobs Dashboard
Transfers user profiles, job applications, resumes, and user goals
from the local SQLite database into PostgreSQL safely and idempotently.

Usage:
    python scripts/migrate_sqlite_to_postgres.py
    python scripts/migrate_sqlite_to_postgres.py --postgres-url "postgresql://..."
    python scripts/migrate_sqlite_to_postgres.py --dry-run
"""

import os
import sys
import argparse
import sqlite3
from typing import Dict, Any, List, Optional
from urllib.parse import urlparse

# Ensure backend modules can be imported
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    import psycopg
    from psycopg.rows import dict_row
except ImportError:
    psycopg = None

from dotenv import load_dotenv
load_dotenv()


def parse_args():
    parser = argparse.ArgumentParser(description="Migrate Jobs Dashboard SQLite data to PostgreSQL.")
    parser.add_argument(
        "--sqlite-path",
        default=os.environ.get("DATABASE_PATH", os.path.join(os.path.dirname(__file__), "..", "backend", "jobs_dashboard.db")),
        help="Path to source SQLite database file"
    )
    parser.add_argument(
        "--postgres-url",
        default=os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL"),
        help="Target PostgreSQL connection URL (e.g., postgresql://user:pass@host:5432/dbname)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Inspect and simulate migration without writing to PostgreSQL"
    )
    parser.add_argument(
        "--clear-target",
        action="store_true",
        help="Truncate target PostgreSQL tables before migrating (CAUTION: wipes target data)"
    )
    return parser.parse_args()


def get_sqlite_data(sqlite_path: str) -> Dict[str, List[Dict[str, Any]]]:
    """Read all rows from existing SQLite database tables."""
    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"SQLite database file not found at: {sqlite_path}")

    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    data: Dict[str, List[Dict[str, Any]]] = {
        "user_profile": [],
        "jobs": [],
        "resumes": [],
        "user_goals": []
    }

    for table in data.keys():
        try:
            cursor.execute(f"SELECT * FROM {table}")
            rows = cursor.fetchall()
            data[table] = [dict(r) for r in rows]
        except sqlite3.OperationalError as e:
            print(f"  [Notice] Table '{table}' not present in SQLite or empty: {e}")
            data[table] = []

    conn.close()
    return data


def mask_url(url: str) -> str:
    """Mask password in connection URL for logging."""
    try:
        parsed = urlparse(url)
        return f"{parsed.scheme}://{parsed.username or ''}:****@{parsed.hostname}:{parsed.port or 5432}{parsed.path}"
    except Exception:
        return "postgresql://[configured]"


def migrate_to_postgres(sqlite_data: Dict[str, List[Dict[str, Any]]], pg_url: str, dry_run: bool = False, clear_target: bool = False):
    """Migrate rows into PostgreSQL respecting foreign keys."""
    if not psycopg:
        print("\n[Error] 'psycopg' is not installed in the active Python environment.")
        print("Please run: pip install \"psycopg[binary]\" psycopg-pool\n")
        sys.exit(1)

    # Normalize url scheme
    if pg_url.startswith("postgres://"):
        pg_url = "postgresql://" + pg_url[len("postgres://"):]

    print("\n" + "=" * 60)
    print("Jobs Dashboard -> PostgreSQL Data Migration")
    print("=" * 60)
    print(f"Target Database: {mask_url(pg_url)}")
    print(f"Mode: {'DRY RUN (no changes written)' if dry_run else 'LIVE MIGRATION'}")
    print("-" * 60)

    # Print summary of source SQLite data
    print("Source SQLite Data:")
    for table, rows in sqlite_data.items():
        print(f"  • {table:<15} : {len(rows)} records found")
    print("-" * 60)

    if dry_run:
        print("\n[Dry Run Completed] All records are valid for migration. No changes made.")
        return

    # Connect to PostgreSQL
    try:
        pg_conn = psycopg.connect(pg_url, autocommit=False)
    except Exception as e:
        print(f"\n[Error] Failed to connect to PostgreSQL: {e}")
        print("Please verify your DATABASE_URL, network/firewall, and credentials.\n")
        sys.exit(1)

    try:
        with pg_conn.cursor() as cur:
            # 1. Initialize schema
            print("Ensuring target PostgreSQL tables and indexes exist...")
            cur.execute("""
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

            if clear_target:
                print("Clearing target tables (--clear-target specified)...")
                cur.execute("TRUNCATE TABLE jobs, resumes, user_goals, user_profile CASCADE;")

            # 2. Migrate user_profile (parent table)
            users = sqlite_data.get("user_profile", [])
            print(f"Migrating {len(users)} user_profile records...")
            for u in users:
                cur.execute("""
                    INSERT INTO user_profile (id, name, email, role, password_hash, salt, data_json)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        email = EXCLUDED.email,
                        role = EXCLUDED.role,
                        password_hash = EXCLUDED.password_hash,
                        salt = EXCLUDED.salt,
                        data_json = EXCLUDED.data_json
                """, (
                    u.get("id"),
                    u.get("name"),
                    u.get("email"),
                    u.get("role"),
                    u.get("password_hash"),
                    u.get("salt"),
                    u.get("data_json")
                ))

            # 3. Migrate user_goals
            goals = sqlite_data.get("user_goals", [])
            print(f"Migrating {len(goals)} user_goals records...")
            for g in goals:
                cur.execute("""
                    INSERT INTO user_goals (user_id, data_json)
                    VALUES (%s, %s)
                    ON CONFLICT (user_id) DO UPDATE SET
                        data_json = EXCLUDED.data_json
                """, (
                    g.get("user_id"),
                    g.get("data_json")
                ))

            # 4. Migrate resumes
            resumes = sqlite_data.get("resumes", [])
            print(f"Migrating {len(resumes)} resumes records...")
            for r in resumes:
                cur.execute("""
                    INSERT INTO resumes (id, user_id, name, target_role, is_default, data_json)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        user_id = EXCLUDED.user_id,
                        name = EXCLUDED.name,
                        target_role = EXCLUDED.target_role,
                        is_default = EXCLUDED.is_default,
                        data_json = EXCLUDED.data_json
                """, (
                    r.get("id"),
                    r.get("user_id"),
                    r.get("name"),
                    r.get("target_role"),
                    r.get("is_default", 0),
                    r.get("data_json")
                ))

            # 5. Migrate jobs
            jobs = sqlite_data.get("jobs", [])
            print(f"Migrating {len(jobs)} jobs records...")
            for j in jobs:
                cur.execute("""
                    INSERT INTO jobs (id, user_id, company, role, stage, priority, workplace_type, rating, applied_date, last_activity_date, ats_score, data_json)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
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
                """, (
                    j.get("id"),
                    j.get("user_id"),
                    j.get("company"),
                    j.get("role"),
                    j.get("stage"),
                    j.get("priority"),
                    j.get("workplace_type"),
                    j.get("rating", 0),
                    j.get("applied_date"),
                    j.get("last_activity_date"),
                    j.get("ats_score"),
                    j.get("data_json")
                ))

            # Commit all operations
            pg_conn.commit()

            # Verification queries
            print("\nVerifying row counts in PostgreSQL:")
            print("-" * 60)
            print(f"{'Table':<15} | {'SQLite Count':<14} | {'PostgreSQL Count':<16} | Status")
            print("-" * 60)

            all_match = True
            for table in ["user_profile", "jobs", "resumes", "user_goals"]:
                cur.execute(f"SELECT count(*) FROM {table}")
                pg_count = cur.fetchone()[0]
                sqlite_count = len(sqlite_data.get(table, []))
                status = "MATCH" if pg_count >= sqlite_count else "MISMATCH"
                if status == "MISMATCH":
                    all_match = False
                print(f"{table:<15} | {sqlite_count:<14} | {pg_count:<16} | {status}")

            print("=" * 60)
            if all_match:
                print("SUCCESS: PostgreSQL migration completed successfully with 0 errors!")
            else:
                print("WARNING: Some row counts did not match. Check PostgreSQL logs.")
            print("=" * 60 + "\n")

    except Exception as e:
        pg_conn.rollback()
        print(f"\n[Error during migration]: {e}")
        raise
    finally:
        pg_conn.close()


def main():
    args = parse_args()
    if not args.postgres_url and not args.dry_run:
        print("\n[Error] No PostgreSQL connection URL provided.")
        print("Please set DATABASE_URL in your .env file or pass --postgres-url:")
        print('  python scripts/migrate_sqlite_to_postgres.py --postgres-url "postgresql://..."')
        print("Or run with --dry-run to preview what will be migrated:")
        print("  python scripts/migrate_sqlite_to_postgres.py --dry-run\n")
        sys.exit(1)

    print(f"Reading SQLite database from: {args.sqlite_path}")
    sqlite_data = get_sqlite_data(args.sqlite_path)
    migrate_to_postgres(sqlite_data, args.postgres_url or "", dry_run=args.dry_run, clear_target=args.clear_target)


if __name__ == "__main__":
    main()
