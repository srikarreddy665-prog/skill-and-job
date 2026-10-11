import React, { useState } from 'react';
import { X, Sparkles, Loader2, Linkedin, CheckCircle } from 'lucide-react';
import { AssessmentDomain } from '../types/index.ts';
import { LinkedInConnectModal, LinkedInImportData } from './LinkedInConnectModal.tsx';

interface NewAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartAssessment: (params: {
    domain: AssessmentDomain;
    targetRoleTitle: string;
    candidateSummary: string;
    maxTurns: number;
  }) => Promise<void>;
  isLoading: boolean;
}

const AVAILABLE_DOMAINS: AssessmentDomain[] = [
  'Backend Architecture',
  'Full Stack Engineering',
  'AI & Machine Learning Engineering',
  'Cloud Infrastructure & DevOps',
  'Frontend Systems',
  'System Security & Reliability',
];

export const NewAssessmentModal: React.FC<NewAssessmentModalProps> = ({
  isOpen,
  onClose,
  onStartAssessment,
  isLoading,
}) => {
  const [domain, setDomain] = useState<AssessmentDomain>('Backend Architecture');
  const [targetRoleTitle, setTargetRoleTitle] = useState('Senior Distributed Backend Engineer');
  const [candidateSummary, setCandidateSummary] = useState(
    '5 years building high-concurrency microservices with Node.js, Go, Redis, and PostgreSQL.'
  );
  const [maxTurns, setMaxTurns] = useState(5);
  const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);
  const [linkedInSuccessBanner, setLinkedInSuccessBanner] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLinkedInImport = (data: LinkedInImportData) => {
    setDomain(data.detectedDomain);
    setTargetRoleTitle(data.targetRoleTitle);
    setCandidateSummary(
      `${data.candidateSummary} Skills: ${data.extractedSkillSet.join(', ')}`
    );
    setLinkedInSuccessBanner(
      `Pre-populated from LinkedIn: ${data.profile.currentRole} (${data.extractedSkillSet.length} skills imported)`
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await onStartAssessment({
      domain,
      targetRoleTitle,
      candidateSummary,
      maxTurns,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Launch Diagnostic Assessment
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Configures the agentic state machine for adaptive question turns
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* LinkedIn Pre-population Banner & Action */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-lg bg-[#0a66c2] text-white flex items-center justify-center shrink-0">
              <Linkedin className="h-4 w-4 fill-current" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-900 block">
                Connect LinkedIn Profile
              </span>
              <span className="text-[11px] text-slate-500 block">
                Auto-fill target title and skills from your experience
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsLinkedInModalOpen(true)}
            className="rounded-lg border border-[#0a66c2] bg-white px-3 py-1.5 text-xs font-semibold text-[#0a66c2] hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
          >
            Auto-Fill
          </button>
        </div>

        {linkedInSuccessBanner && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{linkedInSuccessBanner}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assessment Domain
            </label>
            <select
              value={domain}
              onChange={(e) => {
                const newDomain = e.target.value as AssessmentDomain;
                setDomain(newDomain);
                if (newDomain === 'Backend Architecture') {
                  setTargetRoleTitle('Senior Distributed Backend Engineer');
                } else if (newDomain === 'Full Stack Engineering') {
                  setTargetRoleTitle('Full Stack Platform Engineer');
                } else if (newDomain === 'AI & Machine Learning Engineering') {
                  setTargetRoleTitle('AI Platform & LLM Applications Engineer');
                } else if (newDomain === 'Cloud Infrastructure & DevOps') {
                  setTargetRoleTitle('Cloud Infrastructure & SRE Engineer');
                } else if (newDomain === 'Frontend Systems') {
                  setTargetRoleTitle('Senior Frontend Systems Architect');
                } else {
                  setTargetRoleTitle('Systems Security & Reliability Engineer');
                }
              }}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            >
              {AVAILABLE_DOMAINS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Target Role Title / Benchmark
            </label>
            <input
              type="text"
              value={targetRoleTitle}
              onChange={(e) => setTargetRoleTitle(e.target.value)}
              placeholder="e.g. Senior Distributed Backend Engineer"
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Candidate Background / Resume Summary
            </label>
            <textarea
              value={candidateSummary}
              onChange={(e) => setCandidateSummary(e.target.value)}
              rows={3}
              placeholder="Brief summary of your primary tech stack, years of experience, and focus areas..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assessment Turn Count
            </label>
            <select
              value={maxTurns}
              onChange={(e) => setMaxTurns(parseInt(e.target.value, 10))}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
            >
              <option value={3}>3 Turns (Fast Diagnostic ~5 mins)</option>
              <option value={5}>5 Turns (Standard Calibrated Assessment ~10 mins)</option>
              <option value={7}>7 Turns (Comprehensive Deep Technical Audit)</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Initializing Turn 1...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Start Live Assessment</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <LinkedInConnectModal
        isOpen={isLinkedInModalOpen}
        onClose={() => setIsLinkedInModalOpen(false)}
        onProfileImported={handleLinkedInImport}
      />
    </div>
  );
};
