import { 
  JobApplication, 
  ResumeItem, 
  UserProfile, 
  UserGoals, 
  JobStage, 
  AtsMatchResult 
} from '../types';

const API_BASE = '/api';

/**
 * Helper to handle fetch responses
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(errorData.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Health check
  checkHealth: async (): Promise<{ status: string; service: string }> => {
    return fetchJson(`${API_BASE}/health`);
  },

  // Jobs API
  getJobs: async (params?: { stage?: string; priority?: string; search?: string }): Promise<JobApplication[]> => {
    const query = new URLSearchParams();
    if (params?.stage && params.stage !== 'all') query.set('stage', params.stage);
    if (params?.priority && params.priority !== 'all') query.set('priority', params.priority);
    if (params?.search) query.set('search', params.search);
    
    const qs = query.toString();
    return fetchJson(`${API_BASE}/jobs${qs ? `?${qs}` : ''}`);
  },

  getJobById: async (id: string): Promise<JobApplication> => {
    return fetchJson(`${API_BASE}/jobs/${id}`);
  },

  createOrUpdateJob: async (job: JobApplication): Promise<JobApplication> => {
    return fetchJson(`${API_BASE}/jobs`, {
      method: 'POST',
      body: JSON.stringify(job),
    });
  },

  deleteJob: async (id: string): Promise<{ status: string }> => {
    return fetchJson(`${API_BASE}/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  batchDeleteJobs: async (ids: string[]): Promise<{ status: string; deleted_count: number }> => {
    return fetchJson(`${API_BASE}/jobs/batch-delete`, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  },

  batchUpdateStage: async (ids: string[], stage: JobStage): Promise<{ status: string; updated_count: number }> => {
    return fetchJson(`${API_BASE}/jobs/batch-stage`, {
      method: 'POST',
      body: JSON.stringify({ ids, stage }),
    });
  },

  quickMoveStage: async (jobId: string, stage: JobStage): Promise<JobApplication> => {
    return fetchJson(`${API_BASE}/jobs/${jobId}/stage`, {
      method: 'PATCH',
      body: JSON.stringify({ stage }),
    });
  },

  updateRating: async (jobId: string, rating: number): Promise<JobApplication> => {
    return fetchJson(`${API_BASE}/jobs/${jobId}/rating`, {
      method: 'PATCH',
      body: JSON.stringify({ rating }),
    });
  },

  markInterviewComplete: async (jobId: string, interviewId: string): Promise<JobApplication> => {
    return fetchJson(`${API_BASE}/jobs/${jobId}/interviews/${interviewId}/complete`, {
      method: 'POST',
    });
  },

  // Resumes API
  getResumes: async (): Promise<ResumeItem[]> => {
    return fetchJson(`${API_BASE}/resumes`);
  },

  getResumeById: async (id: string): Promise<ResumeItem> => {
    return fetchJson(`${API_BASE}/resumes/${id}`);
  },

  createOrUpdateResume: async (resume: ResumeItem): Promise<ResumeItem> => {
    return fetchJson(`${API_BASE}/resumes`, {
      method: 'POST',
      body: JSON.stringify(resume),
    });
  },

  deleteResume: async (id: string): Promise<{ status: string }> => {
    return fetchJson(`${API_BASE}/resumes/${id}`, {
      method: 'DELETE',
    });
  },

  uploadResumeFile: async (file: File, targetRole?: string): Promise<ResumeItem> => {
    const formData = new FormData();
    formData.append('file', file);
    if (targetRole) formData.append('targetRole', targetRole);

    const res = await fetch(`${API_BASE}/resumes/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(errorData.detail || 'File upload failed');
    }

    return res.json();
  },

  // User Profile & Goals
  getProfile: async (): Promise<UserProfile> => {
    return fetchJson(`${API_BASE}/profile`);
  },

  saveProfile: async (profile: UserProfile): Promise<UserProfile> => {
    return fetchJson(`${API_BASE}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  getGoals: async (): Promise<UserGoals> => {
    return fetchJson(`${API_BASE}/goals`);
  },

  saveGoals: async (goals: UserGoals): Promise<UserGoals> => {
    return fetchJson(`${API_BASE}/goals`, {
      method: 'PUT',
      body: JSON.stringify(goals),
    });
  },

  // ATS Calculation API
  calculateAts: async (
    resumeText: string, 
    jobDescriptionText: string, 
    targetJobRole?: string
  ): Promise<AtsMatchResult> => {
    return fetchJson(`${API_BASE}/ats/calculate`, {
      method: 'POST',
      body: JSON.stringify({
        resumeText,
        jobDescriptionText,
        targetJobRole,
      }),
    });
  },

  // AI Coach API
  draftEmail: async (payload: {
    jobId?: string;
    company?: string;
    role?: string;
    contactName?: string;
    emailType: 'thank_you' | 'follow_up' | 'negotiation' | 'withdraw';
    userName?: string;
    userPhone?: string;
    userPortfolio?: string;
  }): Promise<{ draft: string; emailType: string }> => {
    return fetchJson(`${API_BASE}/ai/draft-email`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Reset database demo
  resetDemoData: async (): Promise<{ status: string }> => {
    return fetchJson(`${API_BASE}/reset-demo`, {
      method: 'POST',
    });
  },
};
