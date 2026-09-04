import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  ChevronDown,
  Plus,
  Sparkles,
  Search,
  User,
  LogOut,
  LogIn,
  Target,
  Camera,
  CheckCircle2,
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
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onOpenNewJobModal,
  jobs,
  onImportJobs,
  onResetDemoData,
  onOpenAiDraftModal,
  userProfile,
  onOpenProfileModal,
  onOpenGoalsModal,
  onLogout,
  onOpenMobileMenu,
}) => {
  const profile = userProfile || DEFAULT_USER_PROFILE;
  const [showDataMenu, setShowDataMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const viewTitles: Record<ViewMode, string> = {
    kanban: 'Pipeline Dashboard',
    table: 'Application Dashboard',
    analytics: 'Analytics & Funnel Overview',
    offers: 'Offer Comparison Matrix',
    resumes: 'Resume Performance & A/B Tracking',
    'ats-calculator': 'ATS Resume & Job Match Calculator',
    builder: 'Resume Studio, Creator & ATS Guide',
  };

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
          alert('Invalid backup file format. Expected an array of job applications.');
        }
      } catch (err) {
        alert('Failed to parse backup JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowDataMenu(false);
  };

  // Get initials for profile fallback
  const initials = (profile.name || 'User')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3.5 sm:px-6 shrink-0 z-20">
      {/* Title & Mobile Hamburger */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            id="mobile-menu-toggle-btn"
            onClick={onOpenMobileMenu}
            aria-label="Open Navigation Menu"
            className="lg:hidden p-1.5 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="min-w-0">
          <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate">
            {viewTitles[viewMode]}
          </h1>
          <p className="hidden sm:block text-xs text-slate-500 font-medium truncate">
            {jobs.length} total tracked applications • {jobs.filter(j => j.stage === 'offer').length} offers
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Backup / Export Dropdown */}
        <div className="relative">
          <button
            id="data-menu-btn"
            onClick={() => setShowDataMenu(!showDataMenu)}
            aria-label="Export or sync data"
            className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Export / Sync</span>
            <span className="sm:hidden text-[11px]">Sync</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDataMenu && (
            <div 
              className="absolute right-0 mt-1.5 w-52 max-w-[calc(100vw-1.5rem)] bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-medium text-slate-700 animate-fadeIn"
              onMouseLeave={() => setShowDataMenu(false)}
            >
              <button
                onClick={() => {
                  exportJobsToJson(jobs);
                  setShowDataMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                Export Backup (JSON)
              </button>

              <button
                onClick={() => {
                  exportJobsToCsv(jobs);
                  setShowDataMenu(false);
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                Export to CSV (Excel)
              </button>

              <label className="w-full px-3.5 py-2 text-left hover:bg-slate-50 flex items-center gap-2 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-purple-600" />
                Restore from JSON
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
                  if (confirm('Reset application list to standard sample demo data?')) {
                    onResetDemoData();
                    setShowDataMenu(false);
                  }
                }}
                className="w-full px-3.5 py-2 text-left hover:bg-rose-50 text-rose-600 flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to Demo Data
              </button>
            </div>
          )}
        </div>

        {/* Primary Add New Application Button */}
        <button
          id="new-application-btn"
          onClick={onOpenNewJobModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors flex items-center gap-1 sm:gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden md:inline">+ Add New Application</span>
          <span className="hidden sm:inline md:hidden">+ Add</span>
          <span className="sm:hidden text-xs">Add</span>
        </button>

        {/* Interactive User Profile Icon / Dropdown */}
        <div className="relative">
          <button
            id="user-profile-btn"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            title={profile.isLoggedIn ? `${profile.name} - Click for profile & settings` : 'Click to Sign In'}
            className="flex items-center gap-1.5 p-0.5 rounded-full hover:ring-2 hover:ring-blue-500/50 transition-all cursor-pointer relative"
          >
            {profile.isLoggedIn ? (
              profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-8 h-8 rounded-full object-cover border border-slate-300 shadow-2xs"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold text-xs flex items-center justify-center border border-white shadow-2xs">
                  {initials}
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-medium text-xs flex items-center justify-center border border-slate-300 hover:bg-slate-200">
                <User className="w-4 h-4" />
              </div>
            )}

            {/* Online / Active Indicator */}
            {profile.isLoggedIn && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div 
              className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-fadeIn"
              onMouseLeave={() => setShowProfileMenu(false)}
            >
              {profile.isLoggedIn ? (
                <>
                  {/* User Profile Header */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
                    {profile.avatarUrl ? (
                      <img
                        src={profile.avatarUrl}
                        alt={profile.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {profile.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {profile.email}
                      </div>
                      <div className="text-[10px] text-blue-600 font-semibold truncate mt-0.5">
                        {profile.role}
                      </div>
                    </div>
                  </div>

                  {/* Menu Options */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenProfileModal();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors"
                    >
                      <Camera className="w-4 h-4 text-blue-600" />
                      <span>Edit Profile & Photo</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenGoalsModal();
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-slate-50 flex items-center gap-2.5 text-xs font-medium text-slate-700 transition-colors"
                    >
                      <Target className="w-4 h-4 text-purple-600" />
                      <span>Monthly Targets & Goals</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 my-1" />

                  {/* Logout Button */}
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout();
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-rose-50 flex items-center gap-2.5 text-xs font-semibold text-rose-600 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                /* Logged Out State Dropdown */
                <div className="p-3 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center mx-auto mb-2">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-900 mb-0.5">Guest Mode</div>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Sign in to customize your profile, upload your photo, and save your search goals.
                  </p>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onOpenProfileModal();
                    }}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In / Create Profile</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
