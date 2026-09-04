import React from 'react';
import { Briefcase, Clock, Calendar, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { JobApplication } from '../types';
import { getUpcomingInterviews, isStaleApplication } from '../utils/storage';

interface MetricsBarProps {
  jobs: JobApplication[];
  onFilterChange?: (stage: string | null) => void;
  activeFilter?: string | null;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ jobs, onFilterChange, activeFilter }) => {
  const total = jobs.length;
  const activeJobs = jobs.filter(
    (j) => !['rejected', 'withdrawn', 'wishlist'].includes(j.stage)
  );
  const interviewsPending = getUpcomingInterviews(jobs);
  const offers = jobs.filter((j) => j.stage === 'offer');
  const staleJobs = jobs.filter(isStaleApplication);

  // Response rate calculation
  const appliedCount = jobs.filter((j) => j.stage !== 'wishlist').length;
  const interviewOrOfferCount = jobs.filter((j) => 
    ['screening', 'technical', 'interview', 'offer'].includes(j.stage)
  ).length;
  const responseRate = appliedCount > 0 ? ((interviewOrOfferCount / appliedCount) * 100).toFixed(1) : '0.0';

  const cards = [
    {
      id: 'total',
      label: 'Total Applied',
      value: total,
      subtext: '+5 this week',
      subtextColor: 'text-emerald-600',
      filterKey: null,
    },
    {
      id: 'interviews',
      label: 'Interviews',
      value: interviewsPending.length,
      subtext: `${interviewsPending.length} upcoming`,
      subtextColor: 'text-blue-600',
      filterKey: 'interview',
    },
    {
      id: 'response-rate',
      label: 'Response Rate',
      value: `${responseRate}%`,
      subtext: 'Average: 15%',
      subtextColor: 'text-slate-500',
      filterKey: null,
    },
    {
      id: 'pending',
      label: 'Pending',
      value: staleJobs.length > 0 ? staleJobs.length : activeJobs.length,
      subtext: staleJobs.length > 0 ? `${staleJobs.length} need follow-up` : 'In progress',
      subtextColor: staleJobs.length > 0 ? 'text-amber-600' : 'text-slate-500',
      filterKey: 'active',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-6">
      {cards.map((card) => {
        const isSelected = activeFilter === card.filterKey && card.filterKey !== null;

        return (
          <div
            key={card.id}
            id={`metric-card-${card.id}`}
            onClick={() => {
              if (onFilterChange && card.filterKey !== undefined) {
                onFilterChange(isSelected ? null : card.filterKey);
              }
            }}
            className={`bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs transition-all ${
              card.filterKey ? 'cursor-pointer hover:border-slate-300 hover:shadow-sm' : ''
            } ${isSelected ? 'ring-2 ring-blue-500 border-blue-500' : ''}`}
          >
            <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">
              {card.label}
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 sm:mt-1 tracking-tight">
              {card.value}
            </h2>
            <p className={`text-[11px] sm:text-xs font-medium mt-0.5 sm:mt-1 truncate ${card.subtextColor}`}>
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
};
