import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  RotateCcw
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-2xl shadow-xl border border-slate-200/90 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Monthly Targets
              <span className="text-xs font-normal text-slate-400">· {currentMonthName}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Set application volume, pipeline milestones, and compensation goals.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Minimal Progress Bar Summary */}
        <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-3">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
            <span className="font-medium">
              Applications: <strong className="text-slate-900 font-semibold">{appliedCount}</strong> / {monthlyApps}
            </span>
            <span className="text-slate-400">
              Interviews: <strong className="text-slate-700 font-semibold">{interviewCount}</strong>/{monthlyInterviews} · Offers: <strong className="text-slate-700 font-semibold">{offerCount}</strong>/{monthlyOffers}
            </span>
          </div>
          <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${appsProgress >= 100 ? 'bg-emerald-500' : 'bg-blue-600'}`}
              style={{ width: `${appsProgress}%` }}
            />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 overflow-y-auto flex-1 text-sm">
          {/* Monthly Applications Target */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                Monthly Applications Target
              </label>
              <span className="text-xs font-bold text-slate-900">
                {monthlyApps} apps / mo
              </span>
            </div>

            {/* Clean Pill Presets */}
            <div className="flex items-center gap-1.5 mb-2.5">
              {[10, 20, 30, 40, 50].map((presetVal) => (
                <button
                  key={presetVal}
                  type="button"
                  onClick={() => {
                    setMonthlyApps(presetVal);
                    setWeeklyApps(Math.max(1, Math.round(presetVal / 4)));
                  }}
                  className={`flex-1 py-1 text-xs font-medium rounded-lg border transition-all ${
                    monthlyApps === presetVal
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {presetVal}
                </button>
              ))}
            </div>

            {/* Slider & Input */}
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
                className="flex-1 accent-slate-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
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
                className="w-16 px-2 py-1 text-center font-bold text-slate-900 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-xs"
              />
            </div>
          </div>

          {/* Pipeline Milestones: 3 Clean Inputs */}
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Weekly Target
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={weeklyApps}
                onChange={(e) => setWeeklyApps(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Interviews
              </label>
              <input
                type="number"
                min="0"
                max="30"
                value={monthlyInterviews}
                onChange={(e) => setMonthlyInterviews(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Offers
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={monthlyOffers}
                onChange={(e) => setMonthlyOffers(Number(e.target.value))}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          {/* Minimal Target Salary & Currency */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">
                Target Minimum Base Salary
              </label>
              <span className="text-xs font-bold text-emerald-700 font-mono">
                {formatSalaryNum(minSalary || 0, salaryCurrency)} / yr
              </span>
            </div>

            {/* Currency Dropdown & Value Input in one clean row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-1">
                <select
                  value={salaryCurrency}
                  onChange={(e) => handleCurrencyChange(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-medium bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="ZAR">🇿🇦 ZAR (R) - Rand</option>
                  <option value="USD">🇺🇸 USD ($) - US Dollar</option>
                  <option value="EUR">🇪🇺 EUR (€) - Euro</option>
                  <option value="GBP">🇬🇧 GBP (£) - British Pound</option>
                  <option value="CAD">🇨🇦 CAD ($) - Canadian Dollar</option>
                  <option value="AUD">🇦🇺 AUD ($) - Australian Dollar</option>
                  <option disabled>──────────</option>
                  {SUPPORTED_CURRENCIES
                    .filter((c) => !['ZAR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(c.code))
                    .map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} ({c.symbol.trim()}) - {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="sm:col-span-2 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-xs font-mono font-bold text-slate-500">
                  {getCurrencySymbol(salaryCurrency).trim() || salaryCurrency}
                </div>
                <input
                  type="number"
                  min="1000"
                  max="50000000"
                  step={salaryCurrency === 'ZAR' ? '25000' : '5000'}
                  value={minSalary || ''}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  placeholder={salaryCurrency === 'ZAR' ? '650000' : '140000'}
                  className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-900 font-mono focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Quick Benchmark Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
              <span className="text-[11px] text-slate-400 shrink-0">Presets:</span>
              {getSalaryPresets().map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setMinSalary(preset.value)}
                  className={`px-2 py-0.5 text-[11px] rounded-md font-mono transition-colors border ${
                    minSalary === preset.value
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Strategic Search Focus */}
          <div className="pt-3 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Search Focus & Notes <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Key requirements, preferred tech stacks, or search priorities..."
              className="w-full p-2.5 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          {/* Minimal Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg transition-all flex items-center gap-1.5 ${
                  saveSuccess ? 'bg-emerald-600' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Save Targets</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
