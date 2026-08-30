import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  PieChart, 
  Layers, 
  Sparkles, 
  Building2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ArrowRight
} from 'lucide-react';
import { JobApplication, JobStage } from '../types';
import { STAGES_CONFIG } from '../data/initialJobs';
import { formatSalaryNum } from '../utils/storage';

interface AnalyticsViewProps {
  jobs: JobApplication[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ jobs }) => {
  const total = jobs.length;
  const appliedOrMore = jobs.filter((j) => j.stage !== 'wishlist');
  const totalApplied = appliedOrMore.length;

  // Funnel numbers
  const countWishlist = jobs.filter((j) => j.stage === 'wishlist').length;
  const countApplied = jobs.filter((j) => j.stage === 'applied').length;
  const countScreening = jobs.filter((j) => j.stage === 'screening').length;
  const countTechnical = jobs.filter((j) => j.stage === 'technical').length;
  const countInterview = jobs.filter((j) => j.stage === 'interview').length;
  const countOffer = jobs.filter((j) => j.stage === 'offer').length;
  const countRejected = jobs.filter((j) => j.stage === 'rejected').length;

  // Cumulative funnel progress:
  // How many reached at least screening, technical, interview, offer?
  const reachedScreeningOrAbove = jobs.filter((j) =>
    ['screening', 'technical', 'interview', 'offer'].includes(j.stage)
  ).length;
  const reachedTechOrAbove = jobs.filter((j) =>
    ['technical', 'interview', 'offer'].includes(j.stage)
  ).length;
  const reachedInterviewOrAbove = jobs.filter((j) =>
    ['interview', 'offer'].includes(j.stage)
  ).length;

  const screenRate = totalApplied > 0 ? Math.round((reachedScreeningOrAbove / totalApplied) * 100) : 0;
  const interviewRate = reachedScreeningOrAbove > 0 ? Math.round((reachedInterviewOrAbove / reachedScreeningOrAbove) * 100) : 0;
  const offerRate = reachedInterviewOrAbove > 0 ? Math.round((countOffer / reachedInterviewOrAbove) * 100) : 0;

  // Workplace distribution
  const workplaceCounts = {
    remote: jobs.filter((j) => j.workplaceType === 'remote').length,
    hybrid: jobs.filter((j) => j.workplaceType === 'hybrid').length,
    onsite: jobs.filter((j) => j.workplaceType === 'onsite').length,
  };

  // Salary calculations
  const salaries = jobs
    .map((j) => j.salaryMax || j.salaryMin)
    .filter((s): s is number => typeof s === 'number' && s > 0);

  const minSalary = salaries.length > 0 ? Math.min(...salaries) : 0;
  const maxSalary = salaries.length > 0 ? Math.max(...salaries) : 0;
  const avgSalary = salaries.length > 0 ? Math.round(salaries.reduce((a, b) => a + b, 0) / salaries.length) : 0;

  // Tags stats
  const tagCounts: Record<string, number> = {};
  jobs.forEach((j) => {
    j.tags?.forEach((t) => {
      tagCounts[t] = (tagCounts[t] || 0) + 1;
    });
  });
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header Summary */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Application Intelligence</span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Job Search Pipeline Analytics
          </h2>
          <p className="text-slate-300 text-sm mt-1 max-w-xl">
            Real-time conversion funnel, compensation benchmarks, and momentum insights across your {total} active tracked opportunities.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold text-white">{totalApplied}</div>
            <div className="text-[11px] text-indigo-200 font-medium">Applied</div>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold text-emerald-400">{countOffer}</div>
            <div className="text-[11px] text-emerald-200 font-medium">Offers</div>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-2">
            <div className="text-2xl font-extrabold text-amber-300">{screenRate}%</div>
            <div className="text-[11px] text-amber-200 font-medium">Screen Rate</div>
          </div>
        </div>
      </div>

      {/* Pipeline Funnel Visual */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Recruitment Conversion Funnel
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Flow through each interview milestone from application to final offer
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {totalApplied} Total Submissions
          </span>
        </div>

        {/* Funnel Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {[
            {
              stage: 'Applications',
              count: totalApplied,
              subtext: 'Submitted',
              rate: '100%',
              color: 'border-blue-300 bg-blue-50/50 text-blue-900',
              barColor: 'bg-blue-600',
            },
            {
              stage: 'Recruiter Screen',
              count: reachedScreeningOrAbove,
              subtext: `${screenRate}% conversion`,
              rate: `${screenRate}%`,
              color: 'border-amber-300 bg-amber-50/50 text-amber-900',
              barColor: 'bg-amber-500',
            },
            {
              stage: 'Technical Round',
              count: reachedTechOrAbove,
              subtext: `${reachedScreeningOrAbove > 0 ? Math.round((reachedTechOrAbove/reachedScreeningOrAbove)*100) : 0}% screen-to-tech`,
              rate: `${totalApplied > 0 ? Math.round((reachedTechOrAbove/totalApplied)*100) : 0}%`,
              color: 'border-indigo-300 bg-indigo-50/50 text-indigo-900',
              barColor: 'bg-indigo-600',
            },
            {
              stage: 'Final Onsite Loop',
              count: reachedInterviewOrAbove,
              subtext: `${interviewRate}% tech-to-loop`,
              rate: `${interviewRate}%`,
              color: 'border-purple-300 bg-purple-50/50 text-purple-900',
              barColor: 'bg-purple-600',
            },
            {
              stage: 'Job Offers',
              count: countOffer,
              subtext: `${offerRate}% loop-to-offer`,
              rate: `${offerRate}%`,
              color: 'border-emerald-300 bg-emerald-50/50 text-emerald-900',
              barColor: 'bg-emerald-600',
            },
          ].map((step, idx) => (
            <div
              key={step.stage}
              className={`rounded-xl p-4 border ${step.color} relative flex flex-col justify-between`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1">
                  <span>Step 0{idx + 1}</span>
                  <span className="font-mono font-bold text-slate-700">{step.rate}</span>
                </div>
                <div className="text-2xl font-extrabold text-slate-900 mb-0.5">
                  {step.count}
                </div>
                <div className="text-xs font-bold text-slate-800">
                  {step.stage}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60">
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden mb-1.5">
                  <div
                    className={`h-full ${step.barColor} rounded-full`}
                    style={{
                      width: `${totalApplied > 0 ? Math.max((step.count / totalApplied) * 100, 5) : 0}%`,
                    }}
                  />
                </div>
                <div className="text-[11px] text-slate-500 font-medium truncate">
                  {step.subtext}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid for Salary Benchmarks & Work Location Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compensation Statistics */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                Compensation Benchmarks
              </h3>
              <span className="text-xs font-medium text-slate-500">Target Range</span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                <div className="text-xs text-slate-500 font-medium mb-1">Minimum Base</div>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {minSalary > 0 ? formatSalaryNum(minSalary) : 'N/A'}
                </div>
              </div>
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200/80 text-center">
                <div className="text-xs text-emerald-700 font-medium mb-1">Average Target</div>
                <div className="text-lg font-bold text-emerald-800 font-mono">
                  {avgSalary > 0 ? formatSalaryNum(avgSalary) : 'N/A'}
                </div>
              </div>
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
                <div className="text-xs text-slate-500 font-medium mb-1">Peak Target</div>
                <div className="text-lg font-bold text-slate-900 font-mono">
                  {maxSalary > 0 ? formatSalaryNum(maxSalary) : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between">
              <span className="font-medium">Roles with disclosed compensation:</span>
              <span className="font-bold text-slate-900">{salaries.length} of {total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Active offers in hand:</span>
              <span className="font-bold text-emerald-700">{countOffer} position(s)</span>
            </div>
          </div>
        </div>

        {/* Work Location & Domain Tags */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                Workplace Distribution
              </h3>
              <span className="text-xs font-medium text-slate-500">Flexibility</span>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { label: 'Remote', count: workplaceCounts.remote, color: 'bg-blue-500', text: 'text-blue-700' },
                { label: 'Hybrid', count: workplaceCounts.hybrid, color: 'bg-purple-500', text: 'text-purple-700' },
                { label: 'On-site', count: workplaceCounts.onsite, color: 'bg-amber-500', text: 'text-amber-700' },
              ].map((item) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">{item.label}</span>
                      <span className="text-slate-500 font-mono">{item.count} roles ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Domain Tags */}
          <div>
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Top Applied Categories
            </div>
            <div className="flex flex-wrap gap-1.5">
              {topTags.map(([tag, count]) => (
                <span
                  key={tag}
                  className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 font-medium flex items-center gap-1.5"
                >
                  <span>#{tag}</span>
                  <span className="bg-white text-slate-500 px-1.5 py-0.2 rounded text-[10px] font-bold border border-slate-200">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
