import React, { useState, useRef } from 'react';
import {
  Volume2,
  VolumeX,
  Send,
  Loader2,
  CheckCircle,
  Code2,
  Sparkles,
  Terminal,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { AssessmentSession } from '../types/index.ts';
import { triggerCelebration } from '../utils/confetti.ts';

interface AssessmentRoomProps {
  session: AssessmentSession | null;
  onSubmitTurn: (answer: string, codeAnswer?: string) => Promise<void>;
  onCompleteAndEvaluate: () => Promise<void>;
  onStartNewAssessment: () => void;
  onOpenExportReport?: () => void;
  isLoading: boolean;
}

export const AssessmentRoom: React.FC<AssessmentRoomProps> = ({
  session,
  onSubmitTurn,
  onCompleteAndEvaluate,
  onStartNewAssessment,
  onOpenExportReport,
  isLoading,
}) => {
  const [answerText, setAnswerText] = useState('');
  const [codeAnswerText, setCodeAnswerText] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [expandedTurns, setExpandedTurns] = useState<Record<number, boolean>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  if (!session) {
    return (
      <div className="mx-auto max-w-2xl py-20 text-center space-y-5">
        <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20 animate-bounce-subtle">
          <span className="text-2xl">⚡</span>
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">
          No Active Assessment Session 🎯
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Start a dynamic diagnostic session to let our agentic state machine adaptively test your system reasoning, failure mode analysis, and concurrency invariants.
        </p>
        <button
          onClick={() => {
            triggerCelebration('stars');
            onStartNewAssessment();
          }}
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-xs font-bold text-white shadow-md hover:shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
        >
          Initialize Diagnostic Assessment 🚀
        </button>
      </div>
    );
  }

  const currentTurnObj = session.transcript[session.transcript.length - 1];
  const isCompleted = session.status === 'completed';
  const completedTurns = session.transcript.filter((t) => t.userAnswer).length;
  const totalTurnsPlanned = session.maxTurns || 6;

  const handleAudioPlayback = async () => {
    if (isPlayingAudio && audioRef.current) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (!currentTurnObj) return;

    try {
      setIsPlayingAudio(true);
      const textToRead = `${currentTurnObj.scenario}. ${currentTurnObj.questionText}`;

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => fallbackWebSpeech(textToRead);
        await audio.play();
      } else {
        fallbackWebSpeech(textToRead);
      }
    } catch {
      fallbackWebSpeech(`${currentTurnObj.scenario}. ${currentTurnObj.questionText}`);
    }
  };

  const fallbackWebSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answerText.trim() || isLoading) return;

    triggerCelebration('subtle');
    await onSubmitTurn(answerText, showCodeEditor ? codeAnswerText : undefined);
    setAnswerText('');
    setCodeAnswerText('');
    setShowCodeEditor(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleCopyCode = () => {
    if (currentTurnObj?.codeContext) {
      navigator.clipboard.writeText(currentTurnObj.codeContext);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    }
  };

  const insertTemplateSnippet = (snippet: string) => {
    setAnswerText((prev) => (prev ? `${prev}\n\n${snippet}` : snippet));
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Session Progress Header with dot grid texture */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xs bg-dot-pattern">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>🎯</span>
                <span>{session.domain}</span>
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-slate-500 font-medium">Adaptive Diagnostic Mode</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-1 flex items-center gap-2">
              <span>Diagnostic Assessment Room</span>
              <span className="text-base animate-bounce-subtle">⚡</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold capitalize border flex items-center gap-1.5 ${
                currentTurnObj?.difficulty === 'advanced'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : currentTurnObj?.difficulty === 'intermediate'
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              <span>{currentTurnObj?.difficulty === 'advanced' ? '🔥' : '⚡'}</span>
              <span>{currentTurnObj?.difficulty || session.currentDifficulty} Difficulty</span>
            </span>

            <button
              onClick={handleAudioPlayback}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isPlayingAudio
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md animate-pulse'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-indigo-300'
              }`}
              title={isPlayingAudio ? 'Pause Voice' : 'Read Question Aloud (Gemini TTS)'}
            >
              {isPlayingAudio ? (
                <div className="flex items-center gap-1.5 px-1">
                  <VolumeX className="h-4 w-4" />
                  <span className="text-xs font-bold">Mute</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-1">
                  <Volume2 className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-bold">Listen 🎧</span>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Turn Progression Stepper Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <span>Turn {Math.min(completedTurns + 1, totalTurnsPlanned)} of {totalTurnsPlanned}</span>
              <span className="text-xs">🏁</span>
            </span>
            <span className="font-mono font-bold text-indigo-600">
              {Math.round((completedTurns / totalTurnsPlanned) * 100)}% Complete
            </span>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: totalTurnsPlanned }).map((_, idx) => {
              const isPast = idx < completedTurns;
              const isCurrent = idx === completedTurns;
              return (
                <div
                  key={idx}
                  className={`h-2.5 rounded-full transition-all duration-500 ${
                    isPast
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                      : isCurrent
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 ring-2 ring-indigo-200 scale-102'
                      : 'bg-slate-200'
                  }`}
                  title={`Question ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* Completion Banner (if finished) with celebratory buttons */}
      {isCompleted && (
        <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-5 bg-mesh-glow">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-2xl animate-bounce-subtle">🎉</span>
              <h2 className="text-lg font-black text-emerald-950">
                Diagnostic Interview Complete!
              </h2>
            </div>
            <p className="text-xs text-emerald-800 max-w-xl leading-relaxed">
              All turns have been recorded! You can now evaluate your transcript to generate your multi-dimensional Skill Profile, compute mathematical job matches, and create an automated upskilling roadmap.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                triggerCelebration('cannons');
                onCompleteAndEvaluate();
              }}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-6 py-3 text-xs font-bold text-white shadow-md hover:shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Grading Transcript...</span>
                </>
              ) : (
                <>
                  <span>✨ Generate Skill Matrix</span>
                  <span className="text-sm">🏆</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* Active Question Card (if in progress) */}
      {!isCompleted && currentTurnObj && (
        <section className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-5 bg-grid-pattern relative overflow-hidden">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono uppercase tracking-wider font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span>Turn #{currentTurnObj.turnIndex} Scenario</span>
                <span>🧭</span>
              </span>
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-semibold bg-slate-50/80 p-4.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              {currentTurnObj.scenario}
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-extrabold text-slate-950 flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600 fill-indigo-600" />
              <span>Diagnostic Problem:</span>
            </h3>
            <p className="text-sm text-slate-900 leading-relaxed font-bold">
              {currentTurnObj.questionText}
            </p>
          </div>

          {/* Optional Code Context with sleek dark IDE styling */}
          {currentTurnObj.codeContext && (
            <div className="rounded-2xl border border-slate-800 bg-slate-950 text-slate-200 overflow-hidden text-xs shadow-md">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/90">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">code_context.ts</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4.5 font-mono overflow-x-auto text-xs leading-relaxed text-indigo-200/90">
                {currentTurnObj.codeContext}
              </pre>
            </div>
          )}

          {/* Candidate Response Workspace */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                <span>Your Technical Solution & Invariant Analysis:</span>
                <span className="text-sm">✍️</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCodeEditor(!showCodeEditor)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    showCodeEditor
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <Code2 className="h-3.5 w-3.5" />
                  <span>{showCodeEditor ? 'Hide Code Tab' : 'Attach Code Snippet 💻'}</span>
                </button>
              </div>
            </div>

            {/* Quick architectural template helpers */}
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-slate-400 font-bold">Quick Templates:</span>
              <button
                type="button"
                onClick={() =>
                  insertTemplateSnippet(
                    '### System Invariants & Tradeoffs:\n- Concurrency model: \n- Failure modes considered: \n- Latency vs Consistency tradeoff: '
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                + Invariant Template 📐
              </button>
              <button
                type="button"
                onClick={() =>
                  insertTemplateSnippet(
                    '### Idempotency & Persistence:\n- Idempotency key strategy: \n- Transaction boundary / Isolation: '
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
              >
                + Idempotency 🔑
              </button>
            </div>

            <textarea
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={5}
              placeholder="Explain your approach, concurrency considerations, edge cases, data structures, and architectural tradeoffs..."
              className="w-full rounded-2xl border border-slate-200 p-4 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all leading-relaxed shadow-2xs"
            />

            {/* Optional Monospace Code Editor */}
            {showCodeEditor && (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                <span className="text-[11px] font-mono text-slate-500 font-bold flex items-center gap-1">
                  <span>Implementation Code</span>
                  <span>💻</span>
                </span>
                <textarea
                  value={codeAnswerText}
                  onChange={(e) => setCodeAnswerText(e.target.value)}
                  disabled={isLoading}
                  rows={6}
                  placeholder="// Paste your TypeScript, Go, SQL, or pseudocode solution here..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-indigo-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-hidden shadow-inner"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Tip: Press</span>
                <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-slate-700">
                  Ctrl
                </kbd>
                <span>+</span>
                <kbd className="px-1.5 py-0.5 rounded-md bg-slate-100 border border-slate-200 font-mono text-slate-700">
                  Enter
                </kbd>
                <span>to submit</span>
              </div>

              <div className="flex items-center gap-2.5">
                {completedTurns >= 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerCelebration('cannons');
                      onCompleteAndEvaluate();
                    }}
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    <Award className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Finish Early & Grade 🏁</span>
                  </button>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !answerText.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Calibrating Reasoning...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Turn</span>
                      <Send className="h-3.5 w-3.5" />
                      <span>🚀</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </section>
      )}

      {/* Prior Turns History & Feedback */}
      {session.transcript.length > 1 && (
        <section className="space-y-3.5 pt-4 border-t border-slate-200">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>Recorded Interview Turns ({session.transcript.length - (isCompleted ? 0 : 1)})</span>
            <span className="text-xs">📜</span>
          </h3>

          <div className="space-y-3">
            {session.transcript
              .slice(0, isCompleted ? session.transcript.length : session.transcript.length - 1)
              .map((turn) => {
                const isExpanded = expandedTurns[turn.turnIndex] ?? false;
                return (
                  <div
                    key={turn.turnIndex}
                    className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-2xs space-y-3 hover:border-indigo-200 transition-colors"
                  >
                    <div
                      onClick={() =>
                        setExpandedTurns((prev) => ({
                          ...prev,
                          [turn.turnIndex]: !prev[turn.turnIndex],
                        }))
                      }
                      className="flex items-center justify-between text-xs cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          Turn #{turn.turnIndex}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="capitalize font-medium text-slate-600">
                          {turn.difficulty}
                        </span>
                        {turn.score !== undefined && (
                          <span className="px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                            <span>⭐</span>
                            <span>{turn.score}/10</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-slate-400 group-hover:text-slate-600">
                        <span className="text-[11px] font-semibold">
                          {isExpanded ? 'Collapse' : 'Review'}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-semibold line-clamp-1">
                      {turn.questionText}
                    </p>

                    {isExpanded && (
                      <div className="space-y-3 pt-3 border-t border-slate-100 text-xs animate-in fade-in duration-200">
                        {turn.userAnswer && (
                          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                            <span className="font-bold text-slate-900 block text-[11px] flex items-center gap-1">
                              <span>Your Response:</span>
                              <span>💬</span>
                            </span>
                            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {turn.userAnswer}
                            </p>
                          </div>
                        )}

                        {turn.evaluatorFeedback && (
                          <div className="rounded-xl bg-indigo-50/70 p-3.5 border border-indigo-100 space-y-1">
                            <span className="font-bold text-indigo-900 block text-[11px] flex items-center gap-1">
                              <span>Evaluator Diagnostic Feedback:</span>
                              <span>🧠</span>
                            </span>
                            <p className="text-indigo-950 leading-relaxed font-medium">
                              {turn.evaluatorFeedback}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}
    </div>
  );
};
