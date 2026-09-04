import React from 'react';
import { 
  Kanban, 
  Table, 
  Trophy, 
  BarChart3, 
  Sparkles, 
  Target, 
  FileText, 
  Calculator,
  BookOpen,
  X
} from 'lucide-react';
import { ViewMode, JobApplication, ResumeItem, UserGoals } from '../types';

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  jobs: JobApplication[];
  resumes?: ResumeItem[];
  onOpenNewJobModal: () => void;
  onOpenAiDraftModal?: () => void;
  goals?: UserGoals;
  onOpenGoalsModal?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
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
  isOpenMobile,
  onCloseMobile,
}) => {
  const offerCount = jobs.filter((j) => j.stage === 'offer').length;
  const appliedCount = jobs.filter((j) => j.stage !== 'wishlist').length;
  const monthlyTarget = goals?.monthlyApplicationsTarget || 20;
  const targetPercent = Math.min(Math.round((appliedCount / monthlyTarget) * 100), 100);

  const navItems: { id: ViewMode; label: string; icon: React.FC<{ className?: string }>; badge?: number | string; badgeColor?: string }[] = [
    { id: 'kanban', label: 'Pipeline', icon: Kanban },
    { id: 'table', label: 'Applications', icon: Table },
    { id: 'analytics', label: 'Dashboard & Stats', icon: BarChart3 },
    { id: 'builder', label: 'Create Resume & Guide', icon: BookOpen, badge: 'Guide', badgeColor: 'bg-indigo-600' },
    { id: 'resumes', label: 'Resume Tracker', icon: FileText, badge: resumes.length > 0 ? resumes.length : undefined, badgeColor: 'bg-blue-600' },
    { id: 'ats-calculator', label: 'ATS Match Calculator', icon: Calculator },
    { id: 'offers', label: 'Offers & Matrix', icon: Trophy, badge: offerCount > 0 ? offerCount : undefined, badgeColor: 'bg-emerald-600' },
  ];

  const handleNavClick = (mode: ViewMode) => {
    onViewModeChange(mode);
    onCloseMobile?.();
  };

  const renderSidebarContent = (isMobile: boolean) => (
    <>
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-base shadow-xs">
            J
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none font-display">
              JobFlow
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              ATS & Resume Suite
            </span>
          </div>
        </div>

        {isMobile && (
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Main Views
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = viewMode === item.id;
              return (
                <button
                  key={item.id}
                  id={`sidebar-nav-${item.id}${isMobile ? '-mobile' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`${item.badgeColor || 'bg-blue-600'} text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Career AI Action */}
        {onOpenAiDraftModal && (
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                onOpenAiDraftModal();
                onCloseMobile?.();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Career Coach Assistant</span>
            </button>
          </div>
        )}
      </div>

      {/* Monthly Target Card - Clickable to set goals */}
      <div className="p-3 mt-auto border-t border-slate-100">
        <div 
          onClick={() => {
            onOpenGoalsModal?.();
            onCloseMobile?.();
          }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onOpenGoalsModal?.();
              onCloseMobile?.();
            }
          }}
          title="Click to adjust monthly targets"
          className="group rounded-xl p-3 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5 text-xs">
              <Target className="w-3.5 h-3.5 text-blue-600" />
              Monthly Target
            </span>
            <span className="text-[11px] font-bold text-slate-500 font-mono">
              {targetPercent}%
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div className="text-sm font-bold text-slate-900">
              {appliedCount} <span className="text-xs font-normal text-slate-400">/ {monthlyTarget} apps</span>
            </div>
            <span className="text-[11px] text-slate-400 group-hover:text-blue-600 transition-colors">
              {monthlyTarget - appliedCount > 0 ? `${monthlyTarget - appliedCount} left` : 'Done'}
            </span>
          </div>

          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                targetPercent >= 100 ? 'bg-emerald-500' : 'bg-blue-600'
              }`}
              style={{ width: `${Math.min(100, targetPercent)}%` }}
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col h-full shrink-0 select-none">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-slideRight">
            {renderSidebarContent(true)}
          </aside>
        </div>
      )}
    </>
  );
};

