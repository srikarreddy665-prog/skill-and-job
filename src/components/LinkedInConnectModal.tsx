import React, { useState, useEffect } from 'react';
import {
  X,
  Linkedin,
  CheckCircle,
  ExternalLink,
  Sparkles,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Check,
  User,
} from 'lucide-react';
import { AssessmentDomain } from '../types/index.ts';

export interface LinkedInImportData {
  profile: {
    name: string;
    headline: string;
    currentRole: string;
    company?: string;
    skills: string[];
    summary: string;
  };
  detectedDomain: AssessmentDomain;
  targetRoleTitle: string;
  candidateSummary: string;
  recommendedBaselineScore: number;
  extractedSkillSet: string[];
}

interface LinkedInConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileImported: (data: LinkedInImportData) => void;
}

export const LinkedInConnectModal: React.FC<LinkedInConnectModalProps> = ({
  isOpen,
  onClose,
  onProfileImported,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [headline, setHeadline] = useState('Senior Distributed Backend Engineer');
  const [company, setCompany] = useState('Stripe / Cloud Infrastructure');
  const [skillsText, setSkillsText] = useState('Go, Node.js, PostgreSQL, Redis, Kafka, Distributed Systems, Concurrency, gRPC');
  const [summary, setSummary] = useState('5+ years designing high-throughput distributed microservices, idempotent payment gateways, and database index tuning.');

  if (!isOpen) return null;

  const quickPresets = [
    {
      label: 'Staff Backend Architect (Stripe)',
      headline: 'Staff Distributed Systems Architect',
      company: 'Stripe Payments Infrastructure',
      skillsText: 'Go, PostgreSQL, Redis, Kafka, Distributed Systems, Concurrency Invariants, gRPC, Raft, Sharding',
      summary: 'Architecting ultra-reliable transaction pipelines with strict zero-loss idempotency and sub-millisecond latencies.',
      domain: 'Backend Architecture' as AssessmentDomain,
    },
    {
      label: 'Lead AI & ML Engineer (Anthropic)',
      headline: 'Lead Machine Learning Platform Engineer',
      company: 'AI Research Lab',
      skillsText: 'PyTorch, vLLM, CUDA, Triton, Distributed Training, Ray, Python, Model Distillation, Vector DBs',
      summary: 'Scaling large model inference serving clusters, pipeline parallelism, and high-throughput vector indexing.',
      domain: 'AI & Machine Learning Engineering' as AssessmentDomain,
    },
    {
      label: 'Principal Full Stack Architect (Vercel)',
      headline: 'Principal Full Stack Systems Engineer',
      company: 'Edge Web Platform',
      skillsText: 'TypeScript, React, Next.js, Node.js, GraphQL, WebSockets, Tailwind CSS, CDN Edge Routing, PostgreSQL',
      summary: 'Crafting high-performance web applications, server-driven UI engines, and resilient edge state synchronization.',
      domain: 'Full Stack Engineering' as AssessmentDomain,
    },
  ];

  const applyPreset = (preset: typeof quickPresets[0]) => {
    setHeadline(preset.headline);
    setCompany(preset.company);
    setSkillsText(preset.skillsText);
    setSummary(preset.summary);
  };

  const handleImport = async () => {
    setIsLoading(true);
    try {
      const skillsArray = skillsText
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      // Call import endpoint
      const res = await fetch('/api/auth/linkedin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline,
          currentRole: headline,
          company,
          skills: skillsArray,
          summary,
        }),
      });

      const data = await res.json();
      if (data.importResult) {
        onProfileImported(data.importResult);
        onClose();
      }
    } catch (err) {
      console.error(err);
      // Fallback local calibration
      const skillsArray = skillsText.split(',').map((s) => s.trim()).filter(Boolean);
      onProfileImported({
        profile: {
          name: 'Alex Chen',
          headline,
          currentRole: headline,
          company,
          skills: skillsArray,
          summary,
        },
        detectedDomain: 'Backend Architecture',
        targetRoleTitle: headline,
        candidateSummary: summary,
        recommendedBaselineScore: 82,
        extractedSkillSet: skillsArray,
      });
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center shadow-xs">
              <Linkedin className="h-4 w-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Import Profile from LinkedIn
              </h2>
              <p className="text-[11px] text-slate-500">
                Pre-populate verified skills and target roles
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 1-Click Quick Presets */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider">
            1-Click Persona Presets:
          </span>
          <div className="grid grid-cols-1 gap-1.5">
            {quickPresets.map((preset, i) => (
              <button
                key={i}
                type="button"
                onClick={() => applyPreset(preset)}
                className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20 text-xs font-semibold text-slate-800 transition-all flex items-center justify-between group cursor-pointer"
              >
                <span>{preset.label}</span>
                <span className="text-[10px] text-indigo-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                  Use Preset →
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3.5 pt-2 border-t border-slate-100 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Headline / Target Job Title:</label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Current Company or Organization:</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Key Skill Set (comma separated):</label>
            <input
              type="text"
              value={skillsText}
              onChange={(e) => setSkillsText(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700 block">Executive Summary & Experience:</label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden leading-relaxed"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleImport}
            disabled={isLoading || !headline.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0a66c2] hover:bg-[#004182] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Calibrating Baseline...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5 text-blue-200" />
                <span>Import & Calibrate Baseline</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
