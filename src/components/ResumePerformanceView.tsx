import React, { useState } from 'react';
import { 
  FileText, 
  Upload, 
  Plus, 
  Trophy, 
  TrendingUp, 
  BarChart2, 
  Percent, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Trash2, 
  Edit, 
  Eye, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  Calculator, 
  Briefcase, 
  Star, 
  FileCode, 
  Tag, 
  BookOpen,
  Loader2,
  Check
} from 'lucide-react';
import { JobApplication, ResumeItem } from '../types';
import { getResumePerformanceStats, ResumePerformanceStats, getCompanyInitials } from '../utils/storage';
import { extractKeywords } from '../utils/atsCalculator';
import { parseResumeFile } from '../utils/fileParser';

interface ResumePerformanceViewProps {
  jobs: JobApplication[];
  resumes: ResumeItem[];
  onAddResume: (resume: ResumeItem) => void;
  onUpdateResume: (resume: ResumeItem) => void;
  onDeleteResume: (id: string) => void;
  onSelectJob: (job: JobApplication) => void;
  onNavigateToAts: (resumeId?: string, jobId?: string) => void;
  onNavigateToBuilder?: () => void;
}

export const ResumePerformanceView: React.FC<ResumePerformanceViewProps> = ({
  jobs,
  resumes,
  onAddResume,
  onUpdateResume,
  onDeleteResume,
  onSelectJob,
  onNavigateToAts,
  onNavigateToBuilder,
}) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewResume, setPreviewResume] = useState<ResumeItem | null>(null);
  const [editingResume, setEditingResume] = useState<ResumeItem | null>(null);

  // Upload Form State
  const [name, setName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [content, setContent] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState<string | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  const statsList = getResumePerformanceStats(jobs, resumes);

  // Highest performing resume
  const topPerformer = statsList.find((s) => s.isTopPerformer) || statsList[0];

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement> | DragEvent) => {
    let file: File | null = null;
    if ('dataTransfer' in e) {
      file = e.dataTransfer?.files?.[0] || null;
    } else {
      file = e.target.files?.[0] || null;
    }

    if (!file) return;

    setFileName(file.name);
    setFileSize(`${Math.round(file.size / 1024)} KB`);
    setParseError(null);
    setParseStatus(null);
    setIsParsing(true);

    if (!name) {
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      setName(cleanName);
    }

    try {
      const parsed = await parseResumeFile(file);
      setIsParsing(false);

      if (parsed.error || !parsed.text.trim()) {
        setParseError(parsed.error || 'Could not extract text. Please ensure the document is not an image-only scan.');
        return;
      }

      setContent(parsed.text);
      setParseStatus(`Extracted ${parsed.wordCount} words cleanly from ${parsed.fileType}`);

      // Auto-extract detected skills from cleanly extracted text
      const detected = extractKeywords(parsed.text);
      if (detected.length > 0) {
        setSkillsInput(detected.join(', '));
      }

      // Auto-suggest target role if empty
      if (!targetRole) {
        if (/frontend|react|ui\/ux/i.test(parsed.text)) {
          setTargetRole('Frontend Engineer');
        } else if (/fullstack|full-stack/i.test(parsed.text)) {
          setTargetRole('Full-Stack Engineer');
        } else if (/backend|node|python|java|go/i.test(parsed.text)) {
          setTargetRole('Backend Engineer');
        } else if (/devops|cloud|aws|kubernetes/i.test(parsed.text)) {
          setTargetRole('DevOps / Cloud Engineer');
        } else if (/data|analytics|machine learning|ai/i.test(parsed.text)) {
          setTargetRole('Data / AI Engineer');
        }
      }
    } catch (err: any) {
      console.error('Upload processing error:', err);
      setIsParsing(false);
      setParseError(err.message || 'Failed to process file.');
    }
  };

  const handleSaveResume = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      alert('Please provide a resume name and content/text.');
      return;
    }

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingResume) {
      onUpdateResume({
        ...editingResume,
        name,
        targetRole,
        content,
        skills: skills.length > 0 ? skills : extractKeywords(content),
        fileName: fileName || editingResume.fileName,
        fileSize: fileSize || editingResume.fileSize,
      });
      setEditingResume(null);
    } else {
      const newResume: ResumeItem = {
        id: `resume-${Date.now()}`,
        name,
        fileName: fileName || `${name.replace(/\s+/g, '_')}.pdf`,
        fileSize: fileSize || '120 KB',
        uploadDate: new Date().toISOString().split('T')[0],
        targetRole: targetRole || 'Software Engineer',
        content,
        skills: skills.length > 0 ? skills : extractKeywords(content),
        isDefault: resumes.length === 0,
      };
      onAddResume(newResume);
    }

    // Reset Form
    setIsUploadModalOpen(false);
    setName('');
    setTargetRole('');
    setContent('');
    setSkillsInput('');
    setFileName('');
    setFileSize('');
  };

  const handleOpenEdit = (res: ResumeItem) => {
    setEditingResume(res);
    setName(res.name);
    setTargetRole(res.targetRole || '');
    setContent(res.content);
    setSkillsInput(res.skills.join(', '));
    setFileName(res.fileName || '');
    setFileSize(res.fileSize || '');
    setIsUploadModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <BarChart2 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              Resume Performance & A/B Tracking
            </h2>
            <span className="text-[10px] uppercase font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
              {resumes.length} Active CVs
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            See which resume version yields the highest interview conversion rates and ATS match scores across your job applications.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigateToBuilder && (
            <button
              id="resume-builder-nav-btn"
              onClick={() => onNavigateToBuilder()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Create Resume & Guide</span>
            </button>
          )}

          <button
            id="ats-calculator-nav-btn"
            onClick={() => onNavigateToAts()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Calculator className="w-3.5 h-3.5 text-blue-600" />
            <span>Open ATS Calculator</span>
          </button>

          <button
            id="upload-resume-btn"
            onClick={() => {
              setEditingResume(null);
              setName('');
              setTargetRole('');
              setContent('');
              setSkillsInput('');
              setFileName('');
              setFileSize('');
              setIsUploadModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload / Add Resume</span>
          </button>
        </div>
      </div>

      {/* Top Performer Highlight Card */}
      {topPerformer && topPerformer.totalApplications > 0 && (
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-xl p-5 text-white shadow-md shadow-blue-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-amber-400 text-slate-900 px-2 py-0.5 rounded">
                  Top Converting Resume
                </span>
                <span className="text-xs text-blue-100">Highest interview response rate</span>
              </div>
              <h3 className="text-base font-extrabold text-white mt-1">
                {topPerformer.resume.name}
              </h3>
              <p className="text-xs text-blue-100 mt-0.5">
                Target Role: <span className="font-semibold text-white">{topPerformer.resume.targetRole || 'Software Engineer'}</span> • {topPerformer.resume.skills.length} verified ATS skills
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-lg border border-white/20 text-center shrink-0">
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-200">Interview Rate</p>
              <p className="text-lg font-black text-amber-300">{topPerformer.interviewRate}%</p>
            </div>
            <div className="border-x border-white/20 px-2">
              <p className="text-[10px] uppercase font-bold text-blue-200">Interviews</p>
              <p className="text-lg font-black text-white">{topPerformer.interviewsCount}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-blue-200">Avg ATS Score</p>
              <p className="text-lg font-black text-emerald-300">{topPerformer.avgAtsScore}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Resumes & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {statsList.map((stat) => {
          const { resume, totalApplications, interviewsCount, interviewRate, offersCount, avgAtsScore, appliedJobs, isTopPerformer } = stat;

          return (
            <div
              key={resume.id}
              id={`resume-card-${resume.id}`}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              <div>
                {/* Card Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 font-bold">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-xs truncate" title={resume.name}>
                          {resume.name}
                        </h4>
                        {isTopPerformer && (
                          <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded shrink-0">
                            ★ Best
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">
                        {resume.targetRole || 'General Resume'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setPreviewResume(resume)}
                      title="Preview Resume"
                      className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(resume)}
                      title="Edit Details"
                      className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Delete resume "${resume.name}"?`)) {
                          onDeleteResume(resume.id);
                        }
                      }}
                      title="Delete Resume"
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Key Performance Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border-b border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Applications</span>
                    <p className="text-base font-extrabold text-slate-900">{totalApplications}</p>
                  </div>
                  <div className="border-x border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Interview Rate</span>
                    <p className={`text-base font-extrabold ${interviewRate >= 40 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {interviewRate}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Avg ATS</span>
                    <p className="text-base font-extrabold text-indigo-600">
                      {avgAtsScore > 0 ? `${avgAtsScore}%` : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Skills tags preview */}
                <div className="p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Targeted Skills ({resume.skills.length})
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{resume.fileSize || '120 KB'}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                    {resume.skills.slice(0, 7).map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200"
                      >
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 7 && (
                      <span className="text-[10px] font-semibold text-slate-400 px-1 py-0.5">
                        +{resume.skills.length - 7} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Applications list applied with this resume */}
                <div className="px-3.5 pb-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <span>Applied Roles ({appliedJobs.length})</span>
                    <span className="text-blue-600 font-semibold">{offersCount} offers</span>
                  </div>

                  {appliedJobs.length > 0 ? (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {appliedJobs.slice(0, 4).map((job) => (
                        <div
                          key={job.id}
                          onClick={() => onSelectJob(job)}
                          className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 cursor-pointer transition-all text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-5 h-5 rounded text-[9px] text-white flex items-center justify-center font-bold shrink-0"
                              style={{ backgroundColor: job.color || '#3B82F6' }}
                            >
                              {getCompanyInitials(job.company)}
                            </div>
                            <div className="truncate">
                              <span className="font-bold text-slate-900 block truncate">{job.company}</span>
                              <span className="text-[10px] text-slate-500 block truncate">{job.role}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0 ml-2">
                            {job.atsScore && (
                              <span className="text-[9px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-100">
                                {job.atsScore}% ATS
                              </span>
                            )}
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                              job.stage === 'offer'
                                ? 'bg-emerald-100 text-emerald-700'
                                : job.stage === 'interview' || job.stage === 'technical'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}>
                              {job.stage}
                            </span>
                          </div>
                        </div>
                      ))}
                      {appliedJobs.length > 4 && (
                        <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
                          +{appliedJobs.length - 4} more applications
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg text-center text-xs text-slate-400 border border-dashed border-slate-200">
                      No applications linked yet. Select this resume when creating or editing a job.
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Card Action */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => onNavigateToAts(resume.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-white hover:bg-blue-50 text-blue-600 hover:text-blue-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors shadow-2xs"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Test ATS Score with Job</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload / Edit Resume Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-blue-600 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white" />
                <h3 className="font-bold text-sm">
                  {editingResume ? 'Edit Resume Details' : 'Upload / Add New Resume'}
                </h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-white/80 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveResume} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* File Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  handleFileUpload(e.nativeEvent as any);
                }}
                className={`p-5 border-2 border-dashed rounded-xl text-center transition-all ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100/50'
                }`}
              >
                {isParsing ? (
                  <div className="py-3 flex flex-col items-center justify-center space-y-2">
                    <Loader2 className="w-7 h-7 text-blue-600 animate-spin" />
                    <p className="font-bold text-slate-800 text-xs">Parsing Document & Extracting Clean Text...</p>
                    <p className="text-[10px] text-slate-500">Decoding PDF/DOCX structure into ATS plain text</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-blue-600 mx-auto mb-1.5" />
                    <p className="font-bold text-slate-800 text-xs">
                      {fileName ? `Loaded: ${fileName} (${fileSize})` : 'Drag and drop your Resume (.pdf, .docx, .txt, .md)'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 mb-2.5">
                      Or click below to browse from your computer
                    </p>
                    <label className="px-3.5 py-1.5 bg-white text-blue-600 border border-blue-200 font-bold rounded-lg cursor-pointer hover:bg-blue-50 inline-flex items-center gap-1.5 shadow-2xs">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Browse Resume File</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt,.md,.rtf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </>
                )}

                {/* Parsing Status or Error Badges */}
                {parseStatus && !isParsing && (
                  <div className="mt-3 py-1 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{parseStatus}</span>
                  </div>
                )}

                {parseError && !isParsing && (
                  <div className="mt-3 py-1.5 px-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-[11px] font-medium flex items-center justify-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{parseError}</span>
                  </div>
                )}
              </div>

              {/* Name & Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Resume Version Label *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Senior Frontend React Resume.pdf"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Role
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lead Frontend Engineer"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Skills Tags */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Key Skills & Keywords (Comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Next.js, GraphQL, AWS, Docker..."
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Full Text Content */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Resume Plain Text / Content (For ATS Matching) *
                  </label>
                  <span className="text-[10px] text-slate-400">
                    {content.trim().split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  rows={8}
                  required
                  placeholder="Paste or review your resume plain text here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-mono text-xs text-slate-900 focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  {editingResume ? 'Save Changes' : 'Add Resume'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Resume Modal */}
      {previewResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{previewResume.name}</h3>
                <p className="text-[11px] text-slate-400">{previewResume.targetRole} • {previewResume.uploadDate}</p>
              </div>
              <button
                onClick={() => setPreviewResume(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 flex-1">
              {previewResume.content}
            </div>

            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs">
              <span className="text-slate-500">{previewResume.skills.length} extracted skills</span>
              <button
                onClick={() => {
                  setPreviewResume(null);
                  onNavigateToAts(previewResume.id);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                Run ATS Match with Job
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
