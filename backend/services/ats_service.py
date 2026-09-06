import re
from typing import List, Dict, Set, Tuple
from datetime import date
from ..models import AtsMatchResult, AtsSectionsFound

ATS_KEYWORD_DICTIONARY: Dict[str, List[str]] = {
    'frontend': [
        'React', 'TypeScript', 'JavaScript', 'Next.js', 'Vue', 'Angular', 'Svelte',
        'HTML5', 'CSS3', 'Tailwind CSS', 'Sass', 'Redux', 'Zustand', 'GraphQL',
        'REST APIs', 'Webpack', 'Vite', 'Jest', 'Cypress', 'Playwright', 'Figma',
        'Responsive Design', 'Web Accessibility', 'WCAG', 'State Management',
        'Performance Optimization', 'Micro-frontends', 'SSR', 'PWA'
    ],
    'backend': [
        'Python', 'FastAPI', 'Django', 'Flask', 'Node.js', 'Express', 'Java', 'Spring Boot',
        'Go', 'Golang', 'Ruby on Rails', 'PHP', 'C#', '.NET', 'Rust', 'C++',
        'Microservices', 'RESTful APIs', 'GraphQL', 'gRPC', 'WebSockets', 'System Design',
        'Distributed Systems', 'Message Queue', 'Concurrency', 'API Design', 'Celery', 'SQLAlchemy'
    ],
    'database': [
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'DynamoDB',
        'Cassandra', 'SQLite', 'Oracle', 'SQL', 'NoSQL', 'Prisma', 'Drizzle',
        'Database Optimization', 'Indexing', 'Data Modeling', 'Database Sharding'
    ],
    'cloud_devops': [
        'AWS', 'Amazon Web Services', 'GCP', 'Google Cloud', 'Azure', 'Docker',
        'Kubernetes', 'K8s', 'Terraform', 'CI/CD', 'GitHub Actions', 'Jenkins',
        'GitLab CI', 'Linux', 'Serverless', 'Lambda', 'S3', 'CloudFront',
        'Monitoring', 'Datadog', 'Prometheus', 'Grafana'
    ],
    'soft_skills_practices': [
        'Agile', 'Scrum', 'Leadership', 'Mentorship', 'Code Review', 'Collaboration',
        'Communication', 'Problem Solving', 'Test-Driven Development', 'TDD',
        'Design Patterns', 'Unit Testing', 'End-to-End Testing', 'Continuous Delivery',
        'Cross-functional', 'Project Management', 'Stakeholder Management'
    ]
}

ALL_KEYWORDS: List[Tuple[str, str]] = []
for group in ATS_KEYWORD_DICTIONARY.values():
    for kw in group:
        ALL_KEYWORDS.append((kw, kw.lower()))


def clean_text(text: str) -> str:
    """Lowercase and strip non-alphanumeric punctuation except essential code tokens (+, #, ., -)."""
    return re.sub(r'[^a-z0-9+#.\s-]', ' ', text.lower())


def extract_keywords(text: str) -> List[str]:
    """Extract known taxonomy keywords present in the text."""
    if not text:
        return []
    
    normalized_text = f" {clean_text(text)} "
    found = set()

    for display, norm in ALL_KEYWORDS:
        pattern = rf'(?:^|[^a-z0-9]){re.escape(norm)}(?:$|[^a-z0-9])'
        if re.search(pattern, normalized_text, re.IGNORECASE):
            found.add(display)

    return list(found)


def detect_sections(resume_text: str) -> AtsSectionsFound:
    """Check whether essential resume sections are present."""
    lower = resume_text.lower()
    return AtsSectionsFound(
        experience=bool(re.search(r'experience|work history|employment|career history', lower, re.IGNORECASE)),
        education=bool(re.search(r'education|degree|university|college|academic', lower, re.IGNORECASE)),
        skills=bool(re.search(r'skills|technologies|proficiencies|competencies|tools', lower, re.IGNORECASE)),
        projects=bool(re.search(r'projects|open source|portfolio|personal projects', lower, re.IGNORECASE)),
        contact=bool(re.search(r'@|phone|\+?[0-9]{3}[-.\s]?[0-9]{3}|linkedin\.com|github\.com', lower, re.IGNORECASE)),
    )


def calculate_ats_match(resume_text: str, job_description_text: str, target_job_role: str = "") -> AtsMatchResult:
    """
    Calculate ATS compatibility score and diagnostic keyword matching.
    """
    resume_norm = clean_text(resume_text or "")
    job_norm = clean_text(f"{target_job_role or ''} {job_description_text or ''}")

    word_count_resume = len([w for w in (resume_text or "").split() if w.strip()])
    word_count_job = len([w for w in (job_description_text or "").split() if w.strip()])

    job_keywords = extract_keywords(job_norm)
    resume_keywords = extract_keywords(resume_norm)

    if len(job_keywords) < 3 and target_job_role:
        role_kws = extract_keywords(target_job_role)
        for k in role_kws:
            if k not in job_keywords:
                job_keywords.append(k)

    if not job_keywords and job_description_text.strip():
        stop_words = {'the', 'and', 'with', 'for', 'you', 'will', 'this', 'that', 'our', 'are', 'from', 'have', 'your', 'about', 'join', 'team', 'work', 'role', 'looking', 'who'}
        job_words = list(dict.fromkeys(
            [w.capitalize() for w in job_norm.split() if len(w) > 3 and w not in stop_words]
        ))[:10]
        job_keywords.extend(job_words)

    soft_keywords_set = {s.lower() for s in ATS_KEYWORD_DICTIONARY['soft_skills_practices']}

    matched_keywords: List[str] = []
    missing_keywords: List[str] = []
    matched_soft_skills: List[str] = []
    missing_soft_skills: List[str] = []

    for kw in job_keywords:
        is_soft = kw.lower() in soft_keywords_set
        is_present = any(r_kw.lower() == kw.lower() for r_kw in resume_keywords) or (kw.lower() in resume_norm)

        if is_present:
            if is_soft:
                matched_soft_skills.append(kw)
            else:
                matched_keywords.append(kw)
        else:
            if is_soft:
                missing_soft_skills.append(kw)
            else:
                missing_keywords.append(kw)

    total_keywords = len(job_keywords) or 1
    total_matched = len(matched_keywords) + len(matched_soft_skills)
    keyword_match_ratio = (total_matched / total_keywords) if total_keywords > 0 else 0.8
    keyword_score = min(round(keyword_match_ratio * 100), 100)

    sections = detect_sections(resume_text)
    section_count = sum([
        1 if getattr(sections, f) else 0 
        for f in ['experience', 'education', 'skills', 'projects', 'contact']
    ])
    section_score = (section_count / 5.0) * 100

    length_score = 100
    if word_count_resume < 150:
        length_score = 50
    elif word_count_resume < 250:
        length_score = 80
    elif word_count_resume > 1200:
        length_score = 85

    # 65% Keyword Match, 20% Section Completeness, 15% Content Length & Formatting
    final_score = min(max(round(keyword_score * 0.65 + section_score * 0.20 + length_score * 0.15), 0), 100)

    if final_score >= 85:
        rating = 'Exceptional'
    elif final_score >= 70:
        rating = 'Strong Match'
    elif final_score >= 50:
        rating = 'Moderate'
    else:
        rating = 'Low Match'

    recommendations: List[str] = []
    if missing_keywords:
        top_missing = ", ".join(missing_keywords[:4])
        recommendations.append(f"Add key technical skills highlighted in the job description: {top_missing}")
    if missing_soft_skills:
        top_missing_soft = ", ".join(missing_soft_skills[:3])
        recommendations.append(f"Incorporate teamwork & methodology terms: {top_missing_soft}")
    if not sections.skills:
        recommendations.append('Create a dedicated "Technical Skills" section near the top of your resume for ATS parsers.')
    if not sections.projects:
        recommendations.append('Include a "Projects" or "Open Source" section with measurable outcomes to boost keyword density.')
    if word_count_resume < 300:
        recommendations.append('Your resume length is relatively brief (<300 words). Add detail to your bullet points using the Action Verb + Context + Result format.')
    if final_score >= 85:
        recommendations.append('Great match! Your resume contains strong keyword alignment for this role.')

    return AtsMatchResult(
        score=final_score,
        rating=rating,
        matchedKeywords=matched_keywords,
        missingKeywords=missing_keywords,
        matchedSoftSkills=matched_soft_skills,
        missingSoftSkills=missing_soft_skills,
        sectionsFound=sections,
        recommendations=recommendations[:4],
        wordCountResume=word_count_resume,
        wordCountJob=word_count_job,
        analyzedAt=date.today().isoformat()
    )
