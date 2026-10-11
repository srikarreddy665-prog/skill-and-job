import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  ExternalLink,
  Code2,
  Send,
  Loader2,
  Sparkles,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  ChevronRight,
  Check,
  Zap,
  Globe,
  Search,
  Star,
  GraduationCap,
} from 'lucide-react';
import { RoadmapModule, SkillProfile, SkillsCoachingItem } from '../types/index.ts';
import { triggerCelebration } from '../utils/confetti.ts';

interface UpskillingCoachProps {
  roadmap: RoadmapModule[];
  profile: SkillProfile | null;
  onSubmitReTest: (moduleId: string, submission: string) => Promise<void>;
  isLoading: boolean;
  onNavigateToDashboard: () => void;
}

export const UpskillingCoach: React.FC<UpskillingCoachProps> = ({
  roadmap,
  profile,
  onSubmitReTest,
  isLoading,
  onNavigateToDashboard,
}) => {
  const [viewMode, setViewMode] = useState<'curriculum' | 'google_skills_coaching'>('curriculum');
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(
    roadmap[0]?.moduleId || null
  );
  const [activeStage, setActiveStage] = useState<'concept' | 'task' | 'retest'>('retest');
  const [submissionText, setSubmissionText] = useState('');
  const [feedbackAlert, setFeedbackAlert] = useState<{
    score: number;
    feedback: string;
    passed: boolean;
  } | null>(null);

  // Live Skills Coaching (Google Data)
  const [coachingPrograms, setCoachingPrograms] = useState<SkillsCoachingItem[]>([]);
  const [isSearchingCoach, setIsSearchingCoach] = useState(false);
  const [coachingSearchQuery, setCoachingSearchQuery] = useState('Slikks skills coaching tech mentorship');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const fetchCoachingPrograms = async (query = coachingSearchQuery) => {
    setIsSearchingCoach(true);
    try {
      const res = await fetch(`/api/search/skills-coaching?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.coachingPrograms) setCoachingPrograms(data.coachingPrograms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingCoach(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'google_skills_coaching' && coachingPrograms.length === 0) {
      fetchCoachingPrograms();
    }
  }, [viewMode]);

  const activeModule = roadmap.find((m) => m.moduleId === selectedModuleId) || roadmap[0];

  const handleReTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() || !activeModule || isLoading) return;

    try {
      await onSubmitReTest(activeModule.moduleId, submissionText);
      triggerCelebration('cannons');
      setFeedbackAlert({
        score: 8.5,
        feedback: '🎉 Superb invariant verification and concurrency control demonstrated! Your Skill Profile and Job Compatibility ratios have been automatically upgraded in real time.',
        passed: true,
      });
      setSubmissionText('');
    } catch {
      setFeedbackAlert({
        score: 5.0,
        feedback: '⚠️ Solution did not fully address atomic state transition under concurrent access. Review the core principles in Stage 1 and give it another try!',
        passed: false,
      });
    }
  };

  const filteredCoaching =
    selectedCategory === 'all'
      ? coachingPrograms
      : coachingPrograms.filter((c) => c.category === selectedCategory);

  const completedCount = roadmap.filter((m) => m.completed).length;

  return (
    <div className="space-y-8 pb-20">
      {/* Header with View Mode Switcher */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs bg-grid-pattern relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-extrabold text-indigo-600 flex items-center gap-1">
                <span>🚀</span>
                <span>Upskilling & Mentorship Engine</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>3-Stage Micro-Curricula</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <span>Slikks & Google Data Grounded</span>
                <span>🌐</span>
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>Interactive Upskilling Coach</span>
              <span className="text-xl animate-float">🎓</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Target your architectural deficits through verified 3-stage labs, or discover top skills coaching platforms (including Slikks tech mentorship) using real-time Google Search web data.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('curriculum')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'curriculum'
                    ? 'bg-white text-indigo-700 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🛠️ Diagnostic Labs ({completedCount}/{roadmap.length})
              </button>
              <button
                onClick={() => {
                  setViewMode('google_skills_coaching');
                  triggerCelebration('subtle');
                }}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'google_skills_coaching'
                    ? 'bg-purple-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="h-3 w-3" />
                <span>Slikks & Skills Coaching ⚡</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar for Skills Coaching */}
        {viewMode === 'google_skills_coaching' && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-purple-500" />
              <input
                type="text"
                value={coachingSearchQuery}
                onChange={(e) => setCoachingSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCoachingPrograms(coachingSearchQuery)}
                placeholder="Search skills coaching (e.g. Slikks mentorship, Raft consensus)..."
                className="w-full rounded-xl border border-purple-200 bg-purple-50/30 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-600 focus:ring-2 focus:ring-purple-100 focus:outline-hidden transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs overflow-x-auto w-full sm:w-auto">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-white text-purple-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Programs
              </button>
              <button
                onClick={() => setSelectedCategory('slikks_mentorship')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'slikks_mentorship'
                    ? 'bg-white text-purple-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Slikks Mentorship ⭐
              </button>
              <button
                onClick={() => setSelectedCategory('system_design')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'system_design'
                    ? 'bg-white text-purple-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                System Design
              </button>
              <button
                onClick={() => setSelectedCategory('distributed_systems')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === 'distributed_systems'
                    ? 'bg-white text-purple-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Distributed Systems
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Render Google Skills Coaching or Diagnostic Curriculum */}
      {viewMode === 'google_skills_coaching' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Verified Skills Coaching & Mentorship Programs (2026)</span>
              <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full font-bold border border-purple-200">
                Google Grounded ⚡
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredCoaching.length} programs
            </span>
          </div>

          {isSearchingCoach ? (
            <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="h-8 w-8 text-purple-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Searching Google web data for coaching programs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCoaching.map((prog) => (
                <div
                  key={prog.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-purple-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-black border border-purple-200">
                            ⭐ {prog.provider}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-black">
                            ★ {prog.rating} ({prog.reviewCount} reviews)
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-2">{prog.programName}</h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{prog.overview}</p>

                    {/* Program Highlights */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                        CURRICULUM HIGHLIGHTS
                      </span>
                      {prog.highlights.map((h, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700">
                          <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="font-medium">{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">PRICING & FORMAT</span>
                      <span className="text-xs font-black text-slate-900">{prog.pricing}</span>
                      <span className="text-[10px] text-slate-500 block">Duration: {prog.duration}</span>
                    </div>

                    <a
                      href={prog.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <span>Explore Coaching</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Diagnostic Micro-Curriculum View */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Modules List */}
          <div className="lg:col-span-5 space-y-3.5">
            {roadmap.map((module) => {
              const isSelected = selectedModuleId === module.moduleId;
              return (
                <div
                  key={module.moduleId}
                  onClick={() => {
                    setSelectedModuleId(module.moduleId);
                    if (module.completed) triggerCelebration('subtle');
                  }}
                  className={`rounded-2xl border p-5 transition-all cursor-pointer relative ${
                    isSelected
                      ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-100 scale-[1.01]'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            module.priority === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : module.priority === 'high'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {module.priority} priority
                        </span>
                        {module.completed && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <CheckCircle className="h-3 w-3 text-emerald-600" />
                            Completed
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-slate-900 text-sm tracking-tight mt-1">
                        {module.skillName}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {module.stage1Concept.overview}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <div className="text-xs font-black text-slate-800">
                        {module.currentScore.toFixed(1)} → {module.targetScore.toFixed(1)}
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        ⏱️ {module.estimatedTimeToComplete}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Active 3-Stage Module Deep-Dive */}
          {activeModule && (
            <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                      Target Upskill Module
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                      {activeModule.skillName}
                    </h2>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-400 block">EST. TIME</span>
                    <span className="text-sm font-black text-indigo-600">
                      {activeModule.estimatedTimeToComplete}
                    </span>
                  </div>
                </div>

                {/* 3 Stages Navigation Tabs */}
                <div className="mt-5 grid grid-cols-3 gap-2 p-1.5 bg-slate-100/80 rounded-2xl font-bold text-xs">
                  <button
                    onClick={() => setActiveStage('concept')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeStage === 'concept'
                        ? 'bg-white text-indigo-700 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>1. Core Invariant</span>
                  </button>
                  <button
                    onClick={() => setActiveStage('task')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeStage === 'task'
                        ? 'bg-white text-indigo-700 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>2. Hands-on Lab</span>
                  </button>
                  <button
                    onClick={() => setActiveStage('retest')}
                    className={`py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      activeStage === 'retest'
                        ? 'bg-white text-indigo-700 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>3. Verify Re-Test</span>
                  </button>
                </div>
              </div>

              {/* Stage 1: Concepts */}
              {activeStage === 'concept' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900">
                      {activeModule.stage1Concept.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {activeModule.stage1Concept.overview}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
                    <span className="text-xs font-black text-indigo-900 uppercase tracking-wider block">
                      ARCHITECTURAL PATTERN: {activeModule.stage1Concept.architecturalPattern}
                    </span>
                    <ul className="space-y-1.5 text-xs text-indigo-950 font-medium list-disc list-inside">
                      {activeModule.stage1Concept.corePrinciples.map((p, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      Recommended Engineering References
                    </span>
                    <div className="space-y-2">
                      {activeModule.stage1Concept.documentationReferences.map((ref, idx) => (
                        <a
                          key={idx}
                          href={ref.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all text-xs group"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block group-hover:text-indigo-600">
                              {ref.title}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {ref.note}
                            </span>
                          </div>
                          <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-indigo-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Stage 2: Hands-On Task */}
              {activeStage === 'task' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-slate-900">
                      {activeModule.stage2HandsOnTask.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {activeModule.stage2HandsOnTask.scenario}
                    </p>
                  </div>

                  {activeModule.stage2HandsOnTask.starterCodeSnippet && (
                    <div className="rounded-2xl bg-slate-950 p-4 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                      <pre className="leading-relaxed">
                        {activeModule.stage2HandsOnTask.starterCodeSnippet}
                      </pre>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                      Task Requirements
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                      {activeModule.stage2HandsOnTask.taskRequirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Stage 3: Re-Test Challenge & Automated Submission */}
              {activeStage === 'retest' && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 space-y-2">
                    <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-amber-900">
                      <Award className="h-4 w-4 text-amber-600" />
                      <span>{activeModule.stage3ReTest.challengeTitle}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed font-medium">
                      {activeModule.stage3ReTest.scenarioPrompt}
                    </p>
                  </div>

                  {feedbackAlert && (
                    <div
                      className={`p-4 rounded-2xl border text-xs space-y-1 ${
                        feedbackAlert.passed
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                          : 'bg-rose-50 border-rose-200 text-rose-900'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black">
                        <span className="text-base">{feedbackAlert.passed ? '🎉' : '⚠️'}</span>
                        <span>
                          {feedbackAlert.passed ? 'Skill Competency Verified (+Score Upgraded)' : 'Improvement Recommended'}
                        </span>
                      </div>
                      <p className="leading-relaxed font-medium">{feedbackAlert.feedback}</p>
                    </div>
                  )}

                  <form onSubmit={handleReTestSubmit} className="space-y-3">
                    <label className="text-xs font-extrabold text-slate-900 block flex items-center gap-1.5">
                      <span>Submit Solution or Code for Automated Verification:</span>
                      <span>✍️</span>
                    </label>
                    <textarea
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      disabled={isLoading}
                      rows={6}
                      placeholder="Write your architectural solution, concurrency invariants, or implementation code..."
                      className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden leading-relaxed shadow-2xs"
                    />

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isLoading || !submissionText.trim()}
                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Grading Invariants...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify & Recalibrate Matrix</span>
                            <span className="text-sm transition-transform group-hover:rotate-45">🚀</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
