import { JobApplication, JobStage, Priority, ResumeItem } from '../types';
import { INITIAL_JOBS } from '../data/initialJobs';
import { INITIAL_RESUMES } from '../data/initialResumes';
import { calculateAtsMatch } from './atsCalculator';

const JOBS_STORAGE_KEY = 'job_tracker_applications_v4';
const RESUMES_STORAGE_KEY = 'job_tracker_resumes_v4';

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

export function formatSalary(
  min?: number,
  max?: number,
  currency: string = 'USD',
  period: string = 'year'
): string {
  if (!min && !max) return 'Not disclosed';
  
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;
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
  const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : `${currency} `;
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
