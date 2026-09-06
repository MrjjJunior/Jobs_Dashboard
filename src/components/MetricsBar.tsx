import React from 'react';
import { Briefcase, Calendar, Trophy, Layers, ArrowRight } from 'lucide-react';
import { JobApplication } from '../types';
import { getUpcomingInterviews } from '../utils/storage';

interface MetricsBarProps {
  jobs: JobApplication[];
  onFilterChange?: (stage: string | null) => void;
  activeFilter?: string | null;
}

export const MetricsBar: React.FC<MetricsBarProps> = ({ jobs, onFilterChange, activeFilter }) => {
  const activeJobs = jobs.filter(
    (j) => !['rejected', 'withdrawn', 'wishlist'].includes(j.stage)
  );
  const interviewsList = getUpcomingInterviews(jobs);
  const offersList = jobs.filter((j) => j.stage === 'offer');

  const cards = [
    {
      id: 'active-jobs',
      label: 'In Progress',
      value: activeJobs.length,
      icon: Briefcase,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Active applications',
      filterKey: 'active',
    },
    {
      id: 'interviews',
      label: 'Interviews',
      value: interviewsList.length,
      icon: Calendar,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Upcoming conversations',
      filterKey: 'interview',
    },
    {
      id: 'offers',
      label: 'Offers',
      value: offersList.length,
      icon: Trophy,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Received offers',
      filterKey: 'offer',
    },
    {
      id: 'total',
      label: 'Total Saved',
      value: jobs.length,
      icon: Layers,
      badgeColor: 'bg-slate-50 text-slate-700 border-slate-200',
      description: 'All-time applications',
      filterKey: null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeFilter === card.filterKey && card.filterKey !== null;

        return (
          <button
            key={card.id}
            id={`metric-card-${card.id}`}
            type="button"
            onClick={() => {
              if (onFilterChange && card.filterKey !== undefined) {
                onFilterChange(isSelected ? null : card.filterKey);
              }
            }}
            className={`text-left bg-white p-4 rounded-lg border transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden ${
              isSelected
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className="w-7 h-7 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-600">
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="mt-2.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                {card.value}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 mt-1">
              {card.description}
            </p>
          </button>
        );
      })}
    </div>
  );
};
