import React from 'react';
import { 
  Columns3, 
  TableProperties, 
  Plus, 
  BarChart3, 
  Menu 
} from 'lucide-react';
import { ViewMode } from '../types';

interface MobileBottomNavProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenNewJobModal: () => void;
  onOpenMobileMenu: () => void;
  activeJobsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  viewMode,
  onViewModeChange,
  onOpenNewJobModal,
  onOpenMobileMenu,
  activeJobsCount,
}) => {
  return (
    <nav 
      id="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg flex items-center justify-around safe-area-bottom"
    >
      {/* Pipeline / Kanban */}
      <button
        id="mobile-nav-kanban"
        onClick={() => onViewModeChange('kanban')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
          viewMode === 'kanban'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <Columns3 className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Board</span>
      </button>

      {/* Applications Table */}
      <button
        id="mobile-nav-table"
        onClick={() => onViewModeChange('table')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg relative transition-colors ${
          viewMode === 'table'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <TableProperties className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">List</span>
        {activeJobsCount > 0 && (
          <span className="absolute top-0.5 right-2 w-2 h-2 bg-blue-600 rounded-full" />
        )}
      </button>

      {/* Center Action: Add Application */}
      <button
        id="mobile-nav-add"
        onClick={onOpenNewJobModal}
        aria-label="Add new job application"
        className="flex items-center justify-center w-11 h-11 -mt-4 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-full shadow-md shadow-blue-500/30 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        <Plus className="w-6 h-6 stroke-[2.5]" />
      </button>

      {/* Analytics */}
      <button
        id="mobile-nav-analytics"
        onClick={() => onViewModeChange('analytics')}
        className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
          viewMode === 'analytics'
            ? 'text-blue-600 font-bold'
            : 'text-slate-500 hover:text-slate-900 font-medium'
        }`}
      >
        <BarChart3 className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Stats</span>
      </button>

      {/* Full Menu Drawer Toggle */}
      <button
        id="mobile-nav-menu"
        onClick={onOpenMobileMenu}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-lg text-slate-500 hover:text-slate-900 font-medium transition-colors"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  );
};
