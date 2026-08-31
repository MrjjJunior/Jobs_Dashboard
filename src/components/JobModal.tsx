import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Building2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Tag, 
  User, 
  Link as LinkIcon, 
  CheckSquare, 
  Plus, 
  Trash2, 
  Star, 
  FileText, 
  Calculator, 
  Sparkles,
  CheckCircle2,
  CheckCircle,
  AlertCircle,
  Upload,
  Layers,
  Award,
  Loader2
} from 'lucide-react';
import { 
  JobApplication, 
  JobStage, 
  Priority, 
  WorkplaceType, 
  EmploymentType, 
  SalaryPeriod, 
  ContactPerson, 
  InterviewRound, 
  ChecklistItem, 
  ResumeItem, 
  AtsMatchResult 
} from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';
import { getCompanyColor } from '../utils/storage';
import { calculateAtsMatch, extractKeywords } from '../utils/atsCalculator';
import { parseResumeFile } from '../utils/fileParser';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (job: JobApplication) => void;
  initialJob?: JobApplication | null;
  defaultStage?: JobStage;
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
  resumes = [],
  onAddResume,
  onOpenAtsCalculator,
}) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'comp' | 'interviews' | 'notes'>('basic');

  // Form state
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('Remote');
  const [workplaceType, setWorkplaceType] = useState<WorkplaceType>('remote');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full-time');
  const [stage, setStage] = useState<JobStage>(defaultStage);
  const [priority, setPriority] = useState<Priority>('medium');
  const [rating, setRating] = useState<number>(4);

  // Comp
  const [salaryMin, setSalaryMin] = useState<string>('');
  const [salaryMax, setSalaryMax] = useState<string>('');
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [salaryPeriod, setSalaryPeriod] = useState<SalaryPeriod>('year');
  const [equityBonus, setEquityBonus] = useState('');
  const [benefits, setBenefits] = useState('');

  // URLs & Dates & Resume
  const [jobUrl, setJobUrl] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [appliedDate, setAppliedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [deadline, setDeadline] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  
  // Selected Resume & ATS
  const [resumeId, setResumeId] = useState<string>('');
  const [resumeVersion, setResumeVersion] = useState('');
  const [showQuickUpload, setShowQuickUpload] = useState(false);
  const [newResumeName, setNewResumeName] = useState('');
  const [newResumeRole, setNewResumeRole] = useState('');
  const [newResumeContent, setNewResumeContent] = useState('');
  const [isParsingQuickResume, setIsParsingQuickResume] = useState(false);

  const handleQuickFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newResumeName) {
      setNewResumeName(file.name);
    }

    setIsParsingQuickResume(true);
    try {
      const parsed = await parseResumeFile(file);
      setIsParsingQuickResume(false);
      if (parsed.text.trim()) {
        setNewResumeContent(parsed.text);
        if (!newResumeRole) {
          if (/frontend|react/i.test(parsed.text)) setNewResumeRole('Frontend Engineer');
          else if (/fullstack/i.test(parsed.text)) setNewResumeRole('Full-Stack Engineer');
          else if (/backend|python|java/i.test(parsed.text)) setNewResumeRole('Backend Engineer');
        }
      } else {
        alert(parsed.error || 'Could not extract text from this file.');
      }
    } catch (err: any) {
      setIsParsingQuickResume(false);
      alert('Failed to parse file: ' + (err.message || 'Unknown error'));
    }
  };

  // Contacts
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [newContactName, setNewContactName] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContactRole, setNewContactRole] = useState('');

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Notes & Tags
  const [notes, setNotes] = useState('');
  const [tagsString, setTagsString] = useState('');

  // Initialize or reset form
  useEffect(() => {
    if (initialJob) {
      setCompany(initialJob.company || '');
      setRole(initialJob.role || '');
      setLocation(initialJob.location || 'Remote');
      setWorkplaceType(initialJob.workplaceType || 'remote');
      setEmploymentType(initialJob.employmentType || 'full-time');
      setStage(initialJob.stage || defaultStage);
      setPriority(initialJob.priority || 'medium');
      setRating(initialJob.rating || 4);

      setSalaryMin(initialJob.salaryMin ? String(initialJob.salaryMin) : '');
      setSalaryMax(initialJob.salaryMax ? String(initialJob.salaryMax) : '');
      setSalaryCurrency(initialJob.salaryCurrency || 'USD');
      setSalaryPeriod(initialJob.salaryPeriod || 'year');
      setEquityBonus(initialJob.equityBonus || '');
      setBenefits(initialJob.benefits || '');

      setJobUrl(initialJob.jobUrl || '');
      setCompanyWebsite(initialJob.companyWebsite || '');
      setJobDescription(initialJob.jobDescription || '');
      setAppliedDate(initialJob.appliedDate || new Date().toISOString().split('T')[0]);
      setDeadline(initialJob.deadline || '');
      setFollowUpDate(initialJob.followUpDate || '');
      
      const foundRes = resumes.find(r => r.id === initialJob.resumeId) || resumes[0];
      setResumeId(initialJob.resumeId || foundRes?.id || '');
      setResumeVersion(initialJob.resumeVersion || foundRes?.name || '');

      setContacts(initialJob.contacts || []);
      setChecklist(initialJob.checklist || []);
      setNotes(initialJob.notes || '');
      setTagsString((initialJob.tags || []).join(', '));
      setShowQuickUpload(false);
    } else {
      // Reset form
      setCompany('');
      setRole('');
      setLocation('Remote');
      setWorkplaceType('remote');
      setEmploymentType('full-time');
      setStage(defaultStage);
      setPriority('medium');
      setRating(4);

      setSalaryMin('');
      setSalaryMax('');
      setSalaryCurrency('USD');
      setSalaryPeriod('year');
      setEquityBonus('');
      setBenefits('');

      setJobUrl('');
      setCompanyWebsite('');
      setJobDescription('');
      setAppliedDate(new Date().toISOString().split('T')[0]);
      setDeadline('');
      setFollowUpDate('');
      
      const defaultRes = resumes[0];
      setResumeId(defaultRes?.id || '');
      setResumeVersion(defaultRes?.name || '');

      setContacts([]);
      setChecklist([
        { id: 'c1', text: 'Tailor resume for keywords', completed: true },
        { id: 'c2', text: 'Connect with team members on LinkedIn', completed: false },
      ]);
      setNotes('');
      setTagsString('Tech');
      setShowQuickUpload(false);
    }
  }, [initialJob, defaultStage, isOpen, resumes]);

  // Compute live ATS score for every uploaded resume against role & jobDescription
  const resumeAtsScores = useMemo(() => {
    const scores: Record<string, AtsMatchResult> = {};
    resumes.forEach((r) => {
      scores[r.id] = calculateAtsMatch(r.content, jobDescription || notes || '', role || '');
    });
    return scores;
  }, [resumes, jobDescription, notes, role]);

  // Determine highest scoring resume
  const bestResumeId = useMemo(() => {
    if (resumes.length === 0) return null;
    let highest = -1;
    let bestId = resumes[0].id;
    resumes.forEach((r) => {
      const s = resumeAtsScores[r.id]?.score ?? 0;
      if (s > highest) {
        highest = s;
        bestId = r.id;
      }
    });
    return bestId;
  }, [resumes, resumeAtsScores]);

  // Current selected resume's ATS match result
  const currentSelectedAts = useMemo(() => {
    if (!resumeId) return null;
    return resumeAtsScores[resumeId] || null;
  }, [resumeId, resumeAtsScores]);

  if (!isOpen) return null;

  const handleSelectResume = (id: string) => {
    setResumeId(id);
    const selected = resumes.find((r) => r.id === id);
    if (selected) {
      setResumeVersion(selected.name);
    }
  };

  const handleCreateQuickResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newResumeName.trim() || !newResumeContent.trim()) {
      alert('Please provide a resume name and some text content.');
      return;
    }

    const newRes: ResumeItem = {
      id: `resume-${Date.now()}`,
      name: newResumeName.trim().endsWith('.pdf') ? newResumeName.trim() : `${newResumeName.trim()}.pdf`,
      fileName: `${newResumeName.trim().replace(/\s+/g, '_')}.pdf`,
      fileSize: `${Math.round(newResumeContent.length / 10)} KB`,
      uploadDate: new Date().toISOString().split('T')[0],
      targetRole: newResumeRole.trim() || 'Custom Specialization',
      summary: newResumeContent.slice(0, 150) + '...',
      experienceYears: 5,
      education: 'Higher Education Degree',
      skills: ['React', 'TypeScript', 'Node.js', 'Web Development'],
      content: newResumeContent.trim(),
    };

    if (onAddResume) {
      onAddResume(newRes);
    }
    setResumeId(newRes.id);
    setResumeVersion(newRes.name);
    setShowQuickUpload(false);
    setNewResumeName('');
    setNewResumeRole('');
    setNewResumeContent('');
  };

  const handleAddContact = () => {
    if (!newContactName.trim()) return;
    setContacts([
      ...contacts,
      {
        id: `contact-${Date.now()}`,
        name: newContactName.trim(),
        email: newContactEmail.trim(),
        role: newContactRole.trim(),
      },
    ]);
    setNewContactName('');
    setNewContactEmail('');
    setNewContactRole('');
  };

  const handleRemoveContact = (id: string) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const handleAddChecklist = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([
      ...checklist,
      {
        id: `check-${Date.now()}`,
        text: newChecklistText.trim(),
        completed: false,
      },
    ]);
    setNewChecklistText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() || !role.trim()) {
      alert('Please fill in Company Name and Role.');
      return;
    }

    const tags = tagsString
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const calculatedAts = currentSelectedAts;

    const updatedJob: JobApplication = {
      id: initialJob ? initialJob.id : `job-${Date.now()}`,
      company: company.trim(),
      role: role.trim(),
      location: location.trim() || 'Remote',
      workplaceType,
      employmentType,
      stage,
      priority,
      rating,

      salaryMin: salaryMin ? parseFloat(salaryMin) : undefined,
      salaryMax: salaryMax ? parseFloat(salaryMax) : undefined,
      salaryCurrency,
      salaryPeriod,
      equityBonus: equityBonus.trim() || undefined,
      benefits: benefits.trim() || undefined,

      jobUrl: jobUrl.trim() || undefined,
      companyWebsite: companyWebsite.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
      resumeId: resumeId || undefined,
      resumeVersion: resumeVersion.trim() || undefined,
      atsScore: calculatedAts ? calculatedAts.score : undefined,
      atsMatchResult: calculatedAts || undefined,

      appliedDate,
      lastActivityDate: new Date().toISOString().split('T')[0],
      deadline: deadline || undefined,
      followUpDate: followUpDate || undefined,

      contacts,
      interviews: initialJob ? initialJob.interviews : [],
      checklist,
      notes: notes.trim(),
      tags,
      archived: initialJob ? initialJob.archived : false,
      color: initialJob?.color || getCompanyColor(company),
    };

    onSave(updatedJob);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {initialJob ? `Edit Application: ${initialJob.company}` : 'Log New Job Opportunity'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Select your tailored resume, check live ATS match scoring, and track pipeline progress.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50/70 text-xs font-semibold">
          {[
            { id: 'basic', label: '1. Role & Resume Match' },
            { id: 'comp', label: '2. Compensation & Dates' },
            { id: 'interviews', label: '3. Recruiter & Contacts' },
            { id: 'notes', label: '4. Checklist & Notes' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {tab.id === 'basic' && currentSelectedAts && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                  currentSelectedAts.score >= 80 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {currentSelectedAts.score}% ATS
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
          {/* TAB 1: ROLE & RESUME SELECTION (ATS) */}
          {activeTab === 'basic' && (
            <div className="space-y-5">
              {/* Company & Role Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Company Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Stripe, Linear, Apple, Figma"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Title / Role *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend Engineer, Full-Stack Lead"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              {/* Job Description (For precise ATS matching) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    Job Description / Requirements (Calculates ATS Scores Below)
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {jobDescription ? `${jobDescription.length} characters` : 'Optional but recommended'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste the job requirements, responsibilities, or tech stack here to get real-time ATS match scores for each of your uploaded resumes..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                />
              </div>

              {/* RESUME SELECTION & ATS COMPARISON SECTION */}
              <div className="p-4 bg-gradient-to-br from-blue-50/80 via-indigo-50/50 to-slate-50 rounded-xl border border-blue-200 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Select Uploaded Resume Version ({resumes.length} available)
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Choose which resume you submitted or plan to submit. Live ATS match scores are shown for each.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowQuickUpload(!showQuickUpload)}
                    className="px-2.5 py-1 bg-white hover:bg-slate-100 text-blue-700 font-bold border border-blue-200 rounded-lg flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    {showQuickUpload ? 'Hide Upload' : 'Upload New CV'}
                  </button>
                </div>

                {/* Quick Upload Form */}
                {showQuickUpload && (
                  <div className="p-3 bg-white rounded-xl border border-blue-300 space-y-2.5 animate-fadeIn shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-blue-600" />
                        Add a New Resume Version to Your Library
                      </div>
                      <label className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded text-[11px] font-bold cursor-pointer flex items-center gap-1 transition-colors">
                        {isParsingQuickResume ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <FileText className="w-3 h-3" />
                        )}
                        <span>{isParsingQuickResume ? 'Parsing...' : 'Upload PDF / DOCX'}</span>
                        <input
                          type="file"
                          accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                          onChange={handleQuickFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Resume Version Name (e.g. Lead React 2026.pdf)"
                        value={newResumeName}
                        onChange={(e) => setNewResumeName(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Target Role Specialization (e.g. Senior Frontend)"
                        value={newResumeRole}
                        onChange={(e) => setNewResumeRole(e.target.value)}
                        className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Paste resume text or profile content..."
                      value={newResumeContent}
                      onChange={(e) => setNewResumeContent(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowQuickUpload(false)}
                        className="px-2.5 py-1 text-slate-500 hover:text-slate-800 text-xs font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleCreateQuickResume}
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-2xs"
                      >
                        Save & Select This Resume
                      </button>
                    </div>
                  </div>
                )}

                {/* Multiple Resume Options Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {resumes.map((res) => {
                    const isSelected = resumeId === res.id;
                    const isBest = res.id === bestResumeId;
                    const ats = resumeAtsScores[res.id] || { score: 50, rating: 'Good' };
                    const score = ats.score;

                    return (
                      <div
                        key={res.id}
                        onClick={() => handleSelectResume(res.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative text-left ${
                          isSelected
                            ? 'bg-white border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                            : 'bg-white/80 hover:bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        {/* Top selection indicator & Best fit badge */}
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="font-bold text-slate-900 text-xs truncate" title={res.name}>
                              {res.name.replace('.pdf', '')}
                            </span>
                          </div>

                          {isBest && (
                            <span className="text-[9px] font-extrabold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded border border-amber-300 flex items-center gap-0.5 shrink-0">
                              <Award className="w-2.5 h-2.5 text-amber-600" /> Best Fit
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-slate-500 truncate mb-2">
                          {res.targetRole || 'Specialist CV'}
                        </p>

                        {/* ATS Match Score Indicator for this resume option */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                          <span className="text-[10px] font-semibold text-slate-500">ATS Match:</span>
                          <span className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full border ${
                            score >= 80
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : score >= 60
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {score}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Selected Resume ATS Breakdown Card */}
                {currentSelectedAts && (
                  <div className="p-3.5 bg-white rounded-xl border border-blue-200 space-y-2.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-slate-700">
                          Selected Resume ATS Evaluation:
                        </span>
                        <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                          currentSelectedAts.score >= 80
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : currentSelectedAts.score >= 60
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {currentSelectedAts.score}% • {currentSelectedAts.rating} Match
                        </span>
                      </div>

                      {onOpenAtsCalculator && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenAtsCalculator(resumeId, initialJob?.id);
                          }}
                          className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1"
                        >
                          <Calculator className="w-3 h-3" />
                          Deep ATS Optimizer →
                        </button>
                      )}
                    </div>

                    {/* Matched & Missing Keywords Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase block mb-1">
                          Matched Skills ({currentSelectedAts.matchedKeywords.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {currentSelectedAts.matchedKeywords.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">No direct keyword overlap yet.</span>
                          ) : (
                            currentSelectedAts.matchedKeywords.slice(0, 5).map((kw, i) => (
                              <span key={i} className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded border border-emerald-200">
                                ✓ {kw}
                              </span>
                            ))
                          )}
                          {currentSelectedAts.matchedKeywords.length > 5 && (
                            <span className="text-[10px] text-slate-500 font-medium">+{currentSelectedAts.matchedKeywords.length - 5} more</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-rose-600 uppercase block mb-1">
                          Missing Keywords ({currentSelectedAts.missingKeywords.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {currentSelectedAts.missingKeywords.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">None detected</span>
                          ) : (
                            currentSelectedAts.missingKeywords.slice(0, 4).map((kw, i) => (
                              <span key={i} className="text-[10px] font-medium bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200">
                                + {kw}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Pipeline Stage, Priority & Workplace */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pipeline Stage</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as JobStage)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 font-semibold"
                  >
                    {Object.entries(STAGES_CONFIG).map(([sKey, sConf]) => (
                      <option key={sKey} value={sKey}>
                        {sConf.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Workplace Model</label>
                  <select
                    value={workplaceType}
                    onChange={(e) => setWorkplaceType(e.target.value as WorkplaceType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="onsite">On-site</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location / Office</label>
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA or Worldwide"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Job Posting URL</label>
                  <input
                    type="url"
                    placeholder="https://company.com/careers/role"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Tags (comma-separated)</label>
                <input
                  type="text"
                  placeholder="e.g. Fintech, React, Referral, Series-B"
                  value={tagsString}
                  onChange={(e) => setTagsString(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Interest / Enthusiasm Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition-colors"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: COMPENSATION & DATES */}
          {activeTab === 'comp' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Target Compensation Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Currency</label>
                    <select
                      value={salaryCurrency}
                      onChange={(e) => setSalaryCurrency(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-medium"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="CAD">CAD ($)</option>
                      <option value="AUD">AUD ($)</option>
                      <option value="ZAR">ZAR (R)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Min Salary</label>
                    <input
                      type="number"
                      placeholder="e.g. 180000"
                      value={salaryMin}
                      onChange={(e) => setSalaryMin(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Max Salary</label>
                    <input
                      type="number"
                      placeholder="e.g. 220000"
                      value={salaryMax}
                      onChange={(e) => setSalaryMax(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Frequency</label>
                    <select
                      value={salaryPeriod}
                      onChange={(e) => setSalaryPeriod(e.target.value as SalaryPeriod)}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                    >
                      <option value="year">Per Year</option>
                      <option value="month">Per Month</option>
                      <option value="hour">Per Hour</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 font-medium mb-1">Equity, RSUs & Bonus Details</label>
                  <input
                    type="text"
                    placeholder="e.g. $80,000 RSUs over 4 yrs + 15% annual target bonus"
                    value={equityBonus}
                    onChange={(e) => setEquityBonus(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Applied Date</label>
                  <input
                    type="date"
                    value={appliedDate}
                    onChange={(e) => setAppliedDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Follow-up Reminder Date</label>
                  <input
                    type="date"
                    value={followUpDate}
                    onChange={(e) => setFollowUpDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACTS & RECRUITER */}
          {activeTab === 'interviews' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-bold text-slate-800 text-xs mb-3 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-blue-600" />
                  Add Recruiter / Contact Person
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                  <input
                    type="text"
                    placeholder="Role (e.g. Talent Lead)"
                    value={newContactRole}
                    onChange={(e) => setNewContactRole(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={newContactEmail}
                    onChange={(e) => setNewContactEmail(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAddContact}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Contact
                </button>
              </div>

              {/* Contacts List */}
              <div className="space-y-2">
                <h5 className="font-bold text-slate-700">Associated Contacts ({contacts.length})</h5>
                {contacts.length === 0 ? (
                  <p className="text-slate-400 italic">No recruiters or contacts added yet.</p>
                ) : (
                  contacts.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-slate-500 text-[11px]">
                          {c.role} {c.email && `• ${c.email}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveContact(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: CHECKLIST & NOTES */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              {/* Checklist */}
              <div>
                <label className="block font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <CheckSquare className="w-4 h-4 text-slate-600" />
                  Application Action Checklist
                </label>

                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="e.g. Send portfolio link, Prepare questions for VP..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddChecklist();
                      }
                    }}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddChecklist}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold"
                  >
                    Add Task
                  </button>
                </div>

                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {checklist.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg"
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => {
                            setChecklist(
                              checklist.map((c) =>
                                c.id === item.id ? { ...c, completed: !c.completed } : c
                              )
                            );
                          }}
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
                        type="button"
                        onClick={() => setChecklist(checklist.filter((c) => c.id !== item.id))}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Private Notes & Interview Observations
                </label>
                <textarea
                  rows={4}
                  placeholder="Record interview impressions, questions asked, team culture notes, tech stack insights..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                />
              </div>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                id="save-job-submit-btn"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
              >
                {initialJob ? 'Save Changes' : 'Create Application'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
