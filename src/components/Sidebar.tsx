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
  BookOpen
} from 'lucide-react';
import { ViewMode, JobApplication, ResumeItem } from '../types';

interface SidebarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  jobs: JobApplication[];
  resumes?: ResumeItem[];
  onOpenNewJobModal: () => void;
  onOpenAiDraftModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  viewMode,
  onViewModeChange,
  jobs,
  resumes = [],
  onOpenNewJobModal,
  onOpenAiDraftModal,
}) => {
  const offerCount = jobs.filter((j) => j.stage === 'offer').length;
  const appliedCount = jobs.filter((j) => j.stage !== 'wishlist').length;
  const monthlyTarget = 20;
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

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100">
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
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => onViewModeChange(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-colors text-left ${
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
              onClick={onOpenAiDraftModal}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-blue-700 bg-blue-50/70 hover:bg-blue-100/70 border border-blue-200/60 rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Career Coach Assistant</span>
            </button>
          </div>
        )}
      </div>

      {/* Monthly Target Card */}
      <div className="p-4 mt-auto border-t border-slate-100">
        <div className="bg-slate-900 rounded-xl p-4 text-white shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-400 mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold">Monthly Target</span>
            <Target className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-lg font-bold text-white tracking-tight">
            {appliedCount} <span className="text-xs font-normal text-slate-400">/ {monthlyTarget} Apps</span>
          </p>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${targetPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5 flex justify-between font-medium">
            <span>{targetPercent}% Completed</span>
            <span>{monthlyTarget - appliedCount > 0 ? `${monthlyTarget - appliedCount} remaining` : 'Target reached!'}</span>
          </p>
        </div>
      </div>
    </aside>
  );
};
