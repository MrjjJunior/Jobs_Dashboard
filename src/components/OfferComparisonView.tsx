import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Check, 
  DollarSign, 
  Sparkles, 
  Award, 
  Building2, 
  Sliders, 
  ShieldCheck, 
  HeartHandshake,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { JobApplication } from '../types';
import { formatSalary, getCompanyInitials } from '../utils/storage';

interface OfferComparisonViewProps {
  jobs: JobApplication[];
  onAcceptOffer: (job: JobApplication) => void;
  onSelectJob: (job: JobApplication) => void;
}

export const OfferComparisonView: React.FC<OfferComparisonViewProps> = ({
  jobs,
  onAcceptOffer,
  onSelectJob,
}) => {
  // Offers or all late stage jobs
  const offerJobs = jobs.filter((j) => j.stage === 'offer');
  const lateStageJobs = jobs.filter((j) => ['offer', 'interview', 'technical'].includes(j.stage));
  
  // Selected jobs to compare (default to offers, or first 3 late stage jobs)
  const [comparedJobIds, setComparedJobIds] = useState<string[]>(() => {
    if (offerJobs.length > 0) return offerJobs.map((j) => j.id);
    return lateStageJobs.slice(0, 3).map((j) => j.id);
  });

  const [acceptedId, setAcceptedId] = useState<string | null>(null);

  // Weights for composite scoring (0-100)
  const [weights, setWeights] = useState({
    salary: 40,
    remote: 25,
    growth: 20,
    benefits: 15,
  });

  const handleCelebrateAccept = (job: JobApplication) => {
    setAcceptedId(job.id);
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 },
    });
    onAcceptOffer(job);
  };

  const comparedJobs = jobs.filter((j) => comparedJobIds.includes(j.id));

  // Calculate composite score (out of 100) for a job
  const calculateScore = (job: JobApplication): number => {
    // 1. Salary score (normalized to 250k max)
    const baseSal = job.salaryMax || job.salaryMin || 150000;
    const salaryScore = Math.min((baseSal / 250000) * 100, 100);

    // 2. Remote score
    const remoteScore = job.workplaceType === 'remote' ? 100 : job.workplaceType === 'hybrid' ? 70 : 40;

    // 3. Growth / interest rating score
    const growthScore = ((job.rating || 3) / 5) * 100;

    // 4. Benefits / bonus score
    const benefitsScore = job.equityBonus ? 90 : 60;

    const totalWeight = weights.salary + weights.remote + weights.growth + weights.benefits;
    const weighted =
      (salaryScore * weights.salary +
        remoteScore * weights.remote +
        growthScore * weights.growth +
        benefitsScore * weights.benefits) /
      totalWeight;

    return Math.round(weighted);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" />
            <span>Decision Matrix & Decision Engine</span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white">
            Job Offer & Opportunity Comparison
          </h2>
          <p className="text-emerald-100 text-sm mt-1 max-w-xl">
            Evaluate compensation, equity, workplace flexibility, and personal alignment to choose your optimal next career move.
          </p>
        </div>

        {/* Compare selector pills */}
        <div className="flex flex-wrap gap-2 items-center bg-white/10 p-2.5 rounded-xl border border-white/10">
          <span className="text-xs font-semibold text-emerald-200">Comparing:</span>
          {lateStageJobs.map((j) => {
            const isSelected = comparedJobIds.includes(j.id);
            return (
              <button
                key={j.id}
                onClick={() => {
                  if (isSelected) {
                    if (comparedJobIds.length > 1) {
                      setComparedJobIds(comparedJobIds.filter((id) => id !== j.id));
                    }
                  } else {
                    setComparedJobIds([...comparedJobIds, j.id]);
                  }
                }}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-xs font-bold'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                {j.company} {j.stage === 'offer' && '★'}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {comparedJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
          <p className="text-slate-500 text-sm">No applications selected for comparison.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparedJobs.map((job) => {
            const score = calculateScore(job);
            const isAccepted = acceptedId === job.id;
            const isOffer = job.stage === 'offer';

            return (
              <div
                key={job.id}
                id={`offer-card-${job.id}`}
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs ${
                  isAccepted
                    ? 'ring-4 ring-emerald-500 border-emerald-500 shadow-xl'
                    : isOffer
                    ? 'border-emerald-300 ring-2 ring-emerald-100'
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Card Top Header */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs"
                        style={{ backgroundColor: job.color || '#10B981' }}
                      >
                        {getCompanyInitials(job.company)}
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 leading-tight">
                          {job.company}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {job.role}
                        </p>
                      </div>
                    </div>

                    {/* Overall Match Score */}
                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-700 font-display">
                        {score}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Fit Score
                      </div>
                    </div>
                  </div>

                  {/* Attributes Matrix */}
                  <div className="p-5 space-y-4 text-xs">
                    {/* Base Salary */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-0.5">
                        Base Salary
                      </div>
                      <div className="text-base font-bold text-slate-900 font-mono">
                        {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency, job.salaryPeriod)}
                      </div>
                    </div>

                    {/* Bonus & Equity */}
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                      <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-0.5">
                        Bonus & Equity
                      </div>
                      <div className="text-xs font-semibold text-slate-800">
                        {job.equityBonus || 'Standard package / Discretionary'}
                      </div>
                    </div>

                    {/* Workplace & Location */}
                    <div className="flex justify-between items-center py-1 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">Workplace Model:</span>
                      <span className="font-semibold text-slate-800 capitalize bg-slate-100 px-2 py-0.5 rounded">
                        {job.workplaceType} ({job.location})
                      </span>
                    </div>

                    {/* Benefits & Perks */}
                    <div className="py-1 border-b border-slate-100">
                      <div className="text-slate-500 font-medium mb-1">Key Perks:</div>
                      <div className="text-slate-700 leading-relaxed font-medium bg-slate-50 p-2 rounded-lg text-[11px]">
                        {job.benefits || 'Standard health, dental, and 401(k)'}
                      </div>
                    </div>

                    {/* Decision Deadline */}
                    {job.deadline && (
                      <div className="flex justify-between items-center py-1">
                        <span className="text-slate-500 font-medium">Offer Deadline:</span>
                        <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {job.deadline}
                        </span>
                      </div>
                    )}

                    {/* Interest / Match Rating */}
                    <div className="flex justify-between items-center py-1">
                      <span className="text-slate-500 font-medium">Personal Enthusiasm:</span>
                      <span className="font-bold text-amber-500">
                        {'★'.repeat(job.rating || 3)}
                        <span className="text-slate-200">{'★'.repeat(5 - (job.rating || 3))}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-5 pt-0">
                  {isAccepted ? (
                    <div className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs text-center flex items-center justify-center gap-2 shadow-xs">
                      <Check className="w-4 h-4" />
                      Offer Accepted!
                    </div>
                  ) : (
                    <button
                      id={`accept-offer-btn-${job.id}`}
                      onClick={() => handleCelebrateAccept(job)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Select as Top Offer
                    </button>
                  )}

                  <button
                    onClick={() => onSelectJob(job)}
                    className="w-full mt-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium text-center"
                  >
                    View full details & notes →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
