import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Trash2, 
  ArrowRight, 
  BookOpen, 
  Download, 
  Save, 
  HelpCircle, 
  Award, 
  Zap, 
  Sliders, 
  Copy, 
  Check, 
  ShieldAlert, 
  Flame, 
  ChevronRight, 
  ExternalLink,
  RefreshCw,
  Eye,
  Printer,
  ChevronDown,
  RotateCcw
} from 'lucide-react';
import { ResumeItem } from '../types';

interface ResumeBuilderViewProps {
  onSaveResume: (resume: ResumeItem) => void;
  onNavigateToAts?: (resumeId?: string) => void;
  existingResumes?: ResumeItem[];
}

interface WorkExperience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  bullets: string[];
}

interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  graduationYear: string;
  gpa?: string;
  honors?: string;
}

export const ResumeBuilderView: React.FC<ResumeBuilderViewProps> = ({
  onSaveResume,
  onNavigateToAts,
  existingResumes = [],
}) => {
  const [activeTab, setActiveTab] = useState<'builder' | 'guide' | 'verbs' | 'examples'>('builder');

  // Resume builder state - Default to blank for clean user input
  const [fullName, setFullName] = useState('');
  const [targetTitle, setTargetTitle] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [github, setGithub] = useState('');
  const [portfolio, setPortfolio] = useState('');

  // Professional Summary (Replaces outdated Objective)
  const [summary, setSummary] = useState('');

  // Work Experience
  const [experiences, setExperiences] = useState<WorkExperience[]>([]);

  // Skills
  const [languages, setLanguages] = useState('');
  const [frameworks, setFrameworks] = useState('');
  const [cloudTools, setCloudTools] = useState('');
  const [methodologies, setMethodologies] = useState('');

  // Education
  const [education, setEducation] = useState<EducationItem[]>([]);

  // Interactive Google X-Y-Z Bullet Generator State
  const [xyzRoleIndex, setXyzRoleIndex] = useState(0);
  const [xyzAccomplished, setXyzAccomplished] = useState('');
  const [xyzMeasured, setXyzMeasured] = useState('');
  const [xyzDoing, setXyzDoing] = useState('');
  const [selectedVerb, setSelectedVerb] = useState('Engineered');

  // Action verb search
  const [verbCategory, setVerbCategory] = useState<'all' | 'lead' | 'build' | 'optimize' | 'grow' | 'design'>('all');
  const [verbSearch, setVerbSearch] = useState('');
  const [copiedVerb, setCopiedVerb] = useState<string | null>(null);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Template loader & Clear handlers
  const handleLoadSampleTemplate = () => {
    setFullName('Alex Rivera');
    setTargetTitle('Senior Full-Stack Engineer');
    setEmail('alex.rivera@example.com');
    setPhone('+1 (555) 234-5678');
    setLocation('San Francisco, CA');
    setLinkedin('linkedin.com/in/alexrivera-dev');
    setGithub('github.com/alexrivera');
    setPortfolio('alexrivera.io');
    setSummary('Performance-driven Full-Stack Engineer with 5+ years of experience architecting high-throughput distributed web applications and modern React/Node.js systems. Proven track record of accelerating page load times by 40% and leading high-velocity agile sprints.');
    setLanguages('TypeScript, JavaScript (ES6+), Python, SQL, HTML5, CSS3');
    setFrameworks('React, Next.js, Node.js, Express, Tailwind CSS, GraphQL, Redux Toolkit');
    setCloudTools('AWS (S3, Lambda, CloudFront), Docker, PostgreSQL, Redis, Git, GitHub Actions, Jest, Vite');
    setMethodologies('Agile/Scrum, CI/CD, Microservices, Test-Driven Development (TDD), RESTful APIs');
    setExperiences([
      {
        id: 'exp-1',
        company: 'TechFlow Systems',
        role: 'Senior Full-Stack Engineer',
        location: 'San Francisco, CA',
        startDate: '2023-03',
        endDate: 'Present',
        isCurrent: true,
        bullets: [
          'Architected real-time WebSocket dashboard handling 25,000+ concurrent connections, reducing client synchronization latency by 45%.',
          'Spearheaded migration of legacy monolith to micro-frontends using React 18, TypeScript, and Vite, cutting initial bundle size by 38% and accelerating deployment cycles from 2 weeks to daily releases.',
          'Engineered automated CI/CD pipeline with comprehensive end-to-end Playwright tests, decreasing production escape defects by 52% across 6 core product domains.',
        ],
      },
      {
        id: 'exp-2',
        company: 'Nexus Digital Labs',
        role: 'Software Engineer',
        location: 'San Jose, CA',
        startDate: '2021-06',
        endDate: '2023-02',
        isCurrent: false,
        bullets: [
          'Developed high-conversion checkout flows using React, Tailwind CSS, and Stripe API, elevating user checkout completion rate by 18.5% ($1.2M incremental ARR).',
          'Optimized PostgreSQL database queries and implemented Redis caching layer, decreasing average server response time from 420ms to 95ms.',
          'Mentored 4 junior engineers on modern React hooks architecture, code review standards, and automated unit testing practices.',
        ],
      },
    ]);
    setEducation([
      {
        id: 'edu-1',
        school: 'University of California, Berkeley',
        degree: 'Bachelor of Science',
        field: 'Computer Science',
        graduationYear: '2021',
        gpa: '3.8/4.0',
        honors: 'Dean’s Honors List',
      },
    ]);
    setXyzAccomplished('Accelerated mobile application performance');
    setXyzMeasured('by 42% from 3.8s to 2.2s load time');
    setXyzDoing('by implementing code splitting, lazy asset loading, and server caching');
    setSaveSuccessMessage('Sample template loaded for reference!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  const handleClearForm = () => {
    if (confirm('Clear all resume fields to a blank canvas?')) {
      setFullName('');
      setTargetTitle('');
      setEmail('');
      setPhone('');
      setLocation('');
      setLinkedin('');
      setGithub('');
      setPortfolio('');
      setSummary('');
      setLanguages('');
      setFrameworks('');
      setCloudTools('');
      setMethodologies('');
      setExperiences([]);
      setEducation([]);
      setXyzAccomplished('');
      setXyzMeasured('');
      setXyzDoing('');
      setSaveSuccessMessage('Resume canvas cleared!');
      setTimeout(() => setSaveSuccessMessage(null), 3000);
    }
  };

  // Formatted Resume Content for Preview / ATS
  const fullResumeText = useMemo(() => {
    const lines: string[] = [];
    lines.push(`${fullName.toUpperCase()}`);
    lines.push(`${targetTitle} | ${location} | ${phone} | ${email}`);
    lines.push(`${linkedin} | ${github} | ${portfolio}`);
    lines.push('');
    lines.push('PROFESSIONAL SUMMARY');
    lines.push(summary);
    lines.push('');
    lines.push('TECHNICAL SKILLS');
    lines.push(`• Languages: ${languages}`);
    lines.push(`• Frameworks & Libraries: ${frameworks}`);
    lines.push(`• Cloud, Database & Tools: ${cloudTools}`);
    lines.push(`• Architecture & Practices: ${methodologies}`);
    lines.push('');
    lines.push('PROFESSIONAL EXPERIENCE');
    experiences.forEach((exp) => {
      lines.push(`${exp.role.toUpperCase()} — ${exp.company} | ${exp.location}`);
      lines.push(`${exp.startDate} – ${exp.endDate}`);
      exp.bullets.forEach((b) => {
        lines.push(`• ${b}`);
      });
      lines.push('');
    });
    lines.push('EDUCATION');
    education.forEach((edu) => {
      lines.push(`${edu.degree} in ${edu.field} — ${edu.school} (${edu.graduationYear})`);
      if (edu.honors || edu.gpa) {
        lines.push(`  ${[edu.gpa ? `GPA: ${edu.gpa}` : '', edu.honors].filter(Boolean).join(' | ')}`);
      }
    });

    return lines.join('\n');
  }, [
    fullName,
    targetTitle,
    location,
    phone,
    email,
    linkedin,
    github,
    portfolio,
    summary,
    languages,
    frameworks,
    cloudTools,
    methodologies,
    experiences,
    education,
  ]);

  // Real-time ATS Quality & Ranking Scorecard
  const qualityAudit = useMemo(() => {
    const words = fullResumeText.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Checks
    const hasSummary = summary.trim().length >= 80;
    const noObjective = !fullResumeText.toLowerCase().includes('objective:');
    const noPersonalDetails = !fullResumeText.toLowerCase().includes('marital status') && 
                              !fullResumeText.toLowerCase().includes('date of birth') && 
                              !fullResumeText.toLowerCase().includes('nationality');
    
    // Check for metrics (% or $ or numbers) in bullets
    let totalBullets = 0;
    let bulletsWithMetrics = 0;
    let bulletsWithStrongVerbs = 0;

    const strongVerbsList = [
      'architected', 'spearheaded', 'engineered', 'optimized', 'developed', 'designed',
      'implemented', 'accelerated', 'reduced', 'increased', 'scaled', 'built',
      'launched', 'automated', 'streamlined', 'delivered', 'mentored', 'pioneered',
      'cut', 'boosted', 'orchestrated', 'elevated', 'decreased', 'transformed'
    ];

    const passivePhrases = ['responsible for', 'helped with', 'worked on', 'assisted in', 'duties included'];
    let passiveCount = 0;

    experiences.forEach((exp) => {
      exp.bullets.forEach((b) => {
        totalBullets++;
        if (/(\d+%)|(\$\d+)|(\d+\+)|(\d+ms)|(\d+s)/i.test(b)) {
          bulletsWithMetrics++;
        }
        const firstWord = b.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
        if (strongVerbsList.includes(firstWord)) {
          bulletsWithStrongVerbs++;
        }
        passivePhrases.forEach((p) => {
          if (b.toLowerCase().includes(p)) passiveCount++;
        });
      });
    });

    const metricRatio = totalBullets > 0 ? bulletsWithMetrics / totalBullets : 0;
    const verbRatio = totalBullets > 0 ? bulletsWithStrongVerbs / totalBullets : 0;

    // Score calculation
    let score = 50;
    if (wordCount >= 350 && wordCount <= 650) score += 15; // 1-page standard sweet spot
    else if (wordCount > 650 && wordCount <= 900) score += 5;
    if (hasSummary) score += 10;
    if (noObjective) score += 5;
    if (noPersonalDetails) score += 5;
    if (metricRatio >= 0.6) score += 10;
    else if (metricRatio >= 0.3) score += 5;
    if (verbRatio >= 0.7) score += 10;
    else if (verbRatio >= 0.4) score += 5;
    if (passiveCount === 0) score += 5;

    score = Math.min(Math.max(score, 20), 99);

    return {
      score,
      wordCount,
      isOnePage: wordCount >= 350 && wordCount <= 680,
      totalBullets,
      bulletsWithMetrics,
      bulletsWithStrongVerbs,
      passiveCount,
      hasSummary,
      noObjective,
      noPersonalDetails,
    };
  }, [fullResumeText, summary, experiences]);

  // Handle adding experiences and bullets
  const handleAddExperience = () => {
    const newExp: WorkExperience = {
      id: `exp-${Date.now()}`,
      company: 'New Company Inc.',
      role: 'Software Engineer',
      location: 'Remote',
      startDate: '2023-01',
      endDate: 'Present',
      isCurrent: true,
      bullets: [
        'Accomplished key project milestone as measured by 30% performance gain, by developing modular components.',
      ],
    };
    setExperiences([newExp, ...experiences]);
  };

  const handleRemoveExperience = (id: string) => {
    setExperiences(experiences.filter((e) => e.id !== id));
  };

  const handleAddBullet = (expIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].bullets.push(
      'Engineered new feature capability as measured by 25% adoption increase, by leveraging modern cloud infrastructure.'
    );
    setExperiences(updated);
  };

  const handleUpdateBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const updated = [...experiences];
    updated[expIndex].bullets[bulletIndex] = text;
    setExperiences(updated);
  };

  const handleRemoveBullet = (expIndex: number, bulletIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].bullets = updated[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    setExperiences(updated);
  };

  const handleAddEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: '',
      field: '',
      school: '',
      graduationYear: '',
      honors: '',
    };
    setEducation([...education, newEdu]);
  };

  const handleRemoveEducation = (id: string) => {
    setEducation(education.filter((e) => e.id !== id));
  };

  // Google X-Y-Z generated bullet
  const generatedXyzBullet = `${selectedVerb} ${xyzAccomplished.trim()} (${xyzMeasured.trim()}) ${xyzDoing.trim()}.`;

  const handleApplyXyzBullet = () => {
    if (experiences.length === 0) {
      handleAddExperience();
      return;
    }
    const updated = [...experiences];
    const targetIdx = Math.min(xyzRoleIndex, updated.length - 1);
    updated[targetIdx].bullets.push(generatedXyzBullet);
    setExperiences(updated);
    setSaveSuccessMessage('Google X-Y-Z bullet added to experience!');
    setTimeout(() => setSaveSuccessMessage(null), 3000);
  };

  // Save to stored Resumes
  const handleSaveToLibrary = () => {
    const newResume: ResumeItem = {
      id: `res-created-${Date.now()}`,
      name: `${targetTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Master_CV.pdf`,
      fileName: `${targetTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Master_CV.pdf`,
      fileSize: `${Math.round(fullResumeText.length / 10)} KB`,
      uploadDate: new Date().toISOString().split('T')[0],
      targetRole: targetTitle,
      summary: summary,
      experienceYears: experiences.length * 2,
      education: education[0]?.school || 'University Degree',
      skills: languages.split(',').concat(frameworks.split(',')).map((s) => s.trim()).filter(Boolean),
      content: fullResumeText,
      isDefault: existingResumes.length === 0,
    };

    onSaveResume(newResume);
    setSaveSuccessMessage('Saved to your Resume Library! Now accessible in Job Applications & ATS.');
    setTimeout(() => setSaveSuccessMessage(null), 4000);
  };

  // Action Verbs Bank
  const actionVerbsList = [
    { verb: 'Architected', cat: 'build', desc: 'Designed high-level system framework or infrastructure' },
    { verb: 'Engineered', cat: 'build', desc: 'Built a technical solution with precision' },
    { verb: 'Spearheaded', cat: 'lead', desc: 'Led a project or initiative from the front' },
    { verb: 'Optimized', cat: 'optimize', desc: 'Improved efficiency, speed, or performance' },
    { verb: 'Accelerated', cat: 'optimize', desc: 'Reduced time-to-completion or latency' },
    { verb: 'Streamlined', cat: 'optimize', desc: 'Removed redundancies and simplified workflow' },
    { verb: 'Orchestrated', cat: 'lead', desc: 'Coordinated complex cross-functional efforts' },
    { verb: 'Pioneered', cat: 'lead', desc: 'Introduced an entirely new technology or process' },
    { verb: 'Scaled', cat: 'grow', desc: 'Expanded capacity to support higher load or revenue' },
    { verb: 'Elevated', cat: 'grow', desc: 'Raised the quality, standard, or metric of output' },
    { verb: 'Decreased', cat: 'optimize', desc: 'Cut costs, errors, latency, or customer churn' },
    { verb: 'Automated', cat: 'optimize', desc: 'Replaced manual tasks with scripts or workflows' },
    { verb: 'Formulated', cat: 'design', desc: 'Created an actionable strategy or algorithmic model' },
    { verb: 'Delivered', cat: 'build', desc: 'Shipped production code on time and within scope' },
    { verb: 'Mentored', cat: 'lead', desc: 'Coached and leveled up peers or junior developers' },
    { verb: 'Overhauled', cat: 'optimize', desc: 'Completely reconstructed legacy code or systems' },
    { verb: 'Transformed', cat: 'lead', desc: 'Catalyzed deep positive structural change' },
    { verb: 'Constructed', cat: 'build', desc: 'Fabricated robust foundational software modules' },
  ];

  const filteredVerbs = actionVerbsList.filter((v) => {
    const matchCat = verbCategory === 'all' || v.cat === verbCategory;
    const matchSearch = v.verb.toLowerCase().includes(verbSearch.toLowerCase()) || 
                        v.desc.toLowerCase().includes(verbSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleCopyVerb = (verb: string) => {
    setSelectedVerb(verb);
    navigator.clipboard.writeText(verb);
    setCopiedVerb(verb);
    setTimeout(() => setCopiedVerb(null), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Masterclass Overview */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Resume Creator & ATS Rank Optimization Studio
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white font-display">
            Build an ATS-Dominant, High-Impact Resume
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
            Craft a clean, single-page resume using the <strong>Google X-Y-Z achievement formula</strong>, high-ranking power action verbs, and standard ATS formatting that gets past automated filters and captures recruiter attention in under 6 seconds.
          </p>
        </div>

        {/* Live Scorecard Mini Widget */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/15 flex items-center gap-4 shrink-0 shadow-lg">
          <div className="text-center">
            <div className={`text-2xl font-extrabold ${
              qualityAudit.score >= 85 ? 'text-emerald-400' : qualityAudit.score >= 70 ? 'text-blue-400' : 'text-amber-400'
            }`}>
              {qualityAudit.score}%
            </div>
            <div className="text-[10px] text-slate-300 uppercase font-semibold">ATS Rank Score</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div className="space-y-1 text-[11px] text-slate-200">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${qualityAudit.isOnePage ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span>{qualityAudit.wordCount} words ({qualityAudit.isOnePage ? '1-Page Target' : 'Needs trim'})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${qualityAudit.bulletsWithMetrics > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{qualityAudit.bulletsWithMetrics}/{qualityAudit.totalBullets} Metrics (X-Y-Z)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('builder')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'builder'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Interactive Resume Builder</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Resume Masterclass & Tips (5 Rules)</span>
          </button>

          <button
            onClick={() => setActiveTab('examples')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'examples'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Good vs. Bad Bullets</span>
          </button>

          <button
            onClick={() => setActiveTab('verbs')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'verbs'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Power Action Verbs Bank</span>
          </button>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {saveSuccessMessage && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {saveSuccessMessage}
            </span>
          )}

          <button
            type="button"
            onClick={handleLoadSampleTemplate}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
            title="Populate builder with high-impact senior engineer sample data"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Load Sample Template</span>
          </button>

          <button
            type="button"
            onClick={handleClearForm}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Reset all fields to a blank canvas"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear Form</span>
          </button>

          <button
            onClick={handleSaveToLibrary}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save to Library</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INTERACTIVE RESUME BUILDER + LIVE ATS PREVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Editor (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Section 1: Header & Clean Contact Details */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">1</span>
                  <h3 className="font-bold text-slate-900 text-sm">Header & Contact Information</h3>
                </div>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> ATS Anti-Bias Compliant (No Photo/Marital)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Alex Rivera"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-bold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Professional Title</label>
                  <input
                    type="text"
                    value={targetTitle}
                    onChange={(e) => setTargetTitle(e.target.value)}
                    placeholder="e.g. Senior Full-Stack Engineer"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex.rivera@example.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 234-5678"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">City, State / Country</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="text"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    placeholder="e.g. linkedin.com/in/alexrivera-dev"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">GitHub / Code Portfolio</label>
                  <input
                    type="text"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    placeholder="e.g. github.com/alexrivera"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Personal Portfolio / Website</label>
                  <input
                    type="text"
                    value={portfolio}
                    onChange={(e) => setPortfolio(e.target.value)}
                    placeholder="e.g. alexrivera.io"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Professional Summary (No Outdated "Objective") */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">2</span>
                  <h3 className="font-bold text-slate-900 text-sm">Professional Summary (2–3 Impact Lines)</h3>
                </div>
                <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full font-semibold border border-amber-200">
                  Tip: Replaces outdated "Objective"
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Front-load your years of experience, core specialization, primary tech stack, and greatest quantifiable career milestone.
              </p>
              <textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="e.g. Performance-driven Full-Stack Engineer with 5+ years of experience architecting high-throughput distributed web applications and modern React/Node.js systems. Proven track record of accelerating page load times by 40% and leading high-velocity agile sprints."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
              />
            </div>

            {/* Section 3: Interactive Google X-Y-Z Formula Bullet Builder */}
            <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/60 to-purple-50/40 rounded-2xl p-5 border border-indigo-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Google X-Y-Z Bullet Generator</h3>
                    <p className="text-[11px] text-indigo-700 font-medium">
                      "Accomplished [X] as measured by [Y], by doing [Z]"
                    </p>
                  </div>
                </div>

                <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded border border-indigo-300">
                  Recruiter Favorite
                </span>
              </div>

              {/* Action Verb Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">1. Select Strong Action Verb</label>
                <div className="flex flex-wrap gap-1.5">
                  {['Engineered', 'Architected', 'Spearheaded', 'Optimized', 'Accelerated', 'Automated', 'Scaled', 'Pioneered', 'Overhauled'].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSelectedVerb(v)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedVerb === v
                          ? 'bg-indigo-600 text-white shadow-2xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* X, Y, Z Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    [X] Accomplishment
                  </label>
                  <input
                    type="text"
                    value={xyzAccomplished}
                    onChange={(e) => setXyzAccomplished(e.target.value)}
                    placeholder="e.g. reduced checkout abandonment"
                    className="w-full px-2.5 py-2 bg-white border border-indigo-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    [Y] Metric / Measurement
                  </label>
                  <input
                    type="text"
                    value={xyzMeasured}
                    onChange={(e) => setXyzMeasured(e.target.value)}
                    placeholder="e.g. by 28% across 450k users"
                    className="w-full px-2.5 py-2 bg-white border border-indigo-200 rounded-lg text-slate-900 font-semibold text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    [Z] Method / Technology
                  </label>
                  <input
                    type="text"
                    value={xyzDoing}
                    onChange={(e) => setXyzDoing(e.target.value)}
                    placeholder="e.g. by re-architecting React state"
                    className="w-full px-2.5 py-2 bg-white border border-indigo-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Generated Bullet Preview */}
              <div className="p-3 bg-white rounded-xl border border-indigo-200 space-y-2">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Live Output Bullet:</div>
                <div className="text-xs text-slate-900 font-medium leading-relaxed">
                  • <span className="font-bold text-indigo-600">{selectedVerb}</span> {xyzAccomplished.trim()}{' '}
                  <span className="bg-emerald-50 text-emerald-800 font-bold px-1 rounded border border-emerald-200">
                    ({xyzMeasured.trim()})
                  </span>{' '}
                  {xyzDoing.trim()}.
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">Target Role:</span>
                    <select
                      value={xyzRoleIndex}
                      onChange={(e) => setXyzRoleIndex(Number(e.target.value))}
                      className="text-xs font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2 py-1"
                    >
                      {experiences.map((exp, i) => (
                        <option key={exp.id} value={i}>
                          {exp.role} @ {exp.company}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleApplyXyzBullet}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Insert Bullet to Experience
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: Work Experiences List */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">4</span>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Professional Experience ({experiences.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg flex items-center gap-1 border border-blue-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Position
                </button>
              </div>

              {experiences.length === 0 ? (
                <div className="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <FileText className="w-6 h-6 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-700">No work experience entries added yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    Add your work history in reverse-chronological order or load the sample template.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add First Position
                  </button>
                </div>
              ) : (
                experiences.map((exp, expIdx) => (
                  <div
                    key={exp.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">
                        Position #{expIdx + 1} (Reverse-Chronological)
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveExperience(exp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Remove this role"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Role Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[expIdx].role = e.target.value;
                            setExperiences(updated);
                          }}
                          placeholder="e.g. Senior Software Engineer"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[expIdx].company = e.target.value;
                            setExperiences(updated);
                          }}
                          placeholder="e.g. TechFlow Systems"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-700 mb-1">Location</label>
                        <input
                          type="text"
                          value={exp.location}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[expIdx].location = e.target.value;
                            setExperiences(updated);
                          }}
                          placeholder="e.g. San Francisco, CA"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                          <input
                            type="text"
                            placeholder="e.g. 2023-03"
                            value={exp.startDate}
                            onChange={(e) => {
                              const updated = [...experiences];
                              updated[expIdx].startDate = e.target.value;
                              setExperiences(updated);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block font-bold text-slate-700 mb-1">End Date</label>
                          <input
                            type="text"
                            placeholder="e.g. Present"
                            value={exp.endDate}
                            onChange={(e) => {
                              const updated = [...experiences];
                              updated[expIdx].endDate = e.target.value;
                              setExperiences(updated);
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Bullet Points */}
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">
                          Achievement Bullet Points ({exp.bullets.length})
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddBullet(expIdx)}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Add Bullet
                        </button>
                      </div>

                      {exp.bullets.map((bullet, bIdx) => {
                        const hasMetric = /(\d+%)|(\$\d+)|(\d+\+)|(\d+ms)|(\d+s)/i.test(bullet);
                        const isPassive = /responsible for|helped with|worked on/i.test(bullet);

                        return (
                          <div key={bIdx} className="space-y-1">
                            <div className="flex items-start gap-2">
                              <span className="text-slate-400 font-bold text-xs pt-1.5">•</span>
                              <textarea
                                rows={2}
                                value={bullet}
                                onChange={(e) => handleUpdateBullet(expIdx, bIdx, e.target.value)}
                                placeholder="e.g. Architected real-time WebSocket dashboard handling 25,000+ connections, reducing latency by 45%."
                                className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 leading-relaxed font-sans"
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveBullet(expIdx, bIdx)}
                                className="p-1 text-slate-400 hover:text-rose-600 pt-2"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            {isPassive && (
                              <p className="text-[10px] text-rose-600 font-bold pl-4 flex items-center gap-1">
                                <ShieldAlert className="w-2.5 h-2.5" /> Weak phrasing detected: Replace "Responsible for" with an active verb (e.g. Engineered, Spearheaded).
                              </p>
                            )}
                            {!hasMetric && !isPassive && (
                              <p className="text-[10px] text-amber-600 font-medium pl-4">
                                💡 Tip: Quantify this bullet with a metric (e.g., % improvement, $ saved, latency cut).
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Section 5: Technical Skills */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">5</span>
                  <h3 className="font-bold text-slate-900 text-sm">Categorized Technical Skills (ATS Keywords)</h3>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Languages</label>
                  <input
                    type="text"
                    value={languages}
                    onChange={(e) => setLanguages(e.target.value)}
                    placeholder="e.g. TypeScript, JavaScript, Python, SQL, HTML5, CSS3"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frameworks & Libraries</label>
                  <input
                    type="text"
                    value={frameworks}
                    onChange={(e) => setFrameworks(e.target.value)}
                    placeholder="e.g. React, Next.js, Node.js, Express, Tailwind CSS, GraphQL"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cloud, Database & Developer Tools</label>
                  <input
                    type="text"
                    value={cloudTools}
                    onChange={(e) => setCloudTools(e.target.value)}
                    placeholder="e.g. AWS (S3, Lambda), Docker, PostgreSQL, Redis, Git, GitHub Actions"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Architecture & Methodologies</label>
                  <input
                    type="text"
                    value={methodologies}
                    onChange={(e) => setMethodologies(e.target.value)}
                    placeholder="e.g. Agile/Scrum, CI/CD, Microservices, TDD, RESTful APIs"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Education */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">6</span>
                  <h3 className="font-bold text-slate-900 text-sm">Education & Credentials</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs rounded-lg flex items-center gap-1 border border-blue-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Education
                </button>
              </div>

              {education.length === 0 ? (
                <div className="text-center py-5 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">No education credentials added yet</p>
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Education Credential
                  </button>
                </div>
              ) : (
                education.map((edu, idx) => (
                  <div key={edu.id} className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="md:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">School / University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].school = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. University of California, Berkeley"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Graduation Year</label>
                      <input
                        type="text"
                        value={edu.graduationYear}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].graduationYear = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. 2022"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].degree = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. Bachelor of Science"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Major / Field</label>
                      <input
                        type="text"
                        value={edu.field}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[idx].field = e.target.value;
                          setEducation(updated);
                        }}
                        placeholder="e.g. Computer Science"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1">
                        <label className="block font-bold text-slate-700 mb-1">Honors / GPA</label>
                        <input
                          type="text"
                          value={edu.honors || ''}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[idx].honors = e.target.value;
                            setEducation(updated);
                          }}
                          placeholder="e.g. Dean's Honors List | GPA: 3.8"
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveEducation(edu.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 self-end mb-1 transition-colors"
                        title="Remove education"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Live ATS-Standard Paper Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4 sticky top-6">
            {/* Live ATS Quality Audit Header */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600" />
                  Live Resume Quality & ATS Score
                </span>
                <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  qualityAudit.score >= 85 ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {qualityAudit.score}/100 Match Readiness
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    qualityAudit.score >= 85 ? 'bg-emerald-500' : qualityAudit.score >= 70 ? 'bg-blue-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${qualityAudit.score}%` }}
                />
              </div>

              {/* Checklist items */}
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${qualityAudit.isOnePage ? 'text-emerald-600' : 'text-amber-500'}`} />
                  <span>1-Page Length ({qualityAudit.wordCount}w)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${qualityAudit.bulletsWithMetrics > 0 ? 'text-emerald-600' : 'text-rose-500'}`} />
                  <span>Quantified Metrics ({qualityAudit.bulletsWithMetrics})</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Summary (No Objective)</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Standard ATS Fonts</span>
                </div>
              </div>
            </div>

            {/* Simulated Clean ATS Document Canvas */}
            <div 
              id="printable-resume"
              className="bg-white rounded-2xl p-6 border border-slate-300 shadow-md font-sans text-slate-900 text-[11px] leading-relaxed space-y-4 max-h-[75vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="text-center border-b border-slate-300 pb-3 space-y-1">
                <h1 className="text-base font-extrabold uppercase tracking-wide text-slate-900 font-display">
                  {fullName || 'Your Full Name'}
                </h1>
                <p className="text-[10px] text-slate-600 font-medium">
                  {targetTitle} • {location} • {phone} • {email}
                </p>
                <p className="text-[9.5px] text-blue-800 font-mono">
                  {[linkedin, github, portfolio].filter(Boolean).join(' | ')}
                </p>
              </div>

              {/* Summary */}
              {summary && (
                <div className="space-y-1">
                  <h2 className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                    Professional Summary
                  </h2>
                  <p className="text-slate-700 text-[10px] text-justify leading-normal">
                    {summary}
                  </p>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-1">
                <h2 className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                  Technical Skills
                </h2>
                <div className="text-[9.5px] text-slate-700 space-y-0.5">
                  <div><strong>Languages:</strong> {languages}</div>
                  <div><strong>Frameworks:</strong> {frameworks}</div>
                  <div><strong>Cloud & Tools:</strong> {cloudTools}</div>
                  <div><strong>Methodologies:</strong> {methodologies}</div>
                </div>
              </div>

              {/* Experience */}
              <div className="space-y-2.5">
                <h2 className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                  Professional Experience
                </h2>
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline font-bold text-slate-900 text-[10px]">
                      <span>{exp.role} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                      <span className="text-[9.5px] text-slate-500 font-normal">{exp.startDate} – {exp.endDate} | {exp.location}</span>
                    </div>
                    <ul className="list-disc list-outside pl-3.5 text-[9.5px] text-slate-700 space-y-0.5">
                      {exp.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div className="space-y-1">
                <h2 className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-0.5">
                  Education
                </h2>
                {education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline text-[9.5px] text-slate-700">
                    <div>
                      <strong>{edu.degree} in {edu.field}</strong> — {edu.school}
                      {edu.honors && <span className="text-slate-500"> ({edu.honors})</span>}
                    </div>
                    <span className="font-mono text-slate-500">{edu.graduationYear}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MASTERCLASS & 5 TIPS GUIDE */}
      {/* ========================================================================= */}
      {activeTab === 'guide' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Rule 1 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Structure & Layout: The 1-Page Rule</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Unless you possess 10+ years of deep leadership or specialized principal experience, strictly limit your resume to <strong>one page</strong>. Recruiters spend an average of <strong>6 to 7.4 seconds</strong> on their initial scan.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-700 space-y-1 border border-slate-200">
                <div className="font-bold text-slate-900">ATS Formatting Best Practices:</div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0" /> Single-column layout (no complex multi-column sidebars)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0" /> Standard web fonts (Arial, Calibri, Helvetica, Inter)
                </div>
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Check className="w-3.5 h-3.5 shrink-0" /> Reverse-chronological order (most recent role first)
                </div>
              </div>
            </div>

            {/* Rule 2 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Bullet Points & Impact: Google X-Y-Z</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Never list mere job duties. Frame every bullet point around quantifiable results using Laszlo Bock's acclaimed Google formula:
              </p>
              <div className="p-3 bg-indigo-50/80 rounded-xl text-xs text-indigo-900 border border-indigo-200 font-medium">
                "Accomplished <span className="text-indigo-700 font-bold">[X]</span> as measured by <span className="text-emerald-700 font-bold">[Y]</span>, by doing <span className="text-purple-700 font-bold">[Z]</span>."
              </div>
              <p className="text-[11px] text-slate-500">
                Begin every single bullet with a high-impact action verb (e.g. <em>Architected, Spearheaded, Optimized</em>) instead of passive phrasing like <em>"Responsible for"</em>.
              </p>
            </div>

            {/* Rule 3 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Tailoring & Beating the ATS</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applicant Tracking Systems (Workday, Greenhouse, Taleo, Lever) parse and rank resumes based on keyword semantic overlap before human recruiters read them.
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl text-[11px] text-emerald-900 space-y-1.5 border border-emerald-200">
                <div className="font-bold">How to Rank in the Top 5%:</div>
                <div>• Mirror exact skill keywords from the job description (e.g., <em>TypeScript</em> vs <em>TS</em>).</div>
                <div>• Integrate hard skills directly into experience bullet points, not just in a detached skills list.</div>
              </div>
            </div>

            {/* Rule 4 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">What to Leave Out (Anti-Patterns)</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Remove fluff and irrelevant details that consume valuable single-page real estate or introduce unconscious bias:
              </p>
              <div className="space-y-1 text-[11px] text-rose-800">
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span><strong>No Objective Statement:</strong> Replace with a 2–3 line summary.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span><strong>No Personal Info:</strong> No photos, age, marital status, or full street addresses.</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                  <span><strong>No Irrelevant Jobs:</strong> Exclude unrelated high school or non-technical roles.</span>
                </div>
              </div>
            </div>

            {/* Rule 5 */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Final Polish & PDF Submission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A single grammatical error or broken layout sends your application to the discard pile.
              </p>
              <div className="p-3 bg-purple-50 rounded-xl text-[11px] text-purple-900 space-y-1 border border-purple-200">
                <div>• <strong>Read Backward:</strong> Proofread your bullet points from bottom to top to spot spelling typos.</div>
                <div>• <strong>Always Save as PDF:</strong> Preserves exact margins, font rendering, and line heights across Mac, Windows, and Linux.</div>
              </div>
            </div>

            {/* Rule 6: Pro Tip */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-200 shadow-xs space-y-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm">
                <Flame className="w-4 h-4 text-amber-600" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">A/B Testing Your Resumes</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Create 2 or 3 specialized versions in JobFlow (e.g. <em>Frontend Focused</em> vs <em>Full-Stack Lead</em>) and track their interview conversion rates in the <strong>Resume Tracker</strong> view!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: GOOD VS BAD BULLETS */}
      {/* ========================================================================= */}
      {activeTab === 'examples' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Good vs. Bad Bullet Points Transformations</h3>
              <p className="text-xs text-slate-500">
                See how passive job descriptions transform into high-impact Google X-Y-Z achievement statements.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  role: 'Frontend / Full-Stack Engineer',
                  bad: 'Responsible for building new features in React and fixing bugs.',
                  good: 'Engineered 14 modular React components and automated state tests, reducing checkout drop-off by 22% ($450k quarterly revenue).',
                },
                {
                  role: 'Backend & Infrastructure Engineer',
                  bad: 'Managed PostgreSQL database and maintained cloud servers on AWS.',
                  good: 'Optimized PostgreSQL index schemas and configured AWS auto-scaling clusters, cutting p99 server response time from 380ms to 65ms during peak traffic.',
                },
                {
                  role: 'Product / Engineering Lead',
                  bad: 'Helped team ship products faster and attended daily standups.',
                  good: 'Spearheaded agile CI/CD transformation across 8 engineers, elevating weekly release velocity by 65% and cutting regression bugs by 40%.',
                },
                {
                  role: 'Data Engineer / Analyst',
                  bad: 'Wrote SQL queries to generate dashboard reports for marketing.',
                  good: 'Architected automated Snowflake ELT pipelines processing 10M+ daily events, accelerating executive reporting speed by 4x.',
                },
              ].map((ex, i) => (
                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                  <div className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                    {ex.role}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-lg text-rose-900">
                      <div className="font-bold text-[10px] text-rose-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <ShieldAlert className="w-3 h-3 text-rose-600" />
                        Weak / Passive (Rejected by ATS)
                      </div>
                      <p className="italic">{ex.bad}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-emerald-900">
                      <div className="font-bold text-[10px] text-emerald-700 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Google X-Y-Z Masterclass Bullet
                      </div>
                      <p className="font-medium">{ex.good}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: POWER ACTION VERBS BANK */}
      {/* ========================================================================= */}
      {activeTab === 'verbs' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-500" />
                Power Action Verbs Bank ({actionVerbsList.length}+ curated verbs)
              </h3>
              <p className="text-xs text-slate-500">
                Click any verb to copy it or insert it directly into your bullet builder.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: 'all', label: 'All Verbs' },
                { id: 'lead', label: 'Leadership' },
                { id: 'build', label: 'Engineering & Build' },
                { id: 'optimize', label: 'Optimization & Speed' },
                { id: 'grow', label: 'Growth & Scale' },
                { id: 'design', label: 'Design & Strategy' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setVerbCategory(c.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                    verbCategory === c.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div>
            <input
              type="text"
              placeholder="Search action verbs by keyword or meaning..."
              value={verbSearch}
              onChange={(e) => setVerbSearch(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Verbs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredVerbs.map((v) => (
              <div
                key={v.verb}
                onClick={() => handleCopyVerb(v.verb)}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between group text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 group-hover:text-blue-700 flex items-center gap-1.5">
                    {v.verb}
                    {copiedVerb === v.verb && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Copied!
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500">{v.desc}</div>
                </div>
                <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
