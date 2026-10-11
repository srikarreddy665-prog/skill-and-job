import React, { useState } from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Terminal,
  Briefcase,
  GraduationCap,
  Bot,
  Menu,
  X,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';
import { triggerCelebration } from '../utils/confetti.ts';

export type ActiveTab = 'dashboard' | 'assessment' | 'jobs' | 'coach' | 'advisor';

interface TopNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onOpenNewAssessment: () => void;
  isEvaluating?: boolean;
  domainName?: string;
  turnsCount?: number;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenNewAssessment,
  isEvaluating = false,
  domainName = 'Backend Architecture',
  turnsCount = 0,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    emoji: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      emoji: '📊',
      icon: <LayoutDashboard className="h-3.5 w-3.5" />,
    },
    {
      id: 'assessment',
      label: 'Assessment Room',
      emoji: '⚡',
      icon: <Terminal className="h-3.5 w-3.5" />,
      badge: turnsCount > 0 ? `${turnsCount} turns` : undefined,
    },
    {
      id: 'jobs',
      label: 'Job Matching',
      emoji: '🎯',
      icon: <Briefcase className="h-3.5 w-3.5" />,
    },
    {
      id: 'coach',
      label: 'Upskilling Coach',
      emoji: '🚀',
      icon: <GraduationCap className="h-3.5 w-3.5" />,
    },
    {
      id: 'advisor',
      label: 'AI Advisor',
      emoji: '🧠',
      icon: <Bot className="h-3.5 w-3.5" />,
      badge: 'Live ⚡',
    },

  ];

  const handleTabClick = (tabId: ActiveTab) => {
    onSelectTab(tabId);
    setMobileMenuOpen(false);
  };

  const handleBrandClick = () => {
    handleTabClick('dashboard');
    triggerCelebration('subtle');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Logo & Interactive Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 text-left group transition-all transform active:scale-95"
            title="SkillPulse Career Engine · Click for confetti spark!"
          >
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-900 via-indigo-700 to-indigo-500 text-white flex items-center justify-center font-bold text-xs tracking-tight shadow-md group-hover:shadow-indigo-500/25 group-hover:scale-105 transition-all duration-300">
              <Zap className="h-4 w-4 text-amber-300 fill-amber-300 animate-bounce-subtle" />
              <span className="absolute -top-1 -right-1 text-[10px] animate-wiggle">✨</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">
                  SkillPulse
                </span>
                <span className="text-xs transition-transform group-hover:rotate-12 duration-200">⚡</span>
              </div>
              <span className="text-[10px] font-medium text-slate-500 tracking-wide">
                Agentic Assessment & Growth
              </span>
            </div>
          </button>

          {domainName && (
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50/70 border border-indigo-200/60 text-[11px] font-medium text-indigo-800 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="truncate max-w-40 font-semibold">{domainName}</span>
              <span className="text-slate-400">·</span>
              <span className="text-indigo-600 font-mono text-[10px]">Gemini 2.5</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <span className="text-xs transition-transform group-hover:scale-125 duration-200">
                  {item.emoji}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-medium ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Theme Toggle & Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-slate-700/60 transition-all duration-200 cursor-pointer shadow-xs active:scale-95"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-400" />
              )}
            </button>
          )}

          <button
            onClick={() => {
              triggerCelebration('stars');
              onOpenNewAssessment();
            }}
            disabled={isEvaluating}
            className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm hover:shadow-md hover:shadow-indigo-500/20 active:scale-95 transition-all duration-200 disabled:opacity-50 cursor-pointer overflow-hidden"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              <span className="transition-transform group-hover:rotate-45 duration-300">🪄</span>
              <span>New Assessment</span>
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/90 bg-white/95 backdrop-blur-lg px-4 py-3 space-y-1 shadow-lg animate-in slide-in-from-top-2 duration-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
