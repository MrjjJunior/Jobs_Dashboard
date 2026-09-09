import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.services.job_importer import validate_and_sanitize_url, parse_json_ld, extract_location_from_jsonld, extract_salary_from_jsonld
from bs4 import BeautifulSoup


client = TestClient(app)

class TestJobImport(unittest.TestCase):
    def test_import_job_invalid_url(self):
        response = client.post("/api/jobs/import", json={"url": "invalid-url"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invalid URL scheme", response.json()["detail"])

    def test_import_job_ssrf_blocked(self):
        response = client.post("/api/jobs/import", json={"url": "http://127.0.0.1:8000/api/jobs"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("prohibited", response.json()["detail"])

    def test_json_ld_parsing(self):
        sample_html = """
        <html>
        <head>
          <script type="application/ld+json">
          {
            "@type": "JobPosting",
            "title": "Staff Full Stack Engineer",
            "hiringOrganization": {
              "@type": "Organization",
              "name": "Acme Innovations"
            },
            "jobLocation": {
              "@type": "Place",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Cape Town",
                "addressCountry": "South Africa"
              }
            },
            "baseSalary": {
              "@type": "MonetaryAmount",
              "currency": "ZAR",
              "value": {
                "@type": "QuantitativeValue",
                "minValue": 950000,
                "maxValue": 1300000,
                "unitText": "YEAR"
              }
            },
            "description": "<p>We are seeking a Staff Full Stack Engineer with expertise in Python & React.</p>",
            "employmentType": "FULL_TIME",
            "jobLocationType": "TELECOMMUTE"
          }
          </script>
        </head>
        <body><h1>Job Page</h1></body>
        </html>
        """
        soup = BeautifulSoup(sample_html, "html.parser")
        job_ld = parse_json_ld(soup)
        self.assertIsNotNone(job_ld)
        self.assertEqual(job_ld["title"], "Staff Full Stack Engineer")
        self.assertEqual(job_ld["hiringOrganization"]["name"], "Acme Innovations")
        
        loc = extract_location_from_jsonld(job_ld)
        self.assertIn("Cape Town", loc)

        min_sal, max_sal, curr, period = extract_salary_from_jsonld(job_ld)
        self.assertEqual(min_sal, 950000)
        self.assertEqual(max_sal, 1300000)
        self.assertEqual(curr, "ZAR")
        self.assertEqual(period, "year")


class TestUserAuthentication(unittest.TestCase):
    def test_signup_and_login_flow(self):
        email = "testuser@example.com"
        password = "SecurePassword123!"

        # 1. Signup user
        signup_res = client.post("/api/auth/signup", json={
            "name": "Test User",
            "email": email,
            "password": password
        })
        self.assertEqual(signup_res.status_code, 201)
        data = signup_res.json()
        self.assertEqual(data["user"]["email"], email)

        # 2. Login with WRONG password -> MUST FAIL with 401
        wrong_login_res = client.post("/api/auth/login", json={
            "email": email,
            "password": "WrongPassword456!"
        })
        self.assertEqual(wrong_login_res.status_code, 401)
        self.assertIn("Invalid email or password", wrong_login_res.json()["detail"])

        # 3. Login with CORRECT password -> MUST SUCCEED with 200
        correct_login_res = client.post("/api/auth/login", json={
            "email": email,
            "password": password
        })
        self.assertEqual(correct_login_res.status_code, 200)
        self.assertEqual(correct_login_res.json()["user"]["email"], email)

        # 4. Duplicate signup with same email -> MUST FAIL with 400
        dup_signup_res = client.post("/api/auth/signup", json={
            "name": "Duplicate User",
            "email": email,
            "password": "AnotherPassword789!"
        })
        self.assertEqual(dup_signup_res.status_code, 400)
        self.assertIn("already exists", dup_signup_res.json()["detail"])


if __name__ == "__main__":
    unittest.main()

