import re
import json
import socket
import ipaddress
import os
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlparse
import httpx
from bs4 import BeautifulSoup
from fastapi import HTTPException
from datetime import datetime

from ..models import ExtractedJobPreview, WorkplaceType, EmploymentType, SalaryPeriod

# Security: List of private/reserved IP ranges for SSRF prevention
BLOCKED_IP_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.0.2.0/24"),
    ipaddress.ip_network("192.88.99.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("198.51.100.0/24"),
    ipaddress.ip_network("203.0.113.0/24"),
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("::/128"),
    ipaddress.ip_network("fe80::/10"),
    ipaddress.ip_network("fc00::/7"),
]

def validate_and_sanitize_url(url_str: str) -> str:
    """Validate scheme and check for SSRF against private network IPs."""
    url_str = url_str.strip()
    if not re.match(r"^https?://", url_str, re.IGNORECASE):
        raise HTTPException(status_code=400, detail="Invalid URL scheme. Must begin with http:// or https://")

    parsed = urlparse(url_str)
    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(status_code=400, detail="Invalid URL: Missing hostname")

    # Block localhost explicitly
    if hostname.lower() in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        raise HTTPException(status_code=400, detail="Access to internal/local network addresses is prohibited.")

    # Resolve IP address to check against private/reserved ranges
    try:
        addr_info = socket.getaddrinfo(hostname, None)
        for family, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)
            for blocked_net in BLOCKED_IP_NETWORKS:
                if ip_obj in blocked_net or ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_reserved or ip_obj.is_link_local:
                    raise HTTPException(
                        status_code=400,
                        detail="Access to private or local network addresses is prohibited."
                    )
    except socket.gaierror:
        raise HTTPException(status_code=400, detail=f"Could not resolve domain name: {hostname}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid URL host: {str(e)}")

    return url_str


def clean_html_text(html_content: str) -> str:
    """Convert HTML string to clean plain text."""
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, "html.parser")
    # Replace line breaks with newlines
    for br in soup.find_all(["br", "p", "div", "li", "h1", "h2", "h3", "h4"]):
        br.append("\n")
    text = soup.get_text()
    # Normalize whitespace
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    return "\n".join(lines)


def parse_json_ld(soup: BeautifulSoup) -> Optional[Dict[str, Any]]:
    """Locate and parse JobPosting JSON-LD structured data."""
    scripts = soup.find_all("script", type=re.compile(r"application/(ld\+json|json)", re.I))
    for script in scripts:
        if not script.string:
            continue
        try:
            data = json.loads(script.string)
            items = []
            if isinstance(data, list):
                items = data
            elif isinstance(data, dict):
                if "@graph" in data and isinstance(data["@graph"], list):
                    items = data["@graph"]
                else:
                    items = [data]

            for item in items:
                if isinstance(item, dict):
                    item_type = item.get("@type", "")
                    if isinstance(item_type, list) and "JobPosting" in item_type:
                        return item
                    elif isinstance(item_type, str) and item_type.lower() == "jobposting":
                        return item
        except Exception:
            continue
    return None


def extract_location_from_jsonld(job_ld: Dict[str, Any]) -> str:
    """Extract location text from JobPosting JSON-LD."""
    loc_data = job_ld.get("jobLocation")
    if not loc_data:
        # Check applicant location requirements
        app_loc = job_ld.get("applicantLocationRequirements")
        if isinstance(app_loc, dict):
            return app_loc.get("name", "")
        elif isinstance(app_loc, list) and app_loc:
            names = [loc.get("name", "") if isinstance(loc, dict) else str(loc) for loc in app_loc]
            return ", ".join(filter(None, names))
        return ""

    if isinstance(loc_data, list):
        loc_data = loc_data[0] if loc_data else {}

    if isinstance(loc_data, str):
        return loc_data

    if isinstance(loc_data, dict):
        address = loc_data.get("address")
        if isinstance(address, str):
            return address
        elif isinstance(address, dict):
            parts = [
                address.get("streetAddress"),
                address.get("addressLocality"),
                address.get("addressRegion"),
                address.get("postalCode"),
                address.get("addressCountry"),
            ]
            return ", ".join([str(p) for p in parts if p])
        elif loc_data.get("name"):
            return str(loc_data.get("name"))

    return ""


def extract_salary_from_jsonld(job_ld: Dict[str, Any]) -> Tuple[Optional[float], Optional[float], str, SalaryPeriod]:
    """Extract salary min, max, currency, period from baseSalary."""
    sal_data = job_ld.get("baseSalary")
    if not sal_data:
        return None, None, "USD", "year"

    if isinstance(sal_data, (int, float)):
        return float(sal_data), float(sal_data), "USD", "year"

    if isinstance(sal_data, dict):
        currency = sal_data.get("currency", "USD") or "USD"
        value = sal_data.get("value")
        
        unit_text = ""
        min_val, max_val = None, None

        if isinstance(value, (int, float)):
            min_val = float(value)
            max_val = float(value)
            unit_text = sal_data.get("unitText", "")
        elif isinstance(value, dict):
            min_val = float(value["minValue"]) if value.get("minValue") is not None else None
            max_val = float(value["maxValue"]) if value.get("maxValue") is not None else None
            if min_val is None and value.get("value") is not None:
                min_val = float(value["value"])
                max_val = float(value["value"])
            unit_text = value.get("unitText", "") or sal_data.get("unitText", "")

        period: SalaryPeriod = "year"
        if unit_text:
            u_lower = str(unit_text).lower()
            if "hour" in u_lower or "hr" in u_lower:
                period = "hour"
            elif "month" in u_lower or "mo" in u_lower:
                period = "month"
            elif "year" in u_lower or "yr" in u_lower or "annum" in u_lower:
                period = "year"

        return min_val, max_val, currency, period

    return None, None, "USD", "year"


def map_employment_type(raw_type: Any) -> EmploymentType:
    if not raw_type:
        return "full-time"
    if isinstance(raw_type, list):
        raw_type = raw_type[0] if raw_type else ""
    str_val = str(raw_type).upper()
    if "PART" in str_val:
        return "part-time"
    elif "CONTRACT" in str_val or "FREELANCE" in str_val or "TEMPORARY" in str_val:
        return "contract"
    elif "INTERN" in str_val:
        return "internship"
    return "full-time"


def map_workplace_type(job_ld: Dict[str, Any], text_content: str) -> WorkplaceType:
    loc_type = str(job_ld.get("jobLocationType", "")).upper()
    if "TELECOMMUTE" in loc_type or "REMOTE" in loc_type:
        return "remote"
    
    text_lower = text_content.lower()
    if "remote" in text_lower:
        return "remote"
    elif "hybrid" in text_lower:
        return "hybrid"
    elif "on-site" in text_lower or "onsite" in text_lower:
        return "onsite"
    
    return "remote"


def extract_with_gemini_ai(page_text: str, source_url: str) -> Optional[Dict[str, Any]]:
    """Use Gemini AI to extract structured job details if GEMINI_API_KEY or GOOGLE_API_KEY is available."""
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    if not api_key:
        return None

    # Limit text sent to AI to avoid huge token prompts
    trimmed_text = page_text[:8000]

    prompt = f"""
Extract the job posting details from the webpage text below into a valid JSON object.
Return ONLY valid JSON without markdown formatting or code blocks.

Webpage text:
{trimmed_text}

Required JSON keys:
{{
  "title": "Exact job title",
  "company": "Company or organization name",
  "location": "Job location, city, state/country or Remote",
  "workplaceType": "remote, hybrid, or onsite",
  "employmentType": "full-time, part-time, contract, or internship",
  "salaryMin": numeric_value_or_null,
  "salaryMax": numeric_value_or_null,
  "salaryCurrency": "USD or 3-letter currency code",
  "salaryPeriod": "year, month, or hour",
  "description": "Clean detailed summary of role responsibilities and overview",
  "requirements": "Key requirements, qualifications, and skills expected",
  "benefits": "Perks and benefits listed",
  "deadline": "YYYY-MM-DD or null"
}}
"""
    try:
        # Try google.genai or REST call
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json", "temperature": 0.1}
        }
        with httpx.Client(timeout=12.0) as client:
            resp = client.post(url, json=payload, headers=headers)
            if resp.status_code == 200:
                res_data = resp.json()
                text_out = res_data["candidates"][0]["content"]["parts"][0]["text"]
                # Parse JSON
                clean_json_str = re.sub(r"^```json\s*|\s*```$", "", text_out.strip(), flags=re.MULTILINE)
                return json.loads(clean_json_str)
    except Exception as e:
        print(f"AI Extraction fallback warning: {e}")

    return None


async def import_job_from_url(url: str) -> ExtractedJobPreview:
    """Fetch job listing URL and extract structured job application preview."""
    target_url = validate_and_sanitize_url(url)

    # User agent headers
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            response = await client.get(target_url, headers=headers)
            if response.status_code != 200:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not fetch webpage (HTTP status {response.status_code})."
                )
            
            # Response size check
            if len(response.content) > 5 * 1024 * 1024:
                raise HTTPException(status_code=400, detail="Webpage content exceeds maximum allowed size (5MB).")
            
            html_text = response.text
    except httpx.TimeoutException:
        raise HTTPException(status_code=408, detail="Request timed out while connecting to job site (10s limit).")
    except httpx.RequestError as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch job URL: {str(e)}")

    soup = BeautifulSoup(html_text, "html.parser")

    # Step 1: Try JSON-LD JobPosting
    job_ld = parse_json_ld(soup)

    # Step 2: HTML Fallbacks & Cleaning
    # Remove clutter elements
    for el in soup(["script", "style", "nav", "footer", "header", "noscript", "svg", "iframe", "aside"]):
        el.decompose()

    # Meta tag parsing
    og_title = (soup.find("meta", property="og:title") or soup.find("meta", {"name": "twitter:title"}))
    og_site = (soup.find("meta", property="og:site_name") or soup.find("meta", {"name": "author"}))
    og_desc = (soup.find("meta", property="og:description") or soup.find("meta", {"name": "description"}))

    page_h1 = soup.find("h1")
    page_title_tag = soup.title.string.strip() if soup.title and soup.title.string else ""

    # Clean body text
    body_text = clean_html_text(str(soup.body)) if soup.body else ""

    # Extraction defaults
    title = ""
    company = ""
    location = ""
    description = ""
    requirements = ""
    benefits = ""
    workplace_type: WorkplaceType = "remote"
    employment_type: EmploymentType = "full-time"
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    salary_period: SalaryPeriod = "year"
    deadline: Optional[str] = None
    confidence = "medium"
    used_ai = False

    if job_ld:
        confidence = "high"
        title = str(job_ld.get("title") or job_ld.get("name") or "").strip()
        
        org = job_ld.get("hiringOrganization")
        if isinstance(org, dict):
            company = str(org.get("name") or "").strip()
        elif isinstance(org, str):
            company = org.strip()

        location = extract_location_from_jsonld(job_ld)
        description = clean_html_text(str(job_ld.get("description", "")))
        requirements = clean_html_text(str(job_ld.get("qualifications") or job_ld.get("experienceRequirements") or job_ld.get("skills") or ""))
        benefits = clean_html_text(str(job_ld.get("jobBenefits") or job_ld.get("benefits") or ""))
        
        salary_min, salary_max, salary_currency, salary_period = extract_salary_from_jsonld(job_ld)
        employment_type = map_employment_type(job_ld.get("employmentType"))
        workplace_type = map_workplace_type(job_ld, body_text)
        
        valid_through = job_ld.get("validThrough") or job_ld.get("applicationDeadline")
        if valid_through and isinstance(valid_through, str):
            deadline = valid_through[:10]

    # HTML Fallback if missing title or company
    if not title:
        if page_h1 and page_h1.text.strip():
            title = page_h1.text.strip()
        elif og_title and og_title.get("content"):
            title = str(og_title["content"]).strip()
        elif page_title_tag:
            # Clean "Software Engineer at Stripe" or "Software Engineer - Stripe"
            title_parts = re.split(r"\s+[|\-–—:]\s+|\s+at\s+", page_title_tag, maxsplit=1)
            title = title_parts[0].strip()

    if not company:
        if og_site and og_site.get("content"):
            company = str(og_site["content"]).strip()
        else:
            # Try to extract company from page title or host
            if page_title_tag and (" at " in page_title_tag or " - " in page_title_tag or " | " in page_title_tag):
                parts = re.split(r"\s+[|\-–—]\s+|\s+at\s+", page_title_tag)
                if len(parts) > 1:
                    company = parts[-1].strip()
            if not company:
                parsed_url = urlparse(target_url)
                host_parts = parsed_url.netloc.replace("www.", "").split(".")
                if host_parts:
                    company = host_parts[0].capitalize()

    if not description and body_text:
        description = body_text[:4000]

    # Fallback to AI if title, company, or description are insufficient, and Gemini key present
    if (not title or not company or len(description) < 100) and (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")):
        ai_extracted = extract_with_gemini_ai(body_text, target_url)
        if ai_extracted:
            used_ai = True
            if not title and ai_extracted.get("title"):
                title = str(ai_extracted["title"])
            if not company and ai_extracted.get("company"):
                company = str(ai_extracted["company"])
            if not location and ai_extracted.get("location"):
                location = str(ai_extracted["location"])
            if not description and ai_extracted.get("description"):
                description = str(ai_extracted["description"])
            if not requirements and ai_extracted.get("requirements"):
                requirements = str(ai_extracted["requirements"])
            if not benefits and ai_extracted.get("benefits"):
                benefits = str(ai_extracted["benefits"])
            if ai_extracted.get("salaryMin") is not None:
                salary_min = float(ai_extracted["salaryMin"])
            if ai_extracted.get("salaryMax") is not None:
                salary_max = float(ai_extracted["salaryMax"])
            if ai_extracted.get("salaryCurrency"):
                salary_currency = str(ai_extracted["salaryCurrency"])
            if ai_extracted.get("salaryPeriod"):
                salary_period = ai_extracted["salaryPeriod"]
            if ai_extracted.get("workplaceType"):
                workplace_type = ai_extracted["workplaceType"]
            if ai_extracted.get("employmentType"):
                employment_type = ai_extracted["employmentType"]
            if ai_extracted.get("deadline"):
                deadline = str(ai_extracted["deadline"])

    # Recalculate confidence
    if title and company and description:
        confidence = "high" if (job_ld or used_ai) else "medium"
    else:
        confidence = "low"

    warning = None
    if confidence == "low":
        warning = "Some listing details could not be extracted automatically. Please verify or complete the fields below before saving."

    return ExtractedJobPreview(
        sourceUrl=target_url,
        title=title or "Untitled Role",
        company=company or "Company",
        location=location or "Remote",
        workplaceType=workplace_type,
        employmentType=employment_type,
        salaryMin=salary_min,
        salaryMax=salary_max,
        salaryCurrency=salary_currency,
        salaryPeriod=salary_period,
        description=description,
        requirements=requirements,
        benefits=benefits,
        deadline=deadline,
        extractedAt=datetime.now().isoformat(),
        extractionConfidence=confidence, # type: ignore
        usedAiFallback=used_ai,
        warningMessage=warning
    )
