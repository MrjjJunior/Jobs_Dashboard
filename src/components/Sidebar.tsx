import React from 'react';
import { 
  LayoutDashboard,
  Kanban,
  FileText,
  Calendar,
  Sparkles,
  Trophy,
  Calculator,
  Plus,
  Target,
  Settings,
  X
} from 'lucide-react';
import { ViewMode, JobApplication, ResumeItem, UserGoals, UserProfile } from '../types';

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  jobs: JobApplication[];
  resumes?: ResumeItem[];
  onOpenNewJobModal: () => void;
  onOpenAiDraftModal?: () => void;
  goals?: UserGoals;
  onOpenGoalsModal?: () => void;
  userProfile?: UserProfile;
  onOpenProfileModal?: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  onNavigateToLanding?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  viewMode,
  onViewModeChange,
  jobs,
  resumes = [],
  onOpenNewJobModal,
  onOpenAiDraftModal,
  goals,
  onOpenGoalsModal,
  userProfile,
  onOpenProfileModal,
  mobileOpen = false,
  onCloseMobile,
  onNavigateToLanding,
}) => {
  const activeJobsCount = jobs.filter((j) => !['rejected', 'withdrawn', 'wishlist'].includes(j.stage)).length;
  const interviewCount = jobs.filter((j) => ['screening', 'technical', 'interview'].includes(j.stage)).length;
  const offerCount = jobs.filter((j) => j.stage === 'offer').length;

  const navItems: {
    id: ViewMode;
    label: string;
    icon: React.FC<{ className?: string }>;
    badge?: number | string;
  }[] = [
    { id: 'table', label: 'All Applications', icon: LayoutDashboard, badge: jobs.length > 0 ? jobs.length : undefined },
    { id: 'kanban', label: 'Pipeline Board', icon: Kanban, badge: activeJobsCount > 0 ? activeJobsCount : undefined },
    { id: 'resumes', label: 'My Resumes', icon: FileText, badge: resumes.length > 0 ? resumes.length : undefined },
    { id: 'analytics', label: 'Activity & Stats', icon: Calendar, badge: interviewCount > 0 ? interviewCount : undefined },
    { id: 'ats-calculator', label: 'Job Match Helper', icon: Calculator },
    { id: 'builder', label: 'Resume Studio', icon: Sparkles },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none text-slate-800">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div 
          className="flex items-center gap-2.5 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={onNavigateToLanding}
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 rounded-lg bg-[#003B36] flex items-center justify-center text-[#ADFCF9] font-bold text-sm shadow-xs border border-[#003B36]">
            <Sparkles className="w-4 h-4 text-[#ADFCF9]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-tight text-[#003B36] leading-tight">
              JobFlow Pro
            </span>
            <span className="text-[11px] font-medium text-[#917C78] leading-none">
              Career Dashboard
            </span>
          </div>
        </div>
        {mobileOpen && onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden focus-visible:ring-2 focus-visible:ring-[#003B36]"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="p-4 pb-2">
        <button
          id="sidebar-post-job-btn"
          onClick={() => {
            onOpenNewJobModal();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-[#003B36] hover:bg-[#064f48] active:bg-[#00221f] text-[#F3E8EE] rounded-lg text-xs font-semibold shadow-xs transition-colors focus-visible:ring-2 focus-visible:ring-[#003B36] focus-visible:ring-offset-2 focus-visible:outline-hidden"
        >
          <Plus className="w-4 h-4 text-[#ADFCF9]" />
          <span>Add New Application</span>
        </button>
      </div>

      {/* Clean Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <nav aria-label="Main Navigation" className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = viewMode === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => {
                  onViewModeChange(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors text-left focus-visible:ring-2 focus-visible:ring-[#003B36] focus-visible:outline-hidden ${
                  isActive
                    ? 'bg-[#003B36]/10 text-[#003B36] font-bold border-l-2 border-[#003B36]'
                    : 'text-slate-600 hover:bg-[#F3E8EE]/60 hover:text-[#003B36]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#003B36]' : 'text-[#917C78]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      isActive 
                        ? 'bg-[#003B36] text-[#ADFCF9]' 
                        : 'bg-[#F3E8EE] text-[#003B36] border border-[#917C78]/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Email Helper Action */}
        {onOpenAiDraftModal && (
          <div className="pt-4 mt-4 border-t border-slate-100">
            <button
              id="sidebar-coach-btn"
              onClick={() => {
                onOpenAiDraftModal();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[#003B36] bg-[#F3E8EE] hover:bg-[#ebdce4] border border-[#917C78]/30 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#003B36] focus-visible:outline-hidden"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#90A955] shrink-0" />
                <span>Email Follow-up Writer</span>
              </div>
              <span className="text-[10px] text-[#90A955] font-bold">Helper</span>
            </button>
          </div>
        )}
      </div>

      {/* Goal Summary */}
      <div className="p-3 border-t border-slate-100 bg-[#F3E8EE]/40">
        <button
          onClick={onOpenGoalsModal}
          className="w-full p-2.5 text-left rounded-lg bg-white border border-[#917C78]/20 hover:border-[#917C78]/50 transition-colors focus-visible:ring-2 focus-visible:ring-[#003B36] focus-visible:outline-hidden"
          title="Click to view & edit your application goals"
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
            <span className="flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#90A955]" />
              <span>Target Goal</span>
            </span>
            <span className="text-[#003B36] font-bold">
              {jobs.length}/{goals?.monthlyApplicationsTarget || 20}
            </span>
          </div>
          <div className="w-full bg-[#F3E8EE] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-[#90A955] h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(Math.round((jobs.length / (goals?.monthlyApplicationsTarget || 20)) * 100), 100)}%`
              }}
            />
          </div>
        </button>
      </div>

      {/* Profile Footer */}
      <div className="p-3 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onOpenProfileModal}
          className="flex items-center gap-2.5 min-w-0 p-1 rounded-lg hover:bg-slate-100 text-left transition-colors focus-visible:ring-2 focus-visible:ring-[#003B36] focus-visible:outline-hidden flex-1"
        >
          <div className="w-7 h-7 rounded-full bg-[#F3E8EE] text-[#003B36] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-[#917C78]/40">
            {userProfile?.avatarUrl ? (
              <img src={userProfile.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (userProfile?.name || 'A')[0].toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[#003B36] truncate leading-tight">
              {userProfile?.name || 'Alex Rivera'}
            </p>
            <p className="text-[10px] text-[#917C78] truncate leading-tight">
              {userProfile?.role || 'Job Seeker'}
            </p>
          </div>
        </button>
        <button
          onClick={onOpenGoalsModal}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md focus-visible:ring-2 focus-visible:ring-emerald-500"
          title="Settings & Targets"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex w-56 shrink-0 h-full">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative w-64 max-w-xs h-full bg-white shadow-xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
