import { JobApplication, StageConfig, JobStage } from '../types';

export const STAGES_CONFIG: Record<JobStage, StageConfig> = {
  wishlist: {
    id: 'wishlist',
    label: 'Wishlist',
    description: 'Bookmarked opportunities to research & apply',
    color: {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
      badge: 'bg-slate-100 text-slate-700 border-slate-200',
      lightBg: 'bg-slate-50',
      dot: 'bg-slate-400',
    },
  },
  applied: {
    id: 'applied',
    label: 'Applied',
    description: 'Submitted application, waiting for initial response',
    color: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      lightBg: 'bg-blue-50/50',
      dot: 'bg-blue-500',
    },
  },
  screening: {
    id: 'screening',
    label: 'Screening',
    description: 'Recruiter call or initial phone screen scheduled',
    color: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      lightBg: 'bg-amber-50/50',
      dot: 'bg-amber-500',
    },
  },
  technical: {
    id: 'technical',
    label: 'Assessment',
    description: 'Coding challenge, take-home project or tech screen',
    color: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      lightBg: 'bg-indigo-50/50',
      dot: 'bg-indigo-500',
    },
  },
  interview: {
    id: 'interview',
    label: 'Interviews',
    description: 'Deep dive interviews / panel / onsite loops',
    color: {
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      border: 'border-purple-200',
      badge: 'bg-purple-50 text-purple-700 border-purple-200',
      lightBg: 'bg-purple-50/50',
      dot: 'bg-purple-500',
    },
  },
  offer: {
    id: 'offer',
    label: 'Offer',
    description: 'Official offer received! Under negotiation or review',
    color: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      lightBg: 'bg-emerald-50/50',
      dot: 'bg-emerald-500',
    },
  },
  rejected: {
    id: 'rejected',
    label: 'Rejected',
    description: 'Application was not selected or role cancelled',
    color: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      lightBg: 'bg-rose-50/50',
      dot: 'bg-rose-500',
    },
  },
  withdrawn: {
    id: 'withdrawn',
    label: 'Withdrawn',
    description: 'Self-withdrawn or passed due to another offer',
    color: {
      bg: 'bg-zinc-100',
      text: 'text-zinc-700',
      border: 'border-zinc-300',
      badge: 'bg-zinc-100 text-zinc-700 border-zinc-200',
      lightBg: 'bg-zinc-50',
      dot: 'bg-zinc-400',
    },
  },
};

export const INITIAL_JOBS: JobApplication[] = [];
