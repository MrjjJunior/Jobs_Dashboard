import React from 'react';
import { Search, RotateCcw, X } from 'lucide-react';
import { JobStage, Priority, WorkplaceType } from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedStage: JobStage | 'all' | 'active';
  onStageChange: (stage: JobStage | 'all' | 'active') => void;
  selectedPriority: Priority | 'all';
  onPriorityChange: (priority: Priority | 'all') => void;
  selectedWorkplace: WorkplaceType | 'all';
  onWorkplaceChange: (workplace: WorkplaceType | 'all') => void;
  selectedTag: string | 'all';
  onTagChange: (tag: string | 'all') => void;
  availableTags: string[];
  totalFiltered: number;
  totalAll: number;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedStage,
  onStageChange,
  selectedPriority,
  onPriorityChange,
  selectedWorkplace,
  onWorkplaceChange,
  selectedTag,
  onTagChange,
  availableTags,
  totalFiltered,
  totalAll,
  onResetFilters,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    selectedStage !== 'all' ||
    selectedPriority !== 'all' ||
    selectedWorkplace !== 'all' ||
    selectedTag !== 'all';

  return (
    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-xs mb-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by role, company, or location..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-8 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus-visible:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Stage Filter */}
          <select
            value={selectedStage}
            onChange={(e) => onStageChange(e.target.value as any)}
            aria-label="Filter by stage"
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-md font-medium text-slate-700 cursor-pointer focus:border-emerald-500 focus-visible:outline-hidden"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            {Object.entries(STAGES_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as any)}
            aria-label="Filter by priority"
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-md font-medium text-slate-700 cursor-pointer focus:border-emerald-500 focus-visible:outline-hidden"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Workplace Filter */}
          <select
            value={selectedWorkplace}
            onChange={(e) => onWorkplaceChange(e.target.value as any)}
            aria-label="Filter by workplace type"
            className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-md font-medium text-slate-700 cursor-pointer focus:border-emerald-500 focus-visible:outline-hidden"
          >
            <option value="all">All Workplaces</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md border border-slate-200 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          {/* Counter Badge */}
          <span className="text-[11px] font-semibold text-slate-500 ml-auto md:ml-2">
            Showing <span className="text-slate-900">{totalFiltered}</span> of {totalAll}
          </span>
        </div>
      </div>
    </div>
  );
};
