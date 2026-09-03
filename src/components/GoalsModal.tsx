import React, { useState, useEffect } from 'react';
import { 
  X, 
  Target, 
  TrendingUp, 
  Calendar, 
  Award, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Sliders,
  RotateCcw,
  Coins,
  Globe
} from 'lucide-react';
import { UserGoals, JobApplication } from '../types';
import { 
  DEFAULT_USER_GOALS, 
  SUPPORTED_CURRENCIES, 
  getCurrencySymbol, 
  formatSalaryNum 
} from '../utils/storage';

interface GoalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  goals?: UserGoals;
  onSaveGoals: (updatedGoals: UserGoals) => void;
  jobs?: JobApplication[];
}

export const GoalsModal: React.FC<GoalsModalProps> = ({
  isOpen,
  onClose,
  goals: propGoals,
  onSaveGoals,
  jobs = [],
}) => {
  const goals = propGoals || DEFAULT_USER_GOALS;
  const [monthlyApps, setMonthlyApps] = useState<number>(goals.monthlyApplicationsTarget || 20);
  const [weeklyApps, setWeeklyApps] = useState<number>(goals.weeklyApplicationsTarget || 5);
  const [monthlyInterviews, setMonthlyInterviews] = useState<number>(goals.monthlyInterviewsTarget || 4);
  const [monthlyOffers, setMonthlyOffers] = useState<number>(goals.monthlyOffersTarget || 1);
  const [salaryCurrency, setSalaryCurrency] = useState<string>(goals.salaryCurrency || 'USD');
  const [minSalary, setMinSalary] = useState<number>(
    goals.targetMinSalary || (goals.salaryCurrency === 'ZAR' ? 650000 : 140000)
  );
  const [notes, setNotes] = useState<string>(goals.focusNotes || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state when modal opens or goals change
  useEffect(() => {
    if (isOpen) {
      const cur = goals.salaryCurrency || 'USD';
      setMonthlyApps(goals.monthlyApplicationsTarget || 20);
      setWeeklyApps(goals.weeklyApplicationsTarget || 5);
      setMonthlyInterviews(goals.monthlyInterviewsTarget || 4);
      setMonthlyOffers(goals.monthlyOffersTarget || 1);
      setSalaryCurrency(cur);
      setMinSalary(goals.targetMinSalary || (cur === 'ZAR' ? 650000 : 140000));
      setNotes(goals.focusNotes || '');
      setSaveSuccess(false);
    }
  }, [isOpen, goals]);

  if (!isOpen) return null;

  // Calculate actual numbers from current jobs
  const appliedCount = jobs.filter((j) => j.stage !== 'wishlist').length;
  const interviewCount = jobs.filter((j) => 
    ['screening', 'technical', 'interview', 'offer'].includes(j.stage) || 
    (j.interviews && j.interviews.length > 0)
  ).length;
  const offerCount = jobs.filter((j) => j.stage === 'offer').length;

  // Progress percentages
  const appsProgress = monthlyApps > 0 ? Math.min(Math.round((appliedCount / monthlyApps) * 100), 100) : 0;
  const interviewProgress = monthlyInterviews > 0 ? Math.min(Math.round((interviewCount / monthlyInterviews) * 100), 100) : 0;
  const offerProgress = monthlyOffers > 0 ? Math.min(Math.round((offerCount / monthlyOffers) * 100), 100) : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserGoals = {
      ...goals,
      monthlyApplicationsTarget: Math.max(1, Number(monthlyApps) || 20),
      weeklyApplicationsTarget: Math.max(1, Number(weeklyApps) || 5),
      monthlyInterviewsTarget: Math.max(0, Number(monthlyInterviews) || 4),
      monthlyOffersTarget: Math.max(0, Number(monthlyOffers) || 1),
      targetMinSalary: Number(minSalary) || undefined,
      salaryCurrency: salaryCurrency || 'USD',
      focusNotes: notes.trim(),
      targetMonth: goals.targetMonth || new Date().toISOString().slice(0, 7),
    };
    onSaveGoals(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  const handleResetDefaults = () => {
    setMonthlyApps(DEFAULT_USER_GOALS.monthlyApplicationsTarget);
    setWeeklyApps(DEFAULT_USER_GOALS.weeklyApplicationsTarget);
    setMonthlyInterviews(DEFAULT_USER_GOALS.monthlyInterviewsTarget);
    setMonthlyOffers(DEFAULT_USER_GOALS.monthlyOffersTarget);
    setMinSalary(DEFAULT_USER_GOALS.targetMinSalary || 140000);
    setSalaryCurrency(DEFAULT_USER_GOALS.salaryCurrency || 'USD');
    setNotes(DEFAULT_USER_GOALS.focusNotes || '');
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setSalaryCurrency(newCurrency);
    // If switching to ZAR from a low default USD value, offer sensible benchmark
    if (newCurrency === 'ZAR' && minSalary < 250000) {
      setMinSalary(650000);
    } else if (newCurrency === 'USD' && minSalary > 400000) {
      setMinSalary(140000);
    } else if (newCurrency === 'EUR' && minSalary > 300000) {
      setMinSalary(85000);
    } else if (newCurrency === 'GBP' && minSalary > 300000) {
      setMinSalary(75000);
    }
  };

  // Salary preset recommendations based on currency
  const getSalaryPresets = () => {
    if (salaryCurrency === 'ZAR') {
      return [
        { label: 'R 450k', value: 450000 },
        { label: 'R 650k', value: 650000 },
        { label: 'R 850k', value: 850000 },
        { label: 'R 1.1M', value: 1100000 },
        { label: 'R 1.5M', value: 1500000 },
      ];
    }
    if (salaryCurrency === 'EUR') {
      return [
        { label: '€60k', value: 60000 },
        { label: '€75k', value: 75000 },
        { label: '€90k', value: 90000 },
        { label: '€115k', value: 115000 },
        { label: '€140k', value: 140000 },
      ];
    }
    if (salaryCurrency === 'GBP') {
      return [
        { label: '£55k', value: 55000 },
        { label: '£70k', value: 70000 },
        { label: '£85k', value: 85000 },
        { label: '£105k', value: 105000 },
        { label: '£130k', value: 130000 },
      ];
    }
    if (salaryCurrency === 'CAD' || salaryCurrency === 'AUD') {
      return [
        { label: '90k', value: 90000 },
        { label: '120k', value: 120000 },
        { label: '145k', value: 145000 },
        { label: '175k', value: 175000 },
        { label: '210k', value: 210000 },
      ];
    }
    // Default USD / other
    return [
      { label: '$110k', value: 110000 },
      { label: '$140k', value: 140000 },
      { label: '$165k', value: 165000 },
      { label: '$190k', value: 190000 },
      { label: '$225k', value: 225000 },
    ];
  };

  const currentMonthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Monthly Targets & Search Goals
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {currentMonthName}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Set realistic application, interview, and compensation goals to maintain search momentum.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Progress Preview Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5">
          <div className="grid grid-cols-3 gap-3">
            {/* Applications Metric */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Applications</span>
                <span className="font-bold text-slate-900">{appliedCount}/{monthlyApps}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${appsProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>{appsProgress}% done</span>
                <span>{monthlyApps - appliedCount > 0 ? `${monthlyApps - appliedCount} to go` : 'Goal met!'}</span>
              </p>
            </div>

            {/* Interviews Metric */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Interviews</span>
                <span className="font-bold text-slate-900">{interviewCount}/{monthlyInterviews}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${interviewProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>{interviewProgress}% done</span>
                <span>{monthlyInterviews - interviewCount > 0 ? `${monthlyInterviews - interviewCount} to go` : 'Goal met!'}</span>
              </p>
            </div>

            {/* Offers Metric */}
            <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
                <span>Job Offers</span>
                <span className="font-bold text-slate-900">{offerCount}/{monthlyOffers}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${offerProgress}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1 flex justify-between">
                <span>{offerProgress}% done</span>
                <span>{offerCount >= monthlyOffers ? 'Goal met!' : `${monthlyOffers - offerCount} to go`}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          {/* Preset Selector for Monthly Apps */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue-600" />
                Monthly Applications Target
              </label>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {monthlyApps} Applications / Month
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="grid grid-cols-4 gap-2 mb-2.5">
              {[
                { value: 10, label: 'Selective', desc: '10 / mo' },
                { value: 20, label: 'Standard', desc: '20 / mo' },
                { value: 30, label: 'Active', desc: '30 / mo' },
                { value: 50, label: 'Intensive', desc: '50 / mo' },
              ].map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  onClick={() => {
                    setMonthlyApps(preset.value);
                    setWeeklyApps(Math.max(1, Math.round(preset.value / 4)));
                  }}
                  className={`py-2 px-2 text-center rounded-xl border transition-all ${
                    monthlyApps === preset.value
                      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div className="text-xs">{preset.label}</div>
                  <div className={`text-[10px] ${monthlyApps === preset.value ? 'text-blue-100' : 'text-slate-400'}`}>
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>

            {/* Custom slider and number input */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="100"
                step="5"
                value={monthlyApps}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMonthlyApps(val);
                  setWeeklyApps(Math.max(1, Math.round(val / 4)));
                }}
                className="flex-1 accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <input
                type="number"
                min="1"
                max="250"
                value={monthlyApps}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setMonthlyApps(val);
                  if (val > 0) setWeeklyApps(Math.max(1, Math.round(val / 4)));
                }}
                className="w-20 px-2.5 py-1.5 text-center font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Secondary Goals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-100">
            {/* Weekly Target */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weekly Apps Goal
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={weeklyApps}
                  onChange={(e) => setWeeklyApps(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">/ week</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">~{Math.round(monthlyApps / 4)}/wk recommended</p>
            </div>

            {/* Monthly Interviews Target */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Interviews
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={monthlyInterviews}
                  onChange={(e) => setMonthlyInterviews(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">rounds</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Target conversion: 15-20%</p>
            </div>

            {/* Monthly Offers Target */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Job Offers
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={monthlyOffers}
                  onChange={(e) => setMonthlyOffers(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3 top-2 text-xs text-slate-400">offers</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Target for final decision</p>
            </div>
          </div>

          {/* Minimum Target Compensation & Currency Selection */}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-600" />
                Target Minimum Base Salary
              </label>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-200">
                  {salaryCurrency}
                </span>
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {formatSalaryNum(minSalary || 0, salaryCurrency)} / yr
                </span>
              </div>
            </div>

            {/* Currency Selector Options */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-1.5">
                <span className="flex items-center gap-1">
                  <Globe className="w-3 h-3 text-slate-400" />
                  Select Target Currency:
                </span>
                <span className="text-[10px] text-slate-400">South African Rand (ZAR) available</span>
              </div>

              {/* Quick Currency Pills */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {[
                  { code: 'ZAR', label: '🇿🇦 ZAR (R)', title: 'South African Rand' },
                  { code: 'USD', label: '🇺🇸 USD ($)', title: 'US Dollar' },
                  { code: 'EUR', label: '🇪🇺 EUR (€)', title: 'Euro' },
                  { code: 'GBP', label: '🇬🇧 GBP (£)', title: 'British Pound' },
                  { code: 'CAD', label: '🇨🇦 CAD ($)', title: 'Canadian Dollar' },
                  { code: 'AUD', label: '🇦🇺 AUD ($)', title: 'Australian Dollar' },
                ].map((cur) => (
                  <button
                    key={cur.code}
                    type="button"
                    onClick={() => handleCurrencyChange(cur.code)}
                    title={cur.title}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all border ${
                      salaryCurrency === cur.code
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    {cur.label}
                  </button>
                ))}

                {/* More Currencies Dropdown */}
                <select
                  value={salaryCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="px-2 py-1 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  title="More world currencies"
                >
                  <option value="" disabled>All currencies...</option>
                  {SUPPORTED_CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} ({c.symbol.trim()}) - {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Input & Quick Presets */}
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
                  <span className="text-xs font-bold font-mono px-2 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                    {getCurrencySymbol(salaryCurrency).trim() || salaryCurrency}
                  </span>
                </div>
                <input
                  type="number"
                  min="1000"
                  max="50000000"
                  step={salaryCurrency === 'ZAR' ? '25000' : '5000'}
                  value={minSalary || ''}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  placeholder={salaryCurrency === 'ZAR' ? '650000' : '140000'}
                  className="w-full pl-16 pr-4 py-2 border border-slate-200 rounded-lg font-bold text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Quick Salary Benchmarks */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-medium mr-0.5">Quick benchmarks:</span>
                {getSalaryPresets().map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setMinSalary(preset.value)}
                    className={`px-2 py-0.5 text-[11px] rounded-md font-mono transition-colors border ${
                      minSalary === preset.value
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-800 font-bold'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Used in the Offer Comparison Matrix, analytics benchmarks, and job sorting to track roles against your compensation goal in <strong className="text-slate-600">{salaryCurrency}</strong>.
            </p>
          </div>

          {/* Strategic Focus / Motivational Notes */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Strategic Search Focus & Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on companies with modern tech stacks (React, TypeScript, Go), transparent salary ranges, and remote-first culture."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-xs transition-all flex items-center gap-1.5 ${
                  saveSuccess ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Goals Updated!</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4" />
                    <span>Save Monthly Goals</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
