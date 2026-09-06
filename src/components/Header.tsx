import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Plus, 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  ChevronDown,
  User,
  LogOut,
  Target,
  Menu
} from 'lucide-react';
import { ViewMode, JobApplication, UserProfile } from '../types';
import { exportJobsToJson, exportJobsToCsv, DEFAULT_USER_PROFILE } from '../utils/storage';

interface HeaderProps {
  viewMode: ViewMode;
  onOpenNewJobModal: () => void;
  jobs: JobApplication[];
  onImportJobs: (imported: JobApplication[]) => void;
  onResetDemoData: () => void;
  onOpenAiDraftModal?: () => void;
  userProfile?: UserProfile;
  onOpenProfileModal: () => void;
  onOpenGoalsModal: () => void;
  onLogout: () => void;
  onToggleMobileSidebar?: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onOpenNewJobModal,
  jobs,
  onImportJobs,
  onResetDemoData,
  userProfile,
  onOpenProfileModal,
  onOpenGoalsModal,
  onLogout,
  onToggleMobileSidebar,
  searchQuery = '',
  onSearchChange,
}) => {
  const profile = userProfile || DEFAULT_USER_PROFILE;
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const activeCount = jobs.filter((j) => !['rejected', 'withdrawn', 'wishlist'].includes(j.stage)).length;
  const interviewCount = jobs.filter((j) => ['screening', 'technical', 'interview'].includes(j.stage)).length;
  const offerCount = jobs.filter((j) => j.stage === 'offer').length;

  const viewTitles: Record<ViewMode, { title: string; subtitle: string }> = {
    table: {
      title: 'Job Applications',
      subtitle: `Managing ${jobs.length} applications • ${activeCount} active in progress • ${offerCount} offers received`,
    },
    kanban: {
      title: 'Application Pipeline',
      subtitle: 'Track your progress from applied to interview and offer stages.',
    },
    resumes: {
      title: 'Resumes & Documents',
      subtitle: 'Manage your tailored resume versions and track where you used each one.',
    },
    analytics: {
      title: 'Activity & Stats',
      subtitle: 'Overview of your application progress, response rates, and milestones.',
    },
    'ats-calculator': {
      title: 'Job Match Helper',
      subtitle: 'Check how well your resume matches a specific job description.',
    },
    builder: {
      title: 'Resume Studio',
      subtitle: 'Create and polish your resume with high-impact bullet points.',
    },
    offers: {
      title: 'Offer Comparison',
      subtitle: 'Compare compensation, benefits, and working conditions side-by-side.',
    },
  };

  const currentMeta = viewTitles[viewMode] || viewTitles.table;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportJobs(parsed);
          alert(`Successfully imported ${parsed.length} applications!`);
        } else {
          alert('Invalid file format. Expected a JSON list of applications.');
        }
      } catch {
        alert('Failed to parse the uploaded file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowDataMenu(false);
  };

  return (
    <div className="bg-white border-b border-slate-200 shrink-0">
      {/* Top Navbar */}
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 lg:hidden focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
            aria-label="Open Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search */}
          {onSearchChange && (
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by role, company, or location..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-900 placeholder:text-slate-400 pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all focus-visible:outline-hidden"
              />
            </div>
          )}
        </div>

        {/* Right Actions: Export/Sync, Notifications, User Menu */}
        <div className="flex items-center gap-2">
          {/* Export / Sync Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDataMenu(!showDataMenu)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
              aria-label="Data Options"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showDataMenu && (
              <div 
                className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-40 text-xs font-medium text-slate-700"
                onMouseLeave={() => setShowDataMenu(false)}
              >
                <button
                  onClick={() => {
                    exportJobsToJson(jobs);
                    setShowDataMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export as JSON</span>
                </button>

                <button
                  onClick={() => {
                    exportJobsToCsv(jobs);
                    setShowDataMenu(false);
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Export as Excel (CSV)</span>
                </button>

                <label className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                  <Upload className="w-3.5 h-3.5 text-slate-600" />
                  <span>Import Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    if (confirm('Reset to sample demo data?')) {
                      onResetDemoData();
                      setShowDataMenu(false);
                    }
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Sample Data</span>
                </button>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {interviewCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
              )}
            </button>

            {showNotifications && (
              <div 
                className="absolute right-0 mt-1.5 w-72 bg-white rounded-lg shadow-lg border border-slate-200 p-3 z-40 text-xs"
                onMouseLeave={() => setShowNotifications(false)}
              >
                <div className="font-bold text-slate-900 mb-1.5 flex items-center justify-between">
                  <span>Upcoming Reminders</span>
                  <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                    {interviewCount} Active
                  </span>
                </div>
                {interviewCount > 0 ? (
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    You have <span className="font-semibold text-slate-900">{interviewCount} interview rounds</span> in progress. Check the interview panel for schedules.
                  </p>
                ) : (
                  <p className="text-slate-500 text-[11px]">
                    No urgent reminders. Everything is up to date.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-hidden"
              aria-label="User Account"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0 border border-emerald-200 overflow-hidden">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  (profile.name || 'A')[0].toUpperCase()
                )}
              </div>
              <span className="hidden md:inline text-xs font-semibold text-slate-800">
                {profile.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
            </button>

            {showProfileMenu && (
              <div 
                className="absolute right-0 mt-1.5 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50 text-xs"
                onMouseLeave={() => setShowProfileMenu(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="font-bold text-slate-900 truncate">{profile.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{profile.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenProfileModal();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span>Profile & Bio</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenGoalsModal();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Target className="w-3.5 h-3.5 text-slate-500" />
                  <span>Application Goals</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="px-4 lg:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {currentMeta.title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentMeta.subtitle}
          </p>
        </div>

        <button
          id="header-post-job-btn"
          onClick={onOpenNewJobModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:outline-hidden self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>
    </div>
  );
};
