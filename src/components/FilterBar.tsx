import React, { useState } from 'react';
import { Search, SlidersHorizontal, X, Tag, DollarSign, MapPin, Briefcase, Filter } from 'lucide-react';
import { JobStage, Priority, WorkplaceType } from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStage: JobStage | 'all' | 'active';
  onStageChange: (stage: JobStage | 'all' | 'active') => void;
  selectedPriority: Priority | 'all';
  onPriorityChange: (p: Priority | 'all') => void;
  selectedWorkplace: WorkplaceType | 'all';
  onWorkplaceChange: (w: WorkplaceType | 'all') => void;
  selectedTag: string | 'all';
  onTagChange: (t: string | 'all') => void;
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const activeFiltersCount = 
    (selectedStage !== 'all' ? 1 : 0) +
    (selectedPriority !== 'all' ? 1 : 0) +
    (selectedWorkplace !== 'all' ? 1 : 0) +
    (selectedTag !== 'all' ? 1 : 0);

  const hasActiveFilters = searchQuery !== '' || activeFiltersCount > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-2.5 sm:p-3.5 mb-4 sm:mb-5 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
        {/* Search Input & Mobile Filter Toggle Button */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="job-search-input"
              type="text"
              placeholder="Search applications..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Mobile Filters Toggle Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
              activeFiltersCount > 0 || showMobileFilters
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Dropdown Filters (Collapsible on mobile, always visible on sm+) */}
        <div className={`${showMobileFilters ? 'flex' : 'hidden'} sm:flex flex-wrap items-center gap-2 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100`}>
          {/* Stage filter */}
          <select
            id="filter-stage-select"
            value={selectedStage}
            onChange={(e) => onStageChange(e.target.value as any)}
            aria-label="Filter by Stage"
            className="flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Stages</option>
            <option value="active">Active Only (In Progress)</option>
            <option value="wishlist">Wishlist</option>
            <option value="applied">Applied</option>
            <option value="screening">Screening</option>
            <option value="technical">Assessment</option>
            <option value="interview">Interviews</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="withdrawn">Withdrawn</option>
          </select>

          {/* Priority filter */}
          <select
            id="filter-priority-select"
            value={selectedPriority}
            onChange={(e) => onPriorityChange(e.target.value as any)}
            aria-label="Filter by Priority"
            className="flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          {/* Workplace filter */}
          <select
            id="filter-workplace-select"
            value={selectedWorkplace}
            onChange={(e) => onWorkplaceChange(e.target.value as any)}
            aria-label="Filter by Workplace Type"
            className="flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">All Locations</option>
            <option value="remote">Remote Only</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">On-site</option>
          </select>

          {/* Tag filter */}
          {availableTags.length > 0 && (
            <select
              id="filter-tag-select"
              value={selectedTag}
              onChange={(e) => onTagChange(e.target.value)}
              aria-label="Filter by Tag"
              className="flex-1 sm:flex-initial px-2.5 py-1.5 sm:py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-100/70 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="all">All Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  #{tag}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              id="reset-filters-btn"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 sm:py-2 text-xs font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset ({totalFiltered}/{totalAll})</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
