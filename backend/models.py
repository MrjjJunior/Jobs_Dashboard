from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field
from datetime import date, datetime

JobStage = Literal[
    'wishlist',
    'applied',
    'screening',
    'technical',
    'interview',
    'offer',
    'rejected',
    'withdrawn'
]

Priority = Literal['high', 'medium', 'low']
WorkplaceType = Literal['remote', 'hybrid', 'onsite']
EmploymentType = Literal['full-time', 'part-time', 'contract', 'internship']
SalaryPeriod = Literal['year', 'month', 'hour']


class InterviewRound(BaseModel):
    id: str
    stageName: str
    date: str  # YYYY-MM-DD
    time: Optional[str] = None  # HH:mm
    format: Literal['video', 'phone', 'onsite', 'take-home'] = 'video'
    interviewer: Optional[str] = None
    meetingLink: Optional[str] = None
    notes: Optional[str] = None
    completed: bool = False
    feedback: Optional[str] = None


class ContactPerson(BaseModel):
    id: str
    name: str
    role: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None


class ChecklistItem(BaseModel):
    id: str
    text: str
    completed: bool = False


class AtsSectionsFound(BaseModel):
    experience: bool = False
    education: bool = False
    skills: bool = False
    projects: bool = False
    contact: bool = False


class AtsMatchResult(BaseModel):
    score: int = Field(..., ge=0, le=100)
    rating: Literal['Exceptional', 'Strong Match', 'Moderate', 'Low Match']
    matchedKeywords: List[str] = []
    missingKeywords: List[str] = []
    matchedSoftSkills: List[str] = []
    missingSoftSkills: List[str] = []
    sectionsFound: AtsSectionsFound = Field(default_factory=AtsSectionsFound)
    recommendations: List[str] = []
    wordCountResume: int = 0
    wordCountJob: int = 0
    analyzedAt: str = Field(default_factory=lambda: date.today().isoformat())


class ResumeItem(BaseModel):
    id: str
    name: str  # e.g. "Senior React & Frontend CV.pdf"
    fileName: Optional[str] = None
    fileSize: Optional[str] = None
    uploadDate: str = Field(default_factory=lambda: date.today().isoformat())
    targetRole: Optional[str] = None
    content: str = ""
    skills: List[str] = []
    experienceYears: Optional[int] = None
    education: Optional[str] = None
    summary: Optional[str] = None
    isDefault: Optional[bool] = False


class JobApplication(BaseModel):
    id: str
    company: str
    role: str
    location: str = ""
    workplaceType: WorkplaceType = "remote"
    employmentType: EmploymentType = "full-time"
    stage: JobStage = "applied"
    priority: Priority = "medium"

    # Compensation
    salaryMin: Optional[float] = None
    salaryMax: Optional[float] = None
    salaryCurrency: str = "USD"
    salaryPeriod: SalaryPeriod = "year"
    equityBonus: Optional[str] = None
    benefits: Optional[str] = None

    # URLs and Assets
    jobUrl: Optional[str] = None
    companyWebsite: Optional[str] = None
    jobDescription: Optional[str] = None
    resumeId: Optional[str] = None
    resumeVersion: Optional[str] = None
    coverLetterVersion: Optional[str] = None

    # ATS Score
    atsScore: Optional[int] = None
    atsMatchResult: Optional[AtsMatchResult] = None

    # Dates
    appliedDate: str = Field(default_factory=lambda: date.today().isoformat())
    lastActivityDate: str = Field(default_factory=lambda: date.today().isoformat())
    deadline: Optional[str] = None
    followUpDate: Optional[str] = None

    # Details
    contacts: List[ContactPerson] = []
    interviews: List[InterviewRound] = []
    checklist: List[ChecklistItem] = []
    notes: str = ""
    rating: int = 0  # 1 to 5
    tags: List[str] = []
    archived: bool = False
    color: Optional[str] = None


class UserProfile(BaseModel):
    id: str = "user-1"
    name: str = "Alex Rivera"
    email: str = "alex.rivera@example.com"
    role: str = "Senior Software Engineer"
    avatarUrl: Optional[str] = None
    location: Optional[str] = "San Francisco, CA"
    phone: Optional[str] = "+1 (555) 382-9012"
    linkedin: Optional[str] = "https://linkedin.com/in/alex-rivera-tech"
    github: Optional[str] = "https://github.com/alexrivera-dev"
    bio: Optional[str] = "Experienced engineer specializing in React, TypeScript, Python, and cloud services."
    isLoggedIn: bool = True


class UserGoals(BaseModel):
    monthlyApplicationsTarget: int = 20
    weeklyApplicationsTarget: int = 5
    monthlyInterviewsTarget: int = 4
    monthlyOffersTarget: int = 1
    targetMinSalary: Optional[float] = 145000
    salaryCurrency: str = "USD"
    focusNotes: Optional[str] = "Prioritize modern tech stacks, strong engineering culture, and competitive compensation."
    targetMonth: str = Field(default_factory=lambda: datetime.now().strftime("%Y-%m"))


class AtsCalculateRequest(BaseModel):
    resumeText: str
    jobDescriptionText: str
    targetJobRole: Optional[str] = None


class EmailDraftRequest(BaseModel):
    jobId: Optional[str] = None
    company: Optional[str] = None
    role: Optional[str] = None
    contactName: Optional[str] = None
    emailType: Literal['thank_you', 'follow_up', 'negotiation', 'withdraw'] = 'thank_you'
    userName: Optional[str] = "Alex Rivera"
    userPhone: Optional[str] = None
    userPortfolio: Optional[str] = None
    customPrompt: Optional[str] = None


class BatchDeleteRequest(BaseModel):
    ids: List[str]


class BatchStageUpdateRequest(BaseModel):
    ids: List[str]
    stage: JobStage


class StageUpdatePayload(BaseModel):
    stage: JobStage


class RatingUpdatePayload(BaseModel):
    rating: int
