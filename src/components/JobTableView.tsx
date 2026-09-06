import React, { useState } from 'react';
import { 
  ArrowUpDown, 
  ExternalLink, 
  Trash2, 
  Eye, 
  FileText, 
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { JobApplication, JobStage, Priority } from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';
import { formatSalary, getCompanyInitials } from '../utils/storage';

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

type SortField = 'role' | 'company' | 'stage' | 'priority' | 'appliedDate' | 'salary';

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
    if (sortField === 'role') {
      comparison = a.role.localeCompare(b.role);
    } else if (sortField === 'company') {
      comparison = a.company.localeCompare(b.company);
    } else if (sortField === 'stage') {
      comparison = a.stage.localeCompare(b.stage);
    } else if (sortField === 'appliedDate') {
      comparison = new Date(a.lastActivityDate || a.appliedDate).getTime() - new Date(b.lastActivityDate || b.appliedDate).getTime();
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

  const getStageBadgeClass = (stage: JobStage) => {
    switch (stage) {
      case 'offer':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300';
      case 'interview':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'technical':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'screening':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'withdrawn':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Batch Selection Toolbar */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-50/80 px-4 py-2.5 border-b border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
          <span className="font-semibold">{selectedIds.length} application(s) selected</span>
          <div className="flex items-center gap-2">
            {onBatchUpdateStage && (
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    onBatchUpdateStage(selectedIds, e.target.value as JobStage);
                    setSelectedIds([]);
                  }
                }}
                defaultValue=""
                className="bg-white border border-emerald-300 rounded px-2.5 py-1 text-xs font-medium text-slate-800 focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <option value="" disabled>
                  Move to Stage...
                </option>
                {Object.entries(STAGES_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            )}

            {onBatchDelete && (
              <button
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.length} selected applications?`)) {
                    onBatchDelete(selectedIds);
                    setSelectedIds([]);
                  }
                }}
                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded font-semibold transition-colors"
              >
                Delete Selected
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

      {/* Main Jobs Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-200 select-none">
            <tr>
              <th className="py-3 px-4 w-10">
                <input
                  type="checkbox"
                  checked={jobs.length > 0 && selectedIds.length === jobs.length}
                  onChange={toggleSelectAll}
                  aria-label="Select all jobs"
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                />
              </th>

              <th
                onClick={() => handleSort('role')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Role & Company</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4">
                <span>Location</span>
              </th>

              <th
                onClick={() => handleSort('stage')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('priority')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th
                onClick={() => handleSort('salary')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <span>Salary / Rate</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4">
                <span>Resume / Match</span>
              </th>

              <th
                onClick={() => handleSort('appliedDate')}
                className="py-3 px-4 cursor-pointer hover:text-slate-900 transition-colors text-right"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Last Active</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedJobs.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <p className="font-semibold text-slate-700">No applications found</p>
                    <p className="text-[11px] text-slate-400">Add a new job application or adjust your search filter above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedJobs.map((job) => {
                const isSelected = selectedIds.includes(job.id);

                return (
                  <tr
                    key={job.id}
                    id={`table-row-${job.id}`}
                    onClick={() => onSelectJob(job)}
                    className={`hover:bg-slate-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-emerald-50/30' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(job.id)}
                        aria-label={`Select ${job.role} at ${job.company}`}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                    </td>

                    {/* Job Title & Company */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-7 h-7 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center font-bold text-[11px] shrink-0"
                        >
                          {getCompanyInitials(job.company)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 hover:text-emerald-700 transition-colors truncate">
                            {job.role}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mt-0.5">
                            <span className="font-medium text-slate-700">{job.company}</span>
                            {job.jobUrl && (
                              <a
                                href={job.jobUrl}
                                target="_blank"
                                rel="noreferrer noopener"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-blue-600 inline-flex items-center"
                                title="Open Job URL"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Location & Workplace */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <p className="font-medium truncate">{job.location || 'Remote'}</p>
                      <p className="text-[11px] text-slate-400 capitalize">{job.workplaceType}</p>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={job.stage}
                        onChange={(e) => onUpdateStage(job.id, e.target.value as JobStage)}
                        aria-label={`Change stage for ${job.role}`}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer focus:outline-none transition-colors ${getStageBadgeClass(job.stage)}`}
                      >
                        {Object.entries(STAGES_CONFIG).map(([sKey, sConf]) => (
                          <option key={sKey} value={sKey}>
                            {sConf.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
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
                    <td className="py-3.5 px-4 font-mono text-slate-800 text-[11px]">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
                    </td>

                    {/* Resume & Match Score */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1 max-w-[150px]">
                        <div className="flex items-center gap-1.5 text-slate-700 truncate font-medium">
                          <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{job.resumeVersion ? job.resumeVersion.replace('.pdf', '') : 'Default Resume'}</span>
                        </div>
                        {job.atsScore ? (
                          <div>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                              job.atsScore >= 80
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : job.atsScore >= 60
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : 'bg-amber-50 text-amber-800 border-amber-200'
                            }`}>
                              {job.atsScore}% Match
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 text-right text-slate-500 font-medium">
                      {job.lastActivityDate || job.appliedDate}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          id={`view-job-btn-${job.id}`}
                          onClick={() => onSelectJob(job)}
                          title="View Details"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          id={`delete-job-btn-${job.id}`}
                          onClick={() => {
                            if (confirm(`Remove ${job.company} (${job.role})?`)) {
                              onDeleteJob(job.id);
                            }
                          }}
                          title="Delete Application"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
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
