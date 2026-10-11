import React, { useState } from 'react';
import { X, FileDown, CheckCircle, FileText, Check, Loader2 } from 'lucide-react';
import { AssessmentSession, JobMatchResult, SkillProfile } from '../types/index.ts';
import { generateCandidatePDFReport } from '../utils/pdfExport.ts';

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: SkillProfile | null;
  session: AssessmentSession | null;
  jobMatches: JobMatchResult[];
}

export const ExportReportModal: React.FC<ExportReportModalProps> = ({
  isOpen,
  onClose,
  profile,
  session,
  jobMatches,
}) => {
  const [includeTranscript, setIncludeTranscript] = useState(true);
  const [includeJobMatches, setIncludeJobMatches] = useState(true);
  const [includeGapsAndStrengths, setIncludeGapsAndStrengths] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !profile) return null;

  const handleExport = () => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      generateCandidatePDFReport(profile, session, jobMatches, {
        includeTranscript,
        includeJobMatches,
        includeGapsAndStrengths,
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to export PDF:', err);
      setErrorMessage('Failed to generate PDF document. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                Export Technical Evaluation Report
              </h2>
              <p className="text-[11px] text-slate-500">
                Generate recruiter-ready PDF report
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

        {/* Report Overview Preview Box */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Domain:</span>
            <span className="font-bold text-slate-900">{profile.domain}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Readiness Tier:</span>
            <span className="font-bold text-slate-900 truncate max-w-56 text-right">
              {profile.overallReadinessTier}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Overall Score:</span>
            <span className="font-bold font-mono tabular-nums text-indigo-600">
              {profile.overallScore} / 100
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Turns Recorded:</span>
            <span className="font-mono tabular-nums text-slate-700">
              {session?.transcript?.length || 0} turns
            </span>
          </div>
        </div>

        {/* Configuration Options */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
            Include in PDF Document:
          </span>

          <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeTranscript}
              onChange={(e) => setIncludeTranscript(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Full Diagnostic Interview Transcript & Evaluator Feedback</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeJobMatches}
              onChange={(e) => setIncludeJobMatches(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Benchmark Job Fit Scores & Mathematical Ratio Table</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeGapsAndStrengths}
              onChange={(e) => setIncludeGapsAndStrengths(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span>Verified Strengths, Critical Gaps & Interview Risk Notes</span>
          </label>
        </div>

        {errorMessage && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-900 font-medium">
            {errorMessage}
          </div>
        )}

        {/* Footer Actions */}
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
            onClick={handleExport}
            disabled={isExporting}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer ${
              isSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isExporting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Building PDF...</span>
              </>
            ) : isSuccess ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>PDF Downloaded!</span>
              </>
            ) : (
              <>
                <FileDown className="h-3.5 w-3.5" />
                <span>Download PDF Report</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
