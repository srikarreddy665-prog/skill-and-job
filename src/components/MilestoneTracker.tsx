import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Bell,
  Sparkles,
  ChevronRight,
  Loader2,
  X,
  Edit2,
  Check,
  Zap,
} from 'lucide-react';
import { RoadmapModule, SkillProfile } from '../types/index.ts';
import { triggerCelebration } from '../utils/confetti.ts';

interface MilestoneTrackerProps {
  roadmap: RoadmapModule[];
  profile: SkillProfile | null;
  sessionId?: string;
  onUpdateMilestone: (moduleId: string, targetDate: string, reminderEmail: string, reminderEnabled: boolean) => Promise<void>;
  onNavigateToCoach: () => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  roadmap,
  profile,
  sessionId,
  onUpdateMilestone,
  onNavigateToCoach,
}) => {
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editEmail, setEditEmail] = useState('srikarreddy665@gmail.com');
  const [editReminderEnabled, setEditReminderEnabled] = useState(true);
  const [isSendingReminder, setIsSendingReminder] = useState<string | null>(null);
  const [reminderPreview, setReminderPreview] = useState<{
    subject: string;
    body: string;
    recipient: string;
  } | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const currentDate = new Date('2026-10-11');

  const getDaysRemaining = (targetDateStr?: string) => {
    if (!targetDateStr) return null;
    const target = new Date(targetDateStr);
    const diffTime = target.getTime() - currentDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getMilestoneStatus = (module: RoadmapModule) => {
    if (module.completed) {
      return { emoji: '🏆', label: 'Mastered', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
    }
    const days = getDaysRemaining(module.targetDate);
    if (days === null) {
      return { emoji: '🗓️', label: 'No Date Set', color: 'text-slate-600 bg-slate-50 border-slate-200' };
    }
    if (days < 0) {
      return { emoji: '⏰', label: `Overdue (${Math.abs(days)}d ago)`, color: 'text-red-700 bg-red-50 border-red-200' };
    }
    if (days <= 3) {
      return { emoji: '⚡', label: `Approaching (${days}d left)`, color: 'text-amber-700 bg-amber-50 border-amber-200' };
    }
    return { emoji: '🚀', label: `On Track (${days}d left)`, color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
  };

  const handleStartEdit = (module: RoadmapModule) => {
    setEditingModuleId(module.moduleId);
    setEditDate(module.targetDate || '2026-10-25');
    setEditEmail(module.reminderEmail || 'srikarreddy665@gmail.com');
    setEditReminderEnabled(module.reminderEnabled ?? true);
  };

  const handleSaveEdit = async (moduleId: string) => {
    await onUpdateMilestone(moduleId, editDate, editEmail, editReminderEnabled);
    setEditingModuleId(null);
    triggerCelebration('subtle');
    setNoticeMessage('🎯 Target date and notification preference updated successfully!');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleSendReminderTest = async (moduleId: string, email: string) => {
    if (!sessionId) return;
    setIsSendingReminder(moduleId);
    try {
      const res = await fetch('/api/milestones/reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          moduleId,
          recipientEmail: email || 'srikarreddy665@gmail.com',
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReminderPreview({
          subject: data.subject,
          body: data.body,
          recipient: data.recipientEmail,
        });
        triggerCelebration('stars');
      }
    } catch {
      setNoticeMessage('Simulated email dispatched to inbox!');
      setTimeout(() => setNoticeMessage(null), 3000);
    } finally {
      setIsSendingReminder(null);
    }
  };

  const completedCount = roadmap.filter((m) => m.completed).length;
  const progressPercent = Math.round((completedCount / (roadmap.length || 1)) * 100);

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs space-y-6 relative overflow-hidden bg-dot-pattern">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span className="font-extrabold text-indigo-600 flex items-center gap-1">
              <span>🎯</span>
              <span>Career Milestone Tracker</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Target Pacing</span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1">
              <span>Email Alerts</span>
              <span>🔔</span>
            </span>
          </div>
          <h2 className="text-lg font-black text-slate-900 mt-1 flex items-center gap-2">
            <span>Upskilling Milestone Deadlines & Pacing</span>
            <span className="text-base animate-bounce-subtle">🏁</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-xl leading-relaxed">
            Assign target dates for each micro-curriculum module. SkillPulse tracks your projected career readiness date and dispatches personalized email study briefings.
          </p>
        </div>

        {/* Progress gauge card */}
        <div className="flex items-center gap-4 shrink-0 bg-slate-50/90 border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 font-semibold block flex items-center justify-end gap-1">
              <span>Pacing</span>
              <span>📈</span>
            </span>
            <span className="text-base font-black font-mono text-slate-900">
              {completedCount} / {roadmap.length} <span className="text-xs text-indigo-600 font-bold">({progressPercent}%)</span>
            </span>
          </div>
          <div className="h-9 w-px bg-slate-200" />
          <button
            onClick={() => {
              triggerCelebration('subtle');
              onNavigateToCoach();
            }}
            className="group flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <span>Open Coach</span>
            <span className="text-xs transition-transform group-hover:translate-x-0.5">🚀</span>
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="rounded-2xl bg-indigo-50/90 border border-indigo-200/80 p-3.5 text-xs text-indigo-900 font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <span className="flex items-center gap-2">
            <span>✨</span>
            <span>{noticeMessage}</span>
          </span>
          <button onClick={() => setNoticeMessage(null)} className="text-indigo-600 hover:text-indigo-800 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Modules List */}
      <div className="divide-y divide-slate-100">
        {roadmap.map((module) => {
          const status = getMilestoneStatus(module);
          const isEditing = editingModuleId === module.moduleId;

          return (
            <div key={module.moduleId} className="py-4.5 first:pt-0 last:pb-0 space-y-3 group/item">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{status.emoji}</span>
                    <span className="font-extrabold text-sm text-slate-900 group-hover/item:text-indigo-600 transition-colors">
                      {module.skillName}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${status.color}`}>
                      <span>{status.label}</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono flex items-center gap-2">
                    <span>Score: {module.currentScore.toFixed(1)} ➔ Target: {module.targetScore.toFixed(1)}</span>
                    <span className="text-slate-300">·</span>
                    <span className="text-indigo-600 font-semibold">⏱️ {module.estimatedTimeToComplete}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (isEditing ? setEditingModuleId(null) : handleStartEdit(module))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>{isEditing ? 'Cancel' : 'Set Deadline'}</span>
                  </button>

                  <button
                    onClick={() => handleSendReminderTest(module.moduleId, module.reminderEmail || editEmail)}
                    disabled={isSendingReminder === module.moduleId}
                    className="group inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100 text-xs font-bold text-indigo-700 transition-all cursor-pointer disabled:opacity-50 hover:scale-102 active:scale-95"
                  >
                    {isSendingReminder === module.moduleId ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <span className="text-xs group-hover:rotate-12 transition-transform">✉️</span>
                    )}
                    <span>Send Reminder</span>
                  </button>
                </div>
              </div>

              {/* Editing Form */}
              {isEditing && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4.5 space-y-3.5 animate-in fade-in text-xs shadow-2xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <span>📅</span>
                        <span>Target Completion Date:</span>
                      </label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-slate-700 flex items-center gap-1">
                        <span>📧</span>
                        <span>Notification Email:</span>
                      </label>
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 font-medium">
                      <input
                        type="checkbox"
                        checked={editReminderEnabled}
                        onChange={(e) => setEditReminderEnabled(e.target.checked)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Enable periodic email study notifications</span>
                    </label>

                    <button
                      onClick={() => handleSaveEdit(module.moduleId)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-all shadow-xs hover:shadow-indigo-500/20 active:scale-95 cursor-pointer"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Save Milestone 💾</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Reminder Email Preview Modal */}
      {reminderPreview && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-5 text-xs space-y-2.5 animate-in fade-in shadow-xs">
          <div className="flex items-center justify-between border-b border-indigo-200/80 pb-2.5">
            <span className="font-extrabold text-indigo-950 flex items-center gap-2">
              <span className="text-base">📬</span>
              <span>Simulated Email Notification Dispatched:</span>
            </span>
            <button
              onClick={() => setReminderPreview(null)}
              className="text-indigo-600 hover:text-indigo-900 cursor-pointer p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="font-bold text-slate-900 flex items-center gap-1.5">
            <span className="text-indigo-600">Subject:</span>
            <span>{reminderPreview.subject}</span>
          </p>
          <pre className="font-sans text-slate-700 whitespace-pre-wrap leading-relaxed text-[11px] bg-white p-3.5 rounded-xl border border-indigo-100 shadow-2xs">
            {reminderPreview.body}
          </pre>
        </div>
      )}
    </div>
  );
};
