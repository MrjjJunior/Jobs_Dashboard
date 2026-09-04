import React from 'react';
import { 
  Plus, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  CheckSquare, 
  Star,
  ExternalLink,
  MoreVertical,
  AlertCircle,
  FileText
} from 'lucide-react';
import { JobApplication, JobStage, Priority } from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';
import { formatSalary, isStaleApplication, getCompanyInitials } from '../utils/storage';

interface KanbanBoardProps {
  jobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onQuickMoveStage: (jobId: string, newStage: JobStage) => void;
  onAddNewInStage: (stage: JobStage) => void;
}

const STAGES_ORDER: JobStage[] = [
  'wishlist',
  'applied',
  'screening',
  'technical',
  'interview',
  'offer',
  'rejected',
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  jobs,
  onSelectJob,
  onQuickMoveStage,
  onAddNewInStage,
}) => {
  const [mobileStageFilter, setMobileStageFilter] = React.useState<JobStage | 'all'>('all');

  const getNextStage = (current: JobStage): JobStage | null => {
    const idx = STAGES_ORDER.indexOf(current);
    if (idx !== -1 && idx < STAGES_ORDER.length - 1) {
      return STAGES_ORDER[idx + 1];
    }
    return null;
  };

  const getPrevStage = (current: JobStage): JobStage | null => {
    const idx = STAGES_ORDER.indexOf(current);
    if (idx > 0) {
      return STAGES_ORDER[idx - 1];
    }
    return null;
  };

  const visibleStages = mobileStageFilter === 'all' 
    ? STAGES_ORDER 
    : STAGES_ORDER.filter(s => s === mobileStageFilter);

  return (
    <div className="space-y-3">
      {/* Mobile Stage Selector Quick Pills (visible on phones and tablets) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto pb-2 px-1 scrollbar-none -mx-1">
        <button
          onClick={() => setMobileStageFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
            mobileStageFilter === 'all'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Stages ({jobs.length})
        </button>
        {STAGES_ORDER.map((stageKey) => {
          const config = STAGES_CONFIG[stageKey];
          const count = jobs.filter((j) => j.stage === stageKey).length;
          const isSelected = mobileStageFilter === stageKey;
          return (
            <button
              key={stageKey}
              onClick={() => setMobileStageFilter(stageKey)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${config.color.dot}`} />
              <span>{config.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Columns Container with Snap Scrolling */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-6 pt-1 items-start min-h-[500px] snap-x snap-mandatory scrollbar-thin scrollbar-thumb-slate-300 px-0.5">
        {(mobileStageFilter === 'all' ? STAGES_ORDER : visibleStages).map((stageKey) => {
          const stageConfig = STAGES_CONFIG[stageKey];
          const stageJobs = jobs.filter((j) => j.stage === stageKey);

          return (
            <div
              key={stageKey}
              id={`kanban-col-${stageKey}`}
              className={`flex-shrink-0 bg-slate-100/70 rounded-xl p-3 border border-slate-200/90 flex flex-col max-h-[calc(100vh-220px)] snap-center ${
                mobileStageFilter !== 'all' ? 'w-full max-w-lg mx-auto sm:w-80' : 'w-[84vw] max-w-[320px] sm:w-80'
              }`}
            >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${stageConfig.color.dot}`} />
                <h3 className="font-bold text-sm text-slate-800 tracking-tight">
                  {stageConfig.label}
                </h3>
                <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                  {stageJobs.length}
                </span>
              </div>

              <button
                id={`add-job-stage-${stageKey}`}
                onClick={() => onAddNewInStage(stageKey)}
                title={`Add application to ${stageConfig.label}`}
                className="p-1 hover:bg-white rounded-lg text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-200 transition-all"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Jobs List inside Column */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {stageJobs.length === 0 ? (
                <div className="p-6 text-center border-2 border-dashed border-slate-200 rounded-lg">
                  <p className="text-xs font-medium text-slate-400">No applications here</p>
                  <button
                    onClick={() => onAddNewInStage(stageKey)}
                    className="mt-2 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    + Add application
                  </button>
                </div>
              ) : (
                stageJobs.map((job) => {
                  const nextStage = getNextStage(job.stage);
                  const prevStage = getPrevStage(job.stage);
                  const isStale = isStaleApplication(job);
                  const upcomingInterview = job.interviews?.find((i) => !i.completed);
                  const completedChecklist = job.checklist?.filter((c) => c.completed).length || 0;
                  const totalChecklist = job.checklist?.length || 0;

                  return (
                    <div
                      key={job.id}
                      id={`kanban-card-${job.id}`}
                      className="bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all duration-150 group relative"
                    >
                      {/* Top Row: Company & Priority */}
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div 
                          className="flex items-center gap-2.5 cursor-pointer min-w-0"
                          onClick={() => onSelectJob(job)}
                        >
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-2xs"
                            style={{ backgroundColor: job.color || '#3B82F6' }}
                          >
                            {getCompanyInitials(job.company)}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-900 truncate hover:text-blue-600 transition-colors">
                              {job.company}
                            </h4>
                            <p className="text-xs text-slate-500 truncate font-medium">
                              {job.role}
                            </p>
                          </div>
                        </div>

                        {/* Priority Badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                            job.priority === 'high'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : job.priority === 'medium'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {job.priority}
                        </span>
                      </div>

                      {/* Info Chips */}
                      <div 
                        className="cursor-pointer space-y-1.5 py-1"
                        onClick={() => onSelectJob(job)}
                      >
                        {/* Resume & ATS Pill */}
                        <div className="flex items-center justify-between gap-1 text-[11px] pt-0.5">
                          <div className="flex items-center gap-1 text-slate-600 truncate max-w-[170px]" title={job.resumeVersion || 'Default Resume'}>
                            <FileText className="w-3 h-3 text-blue-600 shrink-0" />
                            <span className="truncate">{job.resumeVersion ? job.resumeVersion.replace('.pdf', '') : 'Default CV'}</span>
                          </div>
                          {job.atsScore ? (
                            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${
                              job.atsScore >= 80
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : job.atsScore >= 60
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}>
                              {job.atsScore}% ATS
                            </span>
                          ) : null}
                        </div>

                        {/* Salary & Location */}
                        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                          <span className="text-emerald-700 bg-emerald-50/80 px-1.5 py-0.5 rounded text-[11px] font-semibold border border-emerald-100 truncate">
                            {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
                          </span>
                          <span className="text-slate-400 text-[11px] truncate capitalize">
                            {job.workplaceType}
                          </span>
                        </div>

                        {/* Upcoming Interview alert if any */}
                        {upcomingInterview && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-purple-700 bg-purple-50 px-2 py-1 rounded-md border border-purple-100">
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-purple-600" />
                            <span className="truncate">
                              {upcomingInterview.stageName}: {upcomingInterview.date}
                            </span>
                          </div>
                        )}

                        {/* Stale Warning Badge */}
                        {isStale && !upcomingInterview && (
                          <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                            <span>No activity for 7+ days</span>
                          </div>
                        )}

                        {/* Tags */}
                        {job.tags && job.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {job.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                            {job.tags.length > 3 && (
                              <span className="text-[10px] text-slate-400 font-medium">
                                +{job.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Footer: Tasks, Applied Date, & Move Controls */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-2">
                          {totalChecklist > 0 && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                              <CheckSquare className="w-3 h-3 text-slate-400" />
                              {completedChecklist}/{totalChecklist}
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            {job.appliedDate.slice(5)}
                          </span>
                        </div>

                        {/* Quick Stage Shifters */}
                        <div className="flex items-center gap-1">
                          {prevStage && (
                            <button
                              id={`move-prev-${job.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickMoveStage(job.id, prevStage);
                              }}
                              title={`Move back to ${STAGES_CONFIG[prevStage].label}`}
                              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700 transition-colors"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {nextStage && (
                            <button
                              id={`move-next-${job.id}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                onQuickMoveStage(job.id, nextStage);
                              }}
                              title={`Advance to ${STAGES_CONFIG[nextStage].label}`}
                              className="p-1 hover:bg-blue-50 rounded text-slate-400 hover:text-blue-600 transition-colors"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};
