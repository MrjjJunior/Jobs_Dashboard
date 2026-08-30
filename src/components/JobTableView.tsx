import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ExternalLink, 
  MoreHorizontal, 
  Star, 
  Trash2, 
  Calendar, 
  CheckSquare, 
  AlertCircle,
  Eye,
  Building2,
  ChevronDown,
  FileText
} from 'lucide-react';
import { JobApplication, JobStage, Priority } from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';
import { formatSalary, getCompanyInitials, isStaleApplication } from '../utils/storage';

interface JobTableViewProps {
  jobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  onUpdateStage: (id: string, stage: JobStage) => void;
  onUpdateRating: (id: string, rating: number) => void;
  onBatchDelete?: (ids: string[]) => void;
  onBatchUpdateStage?: (ids: string[], stage: JobStage) => void;
}

type SortField = 'company' | 'role' | 'stage' | 'priority' | 'appliedDate' | 'salary' | 'rating';

export const JobTableView: React.FC<JobTableViewProps> = ({
  jobs,
  onSelectJob,
  onEditJob,
  onDeleteJob,
  onUpdateStage,
  onUpdateRating,
  onBatchDelete,
  onBatchUpdateStage,
}) => {
  const [sortField, setSortField] = useState<SortField>('appliedDate');
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedJobs = [...jobs].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'company') {
      comparison = a.company.localeCompare(b.company);
    } else if (sortField === 'role') {
      comparison = a.role.localeCompare(b.role);
    } else if (sortField === 'stage') {
      comparison = a.stage.localeCompare(b.stage);
    } else if (sortField === 'appliedDate') {
      comparison = new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime();
    } else if (sortField === 'rating') {
      comparison = (a.rating || 0) - (b.rating || 0);
    } else if (sortField === 'salary') {
      comparison = (a.salaryMax || a.salaryMin || 0) - (b.salaryMax || b.salaryMin || 0);
    } else if (sortField === 'priority') {
      const pMap = { high: 3, medium: 2, low: 1 };
      comparison = (pMap[a.priority] || 0) - (pMap[b.priority] || 0);
    }
    return sortAsc ? comparison : -comparison;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === jobs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(jobs.map((j) => j.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getStageBadgeStyle = (stage: JobStage) => {
    switch (stage) {
      case 'offer':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'interview':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'technical':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'screening':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'withdrawn':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Batch Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50/90 px-4 py-2.5 border-b border-blue-100 flex items-center justify-between text-xs animate-fadeIn">
          <div className="flex items-center gap-2 font-semibold text-blue-900">
            <span>{selectedIds.length} application(s) selected</span>
          </div>
          <div className="flex items-center gap-2">
            <select
              onChange={(e) => {
                if (e.target.value && onBatchUpdateStage) {
                  onBatchUpdateStage(selectedIds, e.target.value as JobStage);
                  setSelectedIds([]);
                }
              }}
              defaultValue=""
              aria-label="Bulk update stage"
              className="bg-white border border-blue-200 rounded-md px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="" disabled>
                Move selected to...
              </option>
              {Object.entries(STAGES_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>

            {onBatchDelete && (
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} applications?`)) {
                    onBatchDelete(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="flex items-center gap-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1 rounded-md font-semibold transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            )}

            <button
              onClick={() => setSelectedIds([])}
              className="text-slate-500 hover:text-slate-800 px-2 py-1"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-widest border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={jobs.length > 0 && selectedIds.length === jobs.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all applications"
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
              </th>

              <th
                onClick={() => handleSort('company')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Company</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('role')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Role</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('stage')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('priority')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('salary')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Compensation</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('appliedDate')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Applied</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4 text-left">
                <span>Resume & ATS Match</span>
              </th>

              <th
                onClick={() => handleSort('rating')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Fit</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-sm">
            {sortedJobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  No applications match the current filter.
                </td>
              </tr>
            ) : (
              sortedJobs.map((job) => {
                const stageConf = STAGES_CONFIG[job.stage] || STAGES_CONFIG.applied;
                const isSelected = selectedIds.includes(job.id);
                const isStale = isStaleApplication(job);
                const upcoming = job.interviews?.find((i) => !i.completed);

                return (
                  <tr
                    key={job.id}
                    id={`table-row-${job.id}`}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(job.id)}
                        aria-label={`Select ${job.company}`}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>

                    {/* Company */}
                    <td className="py-3 px-4" onClick={() => onSelectJob(job)}>
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-6 h-6 rounded text-[10px] text-white flex items-center justify-center font-bold shrink-0 shadow-2xs"
                          style={{ backgroundColor: job.color || '#3B82F6' }}
                        >
                          {getCompanyInitials(job.company)}
                        </div>
                        <span className="font-bold text-slate-900 hover:text-blue-600 transition-colors">
                          {job.company}
                        </span>
                        {job.jobUrl && (
                          <a
                            href={job.jobUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-400 hover:text-slate-600 ml-0.5"
                            title="Open Job Posting"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3 px-4 text-slate-600 font-medium text-xs" onClick={() => onSelectJob(job)}>
                      <div className="truncate max-w-[200px]">{job.role}</div>
                      <div className="text-[10px] text-slate-400">{job.location} • {job.workplaceType}</div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={job.stage}
                        onChange={(e) => onUpdateStage(job.id, e.target.value as JobStage)}
                        aria-label={`Change stage for ${job.company}`}
                        className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border cursor-pointer focus:outline-none transition-colors ${getStageBadgeStyle(job.stage)}`}
                      >
                        {Object.entries(STAGES_CONFIG).map(([sKey, sConf]) => (
                          <option key={sKey} value={sKey}>
                            {sConf.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-3 px-4" onClick={() => onSelectJob(job)}>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          job.priority === 'high'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : job.priority === 'medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {job.priority}
                      </span>
                    </td>

                    {/* Compensation */}
                    <td className="py-3 px-4 text-xs" onClick={() => onSelectJob(job)}>
                      <span className="font-semibold text-slate-800 font-mono text-[11px]">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
                      </span>
                    </td>

                    {/* Applied Date */}
                    <td className="py-3 px-4 text-right text-slate-500 text-xs font-medium" onClick={() => onSelectJob(job)}>
                      {job.appliedDate}
                    </td>

                    {/* Resume & ATS */}
                    <td className="py-3 px-4 text-xs" onClick={() => onSelectJob(job)}>
                      <div className="flex flex-col gap-1 max-w-[180px]">
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 truncate" title={job.resumeVersion || 'Default Resume'}>
                          <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                          <span className="truncate">{job.resumeVersion ? job.resumeVersion.replace('.pdf', '') : 'Default Resume'}</span>
                        </div>
                        {job.atsScore ? (
                          <div className="flex items-center gap-1">
                            <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                              job.atsScore >= 80
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : job.atsScore >= 60
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {job.atsScore}% Match
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* Fit / Rating */}
                    <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => onUpdateRating(job.id, star)}
                            title={`Rate ${star} star`}
                            className="p-0.5 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                          >
                            <Star
                              className={`w-3 h-3 ${
                                star <= (job.rating || 0)
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-200'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          id={`view-job-btn-${job.id}`}
                          onClick={() => onSelectJob(job)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          id={`delete-job-btn-${job.id}`}
                          onClick={() => {
                            if (confirm(`Remove ${job.company} (${job.role})?`)) {
                              onDeleteJob(job.id);
                            }
                          }}
                          title="Delete Application"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
