import React, { useState, useEffect } from 'react';
import {
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  TrendingUp,
  Building,
  DollarSign,
  MapPin,
  Sparkles,
  Info,
  Briefcase,
  Globe,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { JobMatchResult, SkillProfile, LiveJobItem } from '../types/index.ts';
import { triggerCelebration } from '../utils/confetti.ts';

interface JobInsightsProps {
  jobMatches: JobMatchResult[];
  profile: SkillProfile | null;
  onNavigateToCoach: () => void;
}

export const JobInsights: React.FC<JobInsightsProps> = ({
  jobMatches,
  profile,
  onNavigateToCoach,
}) => {
  const [viewMode, setViewMode] = useState<'benchmarks' | 'live_google_jobs'>('benchmarks');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(
    jobMatches[0]?.job.jobId || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ready' | 'upskill_needed' | 'critical_foundation'>('all');

  // Live Google Jobs state
  const [liveJobs, setLiveJobs] = useState<LiveJobItem[]>([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveSearchQuery, setLiveSearchQuery] = useState('Staff Distributed Systems Engineer');

  const fetchLiveJobs = async (term = liveSearchQuery) => {
    setIsSearchingLive(true);
    try {
      const res = await fetch(`/api/search/live-jobs?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.jobs) setLiveJobs(data.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearchingLive(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'live_google_jobs' && liveJobs.length === 0) {
      fetchLiveJobs();
    }
  }, [viewMode]);

  const filteredMatches = jobMatches.filter((match) => {
    const matchesSearch =
      match.job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.job.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.job.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      match.job.typicalStack.some((tech) => tech.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || match.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeMatch = jobMatches.find((m) => m.job.jobId === selectedJobId) || jobMatches[0];

  return (
    <div className="space-y-8 pb-20">
      {/* Header & View Mode Switcher */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs bg-grid-pattern relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-extrabold text-indigo-600 flex items-center gap-1">
                <span>🎯</span>
                <span>Job Intelligence & Gap Engine</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>Weighted Seniority Bounds</span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <span>Google Search Grounding</span>
                <span>🌐</span>
              </span>
            </div>
            <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
              <span>Job Compatibility & Market Openings</span>
              <span className="text-xl animate-float">💼</span>
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              Explore your verified skill compatibility scores or browse real-time live tech openings at Google, Stripe, and Datadog powered by Google Search data.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setViewMode('benchmarks')}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
                  viewMode === 'benchmarks'
                    ? 'bg-white text-indigo-700 shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🎯 Mathematical Benchmarks
              </button>
              <button
                onClick={() => {
                  setViewMode('live_google_jobs');
                  triggerCelebration('subtle');
                }}
                className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'live_google_jobs'
                    ? 'bg-blue-600 text-white shadow-2xs font-black'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Globe className="h-3 w-3" />
                <span>Live Google Jobs ⚡</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        {viewMode === 'benchmarks' ? (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search benchmarks, stacks (e.g. Kafka, Go)..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all"
              />
            </div>

            {/* Interactive filter tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Roles ({jobMatches.length})
              </button>
              <button
                onClick={() => setStatusFilter('ready')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'ready'
                    ? 'bg-white text-emerald-800 shadow-2xs scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Ready (80%+) 🚀
              </button>
              <button
                onClick={() => setStatusFilter('upskill_needed')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'upskill_needed'
                    ? 'bg-white text-amber-800 shadow-2xs scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Upskilling (50-79%) ⚡
              </button>
              <button
                onClick={() => setStatusFilter('critical_foundation')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === 'critical_foundation'
                    ? 'bg-white text-rose-800 shadow-2xs scale-102'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fundamental Gaps 💡
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-2.5 h-3.5 w-3.5 text-blue-500" />
              <input
                type="text"
                value={liveSearchQuery}
                onChange={(e) => setLiveSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLiveJobs(liveSearchQuery)}
                placeholder="Search live tech jobs (e.g. Google Staff Distributed Systems)..."
                className="w-full rounded-xl border border-blue-200 bg-blue-50/30 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-hidden transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-semibold">
                Sourced from Google Careers, Stripe, Datadog & live web portals
              </span>
              <button
                onClick={() => fetchLiveJobs(liveSearchQuery)}
                disabled={isSearchingLive}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isSearchingLive ? 'Searching...' : 'Refresh Live Jobs'}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Render Google Live Jobs or Benchmarks */}
      {viewMode === 'live_google_jobs' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>Verified Live Market Openings (2026)</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold border border-emerald-200">
                Live Data Active ⚡
              </span>
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Showing {liveJobs.length} verified listings
            </span>
          </div>

          {isSearchingLive ? (
            <div className="p-12 text-center space-y-3 bg-white rounded-3xl border border-slate-200">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold">Querying Google web data for active tech jobs...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {liveJobs.map((job) => (
                <div
                  key={job.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs hover:border-blue-300 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-black border border-blue-200">
                            🏢 {job.company}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold">
                            📍 {job.location}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-bold">
                            {job.seniority}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-2">{job.title}</h3>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{job.summary}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.keySkills.map((sk, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">CALIBRATED COMP</span>
                      <span className="text-xs font-extrabold text-emerald-700">{job.salaryBand}</span>
                    </div>

                    <a
                      href={job.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <span>Apply on Portal</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Main Split Content */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Job Benchmark Cards List */}
          <div className="lg:col-span-5 space-y-3.5">
            {filteredMatches.length === 0 ? (
              <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500">
                No benchmark roles match your search filters.
              </div>
            ) : (
              filteredMatches.map((match) => {
                const isSelected = selectedJobId === match.job.jobId;
                return (
                  <div
                    key={match.job.jobId}
                    onClick={() => {
                      setSelectedJobId(match.job.jobId);
                      if (match.matchPercentage >= 80) triggerCelebration('subtle');
                    }}
                    className={`rounded-2xl border p-5 transition-all cursor-pointer relative ${
                      isSelected
                        ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-100 scale-[1.01]'
                        : 'border-slate-200/90 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-slate-500 block flex items-center gap-1">
                          <span>🏢</span>
                          <span>{match.job.companyTier}</span>
                        </span>
                        <h3 className="font-black text-slate-900 text-sm tracking-tight">
                          {match.job.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{match.job.summary}</p>
                      </div>

                      {/* Match Badge */}
                      <div className="shrink-0 text-right">
                        <div
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs ${
                            match.matchPercentage >= 80
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : match.matchPercentage >= 60
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          <span>{match.matchPercentage}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Status & Tech tags */}
                    <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100">
                      {match.job.typicalStack.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-bold"
                        >
                          {tech}
                        </span>
                      ))}
                      <span className="ml-auto text-[10px] font-bold text-slate-400">
                        {match.blockingGaps.length} gaps identified
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Selected Job Deep-Dive & Formula Breakdown */}
          {activeMatch && (
            <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6">
              {/* Job Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                    {activeMatch.job.domain} · {activeMatch.job.companyTier}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                    {activeMatch.job.title}
                  </h2>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {activeMatch.job.summary}
                  </p>
                </div>

                <div className="shrink-0 text-center sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="text-3xl font-black text-slate-900">
                    {activeMatch.matchPercentage}%
                  </div>
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      activeMatch.status === 'ready'
                        ? 'bg-emerald-100 text-emerald-800'
                        : activeMatch.status === 'upskill_needed'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {activeMatch.status === 'ready'
                      ? 'Interview Ready 🚀'
                      : activeMatch.status === 'upskill_needed'
                      ? 'Targeted Upskill Needed ⚡'
                      : 'Critical Baseline Gaps 💡'}
                  </span>
                </div>
              </div>

              {/* Seniority Requirements Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">TARGET SENIORITY</span>
                  <span className="text-xs font-black text-slate-800 mt-0.5 block">
                    {activeMatch.job.experienceLevel}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">EXPERIENCE BAND</span>
                  <span className="text-xs font-black text-slate-800 mt-0.5 block">
                    {activeMatch.job.experienceLevel === 'Staff' ? '8+' : '5+'} Years
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">TYPICAL COMP</span>
                  <span className="text-xs font-black text-emerald-700 mt-0.5 block">
                    {activeMatch.job.salaryRange || '$280k - $420k TC'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold block">GAPS REMAINING</span>
                  <span className="text-xs font-black text-indigo-600 mt-0.5 block">
                    {activeMatch.gapDetails.length} Skill Dimensions
                  </span>
                </div>
              </div>

              {/* Dimension Gaps & Mathematical Remediation */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Dimension Gaps & Mathematical Ratios</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    (Formula: Ratio = min(1.0, User / Required))
                  </span>
                </h3>

                <div className="space-y-3">
                  {activeMatch.gapDetails.map((gap, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 hover:bg-slate-50 space-y-2 transition-all"
                    >
                      <div className="flex items-center justify-between gap-3 text-xs">
                        <span className="font-black text-slate-900">{gap.skillName}</span>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-500">
                            Your: <strong className="text-slate-900">{gap.userScore.toFixed(1)}</strong>
                          </span>
                          <span className="text-slate-400">/</span>
                          <span className="text-slate-500">
                            Req: <strong className="text-slate-900">{gap.requiredScore.toFixed(1)}</strong>
                          </span>
                          <span className="font-extrabold text-indigo-600">
                            {Math.round(gap.ratio * 100)}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar with gradient */}
                      <div className="relative h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            gap.ratio >= 1.0 ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : 'bg-gradient-to-r from-amber-400 to-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, gap.ratio * 100)}%` }}
                        />
                      </div>

                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        {gap.remedyAction}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct Link to Upskill */}
              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => {
                    triggerCelebration('stars');
                    onNavigateToCoach();
                  }}
                  className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Launch Micro-Curriculum in Coach</span>
                  <span className="text-sm transition-transform group-hover:translate-x-1">🚀</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
