export type AssessmentDomain =
  | 'Full Stack Engineering'
  | 'Backend Architecture'
  | 'Frontend Systems'
  | 'AI & Machine Learning Engineering'
  | 'Cloud Infrastructure & DevOps'
  | 'System Security & Reliability';

export type TurnDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface TranscriptTurn {
  turnIndex: number;
  questionId: string;
  domain: AssessmentDomain;
  difficulty: TurnDifficulty;
  scenario: string;
  questionText: string;
  codeContext?: string;
  expectedEvaluationRubric?: string;
  userAnswer?: string;
  userCodeAnswer?: string;
  evaluatorFeedback?: string;
  score?: number; // 0-10
  timestamp: number;
}

export interface AssessmentSession {
  sessionId: string;
  userId: string;
  domain: AssessmentDomain;
  targetRoleTitle?: string;
  candidateSummary?: string;
  status: 'in_progress' | 'completed';
  currentTurn: number;
  maxTurns: number;
  currentDifficulty: TurnDifficulty;
  transcript: TranscriptTurn[];
  createdAt: number;
  updatedAt: number;
}

export interface SkillDimension {
  name: string;
  category: string;
  score: number; // 0 to 10
  maxScore: number; // 10
  benchmarkMinRequired: number; // default comparison
  description: string;
  verifiedStrengths: string[];
  criticalGaps: string[];
}

export interface SkillProfile {
  profileId: string;
  sessionId: string;
  userId: string;
  domain: AssessmentDomain;
  overallReadinessTier: string; // e.g. "Lead Backend Systems Engineer", "Mid-Level Full Stack"
  overallScore: number; // 0 - 100
  executiveSummary: string;
  dimensions: SkillDimension[];
  keyStrengths: string[];
  criticalGaps: string[];
  interviewRiskNotes: string[];
  createdAt: number;
  updatedAt: number;
}

export interface RequiredSkillWeight {
  skillName: string;
  minRequiredScore: number; // R_i (0-10)
  weight: number; // W_i (1-5)
  importance: 'critical' | 'high' | 'medium';
  description: string;
}

export interface JobBenchmark {
  jobId: string;
  title: string;
  domain: AssessmentDomain;
  companyTier: string; // e.g. "Series B High-Scale", "Tier 1 Enterprise", "AI Platform Lab"
  experienceLevel: string; // "Mid-Level", "Senior", "Staff"
  salaryRange: string; // e.g. "$160k - $210k"
  location: string; // "Remote (US)", "Hybrid / Bay Area", "Remote Global"
  summary: string;
  requiredSkills: RequiredSkillWeight[];
  typicalStack: string[];
}

export interface SkillGapAnalysis {
  skillName: string;
  userScore: number;
  requiredScore: number;
  ratio: number;
  delta: number;
  isGap: boolean;
  status: 'surpassed' | 'met' | 'moderate_gap' | 'critical_gap';
  remedyAction: string;
}

export interface JobMatchResult {
  job: JobBenchmark;
  matchPercentage: number; // 0 - 100 mathematically calculated
  status: 'ready' | 'upskill_needed' | 'critical_foundation';
  statusLabel: string; // "Ready to Apply", "2-3 Weeks Upskilling", "Fundamental Gaps"
  aiVerdict: string;
  provenStrengths: string[];
  blockingGaps: string[];
  gapDetails: SkillGapAnalysis[];
}

export interface CareerMilestone {
  milestoneId: string;
  moduleId: string;
  skillName: string;
  targetDate: string; // YYYY-MM-DD
  reminderEmail: string;
  reminderFrequency: 'daily' | '2_days_before' | 'weekly';
  reminderEnabled: boolean;
  notes?: string;
  status: 'on_track' | 'approaching' | 'overdue' | 'completed';
  daysRemaining: number;
  lastReminderSentAt?: number;
}

export interface RoadmapModule {
  moduleId: string;
  skillName: string;
  priority: 'high' | 'critical' | 'medium';
  currentScore: number;
  targetScore: number;
  estimatedTimeToComplete: string;
  targetDate?: string; // Target milestone date YYYY-MM-DD
  reminderEmail?: string;
  reminderEnabled?: boolean;
  stage1Concept: {
    title: string;
    overview: string;
    corePrinciples: string[];
    architecturalPattern: string;
    documentationReferences: Array<{ title: string; url: string; note: string }>;
  };
  stage2HandsOnTask: {
    title: string;
    scenario: string;
    starterCodeSnippet?: string;
    taskRequirements: string[];
    verificationCriteria: string[];
  };
  stage3ReTest: {
    questionId: string;
    challengeTitle: string;
    scenarioPrompt: string;
    sampleCodeOrTemplate?: string;
  };
  completed: boolean;
  reTestSubmission?: {
    answer: string;
    evaluatedAt: number;
    scoreAwarded: number;
    passed: boolean;
    feedback: string;
  };
}

export type MemoryCategory = 'identity' | 'goal' | 'skill' | 'preference' | 'experience' | 'insight';

export interface UserMemoryItem {
  id: string;
  key: string;
  value: string;
  category: MemoryCategory;
  confidence: number;
  extractedFrom: string;
  timestamp: number;
}

export interface ChatMessageRecord {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  modelUsed?: string;
  tokensStreamed?: number;
  sources?: Array<{ title: string; uri: string }>;
  searchQueries?: string[];
  memoriesApplied?: string[];
  speedTokensPerSec?: number;
}

export type AdvisorSystemRole =
  | 'general_reasoning'
  | 'jobs_coaching_search'
  | 'mentor'
  | 'interviewer'
  | 'salary_market';

export interface ChatSessionRecord {
  id: string;
  title: string;
  systemRole: AdvisorSystemRole;
  modelUsed: string;
  messages: ChatMessageRecord[];
  summary?: string;
  createdAt: number;
  updatedAt: number;
}

export interface LiveJobItem {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryBand: string;
  postedDate: string;
  summary: string;
  keySkills: string[];
  seniority: string;
  url: string;
  isVerifiedLive: boolean;
  source: string;
}

export interface SkillsCoachingItem {
  id: string;
  programName: string;
  provider: string;
  category: 'interview_coaching' | 'system_design' | 'slikks_mentorship' | 'distributed_systems' | 'executive';
  rating: number;
  reviewCount: number;
  pricing: string;
  duration: string;
  overview: string;
  highlights: string[];
  url: string;
  verifiedSource: string;
}

