import React, { useState } from 'react';
import { 
  Download, 
  Upload, 
  RotateCcw, 
  FileSpreadsheet, 
  ChevronDown,
  Plus,
  Sparkles,
  Search
} from 'lucide-react';
import { ViewMode, JobApplication } from '../types';
import { exportJobsToJson, exportJobsToCsv } from '../utils/storage';

interface HeaderProps {
  viewMode: ViewMode;
  onOpenNewJobModal: () => void;
  jobs: JobApplication[];
  onImportJobs: (imported: JobApplication[]) => void;
  onResetDemoData: () => void;
  onOpenAiDraftModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  onOpenNewJobModal,
  jobs,
  onImportJobs,
  onResetDemoData,
  onOpenAiDraftModal,
}) => {
  const [showDataMenu, setShowDataMenu] = useState(false);

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

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-20">
      {/* Title */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight">
          {viewTitles[viewMode]}
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          {jobs.length} total tracked applications • {jobs.filter(j => j.stage === 'offer').length} offers
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Backup / Export Dropdown */}
        <div className="relative">
          <button
            id="data-menu-btn"
            onClick={() => setShowDataMenu(!showDataMenu)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export / Sync</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDataMenu && (
            <div 
              className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-40 text-xs font-medium text-slate-700 animate-fadeIn"
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
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Application</span>
        </button>

        {/* User profile avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center border border-slate-300">
          JT
        </div>
      </div>
    </header>
  );
};
