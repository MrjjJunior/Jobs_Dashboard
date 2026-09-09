import React, { useState } from 'react';
import { 
  Briefcase, 
  Columns3, 
  FileText, 
  BarChart3, 
  Target, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Star, 
  Zap, 
  Award, 
  TrendingUp, 
  Check, 
  LogIn, 
  UserPlus,
  Play,
  Layers,
  ChevronRight,
  Eye,
  Sliders,
  Compass,
  ArrowUpRight
} from 'lucide-react';
import { UserProfile, JobApplication } from '../types';

interface LandingPageProps {
  userProfile: UserProfile;
  jobs: JobApplication[];
  onStartTracking: (mode?: 'login' | 'signup') => void;
  onGoToDashboard: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  userProfile,
  jobs,
  onStartTracking,
  onGoToDashboard,
  onTryDemo,
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'ats' | 'offers' | 'analytics'>('pipeline');

  const isLoggedIn = Boolean(userProfile.isLoggedIn);

  const handlePrimaryCta = () => {
    if (isLoggedIn) {
      onGoToDashboard();
    } else {
      onStartTracking('signup');
    }
  };

  const handleLoginClick = () => {
    if (isLoggedIn) {
      onGoToDashboard();
    } else {
      onStartTracking('login');
    }
  };

  return (
    <div className="min-h-screen bg-[#003B36] text-[#F3E8EE] flex flex-col selection:bg-[#ADFCF9] selection:text-[#003B36] font-sans">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 bg-[#00302c]/90 backdrop-blur-md border-b border-[#917C78]/30 px-4 lg:px-12 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 h-9 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div>
            <span className="font-black text-2xl tracking-tighter text-white flex items-center gap-1.5 drop-shadow-sm">
              Jobbdash
            </span>
          </div>
        </div>

        {/* Center Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-[#F3E8EE]/80">
          <a href="#features" className="hover:text-[#ADFCF9] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#ADFCF9] transition-colors">How It Works</a>
          <a href="#outcomes" className="hover:text-[#ADFCF9] transition-colors">Outcomes</a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <button
              onClick={onGoToDashboard}
              className="flex items-center gap-2 px-4 py-2 bg-[#90A955] hover:bg-[#a2be64] active:bg-[#7e9647] text-[#00221f] rounded-xl text-xs font-bold shadow-md shadow-[#90A955]/30 transition-all cursor-pointer"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <>
              <button
                onClick={handleLoginClick}
                className="px-3.5 py-2 text-xs font-semibold text-[#F3E8EE]/90 hover:text-white hover:bg-[#002824] rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5 text-[#ADFCF9]" />
                <span>Log In</span>
              </button>
              <button
                onClick={() => onStartTracking('signup')}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#90A955] hover:bg-[#a2be64] active:bg-[#7e9647] text-[#00221f] rounded-xl text-xs font-bold shadow-md shadow-[#90A955]/30 transition-all cursor-pointer"
              >
                <span>Start Tracking</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 lg:px-12 overflow-hidden flex flex-col items-center text-center">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#ADFCF9]/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[250px] bg-[#90A955]/15 blur-[110px] rounded-full pointer-events-none" />

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#F3E8EE] tracking-tight max-w-4xl leading-[1.15] mb-6">
          Take control of your job search.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ADFCF9] via-[#90A955] to-[#ADFCF9]">
            Track applications, beat ATS, land offers.
          </span>
        </h1>

        {/* Hero Subtitle */}
        <p className="text-sm sm:text-base text-[#F3E8EE]/80 max-w-2xl leading-relaxed mb-8">
          The all-in-one workspace designed for ambitious professionals. Organize custom pipelines, analyze keyword match scores in seconds, prepare interview checklists, and compare multiple offers side-by-side.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full max-w-md justify-center mb-10">
          <button
            id="hero-start-tracking-cta"
            onClick={handlePrimaryCta}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-[#90A955] to-[#7f9845] hover:from-[#a2be64] hover:to-[#90A955] active:scale-98 text-[#00221f] rounded-xl text-sm font-bold shadow-xl shadow-[#90A955]/30 transition-all cursor-pointer"
          >
            <span>{isLoggedIn ? 'Open Your Dashboard' : 'Start Tracking Free'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>


        {/* Proof Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-[#F3E8EE]/80 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#90A955]" />
            <span>100% Free & Local-First</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#ADFCF9]" />
            <span>Real-Time ATS Keyword Match</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#90A955]" />
            <span>No Credit Card Required</span>
          </div>
        </div>

        {/* App Showcase Preview Frame */}
        <div className="mt-14 w-full max-w-5xl rounded-2xl bg-[#002824] p-2 sm:p-3 border border-[#917C78]/40 shadow-2xl shadow-black/60 relative">
          <div className="w-full rounded-xl bg-[#001f1c] border border-[#917C78]/30 overflow-hidden text-left">
            {/* Window Controls & Tabs Bar */}
            <div className="px-4 py-3 bg-[#002b27] border-b border-[#917C78]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-[#90A955] inline-block" />
                <span className="ml-3 text-[11px] font-mono text-[#F3E8EE]/60 hidden sm:inline">jobbdash.app/pipeline</span>
              </div>

              <div className="flex items-center gap-1 bg-[#001f1c] p-0.5 rounded-lg text-xs font-semibold text-[#F3E8EE]/80">
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'pipeline' ? 'bg-[#90A955] text-[#00221f] font-bold' : 'hover:text-white'
                  }`}
                >
                  Kanban Pipeline
                </button>
                <button
                  onClick={() => setActiveTab('ats')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'ats' ? 'bg-[#90A955] text-[#00221f] font-bold' : 'hover:text-white'
                  }`}
                >
                  ATS Matcher
                </button>
                <button
                  onClick={() => setActiveTab('offers')}
                  className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                    activeTab === 'offers' ? 'bg-[#90A955] text-[#00221f] font-bold' : 'hover:text-white'
                  }`}
                >
                  Offer Matrix
                </button>
              </div>
            </div>

            {/* Tab 1: Kanban Preview */}
            {activeTab === 'pipeline' && (
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 bg-[#001f1c] text-[#F3E8EE]">
                {/* Col 1: Applied */}
                <div className="bg-[#002b27] rounded-xl p-3 border border-[#917C78]/30 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F3E8EE] pb-1 border-b border-[#917C78]/30">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ADFCF9]" />
                      Applied (3)
                    </span>
                  </div>
                  <div className="bg-[#003833] rounded-lg p-3 border border-[#917C78]/40 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Stripe</span>
                      <span className="text-[10px] font-semibold text-[#ADFCF9] bg-[#ADFCF9]/10 px-1.5 py-0.2 rounded border border-[#ADFCF9]/30">High</span>
                    </div>
                    <p className="text-[11px] text-[#F3E8EE]/70">Senior Frontend Engineer</p>
                    <div className="flex items-center justify-between text-[10px] text-[#F3E8EE]/70 pt-1 border-t border-[#917C78]/30">
                      <span className="text-[#90A955] font-semibold">$165k - $190k</span>
                      <span className="text-[#ADFCF9] bg-[#ADFCF9]/15 px-1.5 rounded font-bold border border-[#ADFCF9]/40">92% ATS</span>
                    </div>
                  </div>
                  <div className="bg-[#003833] rounded-lg p-3 border border-[#917C78]/40 space-y-1.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Airbnb</span>
                      <span className="text-[10px] font-semibold text-amber-300 bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-800/60">Med</span>
                    </div>
                    <p className="text-[11px] text-[#F3E8EE]/70">Product Designer</p>
                    <div className="flex items-center justify-between text-[10px] text-[#F3E8EE]/70 pt-1 border-t border-[#917C78]/30">
                      <span className="text-[#90A955] font-semibold">$150k - $175k</span>
                      <span className="text-[#ADFCF9] bg-[#ADFCF9]/15 px-1.5 rounded font-bold border border-[#ADFCF9]/40">85% ATS</span>
                    </div>
                  </div>
                </div>

                {/* Col 2: Interview */}
                <div className="bg-[#002b27] rounded-xl p-3 border border-[#917C78]/30 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F3E8EE] pb-1 border-b border-[#917C78]/30">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#90A955]" />
                      Interview (2)
                    </span>
                  </div>
                  <div className="bg-[#003833] rounded-lg p-3 border border-[#90A955]/40 space-y-1.5 shadow-sm ring-1 ring-[#90A955]/30">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Linear</span>
                      <span className="text-[10px] font-semibold text-[#ADFCF9] bg-[#ADFCF9]/10 px-1.5 py-0.2 rounded border border-[#ADFCF9]/30">High</span>
                    </div>
                    <p className="text-[11px] text-[#F3E8EE]/70">Full-Stack Tech Lead</p>
                    <div className="bg-[#00221f] text-[#ADFCF9] text-[10px] px-2 py-1 rounded border border-[#917C78]/40 font-medium flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#ADFCF9]" />
                      <span>System Design: Tomorrow at 2:00 PM</span>
                    </div>
                  </div>
                </div>

                {/* Col 3: Offer */}
                <div className="bg-[#002b27] rounded-xl p-3 border border-[#917C78]/30 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-[#F3E8EE] pb-1 border-b border-[#917C78]/30">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#90A955]" />
                      Offer (1)
                    </span>
                  </div>
                  <div className="bg-[#003833] rounded-lg p-3 border border-[#90A955]/60 space-y-1.5 shadow-sm bg-gradient-to-b from-[#90A955]/15 to-[#003833]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#ADFCF9]">Vercel</span>
                      <span className="text-[10px] font-bold text-[#00221f] bg-[#90A955] px-2 py-0.5 rounded-full border border-[#90A955]">🎉 OFFER</span>
                    </div>
                    <p className="text-[11px] text-[#F3E8EE] font-medium">Principal UI Architect</p>
                    <div className="text-[#90A955] font-bold text-xs pt-1 border-t border-[#917C78]/30 flex items-center justify-between">
                      <span>$210,000 / yr</span>
                      <span className="text-[10px] text-[#F3E8EE]/60 font-normal">Remote (Global)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: ATS Scanner Preview */}
            {activeTab === 'ats' && (
              <div className="p-4 sm:p-6 bg-[#001f1c] text-[#F3E8EE] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#002b27] border border-[#917C78]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F3E8EE]">ATS Match Analysis</span>
                    <span className="text-xs font-bold text-[#00221f] bg-[#90A955] px-2.5 py-1 rounded-full border border-[#90A955]">
                      94% Match (Exceptional)
                    </span>
                  </div>
                  <p className="text-xs text-[#F3E8EE]/70">Target Role: Senior Front-End Engineer (React & TypeScript)</p>
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-[#F3E8EE]/80 block">Matched Keywords (14):</span>
                    <div className="flex flex-wrap gap-1.5">
                      {['React (Hooks)', 'TypeScript', 'Redux Saga', 'GraphQL', 'Webpack 4', 'Accessibility (WCAG)', 'CSS Grid'].map((k) => (
                        <span key={k} className="text-[10px] font-semibold bg-[#ADFCF9]/15 text-[#ADFCF9] border border-[#ADFCF9]/30 px-2 py-0.5 rounded-md">
                          ✓ {k}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#002b27] border border-[#917C78]/30 space-y-2.5">
                  <span className="text-xs font-bold text-[#F3E8EE]">Actionable Recommendations</span>
                  <div className="space-y-2 text-xs text-[#F3E8EE]/80">
                    <div className="p-2.5 rounded-lg bg-[#003833] border border-[#917C78]/40 flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-[#ADFCF9] shrink-0 mt-0.5" />
                      <span>Add 1 more mention of <strong>Webpack / Performance Profiling</strong> to your experience section.</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#003833] border border-[#917C78]/40 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#90A955] shrink-0 mt-0.5" />
                      <span>All core section headers (Experience, Education, Skills) are formatted properly.</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Offer Matrix Preview */}
            {activeTab === 'offers' && (
              <div className="p-4 sm:p-6 bg-[#001f1c] text-[#F3E8EE] grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-[#002b27] border border-[#917C78]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Offer A • Vercel</span>
                    <span className="text-xs font-bold text-[#90A955]">$210,000 / yr</span>
                  </div>
                  <div className="text-xs text-[#F3E8EE]/70 space-y-1">
                    <p>• Equity: $60k RSUs / 4yr vesting</p>
                    <p>• Workplace: 100% Remote, Flexible PTO</p>
                    <p>• Benefits: $3,000 Home Office Stipend + Health</p>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#002b27] border border-[#917C78]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Offer B • Datadog</span>
                    <span className="text-xs font-bold text-[#ADFCF9]">$195,000 / yr</span>
                  </div>
                  <div className="text-xs text-[#F3E8EE]/70 space-y-1">
                    <p>• Equity: $40k Stock Options</p>
                    <p>• Workplace: Hybrid (2 days in NYC office)</p>
                    <p>• Benefits: Full 401(k) match up to 6%</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Core Value Pillars / Features Grid */}
      <section id="features" className="py-20 px-4 lg:px-12 bg-[#00302c] border-t border-[#917C78]/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#ADFCF9] mb-2">
              Everything You Need to Win
            </h2>
            <p className="text-2xl sm:text-4xl font-extrabold text-[#F3E8EE] tracking-tight">
              Engineered to turn application chaos into structured career progress.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[#002622] border border-[#917C78]/30 hover:border-[#ADFCF9]/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#003B36] text-[#ADFCF9] border border-[#ADFCF9]/30 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Columns3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Visual Kanban Pipeline</h3>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Track status across Wishlist, Applied, Screening, Technical, Interview, Offer, and Rejected stages with one-click transitions and status chips.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[#002622] border border-[#917C78]/30 hover:border-[#90A955]/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#003B36] text-[#90A955] border border-[#90A955]/40 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">ATS Resume Matcher</h3>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Scan your resume against any job description. Get real-time match scores (0-100%), missing keywords, and section readability advice before you apply.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[#002622] border border-[#917C78]/30 hover:border-[#ADFCF9]/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#003B36] text-[#ADFCF9] border border-[#ADFCF9]/30 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Interview & Reminder Hub</h3>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Log interview rounds, video links, recruiter names, questions, and custom prep checklists so you enter every round confident and prepared.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[#002622] border border-[#917C78]/30 hover:border-[#90A955]/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#003B36] text-[#90A955] border border-[#90A955]/40 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Offer Comparison Matrix</h3>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Compare multiple job offers side-by-side: evaluate base salary, equity, annual bonus, benefits, and workplace flexibility with transparent scoring.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-[#002622] border border-[#917C78]/30 hover:border-[#ADFCF9]/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#003B36] text-[#ADFCF9] border border-[#ADFCF9]/30 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Resume Studio & Vault</h3>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Organize tailored resume versions per role type. See which resume version delivers the highest callback and interview rates.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-[#002622] border border-[#917C78]/30 hover:border-[#90A955]/50 transition-all group">
              <div className="w-10 h-10 rounded-xl bg-[#003B36] text-[#90A955] border border-[#90A955]/40 flex items-center justify-center font-bold mb-4 group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Goals & Activity Analytics</h3>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Set weekly and monthly application goals, visualize conversion rates by stage, and discover where your pipeline performs best.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 lg:px-12 bg-[#003B36] border-t border-[#917C78]/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#90A955] mb-2">
              Simple 4-Step Process
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-[#F3E8EE] tracking-tight">
              From application to offer letter in 4 streamlined steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-[#002b27] border border-[#917C78]/30 relative">
              <span className="text-3xl font-black text-[#917C78]/40 absolute top-4 right-4">01</span>
              <div className="w-8 h-8 rounded-lg bg-[#90A955]/20 text-[#ADFCF9] flex items-center justify-center font-bold text-xs mb-4">
                1
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Save Opportunities</h4>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Quickly add applications, company notes, salary expectations, and job links.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#002b27] border border-[#917C78]/30 relative">
              <span className="text-3xl font-black text-[#917C78]/40 absolute top-4 right-4">02</span>
              <div className="w-8 h-8 rounded-lg bg-[#90A955]/20 text-[#ADFCF9] flex items-center justify-center font-bold text-xs mb-4">
                2
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Optimize with ATS</h4>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Check resume keywords and alignment to maximize screening callback rates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#002b27] border border-[#917C78]/30 relative">
              <span className="text-3xl font-black text-[#917C78]/40 absolute top-4 right-4">03</span>
              <div className="w-8 h-8 rounded-lg bg-[#90A955]/20 text-[#ADFCF9] flex items-center justify-center font-bold text-xs mb-4">
                3
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Manage Interviews</h4>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Schedule rounds, review notes, and track action items with zero missed dates.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#002b27] border border-[#917C78]/30 relative">
              <span className="text-3xl font-black text-[#917C78]/40 absolute top-4 right-4">04</span>
              <div className="w-8 h-8 rounded-lg bg-[#90A955]/20 text-[#ADFCF9] flex items-center justify-center font-bold text-xs mb-4">
                4
              </div>
              <h4 className="text-sm font-bold text-white mb-1.5">Compare & Accept</h4>
              <p className="text-xs text-[#F3E8EE]/75 leading-relaxed">
                Evaluate offers side-by-side and negotiate with absolute clarity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 px-4 lg:px-12 bg-gradient-to-b from-[#00302c] to-[#001f1c] border-t border-[#917C78]/30 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to streamline your job search?
          </h2>
          <p className="text-xs sm:text-sm text-[#F3E8EE]/80 max-w-xl mx-auto leading-relaxed">
            Join professionals who organize their applications, optimize their resumes, and negotiate top offers with Jobbdash.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              id="bottom-start-tracking-cta"
              onClick={handlePrimaryCta}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-[#90A955] hover:bg-[#a2be64] active:scale-98 text-[#00221f] rounded-xl text-sm font-bold shadow-xl shadow-[#90A955]/30 transition-all cursor-pointer"
            >
              <span>{isLoggedIn ? 'Open Your Dashboard' : 'Start Tracking Now - It’s Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 lg:px-12 bg-[#001a18] border-t border-[#917C78]/30 text-center text-xs text-[#F3E8EE]/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#90A955]/20 text-[#ADFCF9] flex items-center justify-center font-bold text-xs">
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-[#F3E8EE]">Jobbdash</span>
          <span>© 2019 All rights reserved.</span>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-[#F3E8EE]/70 mt-4 sm:mt-0">
          <a href="#features" className="hover:text-[#ADFCF9] transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-[#ADFCF9] transition-colors">How It Works</a>
          <a href="#" className="hover:text-[#ADFCF9] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#ADFCF9] transition-colors">Terms of Service</a>
          <button onClick={handleLoginClick} className="hover:text-[#ADFCF9] transition-colors cursor-pointer">
            {isLoggedIn ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </footer>
    </div>
  );
};
