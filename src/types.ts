export type JobStage = 
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'technical'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type Priority = 'high' | 'medium' | 'low';

export type WorkplaceType = 'remote' | 'hybrid' | 'onsite';

export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'internship';

export type SalaryPeriod = 'year' | 'month' | 'hour';

export interface InterviewRound {
  id: string;
  stageName: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  format: 'video' | 'phone' | 'onsite' | 'take-home';
  interviewer?: string;
  meetingLink?: string;
  notes?: string;
  completed: boolean;
  feedback?: string;
}

export interface ContactPerson {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface AtsMatchResult {
  score: number; // 0 - 100
  rating: 'Exceptional' | 'Strong Match' | 'Moderate' | 'Low Match';
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSoftSkills: string[];
  missingSoftSkills: string[];
  sectionsFound: {
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    contact: boolean;
  };
  recommendations: string[];
  wordCountResume: number;
  wordCountJob: number;
  analyzedAt: string;
}

export interface ResumeItem {
  id: string;
  name: string; // e.g. "Senior React & Frontend CV.pdf"
  fileName?: string;
  fileSize?: string;
  uploadDate: string; // YYYY-MM-DD
  targetRole?: string; // e.g. "Senior Frontend Engineer"
  content: string; // Full text content
  skills: string[]; // ['React', 'TypeScript', 'Node.js', ...]
  experienceYears?: number;
  education?: string;
  summary?: string;
  isDefault?: boolean;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  location: string;
  workplaceType: WorkplaceType;
  employmentType: EmploymentType;
  stage: JobStage;
  priority: Priority;
  
  // Compensation
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
  equityBonus?: string;
  benefits?: string;

  // URLs and Assets
  jobUrl?: string;
  companyWebsite?: string;
  jobDescription?: string;
  resumeId?: string; // ID of the linked resume
  resumeVersion?: string; // Name of the linked resume
  coverLetterVersion?: string;
  
  // ATS Score
  atsScore?: number;
  atsMatchResult?: AtsMatchResult;
  
  // Dates
  appliedDate: string; // YYYY-MM-DD
  lastActivityDate: string; // YYYY-MM-DD
  deadline?: string; // YYYY-MM-DD
  followUpDate?: string; // YYYY-MM-DD

  // Details
  contacts: ContactPerson[];
  interviews: InterviewRound[];
  checklist: ChecklistItem[];
  notes: string;
  rating: number; // 1 to 5
  tags: string[];
  archived: boolean;
  color?: string;
}

export interface StageConfig {
  id: JobStage;
  label: string;
  description: string;
  color: {
    bg: string;
    text: string;
    border: string;
    badge: string;
    lightBg: string;
    dot: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
  location?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  bio?: string;
  isLoggedIn: boolean;
}

export interface UserGoals {
  monthlyApplicationsTarget: number;
  weeklyApplicationsTarget: number;
  monthlyInterviewsTarget: number;
  monthlyOffersTarget: number;
  targetMinSalary?: number;
  salaryCurrency?: string; // e.g. 'ZAR', 'USD', 'EUR', 'GBP', etc.
  focusNotes?: string;
  targetMonth?: string; // YYYY-MM
}

export type ViewMode = 'kanban' | 'table' | 'analytics' | 'offers' | 'resumes' | 'ats-calculator' | 'builder';
