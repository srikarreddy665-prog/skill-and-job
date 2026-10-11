import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Globe,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Loader2,
  ExternalLink,
  Bot,
  User,
  Zap,
  Sparkles,
  Copy,
  Check,
  Brain,
  History,
  Plus,
  Trash2,
  X,
  Square,
  Bookmark,
  ChevronRight,
  ShieldAlert,
  Flame,
  Search,
  Briefcase,
  GraduationCap,
  MessageSquare,
  Compass,
} from 'lucide-react';
import {
  SkillProfile,
  UserMemoryItem,
  ChatSessionRecord,
  ChatMessageRecord,
  AdvisorSystemRole,
  MemoryCategory,
  LiveJobItem,
  SkillsCoachingItem,
} from '../types/index.ts';
import { triggerCelebration } from '../utils/confetti.ts';

interface AdvisorChatProps {
  profile: SkillProfile | null;
  sessionId?: string;
}

export const AdvisorChat: React.FC<AdvisorChatProps> = ({ profile, sessionId }) => {
  // Chat state
  const [messages, setMessages] = useState<ChatMessageRecord[]>([
    {
      id: 'init-1',
      role: 'model',
      content: `Hello Srikar! 👋 I am your AI Career, Reasoning & Architectural Partner.

I retain long-term persistent memory of your profile (**Staff Distributed Systems Engineer / L6**, verified cache stampede mitigation at 8.8/10, active distributed lock & DB index milestones), target companies (**Google, Stripe, Datadog**), and past conversations.

Feel free to engage in **general balanced conversation**, explore **live 2026 tech jobs**, check out **Slikks skills coaching**, or deep-dive into architectural trade-offs! How are you feeling today? 🚀`,
      timestamp: Date.now(),
      modelUsed: 'gemini-3.8-flash',
      speedTokensPerSec: 72,
      memoriesApplied: ['Target Career Role', 'Core Tech Stack', 'Candidate Name'],
    },
  ]);

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [enableSearch, setEnableSearch] = useState(false);
  const [modelMode, setModelMode] = useState<'turbo' | 'standard'>('turbo');
  const [systemRole, setSystemRole] = useState<AdvisorSystemRole>('general_reasoning');
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [micNotice, setMicNotice] = useState<string | null>(null);
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);

  // Memory management state
  const [memories, setMemories] = useState<UserMemoryItem[]>([]);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [newMemKey, setNewMemKey] = useState('');
  const [newMemVal, setNewMemVal] = useState('');
  const [newMemCategory, setNewMemCategory] = useState<MemoryCategory>('goal');
  const [memoryFilter, setMemoryFilter] = useState<string>('all');

  // Multi-chat session state (Remember every chat)
  const [chatSessions, setChatSessions] = useState<ChatSessionRecord[]>([]);
  const [activeChatId, setActiveChatId] = useState<string>('chat-current');
  const [activeChatTitle, setActiveChatTitle] = useState<string>('Career Reasoning & Live Market');
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);

  // Live Jobs & Coaching Explorer Modal
  const [showExplorerModal, setShowExplorerModal] = useState(false);
  const [explorerTab, setExplorerTab] = useState<'jobs' | 'coaching'>('jobs');
  const [liveJobs, setLiveJobs] = useState<LiveJobItem[]>([]);
  const [skillsCoaching, setSkillsCoaching] = useState<SkillsCoachingItem[]>([]);
  const [isLoadingExplorer, setIsLoadingExplorer] = useState(false);
  const [explorerSearchQuery, setExplorerSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom on new chunks
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Load memories and past chat sessions from server
  const loadMemoriesAndSessions = async () => {
    try {
      const [memRes, sesRes] = await Promise.all([
        fetch('/api/user/memories'),
        fetch('/api/chat/sessions'),
      ]);

      if (memRes.ok) {
        const memData = await memRes.json();
        if (memData.memories) setMemories(memData.memories);
      }

      if (sesRes.ok) {
        const sesData = await sesRes.json();
        if (sesData.sessions) setChatSessions(sesData.sessions);
      }
    } catch (e) {
      console.warn('Could not load memories/sessions:', e);
    }
  };

  useEffect(() => {
    loadMemoriesAndSessions();
  }, []);

  // Fetch Live Jobs & Coaching data for Explorer
  const loadExplorerData = async () => {
    setIsLoadingExplorer(true);
    try {
      const [jobsRes, coachRes] = await Promise.all([
        fetch(`/api/search/live-jobs?q=${encodeURIComponent(explorerSearchQuery || 'Staff Distributed Systems Engineer')}`),
        fetch(`/api/search/skills-coaching?q=${encodeURIComponent(explorerSearchQuery || 'Slikks skills coaching mentorship')}`),
      ]);

      if (jobsRes.ok) {
        const jData = await jobsRes.json();
        if (jData.jobs) setLiveJobs(jData.jobs);
      }
      if (coachRes.ok) {
        const cData = await coachRes.json();
        if (cData.coachingPrograms) setSkillsCoaching(cData.coachingPrograms);
      }
    } catch (err) {
      console.error('Failed to load explorer data:', err);
    } finally {
      setIsLoadingExplorer(false);
    }
  };

  useEffect(() => {
    if (showExplorerModal && liveJobs.length === 0) {
      loadExplorerData();
    }
  }, [showExplorerModal]);

  // Speech recognition setup
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(transcript);
          sendMessage(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleMic = () => {
    if (!recognitionRef.current) {
      setMicNotice('Speech recognition is not supported in this browser environment.');
      setTimeout(() => setMicNotice(null), 3500);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
        setIsListening(false);
      }
    }
  };

  // Text to Speech
  const speakText = async (text: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.slice(0, 300) }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
          audio.play();
          return;
        }
      }
    } catch {
      // fallback
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Stop Generation button handler
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  // Ultra-Fast Live Streaming Send Message
  const sendMessage = async (overridePrompt?: string) => {
    const query = overridePrompt || input;
    if (!query.trim() || isStreaming) return;

    setInput('');
    const userMessageId = `msg-${Date.now()}-u`;
    const botMessageId = `msg-${Date.now()}-b`;

    const userMsg: ChatMessageRecord = {
      id: userMessageId,
      role: 'user',
      content: query,
      timestamp: Date.now(),
    };

    const initialBotMsg: ChatMessageRecord = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      modelUsed: enableSearch || systemRole === 'jobs_coaching_search' ? 'gemini-3.8-flash' : (modelMode === 'turbo' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash'),
    };

    const newHistory = [...messages, userMsg];
    setMessages([...newHistory, initialBotMsg]);
    setIsStreaming(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const startTime = Date.now();
    let accumulatedText = '';
    let appliedMems: string[] = [];
    let sourcesFound: Array<{ title: string; uri: string }> = [];
    let searchQueriesFound: string[] = [];
    let detectedSpeed = 0;

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortController.signal,
        body: JSON.stringify({
          message: query,
          history: newHistory.map((m) => ({ role: m.role, content: m.content })),
          sessionId,
          chatId: activeChatId,
          modelChoice: modelMode,
          enableSearch: enableSearch || systemRole === 'jobs_coaching_search',
          systemRole,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming connection failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.chunk) {
                accumulatedText += data.chunk;
                const elapsedSec = Math.max(0.2, (Date.now() - startTime) / 1000);
                const estimatedTokens = Math.ceil(accumulatedText.length / 4);
                const spd = Math.round(estimatedTokens / elapsedSec);
                setCurrentSpeed(spd);

                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? {
                          ...msg,
                          content: accumulatedText,
                          speedTokensPerSec: spd,
                        }
                      : msg
                  )
                );
              }

              if (data.appliedMemories) {
                appliedMems = data.appliedMemories;
              }

              if (data.searchSources) {
                sourcesFound = data.searchSources;
              }

              if (data.searchQueries) {
                searchQueriesFound = data.searchQueries;
              }

              if (data.speedTokensPerSec) {
                detectedSpeed = data.speedTokensPerSec;
              }

              if (data.done) {
                // Finalize bot message
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === botMessageId
                      ? {
                          ...msg,
                          content: data.fullText || accumulatedText,
                          memoriesApplied: data.appliedMemories || appliedMems,
                          sources: data.searchSources || sourcesFound,
                          searchQueries: data.searchQueries || searchQueriesFound,
                          speedTokensPerSec: data.speedTokensPerSec || detectedSpeed || 68,
                          modelUsed: data.modelUsed,
                        }
                      : msg
                  )
                );
              }
            } catch {
              // ignore malformed chunks
            }
          }
        }
      }

      // Refresh memories in background to reflect any new facts automatically learned
      setTimeout(() => {
        loadMemoriesAndSessions();
      }, 1000);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content: accumulatedText + '\n\n*(Generation stopped by user)*',
                }
              : msg
          )
        );
      } else {
        console.error('Streaming error, falling back:', err);
        // Fallback to non-streaming endpoint
        try {
          const fbRes = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: query,
              history: newHistory.map((m) => ({ role: m.role, content: m.content })),
              sessionId,
              chatId: activeChatId,
              modelChoice: modelMode,
              enableSearch: enableSearch || systemRole === 'jobs_coaching_search',
              systemRole,
            }),
          });
          if (fbRes.ok) {
            const fbData = await fbRes.json();
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === botMessageId
                  ? {
                      ...msg,
                      content: fbData.reply,
                      memoriesApplied: fbData.appliedMemories || appliedMems,
                      sources: fbData.searchSources || [],
                      modelUsed: fbData.modelUsed,
                    }
                  : msg
              )
            );
          }
        } catch {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === botMessageId
                ? {
                    ...msg,
                    content:
                      'Grounded advice engine is currently reconnecting. Please retry your inquiry.',
                  }
                : msg
            )
          );
        }
      }
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Add new user memory manually
  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemKey.trim() || !newMemVal.trim()) return;

    try {
      const res = await fetch('/api/user/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: newMemKey.trim(),
          value: newMemVal.trim(),
          category: newMemCategory,
          confidence: 1.0,
          extractedFrom: 'User Added in UI',
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
        setNewMemKey('');
        setNewMemVal('');
        triggerCelebration('subtle');
      }
    } catch (e) {
      console.error('Failed to add memory:', e);
    }
  };

  // Delete user memory
  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/user/memories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        const data = await res.json();
        setMemories(data.memories || []);
      }
    } catch (e) {
      console.error('Failed to delete memory:', e);
    }
  };

  // Switch or create a new chat session (Remember Every Chat)
  const handleSelectSession = (session: ChatSessionRecord) => {
    setActiveChatId(session.id);
    setActiveChatTitle(session.title);
    setMessages(session.messages || []);
    setSystemRole(session.systemRole || 'general_reasoning');
    setShowHistoryDrawer(false);
  };

  const handleStartNewChat = async () => {
    const newId = `chat-${Date.now()}`;
    const newTitle = `Advisory Session #${chatSessions.length + 1}`;
    const initialMsg: ChatMessageRecord = {
      id: `msg-${Date.now()}`,
      role: 'model',
      content: `Hello Srikar! 🚀 New conversation started with full access to your persistent memory bank. What question or topic shall we explore today?`,
      timestamp: Date.now(),
    };

    try {
      await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          title: newTitle,
          systemRole,
          modelUsed: modelMode === 'turbo' ? 'gemini-3.1-flash-lite' : 'gemini-3.8-flash',
          messages: [initialMsg],
        }),
      });

      setActiveChatId(newId);
      setActiveChatTitle(newTitle);
      setMessages([initialMsg]);
      setShowHistoryDrawer(false);
      loadMemoriesAndSessions();
      triggerCelebration('subtle');
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' });
      loadMemoriesAndSessions();
      if (activeChatId === id) {
        handleStartNewChat();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredMemories =
    memoryFilter === 'all'
      ? memories
      : memories.filter((m) => m.category === memoryFilter);

  // Suggested prompts covering general chats, live jobs, Slikks, and architecture
  const starterPrompts = [
    { text: 'How do I balance intense career ambition with everyday mental well-being?', emoji: '💬', role: 'general_reasoning' },
    { text: 'Search Google for live Staff Software Engineer jobs hiring at Google and Stripe', emoji: '💼', role: 'jobs_coaching_search' },
    { text: 'Tell me about Slikks skills coaching and how it accelerates tech careers', emoji: '🎓', role: 'jobs_coaching_search' },
    { text: 'What is the calibrated 2026 TC band for my L6 score and background?', emoji: '💰', role: 'salary_market' },
    { text: 'Simulate a mock question on Redlock monotonic fencing tokens', emoji: '⚡', role: 'interviewer' },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-20">
      {/* Top Header & Toolbar with Live Responsive Controls */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs bg-dot-pattern">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-900 text-white flex items-center justify-center shadow-md animate-bounce-subtle">
                <span className="text-2xl">🤖</span>
              </div>
              {/* Live Streaming indicator pulse */}
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>AI Advisor</span>
                  <span className="text-sm">⚡</span>
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Zap className="h-2.5 w-2.5 fill-emerald-500" />
                  Live Responsive
                </span>
                {(enableSearch || systemRole === 'jobs_coaching_search') && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    <Globe className="h-2.5 w-2.5 text-blue-600" />
                    Google Search Data
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                Active Thread: <span className="font-semibold text-slate-700">{activeChatTitle}</span>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons: Explorer, Memory Inspector & Chat History */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Jobs & Coaching Explorer Button */}
            <button
              onClick={() => setShowExplorerModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-bold text-xs transition-all shadow-2xs hover:scale-102 cursor-pointer"
              title="Explore live jobs and Slikks coaching grounded in Google web data"
            >
              <Globe className="h-3.5 w-3.5 text-blue-600" />
              <span>Jobs & Slikks Explorer</span>
              <span className="px-1.5 py-0.2 bg-blue-200/80 rounded-full text-[10px] font-black text-blue-900">
                Live 🌐
              </span>
            </button>

            {/* Brain Memory Button */}
            <button
              onClick={() => setShowMemoryModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200/80 font-bold text-xs transition-all shadow-2xs hover:scale-102 cursor-pointer"
              title="View and edit facts remembered by the AI"
            >
              <Brain className="h-3.5 w-3.5 text-purple-600 animate-pulse" />
              <span>AI Memory Bank</span>
              <span className="px-1.5 py-0.2 bg-purple-200/80 rounded-full text-[10px] font-black text-purple-800">
                {memories.length}
              </span>
            </button>

            {/* Chat History Button (Remember Every Chat) */}
            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs transition-all shadow-2xs hover:scale-102 cursor-pointer"
              title="Switch between saved chat threads"
            >
              <History className="h-3.5 w-3.5 text-slate-600" />
              <span>All Chats</span>
              <span className="px-1.5 py-0.2 bg-slate-200 rounded-full text-[10px] font-black text-slate-800">
                {chatSessions.length}
              </span>
            </button>

            {/* New Chat Button */}
            <button
              onClick={handleStartNewChat}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-all shadow-2xs hover:scale-102 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New</span>
            </button>
          </div>
        </div>

        {/* Second Row: Role Switcher & Ultra-Fast Speed Toggle */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Persona selector (Includes General & Reasoning + Live Jobs/Coaching) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl font-bold overflow-x-auto max-w-full">
            <button
              onClick={() => setSystemRole('general_reasoning')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                systemRole === 'general_reasoning'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              General & Reasoning 💡
            </button>
            <button
              onClick={() => setSystemRole('jobs_coaching_search')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                systemRole === 'jobs_coaching_search'
                  ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Live Jobs & Slikks 🌐
            </button>
            <button
              onClick={() => setSystemRole('mentor')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                systemRole === 'mentor'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mentor 🧑‍🏫
            </button>
            <button
              onClick={() => setSystemRole('interviewer')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                systemRole === 'interviewer'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Interviewer 🧐
            </button>
            <button
              onClick={() => setSystemRole('salary_market')}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                systemRole === 'salary_market'
                  ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Market 💵
            </button>
          </div>

          {/* Model Speed Mode & Grounding Switches */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Speed toggle */}
            <div className="flex items-center gap-1 p-0.5 bg-amber-50 rounded-lg border border-amber-200/80">
              <button
                onClick={() => setModelMode('turbo')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                  modelMode === 'turbo'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-amber-800 hover:text-amber-950'
                }`}
              >
                <Zap className="h-3 w-3 fill-white" />
                <span>Turbo Flash</span>
              </button>
              <button
                onClick={() => setModelMode('standard')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                  modelMode === 'standard'
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Smart Pro</span>
              </button>
            </div>

            {/* Google Search Grounding toggle */}
            <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-700 font-bold hover:text-slate-900">
              <input
                type="checkbox"
                checked={enableSearch || systemRole === 'jobs_coaching_search'}
                onChange={(e) => setEnableSearch(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span className="flex items-center gap-1">
                <Globe className="h-3 w-3 text-indigo-600" />
                <span>Google Data Grounding</span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Drawer: Chat Session History (Remember Every Chat) */}
      {showHistoryDrawer && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">
                Conversation History (Multi-Chat Memory Active)
              </h3>
            </div>
            <button
              onClick={() => setShowHistoryDrawer(false)}
              className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-2">
            The AI automatically retains and remembers context across every chat session below. Click any session to review or resume:
          </p>

          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
            {chatSessions.map((s) => (
              <div
                key={s.id}
                onClick={() => handleSelectSession(s)}
                className={`p-3 rounded-2xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 group ${
                  activeChatId === s.id
                    ? 'border-indigo-500 bg-indigo-50/50 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/60 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate">
                      {s.title}
                    </span>
                    {activeChatId === s.id && (
                      <span className="px-1.5 py-0.2 bg-indigo-200 text-indigo-800 rounded-full text-[9px] font-black">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                    {s.summary || `${s.messages.length} messages`}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    {new Date(s.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <button
                  onClick={(e) => handleDeleteSession(e, s.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 text-rose-600 rounded-lg transition-opacity"
                  title="Delete thread"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modal: Google Live Jobs & Slikks Coaching Explorer */}
      {showExplorerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
            <div className="p-5 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Globe className="h-6 w-6 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <span>Google Web Data & Market Intelligence</span>
                    <span className="text-xs bg-emerald-400/30 text-emerald-200 border border-emerald-300/40 px-2 py-0.5 rounded-full font-bold">
                      Live Grounded ⚡
                    </span>
                  </h3>
                  <p className="text-xs text-blue-100 mt-0.5">
                    Real-time tech jobs, hiring companies, and verified skills coaching (including Slikks platform)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowExplorerModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search bar & Tabs */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  value={explorerSearchQuery}
                  onChange={(e) => setExplorerSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadExplorerData()}
                  placeholder="Search jobs, tech, Slikks coaching..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex items-center p-1 bg-slate-200/80 rounded-xl text-xs font-bold w-full sm:w-auto">
                  <button
                    onClick={() => setExplorerTab('jobs')}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      explorerTab === 'jobs'
                        ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    <span>Live Jobs ({liveJobs.length})</span>
                  </button>
                  <button
                    onClick={() => setExplorerTab('coaching')}
                    className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      explorerTab === 'coaching'
                        ? 'bg-white text-blue-700 shadow-2xs font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Skills Coaching & Slikks ({skillsCoaching.length})</span>
                  </button>
                </div>

                <button
                  onClick={loadExplorerData}
                  disabled={isLoadingExplorer}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
                  title="Refresh Google Search data"
                >
                  {isLoadingExplorer ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Search'}
                </button>
              </div>
            </div>

            {/* Explorer Content Body */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {isLoadingExplorer ? (
                <div className="text-center py-12 space-y-2">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-semibold">
                    Querying Google Search web grounding for live data...
                  </p>
                </div>
              ) : explorerTab === 'jobs' ? (
                <div className="space-y-3">
                  {liveJobs.map((job) => (
                    <div
                      key={job.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-slate-900">{job.title}</span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-[10px] font-black border border-blue-200">
                            {job.company}
                          </span>
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                            {job.location}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{job.summary}</p>
                        <div className="flex items-center gap-2 flex-wrap text-[11px] pt-1">
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            💰 {job.salaryBand}
                          </span>
                          <span className="text-slate-400 font-medium">· Posted: {job.postedDate}</span>
                          <span className="text-slate-400 font-medium">· Source: {job.source}</span>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => {
                            setShowExplorerModal(false);
                            setSystemRole('jobs_coaching_search');
                            sendMessage(`What are the key system architecture requirements for this ${job.company} role: "${job.title}", and how does my background match?`);
                          }}
                          className="flex-1 sm:flex-initial px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          Ask Advisor 🤖
                        </button>
                        <a
                          href={job.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 sm:flex-initial px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-all shadow-2xs"
                        >
                          <span>Apply</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {skillsCoaching.map((coach) => (
                    <div
                      key={coach.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-purple-300 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-sm text-slate-900">{coach.programName}</span>
                            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-md text-[10px] font-black border border-purple-200">
                              {coach.provider}
                            </span>
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-md text-[10px] font-black">
                              ★ {coach.rating} ({coach.reviewCount} reviews)
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">{coach.overview}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => {
                              setShowExplorerModal(false);
                              setSystemRole('jobs_coaching_search');
                              sendMessage(`Can you explain the coaching curriculum of "${coach.programName}" and how it would help me reach Staff/L6 readiness?`);
                            }}
                            className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs rounded-xl transition-all cursor-pointer"
                          >
                            Ask Advisor 🤖
                          </button>
                          <a
                            href={coach.url}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition-all shadow-2xs"
                          >
                            <span>Visit Program</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      </div>

                      {/* Highlights */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                        {coach.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span className="line-clamp-1">{h}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                        <span className="font-bold text-slate-700">Pricing: {coach.pricing}</span>
                        <span>Duration: {coach.duration}</span>
                        <span className="text-slate-400">Verified via {coach.verifiedSource}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: AI Memory Bank Inspector */}
      {showMemoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
                  <Brain className="h-6 w-6 text-purple-200" />
                </div>
                <div>
                  <h3 className="text-base font-black flex items-center gap-2">
                    <span>AI Brain Memory Profile</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-bold">
                      {memories.length} Facts Recalled
                    </span>
                  </h3>
                  <p className="text-xs text-purple-200 mt-0.5">
                    Persistent facts about you that guide the AI's answers across every turn and chat
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowMemoryModal(false)}
                className="p-1.5 hover:bg-white/20 rounded-xl text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-1.5 text-xs font-bold">
              {['all', 'goal', 'skill', 'identity', 'preference', 'insight'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMemoryFilter(cat)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                    memoryFilter === cat
                      ? 'bg-purple-600 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Memories' : cat}
                </button>
              ))}
            </div>

            {/* Memory List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {filteredMemories.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Brain className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold">No memories found in this category.</p>
                </div>
              ) : (
                filteredMemories.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-purple-200 transition-all flex items-start justify-between gap-3 group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{m.key}</span>
                        <span className="px-2 py-0.2 bg-purple-100 text-purple-800 rounded-full text-[9px] font-black uppercase tracking-wider">
                          {m.category}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {Math.round(m.confidence * 100)}% confidence
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-1 font-medium">{m.value}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Learned from: {m.extractedFrom}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteMemory(m.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-100 text-rose-600 rounded-xl transition-all cursor-pointer"
                      title="Forget this memory"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add Memory Form */}
            <form onSubmit={handleAddMemory} className="p-4 bg-slate-50 border-t border-slate-200 space-y-2.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Plus className="h-3.5 w-3.5 text-purple-600" />
                <span>Teach the AI a new fact about you</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder="Key (e.g. Target Tech Stack)"
                  value={newMemKey}
                  onChange={(e) => setNewMemKey(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden"
                />
                <input
                  type="text"
                  placeholder="Value (e.g. Rust, Go, Raft, Kubernetes)"
                  value={newMemVal}
                  onChange={(e) => setNewMemVal(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500 focus:outline-hidden sm:col-span-1"
                />
                <div className="flex gap-2">
                  <select
                    value={newMemCategory}
                    onChange={(e) => setNewMemCategory(e.target.value as MemoryCategory)}
                    className="flex-1 px-2.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-hidden"
                  >
                    <option value="goal">🎯 Goal</option>
                    <option value="skill">🛠️ Skill</option>
                    <option value="preference">💡 Preference</option>
                    <option value="experience">💼 Experience</option>
                    <option value="identity">👤 Identity</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Conversation Stream View */}
      <section className="rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-xs min-h-[460px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[580px] pr-2">
          {messages.map((m) => {
            const isBot = m.role === 'model';
            return (
              <div
                key={m.id}
                className={`flex gap-3 text-sm ${isBot ? 'items-start' : 'items-start flex-row-reverse'}`}
              >
                {/* Avatar */}
                <div
                  className={`h-8 w-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black shadow-2xs ${
                    isBot
                      ? 'bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  {isBot ? '🤖' : '👤'}
                </div>

                {/* Message Bubble */}
                <div className="max-w-[85%] space-y-1.5">
                  <div
                    className={`rounded-2xl p-4 leading-relaxed transition-all ${
                      isBot
                        ? 'bg-slate-50/90 border border-slate-200/80 text-slate-800 shadow-2xs'
                        : 'bg-indigo-600 text-white shadow-xs'
                    }`}
                  >
                    {/* Bot Content with Markdown styling */}
                    <div className="whitespace-pre-wrap font-sans text-[13px] sm:text-sm">
                      {m.content}
                      {/* Live blinking cursor when this message is actively streaming */}
                      {isStreaming && m.id === messages[messages.length - 1]?.id && isBot && (
                        <span className="inline-block w-2 h-4 ml-1 bg-indigo-600 animate-pulse align-middle rounded-xs" />
                      )}
                    </div>

                    {/* Applied Memories Badge if bot remembered something */}
                    {isBot && m.memoriesApplied && m.memoriesApplied.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex flex-wrap items-center gap-1.5 text-[11px]">
                        <span className="inline-flex items-center gap-1 font-extrabold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200/60">
                          <Brain className="h-3 w-3" />
                          <span>Applied Memory:</span>
                        </span>
                        {m.memoriesApplied.map((memName, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-md text-[10px]"
                          >
                            {memName}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Google Search Queries if executed */}
                    {isBot && m.searchQueries && m.searchQueries.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs">
                        <span className="font-bold text-slate-500 block mb-1 flex items-center gap-1">
                          <Globe className="h-3 w-3 text-blue-600" />
                          <span>Google Search Queries Executed:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.searchQueries.map((q, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-mono font-medium border border-blue-200/60"
                            >
                              🔍 "{q}"
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Grounding Search Sources if available */}
                    {isBot && m.sources && m.sources.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 text-xs">
                        <span className="font-bold text-slate-500 block mb-1 flex items-center gap-1">
                          <Compass className="h-3 w-3 text-indigo-600" />
                          <span>Verified Web Grounding References:</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.sources.map((s, idx) => (
                            <a
                              key={idx}
                              href={s.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-slate-200 hover:border-indigo-300 text-indigo-700 hover:bg-indigo-50 text-[11px] font-semibold transition-all shadow-2xs"
                            >
                              <span>{s.title}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Meta & Action Bar */}
                  <div
                    className={`flex items-center gap-2 text-[10px] text-slate-400 px-1 ${
                      isBot ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>

                    {/* Live Speed telemetry */}
                    {isBot && m.speedTokensPerSec && (
                      <span className="inline-flex items-center gap-0.5 font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded-md">
                        <Zap className="h-2.5 w-2.5 fill-emerald-500" />
                        <span>{m.speedTokensPerSec} tok/s</span>
                      </span>
                    )}

                    {isBot && m.modelUsed && (
                      <span className="font-semibold text-slate-400">· {m.modelUsed}</span>
                    )}

                    {isBot && (
                      <div className="flex items-center gap-1 ml-1">
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                          title="Copy text"
                        >
                          {copiedId === m.id ? (
                            <Check className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </button>
                        <button
                          onClick={() => speakText(m.content)}
                          className="hover:text-slate-700 p-0.5 rounded transition-colors cursor-pointer"
                          title="Read aloud"
                        >
                          <Volume2 className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Suggested Question Chips based on User Memory, Live Jobs & Coaching */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold mb-2">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Suggested prompts tailored to your memory, market & reasoning:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {starterPrompts.map((p, idx) => (
              <button
                key={idx}
                disabled={isStreaming}
                onClick={() => {
                  setSystemRole(p.role as AdvisorSystemRole);
                  sendMessage(p.text);
                }}
                className="px-3 py-1.5 rounded-xl border border-slate-200/90 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-800 text-xs font-semibold transition-all shadow-2xs hover:scale-101 text-left cursor-pointer flex items-center gap-1.5"
              >
                <span>{p.emoji}</span>
                <span>{p.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Input & Live Responsive Controls */}
        <div className="mt-3 relative">
          {micNotice && (
            <div className="mb-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
              <span>{micNotice}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* Mic button */}
            <button
              onClick={toggleMic}
              type="button"
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-600 animate-pulse shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title="Speak prompt with microphone"
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </button>

            {/* Input box */}
            <input
              type="text"
              value={input}
              disabled={isStreaming}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isStreaming && sendMessage()}
              placeholder={
                isStreaming
                  ? 'AI is streaming live response...'
                  : systemRole === 'jobs_coaching_search'
                  ? 'Search live jobs, Slikks coaching, hiring companies in 2026...'
                  : systemRole === 'general_reasoning'
                  ? 'Chat about work-life balance, career choices, philosophical thoughts, everyday questions...'
                  : 'Ask about Kafka consensus, PostgreSQL buffers, compensation, or mock design rounds...'
              }
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-hidden transition-all shadow-2xs font-medium"
            />

            {/* Live Streaming Stop button or Send button */}
            {isStreaming ? (
              <button
                type="button"
                onClick={handleStopGeneration}
                className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse"
                title="Stop generation"
              >
                <Square className="h-3.5 w-3.5 fill-white" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim()}
                className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 text-white disabled:text-slate-400 transition-all shadow-md hover:scale-102 cursor-pointer disabled:cursor-not-allowed"
                title="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
