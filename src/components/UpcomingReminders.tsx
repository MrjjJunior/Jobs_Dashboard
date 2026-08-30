import React from 'react';
import { Calendar, Sparkles, Video, Phone, CheckCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { JobApplication, InterviewRound } from '../types';
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
  const staleJobs = jobs.filter(isStaleApplication);

  // Month formatter for calendar badge block
  const parseDateParts = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { month: 'DATE', day: '--' };
      const month = d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
      const day = d.getDate();
      return { month, day };
    } catch {
      return { month: 'DATE', day: '--' };
    }
  };

  const staleTarget = staleJobs[0] || (jobs.find(j => j.stage === 'interview') || jobs[0]);

  return (
    <div className="mb-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Up Next / Upcoming Rounds Section */}
      <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-800 text-sm">Up Next</h3>
            <span className="text-[10px] px-1.5 py-0.5 bg-blue-100 text-blue-700 font-bold rounded">
              {upcoming.length > 0 ? `${upcoming.length} Scheduled` : 'Schedule Ready'}
            </span>
          </div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Interviews & Tasks
          </span>
        </div>

        {upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map(({ job, interview, daysUntil }) => {
              const { month, day } = parseDateParts(interview.date);
              const isToday = daysUntil === 0;

              return (
                <div
                  key={interview.id}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                    isToday ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div 
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                    onClick={() => onSelectJob(job)}
                  >
                    {/* Calendar Badge */}
                    <div className="w-10 h-10 bg-white border border-slate-200 rounded flex flex-col items-center justify-center shrink-0 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 leading-none">{month}</span>
                      <span className="text-sm font-bold text-slate-800 leading-tight">{day}</span>
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {interview.stageName}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        <span className="font-semibold text-slate-700">{job.company}</span>
                        {interview.time && ` • ${interview.time}`}
                        {interview.interviewer && ` • w/ ${interview.interviewer}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      isToday ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil}d`}
                    </span>

                    <button
                      onClick={() => onMarkInterviewComplete(job.id, interview.id)}
                      className="px-2 py-1 bg-white hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                      title="Mark round as completed"
                    >
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="hidden sm:inline">Done</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-lg border border-dashed border-slate-200 text-center text-xs text-slate-500">
            No pending interviews scheduled this week. Log a new round in your applications.
          </div>
        )}
      </div>

      {/* Career Coach AI / Action Recommendation Widget */}
      <div className="lg:col-span-4 bg-blue-600 rounded-xl p-5 text-white shadow-md shadow-blue-100 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-blue-200" />
            <h3 className="font-bold text-sm tracking-tight">Career Coach AI</h3>
          </div>
          <p className="text-xs text-blue-100 leading-relaxed mb-4">
            {staleTarget ? (
              <>
                You haven't followed up with <span className="font-bold text-white">{staleTarget.company}</span> for {staleTarget.role}. Send a tailored thank you or status check-in note?
              </>
            ) : (
              <>Prepare for your upcoming conversations with personalized AI-crafted follow-up emails and negotiation talking points.</>
            )}
          </p>
        </div>

        <button
          id="coach-draft-btn"
          onClick={onOpenAiDraft}
          className="w-full py-2 bg-white hover:bg-blue-50 text-blue-600 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Draft Email with AI</span>
        </button>
      </div>
    </div>
  );
};
