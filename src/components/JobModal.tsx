import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Link as LinkIcon, 
  FileText, 
  Check, 
  Plus
} from 'lucide-react';
import { 
  JobApplication, 
  JobStage, 
  Priority, 
  WorkplaceType, 
  EmploymentType, 
  SalaryPeriod, 
  ResumeItem 
} from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';
import { SUPPORTED_CURRENCIES, getCompanyColor } from '../utils/storage';
import { calculateAtsMatch } from '../utils/atsCalculator';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobApplication) => void;
  initialJob?: JobApplication | null;
  defaultStage?: JobStage;
  defaultCurrency?: string;
  resumes?: ResumeItem[];
  onAddResume?: (resume: ResumeItem) => void;
  onOpenAtsCalculator?: (resumeId?: string, jobId?: string) => void;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialJob,
  defaultStage = 'applied',
  defaultCurrency = 'USD',
  resumes = [],
}) => {
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [stage, setStage] = useState<JobStage>(defaultStage);
  const [priority, setPriority] = useState<Priority>('medium');
  const [location, setLocation] = useState('Remote');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>('remote');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full-time');
  
  // Salary
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [salaryCurrency, setSalaryCurrency] = useState(defaultCurrency);
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('year');

  // Links & Dates
  const [jobUrl, setJobUrl] = useState('');
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Resume & Notes & Tags
  const [resumeId, setResumeId] = useState<string>('');
  const [resumeVersion, setResumeVersion] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Sync state when modal opens or initialJob changes
  useEffect(() => {
    if (initialJob) {
      setRole(initialJob.role || '');
      setCompany(initialJob.company || '');
      setStage(initialJob.stage || defaultStage);
      setPriority(initialJob.priority || 'medium');
      setLocation(initialJob.location || 'Remote');
      setWorkplaceType(initialJob.workplaceType || 'remote');
      setEmploymentType(initialJob.employmentType || 'full-time');
      setSalaryMin(initialJob.salaryMin !== undefined ? String(initialJob.salaryMin) : '');
      setSalaryMax(initialJob.salaryMax !== undefined ? String(initialJob.salaryMax) : '');
      setSalaryCurrency(initialJob.salaryCurrency || defaultCurrency);
      setSalaryPeriod(initialJob.salaryPeriod || 'year');
      setJobUrl(initialJob.jobUrl || '');
      setAppliedDate(initialJob.appliedDate || new Date().toISOString().split('T')[0]);
      setResumeId(initialJob.resumeId || '');
      setResumeVersion(initialJob.resumeVersion || '');
      setNotes(initialJob.notes || '');
      setTags(initialJob.tags || []);
      setTagInput('');
    } else {
      setRole('');
      setCompany('');
      setStage(defaultStage);
      setPriority('medium');
      setLocation('Remote');
      setWorkplaceType('remote');
      setEmploymentType('full-time');
      setSalaryMin('');
      setSalaryMax('');
      setSalaryCurrency(defaultCurrency);
      setSalaryPeriod('year');
      setJobUrl('');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      const firstResume = resumes[0];
      setResumeId(firstResume?.id || '');
      setResumeVersion(firstResume?.name || '');
      setNotes('');
      setTags([]);
      setTagInput('');
    }
  }, [initialJob, defaultStage, defaultCurrency, isOpen, resumes]);

  if (!isOpen) return null;

  const handleAddTag = () => {
    const trimmed = tagInput.trim().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!role.trim()) {
      alert('Please enter a Job Title / Role.');
      return;
    }
    if (!company.trim()) {
      alert('Please enter a Company name.');
      return;
    }

    const min = salaryMin.trim() ? parseFloat(salaryMin) : undefined;
    const max = salaryMax.trim() ? parseFloat(salaryMax) : undefined;

    // Calculate match score if resume is linked
    const selectedResume = resumes.find((r) => r.id === resumeId);
    let atsScore = initialJob?.atsScore;
    let atsMatchResult = initialJob?.atsMatchResult;

    if (selectedResume && selectedResume.content) {
      atsMatchResult = calculateAtsMatch(selectedResume.content, notes || role, role);
      atsScore = atsMatchResult.score;
    }

    const jobToSave: JobApplication = {
      id: initialJob?.id || `job-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || 'Remote',
      workplaceType,
      employmentType,
      stage,
      priority,
      salaryMin: isNaN(min as number) ? undefined : min,
      salaryMax: isNaN(max as number) ? undefined : max,
      salaryCurrency,
      salaryPeriod,
      jobUrl: jobUrl.trim() || undefined,
      appliedDate: appliedDate || new Date().toISOString().split('T')[0],
      lastActivityDate: new Date().toISOString().split('T')[0],
      resumeId: resumeId || undefined,
      resumeVersion: resumeVersion || undefined,
      atsScore,
      atsMatchResult,
      contacts: initialJob?.contacts || [],
      interviews: initialJob?.interviews || [],
      checklist: initialJob?.checklist || [],
      notes: notes.trim(),
      rating: initialJob?.rating || 4,
      tags: tags.length > 0 ? tags : (initialJob?.tags || []),
      archived: false,
      color: initialJob?.color || getCompanyColor(company.trim()),
    };

    onSave(jobToSave);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh] animate-fadeIn">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-2xs">
              <Briefcase className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm sm:text-base tracking-tight">
                {initialJob ? 'Edit Application' : 'Add Application'}
              </h2>
              <p className="text-xs text-slate-500">
                {initialJob ? 'Update application progress and details' : 'Save a new job opportunity to your tracker'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-6 space-y-4 text-xs text-slate-800 overflow-y-auto flex-1">
            {/* Row 1: Role & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Job Title / Role <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Frontend Engineer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden transition-all"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Company / Organization <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Stripe, Acme Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden transition-all"
                />
              </div>
            </div>

            {/* Row 2: Status Stage & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Application Status
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as JobStage)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden cursor-pointer"
                >
                  {Object.entries(STAGES_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>
                      {conf.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden cursor-pointer"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>
            </div>

            {/* Row 3: Location, Workplace Type, Employment Type */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, Remote"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Workplace Type
                </label>
                <select
                  value={workplaceType}
                  onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden cursor-pointer"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Job Type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden cursor-pointer"
                >
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract / Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
            </div>

            {/* Row 4: Salary Range & Currency */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <span className="block font-semibold text-slate-700">
                Salary or Compensation (Optional)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <input
                    type="number"
                    placeholder="Min Salary"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:border-emerald-500 focus-visible:outline-hidden"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max Salary"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:border-emerald-500 focus-visible:outline-hidden"
                  />
                </div>
                <div>
                  <select
                    value={salaryCurrency}
                    onChange={(e) => setSalaryCurrency(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:border-emerald-500 focus-visible:outline-hidden cursor-pointer"
                  >
                    {SUPPORTED_CURRENCIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <select
                    value={salaryPeriod}
                    onChange={(e) => setSalaryPeriod(e.target.value as SalaryPeriod)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-md text-xs font-medium focus:border-emerald-500 focus-visible:outline-hidden cursor-pointer"
                  >
                    <option value="year">/ Year</option>
                    <option value="month">/ Month</option>
                    <option value="hour">/ Hour</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 5: Job URL & Applied Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Job Posting URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Date Applied
                </label>
                <input
                  type="date"
                  value={appliedDate}
                  onChange={(e) => setAppliedDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden"
                />
              </div>
            </div>

            {/* Row 6: Resume Attached */}
            {resumes.length > 0 && (
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Resume Used
                </label>
                <select
                  value={resumeId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    setResumeId(selectedId);
                    const selected = resumes.find((r) => r.id === selectedId);
                    if (selected) setResumeVersion(selected.name);
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden cursor-pointer"
                >
                  <option value="">Select a saved resume...</option>
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} {r.targetRole ? `(${r.targetRole})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Row 7: Tags */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tags & Keywords
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. React, Remote, High Priority"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium border border-slate-200"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Row 8: Notes */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Notes & Key Details
              </label>
              <textarea
                rows={3}
                placeholder="Add contact names, interview questions, key requirements, or personal impressions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus-visible:outline-hidden resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Modal Footer (Sticky) */}
          <div className="px-6 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/70 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{initialJob ? 'Save Changes' : 'Add Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
