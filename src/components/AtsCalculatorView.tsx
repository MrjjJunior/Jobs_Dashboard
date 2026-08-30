import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Briefcase, 
  ArrowRight, 
  Layers, 
  Trophy, 
  Zap, 
  Save, 
  RefreshCw,
  Copy,
  Plus,
  Building2,
  Sliders,
  Check
} from 'lucide-react';
import { JobApplication, ResumeItem, AtsMatchResult } from '../types';
import { calculateAtsMatch, extractKeywords } from '../utils/atsCalculator';
import { getCompanyInitials } from '../utils/storage';

interface AtsCalculatorViewProps {
  jobs: JobApplication[];
  resumes: ResumeItem[];
  initialResumeId?: string;
  initialJobId?: string;
  onUpdateJob: (updated: JobApplication) => void;
  onUpdateResume: (updated: ResumeItem) => void;
}

export const AtsCalculatorView: React.FC<AtsCalculatorViewProps> = ({
  jobs,
  resumes,
  initialResumeId,
  initialJobId,
  onUpdateJob,
  onUpdateResume,
}) => {
  // Selected Resume & Job state
  const [selectedResumeId, setSelectedResumeId] = useState<string>(
    initialResumeId || resumes[0]?.id || ''
  );
  const [selectedJobId, setSelectedJobId] = useState<string>(
    initialJobId || (jobs.length > 0 ? jobs[0]?.id : '')
  );

  // Editable text inputs
  const [resumeText, setResumeText] = useState<string>('');
  const [jobDescriptionText, setJobDescriptionText] = useState<string>('');
  const [jobRoleTitle, setJobRoleTitle] = useState<string>('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // Comparison Mode
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);

  // Sync state when resume selection changes
  useEffect(() => {
    const activeRes = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
    if (activeRes) {
      setResumeText(activeRes.content || '');
    }
  }, [selectedResumeId, resumes]);

  // Sync state when job selection changes
  useEffect(() => {
    if (selectedJobId && selectedJobId !== 'custom') {
      const activeJob = jobs.find((j) => j.id === selectedJobId);
      if (activeJob) {
        setJobRoleTitle(activeJob.role || '');
        setJobDescriptionText(activeJob.jobDescription || activeJob.notes || '');
      }
    }
  }, [selectedJobId, jobs]);

  // Active Resume Object
  const currentResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];
  const currentJob = jobs.find((j) => j.id === selectedJobId);

  // Calculate ATS result
  const atsResult: AtsMatchResult = calculateAtsMatch(
    resumeText,
    jobDescriptionText,
    jobRoleTitle
  );

  // Calculate comparative scores for all resumes against current job description
  const comparisonResults = resumes.map((res) => {
    const resAts = calculateAtsMatch(res.content, jobDescriptionText, jobRoleTitle);
    return {
      resume: res,
      ats: resAts,
    };
  }).sort((a, b) => b.ats.score - a.ats.score);

  const bestMatchingResume = comparisonResults[0];

  const handleSaveToJob = () => {
    if (!currentJob) return;

    const updated: JobApplication = {
      ...currentJob,
      resumeId: currentResume ? currentResume.id : currentJob.resumeId,
      resumeVersion: currentResume ? currentResume.name : currentJob.resumeVersion,
      jobDescription: jobDescriptionText,
      atsScore: atsResult.score,
      atsMatchResult: atsResult,
    };

    onUpdateJob(updated);
    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3000);
  };

  const handleAddKeywordToResume = (kw: string) => {
    if (!currentResume) return;
    const updatedContent = `${resumeText.trim()}\n• Competencies & Technologies: ${kw}`;
    setResumeText(updatedContent);

    // Also update saved resume skills list
    const updatedSkills = Array.from(new Set([...currentResume.skills, kw]));
    onUpdateResume({
      ...currentResume,
      content: updatedContent,
      skills: updatedSkills,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Calculator className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              ATS Match & Keyword Optimization Calculator
            </h2>
            <span className="text-[10px] uppercase font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
              Automated Parser
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare your resume against any job description to evaluate Applicant Tracking System (ATS) keyword alignment, missing skills, and structural readiness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setComparisonMode(!comparisonMode)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border transition-colors ${
              comparisonMode
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{comparisonMode ? 'Single View' : 'Compare All Resumes'}</span>
          </button>
        </div>
      </div>

      {/* Multi-Resume Comparison Banner (When toggled or when best match found) */}
      {comparisonMode && (
        <div className="bg-white rounded-xl border border-indigo-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Resume Fit Comparison Matrix
              </h3>
            </div>
            <span className="text-xs text-slate-500">
              Targeting: <strong className="text-slate-900">{jobRoleTitle || 'Job Description'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {comparisonResults.map(({ resume, ats }, idx) => {
              const isBest = idx === 0;
              const isSelected = resume.id === selectedResumeId;

              return (
                <div
                  key={resume.id}
                  onClick={() => {
                    setSelectedResumeId(resume.id);
                    setResumeText(resume.content);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isBest
                      ? 'border-emerald-300 bg-emerald-50/30 ring-2 ring-emerald-400'
                      : isSelected
                      ? 'border-indigo-300 bg-indigo-50/20'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="truncate pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate block">
                          {resume.name}
                        </span>
                        {isBest && (
                          <span className="text-[9px] font-extrabold uppercase bg-emerald-600 text-white px-1.5 py-0.2 rounded shrink-0">
                            ★ Best Fit
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{resume.targetRole}</p>
                    </div>

                    <div className={`text-right shrink-0 font-black text-lg ${
                      ats.score >= 80 ? 'text-emerald-600' : ats.score >= 60 ? 'text-blue-600' : 'text-amber-600'
                    }`}>
                      {ats.score}%
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] pt-2 border-t border-slate-200/60">
                    <div className="flex justify-between text-slate-600">
                      <span>Keywords Matched:</span>
                      <strong className="text-emerald-700">{ats.matchedKeywords.length}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Keywords Missing:</span>
                      <strong className="text-rose-600">{ats.missingKeywords.length}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Rating:</span>
                      <span className="font-semibold text-slate-800">{ats.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Selectors & Inputs (5 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Resume Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Select Resume to Evaluate
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">
                {resumes.length} saved versions
              </span>
            </div>

            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.targetRole || 'CV'})
                </option>
              ))}
            </select>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Resume Content (Editable)
                </span>
                <span className="text-[10px] text-slate-400">
                  {atsResult.wordCountResume} words
                </span>
              </div>
              <textarea
                rows={8}
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="Paste or edit resume text..."
                className="w-full p-2.5 font-mono text-[11px] text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 leading-relaxed"
              />
            </div>
          </div>

          {/* Job Description Selector */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Target Job Application / Description
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              >
                <option value="custom">-- Custom Job Description --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.company} - {j.role}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Role Title (e.g. Senior Frontend Eng)"
                value={jobRoleTitle}
                onChange={(e) => setJobRoleTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Job Description Requirements
                </span>
                <span className="text-[10px] text-slate-400">
                  {atsResult.wordCountJob} words
                </span>
              </div>
              <textarea
                rows={8}
                value={jobDescriptionText}
                onChange={(e) => setJobDescriptionText(e.target.value)}
                placeholder="Paste the full job description or requirements here..."
                className="w-full p-2.5 font-mono text-[11px] text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
            </div>

            {/* Save Score to Job Button */}
            {currentJob && selectedJobId !== 'custom' && (
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleSaveToJob}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save ATS Score & CV Link to {currentJob.company}</span>
                </button>
                {saveSuccessMsg && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Updated job profile!
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: ATS Match Score & Analytics Breakdown (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Main Score Gauge Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Overall ATS Compatibility Score
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className={`text-3xl font-black ${
                    atsResult.score >= 85
                      ? 'text-emerald-600'
                      : atsResult.score >= 70
                      ? 'text-blue-600'
                      : atsResult.score >= 50
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}>
                    {atsResult.score}%
                  </h3>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    atsResult.score >= 85
                      ? 'bg-emerald-100 text-emerald-800'
                      : atsResult.score >= 70
                      ? 'bg-blue-100 text-blue-800'
                      : atsResult.score >= 50
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {atsResult.rating}
                  </span>
                </div>
              </div>

              {/* Mini progress ring or meter */}
              <div className="w-24 h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 ${
                    atsResult.score >= 85
                      ? 'bg-emerald-500'
                      : atsResult.score >= 70
                      ? 'bg-blue-500'
                      : atsResult.score >= 50
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                  }`}
                  style={{ width: `${atsResult.score}%` }}
                />
              </div>
            </div>

            {/* Keyword Match Stats */}
            <div className="grid grid-cols-2 gap-3 py-3 border-b border-slate-100 text-xs">
              <div className="p-2.5 bg-emerald-50/60 rounded-lg border border-emerald-100">
                <div className="flex items-center justify-between text-emerald-800 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Matched Keywords
                  </span>
                  <span>{atsResult.matchedKeywords.length + atsResult.matchedSoftSkills.length}</span>
                </div>
                <p className="text-[10px] text-emerald-600">
                  Directly verified in your resume
                </p>
              </div>

              <div className="p-2.5 bg-rose-50/60 rounded-lg border border-rose-100">
                <div className="flex items-center justify-between text-rose-800 font-bold mb-1">
                  <span className="flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Missing Keywords
                  </span>
                  <span>{atsResult.missingKeywords.length + atsResult.missingSoftSkills.length}</span>
                </div>
                <p className="text-[10px] text-rose-600">
                  Found in job but missing in CV
                </p>
              </div>
            </div>

            {/* Matched Keywords Tags */}
            <div className="py-3 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Matched Technical Keywords ({atsResult.matchedKeywords.length})
              </span>
              {atsResult.matchedKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No direct hard skill matches detected yet.</p>
              )}
            </div>

            {/* Missing Keywords Tags (with one-click add) */}
            <div className="py-3 border-b border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Missing Keywords from Job ({atsResult.missingKeywords.length})
                </span>
                <span className="text-[10px] text-slate-400">Click + to append to CV</span>
              </div>
              {atsResult.missingKeywords.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {atsResult.missingKeywords.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => handleAddKeywordToResume(kw)}
                      title={`Click to add "${kw}" to resume`}
                      className="text-[11px] font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{kw}</span>
                      <Plus className="w-3 h-3 text-rose-500" />
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All top job description keywords are present in your resume!
                </p>
              )}
            </div>

            {/* ATS Section Structure Audit */}
            <div className="py-3 border-b border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                ATS Document Structure Check
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-[10px] font-bold">
                <div className={`p-1.5 rounded text-center border ${
                  atsResult.sectionsFound.experience
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {atsResult.sectionsFound.experience ? '✓ Experience' : '✕ Experience'}
                </div>
                <div className={`p-1.5 rounded text-center border ${
                  atsResult.sectionsFound.skills
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {atsResult.sectionsFound.skills ? '✓ Skills' : '✕ Skills'}
                </div>
                <div className={`p-1.5 rounded text-center border ${
                  atsResult.sectionsFound.education
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {atsResult.sectionsFound.education ? '✓ Education' : '✕ Education'}
                </div>
                <div className={`p-1.5 rounded text-center border ${
                  atsResult.sectionsFound.projects
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {atsResult.sectionsFound.projects ? '✓ Projects' : '✕ Projects'}
                </div>
                <div className={`p-1.5 rounded text-center border ${
                  atsResult.sectionsFound.contact
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-50 text-slate-400 border-slate-200'
                }`}>
                  {atsResult.sectionsFound.contact ? '✓ Contact' : '✕ Contact'}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="pt-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Actionable Optimization Tips
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {atsResult.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
