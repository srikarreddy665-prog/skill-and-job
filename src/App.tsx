import React, { useState, useEffect } from 'react';
import { TopNav, ActiveTab } from './components/TopNav.tsx';
import { DashboardHome } from './components/DashboardHome.tsx';
import { AssessmentRoom } from './components/AssessmentRoom.tsx';
import { JobInsights } from './components/JobInsights.tsx';
import { UpskillingCoach } from './components/UpskillingCoach.tsx';
import { AdvisorChat } from './components/AdvisorChat.tsx';
import { NewAssessmentModal } from './components/NewAssessmentModal.tsx';
import { ExportReportModal } from './components/ExportReportModal.tsx';
import { LinkedInConnectModal, LinkedInImportData } from './components/LinkedInConnectModal.tsx';
import { ToastContainer, ToastMessage } from './components/Toast.tsx';
import {
  AssessmentDomain,
  AssessmentSession,
  JobMatchResult,
  RoadmapModule,
  SkillProfile,
} from './types/index.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [session, setSession] = useState<AssessmentSession | null>(null);
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [jobMatches, setJobMatches] = useState<JobMatchResult[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('skillpulse-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('skillpulse-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const addToast = (type: 'success' | 'info' | 'warning' | 'error', message: string, title?: string) => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random()}`,
      type,
      title,
      message,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initialize by fetching current demo/default session
  useEffect(() => {
    async function loadInitialSession() {
      try {
        setIsLoading(true);
        const res = await fetch('/api/sessions');
        const data = await res.json();
        const firstSessionId = data.sessions?.[0]?.sessionId || 'session-demo-01';

        const detailRes = await fetch(`/api/sessions/${firstSessionId}`);
        if (detailRes.ok) {
          const detail = await detailRes.json();
          setSession(detail.session);
          setProfile(detail.profile);
          setJobMatches(detail.jobMatches || []);
          setRoadmap(detail.roadmap || []);
        }
      } catch (err) {
        console.error('Failed to load initial session data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialSession();
  }, []);

  // Handler: Start a new diagnostic assessment session
  const handleStartNewAssessment = async (params: {
    domain: AssessmentDomain;
    targetRoleTitle: string;
    candidateSummary: string;
    maxTurns: number;
  }) => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/test/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) throw new Error('Failed to start assessment');
      const data = await res.json();
      setSession(data.session);
      setActiveTab('assessment');
      addToast('success', `Diagnostic session initialized for ${params.domain}. Turn #1 ready.`, 'Assessment Started');
    } catch (err) {
      console.error(err);
      addToast('error', 'Error starting assessment. Please verify backend service.', 'Session Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Submit a turn in the assessment room
  const handleSubmitTurn = async (answer: string, codeAnswer?: string) => {
    if (!session) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/test/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          userAnswer: answer,
          userCodeAnswer: codeAnswer,
        }),
      });

      if (!res.ok) throw new Error('Failed to evaluate turn');
      const data = await res.json();
      setSession(data.session);
      addToast('info', 'Turn recorded and reasoning evaluated by diagnostic agent.', 'Turn Calibrated');
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to submit answer turn. Please retry.', 'Network Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Complete turns and generate Skill Matrix
  const handleCompleteAndEvaluate = async () => {
    if (!session) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/test/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: session.sessionId }),
      });

      if (!res.ok) throw new Error('Evaluation failed');
      const data = await res.json();
      setProfile(data.profile);
      setJobMatches(data.jobMatches || []);
      setRoadmap(data.roadmap || []);
      setSession(data.session);
      setActiveTab('dashboard');
      addToast('success', 'Multi-dimensional Skill Matrix and Job Match calculated!', 'Evaluation Complete');
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to evaluate transcript. Please check backend logs.', 'Evaluation Error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Submit re-test challenge in coach
  const handleSubmitReTest = async (moduleId: string, submission: string) => {
    if (!session) return;
    try {
      setIsLoading(true);
      const res = await fetch('/api/roadmap/retest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          moduleId,
          submission,
        }),
      });

      if (!res.ok) throw new Error('Re-test evaluation failed');
      const data = await res.json();
      if (data.updatedProfile) setProfile(data.updatedProfile);
      if (data.updatedJobMatches) setJobMatches(data.updatedJobMatches);
      if (data.updatedRoadmap) setRoadmap(data.updatedRoadmap);
      addToast('success', 'Skill score elevated and Job Match recalculated!', 'Competency Verified');
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handler: Update module milestone date and reminder
  const handleUpdateMilestone = async (
    moduleId: string,
    targetDate: string,
    reminderEmail: string,
    reminderEnabled: boolean
  ) => {
    if (!session) return;
    try {
      const res = await fetch('/api/milestones/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: session.sessionId,
          moduleId,
          targetDate,
          reminderEmail,
          reminderEnabled,
        }),
      });

      if (!res.ok) throw new Error('Failed to update milestone');
      const data = await res.json();
      if (data.roadmap) setRoadmap(data.roadmap);
      addToast('success', 'Milestone target deadline updated successfully.', 'Pacing Saved');
    } catch (err) {
      console.error(err);
      addToast('error', 'Failed to update milestone deadline.', 'Update Error');
    }
  };

  // Handler: Process imported LinkedIn profile
  const handleLinkedInProfileImport = (data: LinkedInImportData) => {
    if (session) {
      setSession({
        ...session,
        domain: data.detectedDomain,
        targetRoleTitle: data.targetRoleTitle,
        candidateSummary: `${data.candidateSummary} Skills: ${data.extractedSkillSet.join(', ')}`,
      });
    }

    if (profile) {
      setProfile({
        ...profile,
        overallReadinessTier: data.targetRoleTitle,
        domain: data.detectedDomain,
      });
    }

    addToast(
      'success',
      `Imported: ${data.profile.currentRole}. Extracted ${data.extractedSkillSet.length} skills.`,
      'LinkedIn Profile Connected'
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Strict 3-Zone Top Navigation with Mobile Drawer */}
      <TopNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewAssessment={() => setIsModalOpen(true)}
        isEvaluating={isLoading}
        domainName={profile?.domain || session?.domain}
        turnsCount={session?.transcript?.length || 0}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Viewport Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {activeTab === 'dashboard' && (
          <DashboardHome
            profile={profile}
            jobMatches={jobMatches}
            roadmap={roadmap}
            sessionId={session?.sessionId}
            onNavigateToTab={setActiveTab}
            onOpenNewAssessment={() => setIsModalOpen(true)}
            onOpenExportReport={() => setIsExportModalOpen(true)}
            onOpenLinkedInConnect={() => setIsLinkedInModalOpen(true)}
            onUpdateMilestone={handleUpdateMilestone}
          />
        )}

        {activeTab === 'assessment' && (
          <AssessmentRoom
            session={session}
            onSubmitTurn={handleSubmitTurn}
            onCompleteAndEvaluate={handleCompleteAndEvaluate}
            onStartNewAssessment={() => setIsModalOpen(true)}
            onOpenExportReport={() => setIsExportModalOpen(true)}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'jobs' && (
          <JobInsights
            jobMatches={jobMatches}
            profile={profile}
            onNavigateToCoach={() => setActiveTab('coach')}
          />
        )}

        {activeTab === 'coach' && (
          <UpskillingCoach
            roadmap={roadmap}
            profile={profile}
            onSubmitReTest={handleSubmitReTest}
            isLoading={isLoading}
            onNavigateToDashboard={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'advisor' && (
          <AdvisorChat
            profile={profile}
            sessionId={session?.sessionId}
          />
        )}
      </main>

      {/* Launch Assessment Modal */}
      <NewAssessmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onStartAssessment={handleStartNewAssessment}
        isLoading={isLoading}
      />

      {/* Export PDF Report Modal */}
      <ExportReportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        profile={profile}
        session={session}
        jobMatches={jobMatches}
      />

      {/* LinkedIn Connect Modal */}
      <LinkedInConnectModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
        onProfileImported={handleLinkedInProfileImport}
      />

      {/* Global Floating Toast Notifications Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Editorial Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0c111d] py-6 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">SkillPulse</span>
            <span className="text-slate-400 dark:text-slate-600">·</span>
            <span>Agentic AI Skill & Job Analysis Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <button className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => setActiveTab('dashboard')}>
              Dashboard
            </button>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <button className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => setActiveTab('assessment')}>
              Assessment Room
            </button>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <button className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => setActiveTab('jobs')}>
              Job Matching
            </button>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <button className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => setActiveTab('coach')}>
              Upskilling Coach
            </button>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
            <button className="cursor-pointer hover:text-slate-900 dark:hover:text-slate-200 transition-colors" onClick={() => setActiveTab('advisor')}>
              AI Advisor
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
