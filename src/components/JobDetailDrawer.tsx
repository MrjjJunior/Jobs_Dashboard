import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Building2, 
  ExternalLink, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  User, 
  CheckSquare, 
  Trash2, 
  Edit3, 
  Star, 
  Video, 
  Phone, 
  Briefcase, 
  Sparkles,
  MessageSquare,
  FileText,
  Calculator,
  Check,
  ArrowRight
} from 'lucide-react';
import { JobApplication, JobStage, InterviewRound, ChecklistItem, ResumeItem } from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';
import { formatSalary, getCompanyInitials } from '../utils/storage';
import { calculateAtsMatch } from '../utils/atsCalculator';

interface JobDetailDrawerProps {
  job: JobApplication | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateJob: (updated: JobApplication) => void;
  onEditJob: (job: JobApplication) => void;
  onDeleteJob: (id: string) => void;
  resumes?: ResumeItem[];
  onNavigateToAts?: (resumeId?: string, jobId?: string) => void;
  onNavigateToResumes?: () => void;
}

export const JobDetailDrawer: React.FC<JobDetailDrawerProps> = ({
  job,
  isOpen,
  onClose,
  onUpdateJob,
  onEditJob,
  onDeleteJob,
  resumes = [],
  onNavigateToAts,
  onNavigateToResumes,
}) => {
  const [showAddInterview, setShowAddInterview] = useState(false);
  const [roundStageName, setRoundStageName] = useState('Technical Interview');
  const [roundDate, setRoundDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [roundTime, setRoundTime] = useState('14:00');
  const [roundFormat, setRoundFormat] = useState<'video' | 'phone' | 'onsite' | 'take-home'>('video');
  const [roundInterviewer, setRoundInterviewer] = useState('');
  const [roundNotes, setRoundNotes] = useState('');

  const [newTaskText, setNewTaskText] = useState('');

  if (!isOpen || !job) return null;

  const stageConfig = STAGES_CONFIG[job.stage] || STAGES_CONFIG.applied;

  const handleStageChange = (newStage: JobStage) => {
    if (newStage === 'offer') {
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.6 } });
    }
    onUpdateJob({
      ...job,
      stage: newStage,
      lastActivityDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleToggleChecklist = (id: string) => {
    const updated = job.checklist.map((c) =>
      c.id === id ? { ...c, completed: !c.completed } : c
    );
    onUpdateJob({ ...job, checklist: updated });
  };

  const handleAddChecklist = () => {
    if (!newTaskText.trim()) return;
    const newItem: ChecklistItem = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
    };
    onUpdateJob({ ...job, checklist: [...(job.checklist || []), newItem] });
    setNewTaskText('');
  };

  const handleRemoveChecklist = (id: string) => {
    onUpdateJob({
      ...job,
      checklist: job.checklist.filter((c) => c.id !== id),
    });
  };

  const handleAddInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const newRound: InterviewRound = {
      id: `int-${Date.now()}`,
      stageName: roundStageName,
      date: roundDate,
      time: roundTime,
      format: roundFormat,
      interviewer: roundInterviewer.trim() || undefined,
      notes: roundNotes.trim() || undefined,
      completed: false,
    };
    onUpdateJob({
      ...job,
      interviews: [...(job.interviews || []), newRound],
      lastActivityDate: new Date().toISOString().split('T')[0],
    });
    setShowAddInterview(false);
    setRoundInterviewer('');
    setRoundNotes('');
  };

  const handleToggleInterviewComplete = (id: string) => {
    const updated = job.interviews.map((i) =>
      i.id === id ? { ...i, completed: !i.completed } : i
    );
    onUpdateJob({ ...job, interviews: updated });
  };

  const handleRemoveInterview = (id: string) => {
    onUpdateJob({
      ...job,
      interviews: job.interviews.filter((i) => i.id !== id),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-2xs transition-opacity" 
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div className="p-6 border-b border-slate-200 bg-slate-50/80">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-base text-white shadow-xs"
                  style={{ backgroundColor: job.color || '#3B82F6' }}
                >
                  {getCompanyInitials(job.company)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 leading-tight">
                    {job.company}
                  </h2>
                  <p className="text-sm font-semibold text-slate-600">
                    {job.role}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  id="drawer-edit-btn"
                  onClick={() => onEditJob(job)}
                  title="Edit Application"
                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  id="drawer-close-btn"
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Stage Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                  Current Status
                </span>
                <span className="text-slate-400 text-[11px]">
                  Applied on {job.appliedDate}
                </span>
              </div>
              <select
                value={job.stage}
                onChange={(e) => handleStageChange(e.target.value as JobStage)}
                aria-label="Change stage in detail view"
                className={`w-full text-xs font-bold px-3 py-2 rounded-xl border cursor-pointer focus:outline-none ${stageConfig.color.badge}`}
              >
                {Object.entries(STAGES_CONFIG).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label} — {v.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
            {/* Linked Resume & ATS Match Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-4 rounded-xl border border-blue-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                    Application CV Version
                  </span>
                </div>

                {job.atsScore ? (
                  <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    job.atsScore >= 80
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  }`}>
                    {job.atsScore}% ATS Match
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">No ATS score yet</span>
                )}
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Assigned Resume Version
                    </label>
                    <select
                      value={job.resumeId || ''}
                      onChange={(e) => {
                        const newResId = e.target.value;
                        const found = resumes.find((r) => r.id === newResId);
                        if (found) {
                          const resMatch = calculateAtsMatch(
                            found.content,
                            job.jobDescription || job.notes || '',
                            job.role || ''
                          );
                          onUpdateJob({
                            ...job,
                            resumeId: found.id,
                            resumeVersion: found.name,
                            atsScore: resMatch.score,
                            atsMatchResult: resMatch,
                          });
                        }
                      }}
                      className="w-full text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {resumes.map((r) => {
                        const score = calculateAtsMatch(
                          r.content,
                          job.jobDescription || job.notes || '',
                          job.role || ''
                        ).score;
                        return (
                          <option key={r.id} value={r.id}>
                            {r.name} ({score}% Match)
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end">
                    {onNavigateToAts && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToAts(job.resumeId, job.id);
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-2xs transition-colors"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>ATS Breakdown</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500">
                  Switching resumes immediately recalculates the ATS match score against this job description.
                </p>
              </div>

              {job.atsMatchResult?.matchedKeywords && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">
                    Matched Skills for {job.company}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {job.atsMatchResult.matchedKeywords.slice(0, 6).map((kw, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded"
                      >
                        ✓ {kw}
                      </span>
                    ))}
                    {job.atsMatchResult.missingKeywords.length > 0 && (
                      <span className="text-[10px] font-medium text-rose-600 bg-rose-50 border border-rose-200 px-1.5 py-0.2 rounded">
                        +{job.atsMatchResult.missingKeywords.length} missing keywords
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Specs Matrix */}
            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div>
                <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">
                  Compensation
                </div>
                <div className="font-bold text-slate-900 text-sm font-mono">
                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
                </div>
                {job.equityBonus && (
                  <div className="text-[11px] text-slate-500 mt-0.5">{job.equityBonus}</div>
                )}
              </div>

              <div>
                <div className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider mb-0.5">
                  Work Model
                </div>
                <div className="font-bold text-slate-900 text-sm capitalize">
                  {job.workplaceType}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{job.location}</div>
              </div>

              {job.jobUrl && (
                <div className="col-span-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Original Posting:</span>
                  <a
                    href={job.jobUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    View Job Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {/* Interview Timeline & Log */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  Interview Stages ({job.interviews?.length || 0})
                </h3>
                <button
                  onClick={() => setShowAddInterview(true)}
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-700 font-semibold text-xs bg-blue-50 px-2.5 py-1 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Schedule Round
                </button>
              </div>

              {showAddInterview && (
                <form
                  onSubmit={handleAddInterview}
                  className="bg-blue-50/50 p-4 rounded-xl border border-blue-200 space-y-3 animate-fadeIn"
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Stage Name</label>
                      <input
                        type="text"
                        required
                        value={roundStageName}
                        onChange={(e) => setRoundStageName(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Format</label>
                      <select
                        value={roundFormat}
                        onChange={(e) => setRoundFormat(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="video">Video Call (Zoom/Meet)</option>
                        <option value="phone">Phone Call</option>
                        <option value="onsite">On-site</option>
                        <option value="take-home">Take-home Challenge</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={roundDate}
                        onChange={(e) => setRoundDate(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 mb-1">Time</label>
                      <input
                        type="time"
                        value={roundTime}
                        onChange={(e) => setRoundTime(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-1">Interviewer & Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Sarah Connor (Eng Lead) - Focus on System Design"
                      value={roundInterviewer}
                      onChange={(e) => setRoundInterviewer(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAddInterview(false)}
                      className="px-3 py-1 text-slate-500 hover:text-slate-700 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xs"
                    >
                      Save Round
                    </button>
                  </div>
                </form>
              )}

              {/* Rounds List */}
              <div className="space-y-2">
                {(!job.interviews || job.interviews.length === 0) ? (
                  <p className="text-slate-400 italic text-xs py-2">No interview rounds scheduled yet.</p>
                ) : (
                  job.interviews.map((round) => (
                    <div
                      key={round.id}
                      className={`p-3 rounded-xl border transition-all ${
                        round.completed
                          ? 'bg-slate-50 border-slate-200 opacity-75'
                          : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            checked={round.completed}
                            onChange={() => handleToggleInterviewComplete(round.id)}
                            className="mt-1 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div>
                            <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                              <span className={round.completed ? 'line-through text-slate-400' : ''}>
                                {round.stageName}
                              </span>
                              <span className="text-[10px] font-normal uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                                {round.format}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{round.date} {round.time && `at ${round.time}`}</span>
                              {round.interviewer && <span>• with {round.interviewer}</span>}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleRemoveInterview(round.id)}
                          className="text-slate-400 hover:text-rose-600 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Checklist & Next Steps */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  Action Checklist
                </h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add task (e.g. Send thank you note)..."
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklist();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleAddChecklist}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1.5">
                {(!job.checklist || job.checklist.length === 0) ? (
                  <p className="text-slate-400 italic text-xs py-1">No action items yet.</p>
                ) : (
                  job.checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklist(item.id)}
                          className="rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        />
                        <span
                          className={`font-medium ${
                            item.completed ? 'line-through text-slate-400' : 'text-slate-800'
                          }`}
                        >
                          {item.text}
                        </span>
                      </label>
                      <button
                        onClick={() => handleRemoveChecklist(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recruiter / Contacts */}
            {job.contacts && job.contacts.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  Key Contacts
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  {job.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{contact.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {contact.role}
                        </div>
                      </div>
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:underline font-semibold bg-white border border-blue-200 px-2.5 py-1 rounded-lg"
                        >
                          {contact.email}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes & Job Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                Notes & Job Overview
              </h3>
              <div className="p-3.5 bg-amber-50/40 rounded-xl border border-amber-200/80 text-slate-800 whitespace-pre-wrap leading-relaxed">
                {job.notes || job.jobDescription || 'No notes added yet.'}
              </div>
            </div>
          </div>

          {/* Footer Controls */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
            <button
              id="drawer-delete-btn"
              onClick={() => {
                if (confirm(`Are you sure you want to delete ${job.company} (${job.role})?`)) {
                  onDeleteJob(job.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-semibold text-xs px-3 py-2 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onEditJob(job)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-xs transition-colors"
              >
                Edit Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
