import { JobApplication, StageConfig, JobStage } from '../types';

export const STAGES_CONFIG: Record<JobStage, StageConfig> = {
  wishlist: {
    id: 'wishlist',
    label: 'Wishlist',
    description: 'Bookmarked opportunities to research & apply',
    color: {
      bg: 'bg-linen-100',
      text: 'text-[#003B36]',
      border: 'border-[#917C78]/30',
      badge: 'bg-[#F3E8EE] text-[#003B36] border-[#917C78]/30',
      lightBg: 'bg-[#F3E8EE]/30',
      dot: 'bg-[#917C78]',
    },
  },
  applied: {
    id: 'applied',
    label: 'Applied',
    description: 'Submitted application, waiting for initial response',
    color: {
      bg: 'bg-[#003B36]/10',
      text: 'text-[#003B36]',
      border: 'border-[#003B36]/20',
      badge: 'bg-[#003B36]/10 text-[#003B36] border-[#003B36]/20',
      lightBg: 'bg-[#003B36]/5',
      dot: 'bg-[#003B36]',
    },
  },
  screening: {
    id: 'screening',
    label: 'Screening',
    description: 'Recruiter call or initial phone screen scheduled',
    color: {
      bg: 'bg-[#90A955]/15',
      text: 'text-[#3c4c1d]',
      border: 'border-[#90A955]/30',
      badge: 'bg-[#90A955]/20 text-[#3c4c1d] border-[#90A955]/30',
      lightBg: 'bg-[#90A955]/10',
      dot: 'bg-[#90A955]',
    },
  },
  technical: {
    id: 'technical',
    label: 'Assessment',
    description: 'Coding challenge, take-home project or tech screen',
    color: {
      bg: 'bg-[#F3E8EE]/80',
      text: 'text-[#003B36]',
      border: 'border-[#917C78]/30',
      badge: 'bg-[#F3E8EE] text-[#003B36] border-[#917C78]/30',
      lightBg: 'bg-[#F3E8EE]/40',
      dot: 'bg-[#003B36]',
    },
  },
  interview: {
    id: 'interview',
    label: 'Interviews',
    description: 'Deep dive interviews / panel / onsite loops',
    color: {
      bg: 'bg-[#90A955]/20',
      text: 'text-[#252f0f]',
      border: 'border-[#90A955]/40',
      badge: 'bg-[#90A955]/25 text-[#252f0f] border-[#90A955]/40 font-semibold',
      lightBg: 'bg-[#90A955]/10',
      dot: 'bg-[#90A955]',
    },
  },
  offer: {
    id: 'offer',
    label: 'Offer',
    description: 'Official offer received! Under negotiation or review',
    color: {
      bg: 'bg-[#ADFCF9]/20',
      text: 'text-[#003B36]',
      border: 'border-[#ADFCF9]/60',
      badge: 'bg-[#ADFCF9]/30 text-[#003B36] border-[#ADFCF9] font-bold',
      lightBg: 'bg-[#ADFCF9]/10',
      dot: 'bg-[#003B36]',
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
      dot: 'bg-rose-400',
    },
  },
  withdrawn: {
    id: 'withdrawn',
    label: 'Withdrawn',
    description: 'Self-withdrawn or passed due to another offer',
    color: {
      bg: 'bg-[#F3E8EE]/60',
      text: 'text-[#917C78]',
      border: 'border-[#917C78]/30',
      badge: 'bg-[#F3E8EE] text-[#917C78] border-[#917C78]/30',
      lightBg: 'bg-[#F3E8EE]/30',
      dot: 'bg-[#917C78]',
    },
  },
};

export const INITIAL_JOBS: JobApplication[] = [];
