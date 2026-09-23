import sys
import os
import unittest
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend import database as db
from backend.models import (
    JobApplication,
    ResumeItem,
    UserProfile,
    UserGoals,
)

class TestDatabaseOperations(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        db.init_db()

    def setUp(self):
        self.test_user_id = f"test-user-{uuid.uuid4().hex[:8]}"
        self.test_email = f"{self.test_user_id}@example.com"
        self.test_password = "SecretPassword123!"

    def test_query_formatting(self):
        """Test query formatter handles parameter conversions."""
        # SQLite query
        q1 = "SELECT * FROM jobs WHERE id = ? AND user_id = ? ORDER BY rowid DESC"
        # Test default SQLite format
        if not db.is_postgres():
            self.assertEqual(db._format_query(q1), q1)

    def test_password_hashing_and_verification(self):
        pw = "MySecurePass!99"
        hash1, salt1 = db.hash_password(pw)
        self.assertTrue(db.verify_password(pw, hash1, salt1))
        self.assertFalse(db.verify_password("WrongPass", hash1, salt1))

    def test_user_creation_and_auth(self):
        user = db.create_user_account("Alex Test", self.test_email, self.test_password, "Software Engineer")
        self.assertEqual(user.email, self.test_email)
        self.assertEqual(user.name, "Alex Test")

        # Duplicate signup must fail
        with self.assertRaises(ValueError):
            db.create_user_account("Duplicate", self.test_email, "another-pass")

        # Authenticate with correct password
        auth_user = db.authenticate_user(self.test_email, self.test_password)
        self.assertIsNotNone(auth_user)
        self.assertEqual(auth_user.id, user.id)

        # Authenticate with incorrect password
        bad_auth = db.authenticate_user(self.test_email, "IncorrectPassword")
        self.assertIsNone(bad_auth)

    def test_job_crud_lifecycle(self):
        user = db.create_user_account("Job Hunter", self.test_email, self.test_password)
        uid = user.id

        job1 = JobApplication(
            id=f"job-{uuid.uuid4().hex[:8]}",
            userId=uid,
            company="Tech Corp",
            role="Backend Engineer",
            stage="applied",
            priority="high",
            location="Remote",
            notes="Found via LinkedIn"
        )
        db.upsert_job(job1, user_id=uid)

        # Fetch by ID
        fetched = db.get_job_by_id(job1.id, user_id=uid)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.company, "Tech Corp")
        self.assertEqual(fetched.priority, "high")

        # Update job
        job1.stage = "technical"
        job1.rating = 5
        db.upsert_job(job1, user_id=uid)
        updated = db.get_job_by_id(job1.id, user_id=uid)
        self.assertEqual(updated.stage, "technical")
        self.assertEqual(updated.rating, 5)

        # Filter by stage
        technical_jobs = db.get_all_jobs(user_id=uid, stage="technical")
        self.assertEqual(len(technical_jobs), 1)
        applied_jobs = db.get_all_jobs(user_id=uid, stage="applied")
        self.assertEqual(len(applied_jobs), 0)

        # Search
        search_res = db.get_all_jobs(user_id=uid, search="Tech Corp")
        self.assertEqual(len(search_res), 1)
        no_res = db.get_all_jobs(user_id=uid, search="Nonexistent")
        self.assertEqual(len(no_res), 0)

        # Batch update stages
        db.batch_update_stages([job1.id], "offer", user_id=uid)
        offered = db.get_job_by_id(job1.id, user_id=uid)
        self.assertEqual(offered.stage, "offer")

        # Delete job
        deleted = db.delete_job_by_id(job1.id, user_id=uid)
        self.assertTrue(deleted)
        self.assertIsNone(db.get_job_by_id(job1.id, user_id=uid))

    def test_resume_crud(self):
        user = db.create_user_account("Resume User", self.test_email, self.test_password)
        uid = user.id

        resume = ResumeItem(
            id=f"res-{uuid.uuid4().hex[:8]}",
            userId=uid,
            name="Senior_Backend_CV.pdf",
            targetRole="Principal Engineer",
            isDefault=True
        )
        db.upsert_resume(resume, user_id=uid)

        fetched = db.get_resume_by_id(resume.id, user_id=uid)
        self.assertIsNotNone(fetched)
        self.assertEqual(fetched.name, "Senior_Backend_CV.pdf")
        self.assertTrue(fetched.isDefault)

        all_resumes = db.get_all_resumes(user_id=uid)
        self.assertEqual(len(all_resumes), 1)

        db.delete_resume_by_id(resume.id, user_id=uid)
        self.assertEqual(len(db.get_all_resumes(user_id=uid)), 0)

    def test_user_goals(self):
        user = db.create_user_account("Goal Setter", self.test_email, self.test_password)
        uid = user.id

        goals = UserGoals(
            userId=uid,
            monthlyApplicationsTarget=30,
            targetMinSalary=160000
        )
        db.save_user_goals(goals, user_id=uid)

        fetched = db.get_user_goals(user_id=uid)
        self.assertEqual(fetched.monthlyApplicationsTarget, 30)
        self.assertEqual(fetched.targetMinSalary, 160000)

    def test_cascade_delete_account(self):
        user = db.create_user_account("Delete Me", self.test_email, self.test_password)
        uid = user.id

        job = JobApplication(
            id=f"job-{uuid.uuid4().hex[:8]}",
            userId=uid,
            company="Temp Corp",
            role="Contractor"
        )
        db.upsert_job(job, user_id=uid)

        res = ResumeItem(
            id=f"res-{uuid.uuid4().hex[:8]}",
            userId=uid,
            name="Temp.pdf"
        )
        db.upsert_resume(res, user_id=uid)

        # Delete account and data
        success = db.delete_account_and_data(uid)
        self.assertTrue(success)

        self.assertIsNone(db.get_user_profile(uid))
        self.assertEqual(len(db.get_all_jobs(uid)), 0)
        self.assertEqual(len(db.get_all_resumes(uid)), 0)

if __name__ == "__main__":
    unittest.main()
