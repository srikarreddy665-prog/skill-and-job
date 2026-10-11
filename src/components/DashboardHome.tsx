import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Linkedin,
  Target,
  Sparkles,
  Search,
  Check,
  TrendingUp,
  Bot,
  Zap,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { AssessmentDomain, JobMatchResult, RoadmapModule, SkillProfile } from '../types/index.ts';
import { RadarChart } from './RadarChart.tsx';
import { MilestoneTracker } from './MilestoneTracker.tsx';
import { triggerCelebration } from '../utils/confetti.ts';

interface DashboardHomeProps {
  profile: SkillProfile | null;
  jobMatches: JobMatchResult[];
  roadmap: RoadmapModule[];
  sessionId?: string;
  onNavigateToTab: (tab: 'assessment' | 'jobs' | 'coach' | 'advisor') => void;
  onOpenNewAssessment: () => void;
  onOpenExportReport: () => void;
  onOpenLinkedInConnect?: () => void;
  onUpdateMilestone: (
    moduleId: string,
    targetDate: string,
    reminderEmail: string,
    reminderEnabled: boolean
  ) => Promise<void>;
  onQuickSwitchDomain?: (domain: AssessmentDomain) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  profile,
  jobMatches,
  roadmap,
  sessionId,
  onNavigateToTab,
  onOpenNewAssessment,
  onOpenExportReport,
  onOpenLinkedInConnect,
  onUpdateMilestone,
  onQuickSwitchDomain,
}) => {
  const [showBenchmarkRadar, setShowBenchmarkRadar] = useState(true);
  const [dimensionFilter, setDimensionFilter] = useState<'all' | 'strengths' | 'gaps'>('all');
  const [dimensionSearch, setDimensionSearch] = useState('');
  const [expandedDim, setExpandedDim] = useState<string | null>(null);

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl py-24 text-center space-y-6">
        <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-tr from-indigo-500 to-indigo-700 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/25 ring-8 ring-indigo-50 animate-bounce-subtle">
          <span className="text-3xl">🎯</span>
          <span className="absolute -top-1 -right-1 text-base animate-wiggle">✨</span>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Calibrated Assessment Ready 🚀
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Initialize an autonomous diagnostic interview to evaluate your system design, concurrency invariants, and production algorithmic reasoning.
          </p>
        </div>
        <button
          onClick={() => {
            triggerCelebration('cannons');
            onOpenNewAssessment();
          }}
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-7 py-3.5 text-xs font-bold text-white shadow-md hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
        >
          <span className="text-base transition-transform group-hover:rotate-12">⚡</span>
          <span>Initialize Diagnostic Assessment</span>
        </button>
      </div>
    );
  }

  const topJob = jobMatches[0];
  const readyJobsCount = jobMatches.filter((j) => j.status === 'ready').length;
  const criticalGapsCount = profile.criticalGaps?.length || 0;
  const strengthsCount = profile.keyStrengths?.length || 0;

  // Filter dimensions
  const filteredDimensions = profile.dimensions.filter((dim) => {
    const target = dim.benchmarkMinRequired || 7.5;
    const isStrength = dim.score >= target;
    const matchesFilter =
      dimensionFilter === 'all' ||
      (dimensionFilter === 'strengths' && isStrength) ||
      (dimensionFilter === 'gaps' && !isStrength);

    const matchesSearch =
      dim.name.toLowerCase().includes(dimensionSearch.toLowerCase()) ||
      dim.category.toLowerCase().includes(dimensionSearch.toLowerCase()) ||
      dim.description.toLowerCase().includes(dimensionSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Hero Banner with subtle dot matrix texture & interactive celebration */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs relative overflow-hidden bg-grid-pattern">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-gradient-to-bl from-indigo-100/70 via-indigo-50/40 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-gradient-to-tr from-emerald-100/50 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="space-y-3.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs">
                <span className="animate-wiggle">🎯</span>
                {profile.domain}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <span>Evaluator Calibration</span>
                <span className="text-xs">🤖</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-400 font-mono text-[11px]">
                Updated {new Date(profile.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  {profile.overallReadinessTier}
                </h1>
                <span className="text-2xl animate-float">🔥</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                {profile.executiveSummary}
              </p>
            </div>

            {/* Quick Action Buttons with emojis */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5">
              {onOpenLinkedInConnect && (
                <button
                  onClick={onOpenLinkedInConnect}
                  className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-blue-300 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
                  title="Import LinkedIn profile to auto-fill target title and skills"
                >
                  <Linkedin className="h-3.5 w-3.5 text-[#0a66c2] fill-current group-hover:scale-110 transition-transform" />
                  <span>Sync LinkedIn Skills</span>
                  <span className="text-[11px] opacity-70 group-hover:opacity-100">💼</span>
                </button>
              )}

              <button
                onClick={() => {
                  triggerCelebration('stars');
                  onOpenExportReport();
                }}
                className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-slate-900 hover:border-indigo-300 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <FileDown className="h-3.5 w-3.5 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span>Export PDF Report</span>
                <span className="text-[11px]">📄</span>
              </button>

              <button
                onClick={() => onNavigateToTab('advisor')}
                className="group inline-flex items-center gap-2 rounded-xl border border-indigo-200/80 bg-indigo-50/70 hover:bg-indigo-100/80 px-3.5 py-2 text-xs font-semibold text-indigo-700 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <Bot className="h-3.5 w-3.5 text-indigo-600 group-hover:rotate-12 transition-transform" />
                <span>Ask AI Advisor</span>
                <span className="text-[11px]">💡</span>
              </button>
            </div>
          </div>

          {/* Calibrated Score Box with interactive particle trigger & badge */}
          <div
            onClick={() => triggerCelebration('burst')}
            className="group relative flex flex-row lg:flex-col items-center justify-between lg:justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 min-w-48 shadow-xl text-center shrink-0 border border-slate-800/80 hover:border-indigo-500/50 hover:scale-[1.02] transition-all duration-300 cursor-pointer overflow-hidden"
            title="Click for celebratory fireworks!"
          >
            <div className="absolute top-2 right-2 text-xs opacity-60 group-hover:opacity-100 group-hover:scale-125 transition-all">
              🎉
            </div>
            <div className="text-left lg:text-center">
              <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider block flex items-center justify-center gap-1">
                <span>Calibrated Score</span>
                <span className="animate-wiggle">⚡</span>
              </span>
              <div className="flex items-baseline gap-1 mt-1 justify-center">
                <span className="text-4xl sm:text-5xl font-black font-mono tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
                  {profile.overallScore}
                </span>
                <span className="text-xs text-indigo-300 font-mono">/ 100</span>
              </div>
            </div>
            <div className="mt-0 lg:mt-3 px-3 py-1 rounded-full bg-white/10 text-[11px] font-medium text-indigo-200 backdrop-blur-xs flex items-center gap-1.5 border border-white/10 group-hover:bg-indigo-600/40 transition-colors">
              <span>{profile.overallScore >= 80 ? '🏆 Tier 1 Senior Ready' : '🌱 Upskilling In-Progress'}</span>
            </div>
          </div>
        </div>

        {/* 4 Quantitative Metric Cards with lively emojis & hover animations */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 border-t border-slate-100 pt-6">
          <div
            onClick={() => onNavigateToTab('jobs')}
            className="group rounded-2xl bg-gradient-to-b from-indigo-50/50 to-white p-4 border border-indigo-100/80 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-sm group-hover:scale-125 transition-transform">🎯</span>
                <span>Top Benchmark Fit</span>
              </span>
              <Target className="h-4 w-4 text-indigo-600 group-hover:rotate-45 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tabular-nums text-indigo-600">
                {topJob ? `${topJob.matchPercentage}%` : 'N/A'}
              </span>
              <span className="text-[11px] text-slate-500 truncate max-w-28 font-medium">
                {topJob?.job.title}
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('jobs')}
            className="group rounded-2xl bg-gradient-to-b from-emerald-50/50 to-white p-4 border border-emerald-100/80 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-500/10 hover:-translate-y-0.5 transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-sm group-hover:scale-125 transition-transform">🚀</span>
                <span>Ready to Apply</span>
              </span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tabular-nums text-emerald-600">
                {readyJobsCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                of {jobMatches.length} roles (80%+)
              </span>
            </div>
          </div>

          <div
            onClick={() => setDimensionFilter('strengths')}
            className="group rounded-2xl bg-gradient-to-b from-amber-50/40 to-white p-4 border border-amber-100/80 hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/10 hover:-translate-y-0.5 transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-sm group-hover:scale-125 transition-transform">🌟</span>
                <span>Verified Strengths</span>
              </span>
              <Award className="h-4 w-4 text-amber-600 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tabular-nums text-slate-900">
                {strengthsCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                senior capabilities
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigateToTab('coach')}
            className="group rounded-2xl bg-gradient-to-b from-rose-50/40 to-white p-4 border border-rose-100/80 hover:border-rose-300 hover:shadow-md hover:shadow-rose-500/10 hover:-translate-y-0.5 transition-all cursor-pointer space-y-1"
          >
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="text-sm group-hover:scale-125 transition-transform">💡</span>
                <span>Remediation Gaps</span>
              </span>
              <AlertTriangle className="h-4 w-4 text-rose-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono tabular-nums text-rose-600">
                {criticalGapsCount}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                active modules
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 2-Column Split: Radar Chart + Dimensional Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Visual Radar Chart with subtle glass framing */}
        <section className="lg:col-span-5 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-5 bg-dot-pattern">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Capability Radar Matrix</span>
                <span className="text-sm">🕸️</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluated score polygon vs industry standard
              </p>
            </div>

            <button
              onClick={() => setShowBenchmarkRadar(!showBenchmarkRadar)}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all hover:scale-105 cursor-pointer shadow-2xs"
            >
              {showBenchmarkRadar ? 'Hide Benchmark' : 'Show Benchmark'}
            </button>
          </div>

          <div className="py-2 flex justify-center">
            <RadarChart
              dimensions={profile.dimensions}
              size={330}
              showBenchmark={showBenchmarkRadar}
            />
          </div>

          <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <span>Interactive polygon inspection</span>
              <span className="text-[10px]">✨</span>
            </span>
            <button
              onClick={() => onNavigateToTab('coach')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
            >
              <span>Upskill in Coach</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Right Column: Detailed Dimensions List */}
        <section className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Proficiency Dimensions</span>
                <span className="text-sm">📊</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Calibrated against enterprise benchmark thresholds
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-medium shrink-0">
              <button
                onClick={() => setDimensionFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dimensionFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({profile.dimensions.length})
              </button>
              <button
                onClick={() => setDimensionFilter('strengths')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dimensionFilter === 'strengths'
                    ? 'bg-white text-emerald-800 shadow-2xs font-bold scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Strengths 🌟
              </button>
              <button
                onClick={() => setDimensionFilter('gaps')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dimensionFilter === 'gaps'
                    ? 'bg-white text-amber-800 shadow-2xs font-bold scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gaps 💡
              </button>
            </div>
          </div>

          {/* Search box for skills */}
          <div className="relative">
            <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={dimensionSearch}
              onChange={(e) => setDimensionSearch(e.target.value)}
              placeholder="Search dimensions (e.g., Concurrency, Distributed, API)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all"
            />
          </div>

          <div className="divide-y divide-slate-100 space-y-0.5 max-h-[460px] overflow-y-auto pr-1">
            {filteredDimensions.map((dim) => {
              const target = dim.benchmarkMinRequired || 7.5;
              const isMet = dim.score >= target;
              const delta = Number((dim.score - target).toFixed(1));
              const isExpanded = expandedDim === dim.name;

              return (
                <div key={dim.name} className="py-3.5 first:pt-1 last:pb-0">
                  <div
                    onClick={() => setExpandedDim(isExpanded ? null : dim.name)}
                    className="flex items-center justify-between text-xs cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {dim.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {dim.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono tabular-nums font-extrabold text-slate-900 text-sm">
                          {dim.score.toFixed(1)}
                        </span>
                        <span className="text-slate-400 text-[11px]">/ 10</span>
                      </div>

                      <span
                        className={`text-[11px] font-mono tabular-nums font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                          isMet
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                            : 'text-amber-700 bg-amber-50 border border-amber-100'
                        }`}
                      >
                        <span>{isMet ? '✅' : '⚠️'}</span>
                        <span>{delta > 0 ? `+${delta}` : delta}</span>
                      </span>

                      {isExpanded ? (
                        <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Dual comparison progress bar with smooth transition */}
                  <div className="relative mt-2.5 h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isMet
                          ? 'bg-gradient-to-r from-indigo-500 to-indigo-600'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500'
                      }`}
                      style={{ width: `${(dim.score / 10) * 100}%` }}
                    />
                    {/* Target benchmark notch */}
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-slate-900/60 z-10"
                      style={{ left: `${(target / 10) * 100}%` }}
                      title={`Target Benchmark Threshold: ${target}`}
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    {dim.description}
                  </p>

                  {/* Expanded detail box */}
                  {isExpanded && (
                    <div className="mt-3 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 text-xs space-y-2.5 animate-in fade-in duration-200">
                      {dim.verifiedStrengths && dim.verifiedStrengths.length > 0 && (
                        <div>
                          <span className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1.5">
                            <span>Verified Capabilities</span>
                            <span>🎯</span>
                          </span>
                          <ul className="space-y-1">
                            {dim.verifiedStrengths.map((str, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                                <Check className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                                <span>{str}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {dim.criticalGaps && dim.criticalGaps.length > 0 && (
                        <div>
                          <span className="font-bold text-amber-800 flex items-center gap-1.5 mb-1.5">
                            <span>Remediation Target</span>
                            <span>💡</span>
                          </span>
                          <ul className="space-y-1">
                            {dim.criticalGaps.map((gap, idx) => (
                              <li key={idx} className="flex items-start gap-1.5 text-slate-700">
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                                <span>{gap}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Verified Strengths and Key Interview Risk Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-3.5 relative overflow-hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="text-lg">🏆</span>
            <h2 className="text-base font-extrabold text-slate-900">
              Verified Technical Strengths
            </h2>
          </div>
          <ul className="space-y-3">
            {profile.keyStrengths?.map((strength, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100 hover:border-emerald-200 transition-colors">
                <span className="text-emerald-600 font-bold shrink-0">✦</span>
                <span className="font-medium">{strength}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-3.5 relative overflow-hidden">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="text-lg">🧭</span>
            <h2 className="text-base font-extrabold text-slate-900">
              Evaluator Advisory & Risk Notes
            </h2>
          </div>
          <ul className="space-y-3">
            {profile.interviewRiskNotes?.map((note, idx) => (
              <li key={idx} className="flex items-start gap-3 text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-xl border border-slate-100 hover:border-indigo-200 transition-colors">
                <span className="text-indigo-600 font-bold shrink-0">✦</span>
                <span className="font-medium">{note}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Career Milestone Tracker Component */}
      <MilestoneTracker
        roadmap={roadmap}
        profile={profile}
        sessionId={sessionId}
        onUpdateMilestone={onUpdateMilestone}
        onNavigateToCoach={() => onNavigateToTab('coach')}
      />

      {/* Top Matching Benchmark Teaser */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs bg-mesh-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>Benchmark Compatibility Highlights</span>
              <span className="text-sm">💼</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict mathematical weighted ratio matching against live role standards
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('jobs')}
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer"
          >
            <span>View All {jobMatches.length} Job Benchmarks</span>
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobMatches.slice(0, 3).map((match) => (
            <div
              key={match.job.jobId}
              onClick={() => onNavigateToTab('jobs')}
              className="group rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-2.5 bg-slate-50/60 hover:bg-white hover:-translate-y-0.5 duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <span>🏢</span>
                  <span>{match.job.companyTier}</span>
                </span>
                <span className="text-base font-black font-mono tabular-nums text-slate-900 group-hover:text-indigo-600 transition-colors">
                  {match.matchPercentage}%
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                {match.job.title}
              </h3>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                  match.status === 'ready'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                    : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                }`}>
                  <span>{match.status === 'ready' ? '✅' : '📈'}</span>
                  <span>{match.statusLabel}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">{match.job.salaryRange}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
