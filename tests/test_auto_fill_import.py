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

if __name__ == "__main__":
    unittest.main()
