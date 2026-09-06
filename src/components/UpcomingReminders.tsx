import React from 'react';
import { 
  Calendar, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Activity, 
  Building2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { JobApplication, JobStage } from '../types';
import { getUpcomingInterviews, isStaleApplication } from '../utils/storage';

interface UpcomingRemindersProps {
  jobs: JobApplication[];
  onSelectJob: (job: JobApplication) => void;
  onMarkInterviewComplete: (jobId: string, interviewId: string) => void;
  onOpenAiDraft?: () => void;
}

export const UpcomingReminders: React.FC<UpcomingRemindersProps> = ({
  jobs,
  onSelectJob,
  onMarkInterviewComplete,
  onOpenAiDraft,
}) => {
  const upcoming = getUpcomingInterviews(jobs);

  // Simplified Stage Pipeline Breakdown
  const stagesSummary: { stage: JobStage; label: string; count: number; barColor: string }[] = [
    { stage: 'applied', label: 'Applied', count: jobs.filter(j => j.stage === 'applied').length, barColor: 'bg-blue-500' },
    { stage: 'screening', label: 'Screening', count: jobs.filter(j => j.stage === 'screening').length, barColor: 'bg-amber-500' },
    { stage: 'interview', label: 'Interviews', count: jobs.filter(j => ['technical', 'interview'].includes(j.stage)).length, barColor: 'bg-indigo-500' },
    { stage: 'offer', label: 'Offers', count: jobs.filter(j => j.stage === 'offer').length, barColor: 'bg-emerald-500' },
  ];

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Upcoming Interviews Agenda (8 Columns) */}
      <div className="lg:col-span-8 bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Upcoming Interviews & Meetings
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
              {upcoming.length} Scheduled
            </span>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {upcoming.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No interviews scheduled right now. Add interview dates inside any application.
              </div>
            ) : (
              upcoming.slice(0, 3).map(({ job, interview, daysUntil }) => (
                <div
                  key={interview.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => onSelectJob(job)}
                    className="flex-1 min-w-0 text-left focus-visible:outline-hidden"
                  >
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {interview.stageName} • <span className="text-slate-700 font-bold">{job.company}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {interview.date} {interview.time ? `at ${interview.time}` : ''}
                      {interview.interviewer ? ` • with ${interview.interviewer}` : ''}
                    </p>
                  </button>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      daysUntil === 0 
                        ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
                    </span>

                    <button
                      type="button"
                      onClick={() => onMarkInterviewComplete(job.id, interview.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                      title="Mark round as finished"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="mt-3 pt-2 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Click on any interview to review details or take notes</span>
        </div>
      </div>

      {/* Stage Breakdown Summary (4 Columns) */}
      <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Pipeline Stages
              </h3>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              {jobs.length} total
            </span>
          </div>

          <div className="mt-3.5 space-y-2.5">
            {stagesSummary.map((item) => {
              const percent = jobs.length > 0 ? Math.round((item.count / jobs.length) * 100) : 0;
              return (
                <div key={item.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="font-bold text-slate-900">{item.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.barColor}`}
                      style={{ width: `${Math.max(percent, item.count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {onOpenAiDraft && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={onOpenAiDraft}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Draft Follow-up Email</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
