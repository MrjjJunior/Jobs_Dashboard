import React from 'react';
import { 
  TrendingUp, 
  Target, 
  Calendar, 
  DollarSign, 
  PieChart, 
  CheckCircle2, 
  Layers, 
  ArrowRight,
  Sparkles,
  Building2,
  Clock,
  Pencil
} from 'lucide-react';
import { JobApplication, JobStage, UserGoals } from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';
import { formatSalaryNum } from '../utils/storage';

interface AnalyticsViewProps {
  jobs: JobApplication[];
  goals?: UserGoals;
  onOpenGoalsModal?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  jobs,
  goals,
  onOpenGoalsModal,
}) => {
  const total = jobs.length;
  const appliedOrMore = jobs.filter((j) => j.stage !== 'wishlist');
  const totalApplied = appliedOrMore.length;

  const targetApps = goals?.monthlyApplicationsTarget || 20;
  const targetInterviews = goals?.monthlyInterviewsTarget || 4;
  const targetOffers = goals?.monthlyOffersTarget || 1;
  const appsProgress = Math.min(Math.round((totalApplied / targetApps) * 100), 100);

  // Funnel numbers
  const countApplied = jobs.filter((j) => j.stage === 'applied').length;
  const countScreening = jobs.filter((j) => j.stage === 'screening').length;
  const countInterview = jobs.filter((j) => ['technical', 'interview'].includes(j.stage)).length;
  const countOffer = jobs.filter((j) => j.stage === 'offer').length;
  const countRejected = jobs.filter((j) => j.stage === 'rejected').length;

  // Conversion rates
  const reachedInterviewOrAbove = jobs.filter((j) =>
    ['screening', 'technical', 'interview', 'offer'].includes(j.stage)
  ).length;

  const interviewRate = totalApplied > 0 ? Math.round((reachedInterviewOrAbove / totalApplied) * 100) : 0;
  const offerRate = totalApplied > 0 ? Math.round((countOffer / totalApplied) * 100) : 0;

  // Workplace distribution
  const workplaceCounts = {
    remote: jobs.filter((j) => j.workplaceType === 'remote').length,
    hybrid: jobs.filter((j) => j.workplaceType === 'hybrid').length,
    onsite: jobs.filter((j) => j.workplaceType === 'onsite').length,
  };

  // Salary calculations
  const currency = goals?.salaryCurrency || 'USD';
  const salaries = jobs
    .map((j) => j.salaryMax || j.salaryMin)
    .filter((s): s is number => typeof s === 'number' && s > 0);

  const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0;
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
  const avgSalary = salaries.length > 0 ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) : 0;

  return (
    <div className="space-y-6">
      {/* Top Goals & Conversion Highlights Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Monthly Career Goals Progress
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Tracking progress against your {targetApps} application target for this cycle.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 self-end md:self-auto">
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 block">Progress</span>
            <span className="text-lg font-bold text-emerald-700">{appsProgress}% Complete</span>
          </div>
          {onOpenGoalsModal && (
            <button
              onClick={onOpenGoalsModal}
              className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
            >
              Adjust Goals
            </button>
          )}
        </div>
      </div>

      {/* 4 Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Interview Conversion
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {interviewRate}%
          </p>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">
            {reachedInterviewOrAbove} of {totalApplied} applied
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Offer Success Rate
          </span>
          <p className="text-2xl font-bold text-emerald-700 mt-1">
            {offerRate}%
          </p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {countOffer} confirmed offers
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Average Target Salary
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
            {avgSalary > 0 ? formatSalaryNum(avgSalary, currency) : 'N/A'}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Across {salaries.length} disclosed roles
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Active Submissions
          </span>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalApplied}
          </p>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            {countRejected} closed / rejected
          </p>
        </div>
      </div>

      {/* Conversion Funnel & Workplace Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Stage Conversion Funnel (8 Columns) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
              Application Conversion Funnel
            </h3>
            <span className="text-xs text-slate-500 font-medium">Stage progression</span>
          </div>

          <div className="space-y-4">
            {/* 1. Submitted */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">1. Applications Submitted</span>
                <span className="text-slate-900">{totalApplied} (100%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* 2. Screening */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">2. Screening & Review</span>
                <span className="text-slate-900">{countScreening + countInterview + countOffer} ({totalApplied > 0 ? Math.round(((countScreening + countInterview + countOffer) / totalApplied) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-amber-500 h-full rounded-full" 
                  style={{ width: `${totalApplied > 0 ? Math.round(((countScreening + countInterview + countOffer) / totalApplied) * 100) : 0}%` }} 
                />
              </div>
            </div>

            {/* 3. Interviews */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">3. Interviews & Meetings</span>
                <span className="text-slate-900">{countInterview + countOffer} ({totalApplied > 0 ? Math.round(((countInterview + countOffer) / totalApplied) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full rounded-full" 
                  style={{ width: `${totalApplied > 0 ? Math.round(((countInterview + countOffer) / totalApplied) * 100) : 0}%` }} 
                />
              </div>
            </div>

            {/* 4. Offers */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-slate-800">4. Final Offers</span>
                <span className="text-emerald-700 font-bold">{countOffer} ({totalApplied > 0 ? Math.round((countOffer / totalApplied) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full" 
                  style={{ width: `${totalApplied > 0 ? Math.max(Math.round((countOffer / totalApplied) * 100), countOffer > 0 ? 6 : 0) : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Workplace & Compensation Breakdown (4 Columns) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-lg border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-semibold text-xs text-slate-900 uppercase tracking-wider">
                Workplace Types
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Remote</span>
                <span className="font-bold text-slate-900">{workplaceCounts.remote} jobs</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Hybrid</span>
                <span className="font-bold text-slate-900">{workplaceCounts.hybrid} jobs</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Onsite</span>
                <span className="font-bold text-slate-900">{workplaceCounts.onsite} jobs</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            {minSalary > 0 && maxSalary > 0 && (
              <p>Salary Range: <span className="font-semibold text-slate-800">{formatSalaryNum(minSalary, currency)} – {formatSalaryNum(maxSalary, currency)}</span></p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
