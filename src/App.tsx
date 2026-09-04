import React, { useState, useEffect, useMemo } from 'react';
import { 
  JobApplication, 
  JobStage, 
  Priority, 
  WorkplaceType, 
  ViewMode,
  ResumeItem,
  UserProfile,
  UserGoals
} from './types';
import { INITIAL_JOBS } from './data/initialJobs';
import { INITIAL_RESUMES } from './data/initialResumes';
import { 
  loadStoredJobs, 
  saveStoredJobs, 
  loadStoredResumes, 
  saveStoredResumes,
  loadStoredUserProfile,
  saveStoredUserProfile,
  loadStoredUserGoals,
  saveStoredUserGoals
} from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricsBar } from './components/MetricsBar';
import { UpcomingReminders } from './components/UpcomingReminders';
import { FilterBar } from './components/FilterBar';
import { KanbanBoard } from './components/KanbanBoard';
import { JobTableView } from './components/JobTableView';
import { AnalyticsView } from './components/AnalyticsView';
import { OfferComparisonView } from './components/OfferComparisonView';
import { ResumePerformanceView } from './components/ResumePerformanceView';
import { AtsCalculatorView } from './components/AtsCalculatorView';
import { ResumeBuilderView } from './components/ResumeBuilderView';
import { JobModal } from './components/JobModal';
import { JobDetailDrawer } from './components/JobDetailDrawer';
import { AiCoachModal } from './components/AiCoachModal';
import { GoalsModal } from './components/GoalsModal';
import { ProfileModal } from './components/ProfileModal';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  // Main jobs and resumes state
  const [jobs, setJobs] = useState<JobApplication[]>(() => loadStoredJobs());
  const [resumes, setResumes] = useState<ResumeItem[]>(() => loadStoredResumes());
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('kanban');

  // User profile and goals state
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadStoredUserProfile());
  const [userGoals, setUserGoals] = useState<UserGoals>(() => loadStoredUserGoals());
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Pre-selected parameters for ATS calculator view
  const [atsPreselectedResumeId, setAtsPreselectedResumeId] = useState<string | undefined>(undefined);
  const [atsPreselectedJobId, setAtsPreselectedJobId] = useState<string | undefined>(undefined);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStage, setSelectedStage] = useState<JobStage | 'all' | 'active'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceType | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');

  // Drawer & Modal states
  const [activeDrawerJobId, setActiveDrawerJobId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalJob, setModalJob] = useState<JobApplication | null>(null);
  const [modalDefaultStage, setModalDefaultStage] = useState<JobStage>('applied');
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);

  // Save to localStorage whenever jobs, resumes, userProfile, or userGoals change
  useEffect(() => {
    saveStoredJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    saveStoredResumes(resumes);
  }, [resumes]);

  useEffect(() => {
    saveStoredUserProfile(userProfile);
  }, [userProfile]);

  useEffect(() => {
    saveStoredUserGoals(userGoals);
  }, [userGoals]);

  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
  };

  const handleUpdateGoals = (updated: UserGoals) => {
    setUserGoals(updated);
  };

  const handleLogout = () => {
    setUserProfile((prev) => ({
      ...prev,
      isLoggedIn: false,
    }));
  };

  const handleLogin = (email: string, name: string) => {
    setUserProfile((prev) => ({
      ...prev,
      email,
      name,
      isLoggedIn: true,
    }));
  };

  // Extract all distinct tags
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => j.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [jobs]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCompany = job.company.toLowerCase().includes(q);
        const matchRole = job.role.toLowerCase().includes(q);
        const matchNotes = job.notes?.toLowerCase().includes(q);
        const matchLocation = job.location?.toLowerCase().includes(q);
        const matchTags = job.tags?.some((t) => t.toLowerCase().includes(q));
        const matchResume = job.resumeVersion?.toLowerCase().includes(q);
        const matchInterviewers = job.interviews?.some((i) => 
          i.interviewer?.toLowerCase().includes(q) || i.stageName.toLowerCase().includes(q)
        );
        if (!matchCompany && !matchRole && !matchNotes && !matchLocation && !matchTags && !matchInterviewers && !matchResume) {
          return false;
        }
      }

      // 2. Stage Filter
      if (selectedStage !== 'all') {
        if (selectedStage === 'active') {
          if (['rejected', 'withdrawn', 'wishlist'].includes(job.stage)) return false;
        } else if (job.stage !== selectedStage) {
          return false;
        }
      }

      // 3. Priority Filter
      if (selectedPriority !== 'all' && job.priority !== selectedPriority) {
        return false;
      }

      // 4. Workplace Filter
      if (selectedWorkplace !== 'all' && job.workplaceType !== selectedWorkplace) {
        return false;
      }

      // 5. Tag Filter
      if (selectedTag !== 'all' && !job.tags?.includes(selectedTag)) {
        return false;
      }

      return true;
    });
  }, [jobs, searchQuery, selectedStage, selectedPriority, selectedWorkplace, selectedTag]);

  // Handlers for Jobs
  const handleAddOrUpdateJob = (jobToSave: JobApplication) => {
    setJobs((prev) => {
      const exists = prev.some((j) => j.id === jobToSave.id);
      if (exists) {
        return prev.map((j) => (j.id === jobToSave.id ? jobToSave : j));
      }
      return [jobToSave, ...prev];
    });
  };

  const handleDeleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (activeDrawerJobId === id) {
      setActiveDrawerJobId(null);
    }
  };

  const handleBatchDelete = (ids: string[]) => {
    setJobs((prev) => prev.filter((j) => !ids.includes(j.id)));
  };

  const handleBatchUpdateStage = (ids: string[], newStage: JobStage) => {
    const today = new Date().toISOString().split('T')[0];
    setJobs((prev) =>
      prev.map((j) => (ids.includes(j.id) ? { ...j, stage: newStage, lastActivityDate: today } : j))
    );
  };

  const handleQuickMoveStage = (jobId: string, newStage: JobStage) => {
    const today = new Date().toISOString().split('T')[0];
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, stage: newStage, lastActivityDate: today } : j))
    );
  };

  const handleUpdateRating = (jobId: string, rating: number) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, rating } : j))
    );
  };

  const handleMarkInterviewComplete = (jobId: string, interviewId: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id !== jobId) return j;
        const updatedInterviews = j.interviews.map((i) =>
          i.id === interviewId ? { ...i, completed: true } : i
        );
        return {
          ...j,
          interviews: updatedInterviews,
          lastActivityDate: new Date().toISOString().split('T')[0],
        };
      })
    );
  };

  // Handlers for Resumes
  const handleAddResume = (resume: ResumeItem) => {
    setResumes((prev) => [resume, ...prev]);
  };

  const handleUpdateResume = (resume: ResumeItem) => {
    setResumes((prev) => prev.map((r) => (r.id === resume.id ? resume : r)));
  };

  const handleDeleteResume = (id: string) => {
    setResumes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleOpenNewModal = (defaultStage: JobStage = 'applied') => {
    setModalJob(null);
    setModalDefaultStage(defaultStage);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (job: JobApplication) => {
    setModalJob(job);
    setIsModalOpen(true);
  };

  const handleNavigateToAts = (resumeId?: string, jobId?: string) => {
    setAtsPreselectedResumeId(resumeId);
    setAtsPreselectedJobId(jobId);
    setViewMode('ats-calculator');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStage('all');
    setSelectedPriority('all');
    setSelectedWorkplace('all');
    setSelectedTag('all');
  };

  const handleResetDemoData = () => {
    setJobs(INITIAL_JOBS);
    saveStoredJobs(INITIAL_JOBS);
    setResumes(INITIAL_RESUMES);
    saveStoredResumes(INITIAL_RESUMES);
  };

  const activeDrawerJob = jobs.find((j) => j.id === activeDrawerJobId) || null;

  return (
    <div className="h-screen w-full flex bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* High Density Left Sidebar (Desktop & Mobile Drawer) */}
      <Sidebar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        jobs={jobs}
        resumes={resumes}
        onOpenNewJobModal={() => handleOpenNewModal('applied')}
        onOpenAiDraftModal={() => setIsAiCoachOpen(true)}
        goals={userGoals}
        onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <Header
          viewMode={viewMode}
          onOpenNewJobModal={() => handleOpenNewModal('applied')}
          jobs={jobs}
          onImportJobs={(imported) => setJobs(imported)}
          onResetDemoData={handleResetDemoData}
          onOpenAiDraftModal={() => setIsAiCoachOpen(true)}
          userProfile={userProfile}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
          onLogout={handleLogout}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable Dashboard View Body */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            {/* Top 4-Column Metric Summary (Show on Kanban, Table, Offers, Analytics) */}
            {viewMode !== 'resumes' && viewMode !== 'ats-calculator' && viewMode !== 'builder' && (
              <>
                <MetricsBar
                  jobs={jobs}
                  activeFilter={selectedStage === 'active' ? 'active' : selectedStage === 'offer' ? 'offer' : selectedStage === 'interview' ? 'interview' : null}
                  onFilterChange={(stageKey) => {
                    if (stageKey === 'active') setSelectedStage('active');
                    else if (stageKey === 'offer') setSelectedStage('offer');
                    else if (stageKey === 'interview') setSelectedStage('interview');
                    else setSelectedStage('all');
                  }}
                />

                {/* Up Next & Career Coach AI Banner */}
                <UpcomingReminders
                  jobs={jobs}
                  onSelectJob={(job) => setActiveDrawerJobId(job.id)}
                  onMarkInterviewComplete={handleMarkInterviewComplete}
                  onOpenAiDraft={() => setIsAiCoachOpen(true)}
                />
              </>
            )}

            {/* Filter Bar (for Kanban & Table) */}
            {(viewMode === 'kanban' || viewMode === 'table') && (
              <FilterBar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedStage={selectedStage}
                onStageChange={setSelectedStage}
                selectedPriority={selectedPriority}
                onPriorityChange={setSelectedPriority}
                selectedWorkplace={selectedWorkplace}
                onWorkplaceChange={setSelectedWorkplace}
                selectedTag={selectedTag}
                onTagChange={setSelectedTag}
                availableTags={availableTags}
                totalFiltered={filteredJobs.length}
                totalAll={jobs.length}
                onResetFilters={handleResetFilters}
              />
            )}

            {/* View Switcher Output */}
            {viewMode === 'kanban' && (
              <KanbanBoard
                jobs={filteredJobs}
                onSelectJob={(job) => setActiveDrawerJobId(job.id)}
                onQuickMoveStage={handleQuickMoveStage}
                onAddNewInStage={(stg) => handleOpenNewModal(stg)}
              />
            )}

            {viewMode === 'table' && (
              <JobTableView
                jobs={filteredJobs}
                onSelectJob={(job) => setActiveDrawerJobId(job.id)}
                onEditJob={handleOpenEditModal}
                onDeleteJob={handleDeleteJob}
                onUpdateStage={handleQuickMoveStage}
                onUpdateRating={handleUpdateRating}
                onBatchDelete={handleBatchDelete}
                onBatchUpdateStage={handleBatchUpdateStage}
              />
            )}

            {viewMode === 'resumes' && (
              <ResumePerformanceView
                resumes={resumes}
                jobs={jobs}
                onAddResume={handleAddResume}
                onUpdateResume={handleUpdateResume}
                onDeleteResume={handleDeleteResume}
                onTestWithAts={(resId) => handleNavigateToAts(resId)}
                onSelectJob={(job) => setActiveDrawerJobId(job.id)}
                onNavigateToBuilder={() => setViewMode('builder')}
              />
            )}

            {viewMode === 'builder' && (
              <ResumeBuilderView
                onSaveResume={(newRes) => {
                  handleAddResume(newRes);
                }}
                onNavigateToAts={(resId) => handleNavigateToAts(resId)}
                existingResumes={resumes}
              />
            )}

            {viewMode === 'ats-calculator' && (
              <AtsCalculatorView
                resumes={resumes}
                jobs={jobs}
                initialResumeId={atsPreselectedResumeId}
                initialJobId={atsPreselectedJobId}
                onSaveAtsScoreToJob={(jobId, score, result) => {
                  setJobs((prev) =>
                    prev.map((j) =>
                      j.id === jobId
                        ? { ...j, atsScore: score, atsMatchResult: result }
                        : j
                    )
                  );
                }}
                onOpenJobModal={(job) => handleOpenEditModal(job)}
              />
            )}

            {viewMode === 'analytics' && (
              <AnalyticsView 
                jobs={jobs} 
                goals={userGoals}
                onOpenGoalsModal={() => setIsGoalsModalOpen(true)}
              />
            )}

            {viewMode === 'offers' && (
              <OfferComparisonView
                jobs={jobs}
                onAcceptOffer={(job) => {
                  handleQuickMoveStage(job.id, 'offer');
                }}
                onSelectJob={(job) => setActiveDrawerJobId(job.id)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onOpenNewJobModal={() => handleOpenNewModal('applied')}
        onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
        activeJobsCount={jobs.length}
      />

      {/* Slide-over Detail Drawer */}
      <JobDetailDrawer
        job={activeDrawerJob}
        isOpen={Boolean(activeDrawerJobId)}
        onClose={() => setActiveDrawerJobId(null)}
        onUpdateJob={handleAddOrUpdateJob}
        onEditJob={(job) => {
          setActiveDrawerJobId(null);
          handleOpenEditModal(job);
        }}
        onDeleteJob={handleDeleteJob}
        resumes={resumes}
        onNavigateToAts={handleNavigateToAts}
        onNavigateToResumes={() => setViewMode('resumes')}
      />

      {/* Add / Edit Job Modal */}
      <JobModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleAddOrUpdateJob}
        initialJob={modalJob}
        defaultStage={modalDefaultStage}
        defaultCurrency={userGoals.salaryCurrency || 'USD'}
        resumes={resumes}
        onAddResume={handleAddResume}
        onOpenAtsCalculator={handleNavigateToAts}
      />

      {/* Career Coach AI Assistant Modal */}
      <AiCoachModal
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        jobs={jobs}
      />

      {/* Monthly Goals & Search Targets Modal */}
      <GoalsModal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        goals={userGoals}
        onSaveGoals={handleUpdateGoals}
        jobs={jobs}
      />

      {/* User Profile & Photo & Auth Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userProfile={userProfile}
        profile={userProfile}
        onSaveProfile={handleUpdateProfile}
        onLogout={handleLogout}
        onLogin={handleLogin}
        onOpenGoalsModal={() => {
          setIsProfileModalOpen(false);
          setIsGoalsModalOpen(true);
        }}
      />
    </div>
  );
}
