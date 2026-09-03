import { JobApplication, JobStage, Priority, ResumeItem, UserProfile, UserGoals } from '../types';
import { INITIAL_JOBS } from '../data/initialJobs';
import { INITIAL_RESUMES } from '../data/initialResumes';
import { calculateAtsMatch } from './atsCalculator';

const JOBS_STORAGE_KEY = 'job_tracker_applications_v4';
const RESUMES_STORAGE_KEY = 'job_tracker_resumes_v4';
const USER_PROFILE_STORAGE_KEY = 'job_tracker_user_profile_v1';
const USER_GOALS_STORAGE_KEY = 'job_tracker_user_goals_v1';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'user-1',
  name: 'Alex Rivera',
  email: 'alex.rivera@example.com',
  role: 'Senior Software Engineer',
  avatarUrl: null,
  location: 'San Francisco, CA',
  phone: '+1 (555) 382-9012',
  linkedin: 'https://linkedin.com/in/alex-rivera-tech',
  github: 'https://github.com/alexrivera-dev',
  bio: 'Experienced engineer specializing in React, TypeScript, cloud services, and developer tooling.',
  isLoggedIn: true,
};

export const DEFAULT_USER_GOALS: UserGoals = {
  monthlyApplicationsTarget: 20,
  weeklyApplicationsTarget: 5,
  monthlyInterviewsTarget: 4,
  monthlyOffersTarget: 1,
  targetMinSalary: 145000,
  salaryCurrency: 'USD',
  focusNotes: 'Prioritize modern tech stacks, strong engineering culture, and competitive compensation.',
  targetMonth: new Date().toISOString().slice(0, 7),
};

export function loadStoredUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
    if (!raw || raw === 'undefined' || raw === 'null') {
      localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
      return DEFAULT_USER_PROFILE;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_USER_PROFILE;
    }
    return { ...DEFAULT_USER_PROFILE, ...parsed };
  } catch (err) {
    console.error('Failed to load user profile from storage', err);
    return DEFAULT_USER_PROFILE;
  }
}

export function saveStoredUserProfile(profile: UserProfile): void {
  try {
    if (!profile) return;
    localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('Failed to save user profile to localStorage', err);
  }
}

export function loadStoredUserGoals(): UserGoals {
  try {
    const raw = localStorage.getItem(USER_GOALS_STORAGE_KEY);
    if (!raw || raw === 'undefined' || raw === 'null') {
      localStorage.setItem(USER_GOALS_STORAGE_KEY, JSON.stringify(DEFAULT_USER_GOALS));
      return DEFAULT_USER_GOALS;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return DEFAULT_USER_GOALS;
    }
    return { ...DEFAULT_USER_GOALS, ...parsed };
  } catch (err) {
    console.error('Failed to load user goals from storage', err);
    return DEFAULT_USER_GOALS;
  }
}

export function saveStoredUserGoals(goals: UserGoals): void {
  try {
    if (!goals) return;
    localStorage.setItem(USER_GOALS_STORAGE_KEY, JSON.stringify(goals));
  } catch (err) {
    console.error('Failed to save user goals to localStorage', err);
  }
}

export function loadStoredJobs(): JobApplication[] {
  try {
    const raw = localStorage.getItem(JOBS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse stored jobs, starting fresh', err);
    return [];
  }
}

export function saveStoredJobs(jobs: JobApplication[]): void {
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save jobs to localStorage', err);
  }
}

export function loadStoredResumes(): ResumeItem[] {
  try {
    const raw = localStorage.getItem(RESUMES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RESUMES_STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse stored resumes', err);
    return [];
  }
}

export function saveStoredResumes(resumes: ResumeItem[]): void {
  try {
    localStorage.setItem(RESUMES_STORAGE_KEY, JSON.stringify(resumes));
  } catch (err) {
    console.error('Failed to save resumes to localStorage', err);
  }
}

export function clearAllStoredData(): void {
  try {
    localStorage.setItem(JOBS_STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(RESUMES_STORAGE_KEY, JSON.stringify([]));
    localStorage.removeItem('job_tracker_applications_v1');
    localStorage.removeItem('job_tracker_resumes_v1');
  } catch (err) {
    console.error('Failed to clear storage', err);
  }
}

/**
 * Enriches jobs with realistic default descriptions, resume linking, and ATS scores
 */
function enrichInitialJobs(jobs: JobApplication[]): JobApplication[] {
  const resumes = INITIAL_RESUMES;

  return jobs.map((job, idx) => {
    let resumeId = job.resumeId;
    let resumeVersion = job.resumeVersion;

    if (!resumeId) {
      // Assign based on role or index
      if (job.role.toLowerCase().includes('frontend') || job.role.toLowerCase().includes('ui')) {
        resumeId = 'resume-1';
        resumeVersion = 'Frontend Specialist (React & TypeScript).pdf';
      } else if (job.role.toLowerCase().includes('backend') || job.role.toLowerCase().includes('systems')) {
        resumeId = 'resume-3';
        resumeVersion = 'Backend & Distributed Systems CV.pdf';
      } else {
        resumeId = 'resume-2';
        resumeVersion = 'Full-Stack & Cloud Architecture.pdf';
      }
    }

    let jobDescription = job.jobDescription;
    if (!jobDescription) {
      jobDescription = generateSampleJobDescription(job.company, job.role);
    }

    let atsScore = job.atsScore;
    let atsMatchResult = job.atsMatchResult;

    if (!atsScore) {
      const resume = resumes.find((r) => r.id === resumeId) || resumes[0];
      if (resume) {
        atsMatchResult = calculateAtsMatch(resume.content, jobDescription, job.role);
        atsScore = atsMatchResult.score;
      } else {
        atsScore = 78 + (idx % 18);
      }
    }

    return {
      ...job,
      resumeId,
      resumeVersion,
      jobDescription,
      atsScore,
      atsMatchResult,
    };
  });
}

function generateSampleJobDescription(company: string, role: string): string {
  return `About the Role:
${company} is looking for an exceptional ${role} to join our core engineering team. You will be responsible for designing, building, and deploying mission-critical systems and intuitive user experiences that power our global platform.

Key Responsibilities:
• Architect, build, and maintain highly scalable web applications and microservices.
• Collaborate cross-functionally with Product Managers, UX Designers, and engineering peers in an Agile environment.
• Lead code reviews, champion engineering best practices, and mentor junior engineers.
• Optimize application performance, reliability, and security across the full development lifecycle.

Requirements & Qualifications:
• 4+ years of professional software engineering experience.
• Strong proficiency in TypeScript, React, Node.js, and modern state management.
• Experience with cloud infrastructure (AWS or GCP), Docker, CI/CD pipelines, and PostgreSQL.
• Passion for clean code, automated testing (Jest, Cypress), and accessibility standards.
• Excellent problem-solving, communication, and system design skills.`;
}

export interface ResumePerformanceStats {
  resume: ResumeItem;
  totalApplications: number;
  activeApplications: number;
  interviewsCount: number;
  interviewRate: number; // 0 - 100%
  offersCount: number;
  offerRate: number; // 0 - 100%
  rejectionsCount: number;
  avgAtsScore: number;
  isTopPerformer: boolean;
  appliedJobs: JobApplication[];
}

/**
 * Calculates comparative performance analytics for each resume
 */
export function getResumePerformanceStats(
  jobs: JobApplication[],
  resumes: ResumeItem[]
): ResumePerformanceStats[] {
  let highestInterviewRate = -1;

  const rawStats = resumes.map((resume) => {
    // Find all jobs linked to this resume (by ID or matching name)
    const appliedJobs = jobs.filter(
      (j) => j.resumeId === resume.id || j.resumeVersion === resume.name
    );

    const totalApplications = appliedJobs.length;
    const activeApplications = appliedJobs.filter(
      (j) => !['rejected', 'withdrawn', 'wishlist'].includes(j.stage)
    ).length;

    // Interview count: screening, technical, interview, offer
    const interviewsCount = appliedJobs.filter((j) =>
      ['screening', 'technical', 'interview', 'offer'].includes(j.stage)
    ).length;

    const interviewRate =
      totalApplications > 0
        ? Math.round((interviewsCount / totalApplications) * 100)
        : 0;

    const offersCount = appliedJobs.filter((j) => j.stage === 'offer').length;
    const offerRate =
      totalApplications > 0
        ? Math.round((offersCount / totalApplications) * 100)
        : 0;

    const rejectionsCount = appliedJobs.filter((j) => j.stage === 'rejected').length;

    // Average ATS Score
    const scoredJobs = appliedJobs.filter((j) => j.atsScore && j.atsScore > 0);
    const avgAtsScore =
      scoredJobs.length > 0
        ? Math.round(
            scoredJobs.reduce((acc, curr) => acc + (curr.atsScore || 0), 0) /
              scoredJobs.length
          )
        : 0;

    if (totalApplications >= 2 && interviewRate > highestInterviewRate) {
      highestInterviewRate = interviewRate;
    }

    return {
      resume,
      totalApplications,
      activeApplications,
      interviewsCount,
      interviewRate,
      offersCount,
      offerRate,
      rejectionsCount,
      avgAtsScore,
      isTopPerformer: false,
      appliedJobs,
    };
  });

  // Assign top performer flag
  return rawStats.map((stat) => ({
    ...stat,
    isTopPerformer:
      stat.totalApplications >= 2 &&
      stat.interviewRate === highestInterviewRate &&
      highestInterviewRate > 0,
  }));
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  region: string;
  exampleMinSalary: number;
}

export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'ZAR', symbol: 'R', name: 'South African Rand', region: 'South Africa', exampleMinSalary: 650000 },
  { code: 'USD', symbol: '$', name: 'US Dollar', region: 'United States', exampleMinSalary: 140000 },
  { code: 'EUR', symbol: '€', name: 'Euro', region: 'European Union', exampleMinSalary: 85000 },
  { code: 'GBP', symbol: '£', name: 'British Pound', region: 'United Kingdom', exampleMinSalary: 75000 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', region: 'Canada', exampleMinSalary: 120000 },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', region: 'Australia', exampleMinSalary: 135000 },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', region: 'India', exampleMinSalary: 2000000 },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', region: 'Japan', exampleMinSalary: 8000000 },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', region: 'Switzerland', exampleMinSalary: 110000 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', region: 'Singapore', exampleMinSalary: 100000 },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar', region: 'New Zealand', exampleMinSalary: 120000 },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', region: 'Brazil', exampleMinSalary: 180000 },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira', region: 'Nigeria', exampleMinSalary: 15000000 },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling', region: 'Kenya', exampleMinSalary: 3000000 },
];

export function getCurrencySymbol(currencyCode: string = 'USD'): string {
  const code = (currencyCode || 'USD').toUpperCase().trim();
  switch (code) {
    case 'ZAR':
      return 'R ';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    case 'GBP':
      return '£';
    case 'CAD':
      return 'CA$';
    case 'AUD':
      return 'A$';
    case 'INR':
      return '₹';
    case 'JPY':
      return '¥';
    case 'CHF':
      return 'CHF ';
    case 'SGD':
      return 'S$';
    case 'NZD':
      return 'NZ$';
    case 'BRL':
      return 'R$ ';
    case 'NGN':
      return '₦';
    case 'KES':
      return 'KSh ';
    default:
      return `${code} `;
  }
}

export function formatSalary(
  min?: number,
  max?: number,
  currency: string = 'USD',
  period: string = 'year'
): string {
  if (!min && !max) return 'Not disclosed';
  
  const symbol = getCurrencySymbol(currency);
  const periodLabel = period === 'year' ? '/yr' : period === 'month' ? '/mo' : '/hr';

  const fmt = (num: number) => {
    if (period === 'year') {
      if (num >= 1000) {
        return `${Math.round(num / 1000)}k`;
      }
    }
    return num.toLocaleString();
  };

  if (min && max) {
    if (min === max) return `${symbol}${fmt(min)}${periodLabel}`;
    return `${symbol}${fmt(min)} - ${symbol}${fmt(max)}${periodLabel}`;
  }
  if (min) return `From ${symbol}${fmt(min)}${periodLabel}`;
  if (max) return `Up to ${symbol}${fmt(max)}${periodLabel}`;
  return 'Not disclosed';
}

export function formatSalaryNum(val: number, currency: string = 'USD'): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${val.toLocaleString()}`;
}

export function daysBetween(dateString: string): number {
  const target = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - target.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

export function isStaleApplication(job: JobApplication): boolean {
  if (job.stage === 'offer' || job.stage === 'rejected' || job.stage === 'withdrawn' || job.stage === 'wishlist') {
    return false;
  }
  const days = daysBetween(job.lastActivityDate || job.appliedDate);
  return days >= 7;
}

export function getUpcomingInterviews(jobs: JobApplication[]): Array<{
  job: JobApplication;
  interview: JobApplication['interviews'][0];
  daysUntil: number;
}> {
  const list: Array<{
    job: JobApplication;
    interview: JobApplication['interviews'][0];
    daysUntil: number;
  }> = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  jobs.forEach((job) => {
    if (job.stage === 'rejected' || job.stage === 'withdrawn' || job.archived) return;
    job.interviews?.forEach((interview) => {
      if (interview.completed) return;
      const intDate = new Date(interview.date);
      intDate.setHours(0, 0, 0, 0);
      const diffTime = intDate.getTime() - today.getTime();
      const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (daysUntil >= -2) {
        list.push({ job, interview, daysUntil });
      }
    });
  });

  return list.sort((a, b) => a.daysUntil - b.daysUntil);
}

export function exportJobsToJson(jobs: JobApplication[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jobs, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  const date = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `job-applications-backup-${date}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportJobsToCsv(jobs: JobApplication[]): void {
  const headers = [
    'Company',
    'Role',
    'Stage',
    'Priority',
    'Location',
    'Workplace Type',
    'Employment Type',
    'Resume Version',
    'ATS Match Score',
    'Min Salary',
    'Max Salary',
    'Currency',
    'Period',
    'Equity/Bonus',
    'Applied Date',
    'Last Activity',
    'Rating (1-5)',
    'Tags',
    'Job URL',
    'Notes',
  ];

  const escapeCsv = (str: string | number | undefined) => {
    if (str === undefined || str === null) return '""';
    const clean = String(str).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const rows = jobs.map((j) => [
    escapeCsv(j.company),
    escapeCsv(j.role),
    escapeCsv(j.stage),
    escapeCsv(j.priority),
    escapeCsv(j.location),
    escapeCsv(j.workplaceType),
    escapeCsv(j.employmentType),
    escapeCsv(j.resumeVersion || 'Default'),
    escapeCsv(j.atsScore ? `${j.atsScore}%` : 'N/A'),
    escapeCsv(j.salaryMin),
    escapeCsv(j.salaryMax),
    escapeCsv(j.salaryCurrency),
    escapeCsv(j.salaryPeriod),
    escapeCsv(j.equityBonus),
    escapeCsv(j.appliedDate),
    escapeCsv(j.lastActivityDate),
    escapeCsv(j.rating),
    escapeCsv(j.tags.join(', ')),
    escapeCsv(j.jobUrl),
    escapeCsv(j.notes),
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodedUri);
  const date = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute('download', `job-applications-${date}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function getCompanyInitials(company: string): string {
  if (!company) return 'J';
  const parts = company.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return company.slice(0, 2).toUpperCase();
}

export function getCompanyColor(company: string): string {
  const colors = [
    '#3B82F6', // Blue
    '#10B981', // Emerald
    '#6366F1', // Indigo
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#F59E0B', // Amber
    '#06B6D4', // Cyan
    '#14B8A6', // Teal
    '#E11D48', // Rose
    '#4F46E5', // Violet
  ];
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
