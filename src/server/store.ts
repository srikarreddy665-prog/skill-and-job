import {
  AssessmentDomain,
  AssessmentSession,
  RoadmapModule,
  SkillProfile,
  UserMemoryItem,
  ChatSessionRecord,
  ChatMessageRecord,
} from '../types/index.ts';

class AppStateStore {
  private sessions: Map<string, AssessmentSession> = new Map();
  private profiles: Map<string, SkillProfile> = new Map();
  private roadmaps: Map<string, RoadmapModule[]> = new Map();
  private memories: Map<string, UserMemoryItem> = new Map();
  private chatSessions: Map<string, ChatSessionRecord> = new Map();
  private connectedLinkedInProfile: any = null;

  constructor() {
    this.seedDefaultState();
  }

  public getLinkedInProfile(): any {
    return this.connectedLinkedInProfile;
  }

  public setLinkedInProfile(profile: any): void {
    this.connectedLinkedInProfile = profile;
    if (profile) {
      // Automatically learn memories from LinkedIn profile
      if (profile.fullName) {
        this.addOrUpdateMemory({
          key: 'Candidate Name',
          value: profile.fullName,
          category: 'identity',
          confidence: 1.0,
          extractedFrom: 'LinkedIn Profile Sync',
        });
      }
      if (profile.currentRole) {
        this.addOrUpdateMemory({
          key: 'Current Title',
          value: profile.currentRole,
          category: 'experience',
          confidence: 1.0,
          extractedFrom: 'LinkedIn Profile Sync',
        });
      }
      if (profile.skills && Array.isArray(profile.skills)) {
        this.addOrUpdateMemory({
          key: 'Verified Skill Baseline',
          value: profile.skills.join(', '),
          category: 'skill',
          confidence: 0.95,
          extractedFrom: 'LinkedIn Skill Endorsements',
        });
      }
    }
  }

  // ------------------------------------
  // User Memory Methods
  // ------------------------------------
  public getMemories(): UserMemoryItem[] {
    return Array.from(this.memories.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  public addOrUpdateMemory(item: Omit<UserMemoryItem, 'id' | 'timestamp'> & { id?: string }): UserMemoryItem {
    const memoryId = item.id || `mem-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const record: UserMemoryItem = {
      id: memoryId,
      key: item.key.trim(),
      value: item.value.trim(),
      category: item.category,
      confidence: item.confidence ?? 0.9,
      extractedFrom: item.extractedFrom || 'AI Interaction',
      timestamp: Date.now(),
    };
    this.memories.set(memoryId, record);
    return record;
  }

  public deleteMemory(id: string): boolean {
    return this.memories.delete(id);
  }

  public clearMemories(): void {
    this.memories.clear();
  }

  // ------------------------------------
  // Chat Session Records (Remember Every Chat)
  // ------------------------------------
  public getChatSessions(): ChatSessionRecord[] {
    return Array.from(this.chatSessions.values()).sort((a, b) => b.updatedAt - a.updatedAt);
  }

  public getChatSession(id: string): ChatSessionRecord | undefined {
    return this.chatSessions.get(id);
  }

  public saveChatSession(session: ChatSessionRecord): void {
    session.updatedAt = Date.now();
    this.chatSessions.set(session.id, session);
  }

  public deleteChatSession(id: string): boolean {
    return this.chatSessions.delete(id);
  }

  // ------------------------------------
  // Session Methods
  // ------------------------------------
  public getSession(id: string): AssessmentSession | undefined {
    return this.sessions.get(id);
  }

  public saveSession(session: AssessmentSession): void {
    session.updatedAt = Date.now();
    this.sessions.set(session.sessionId, session);
  }

  public getAllSessions(): AssessmentSession[] {
    return Array.from(this.sessions.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  // ------------------------------------
  // Skill Profile Methods
  // ------------------------------------
  public getProfile(sessionId: string): SkillProfile | undefined {
    return this.profiles.get(sessionId);
  }

  public saveProfile(profile: SkillProfile): void {
    profile.updatedAt = Date.now();
    this.profiles.set(profile.sessionId, profile);
  }

  public updateSkillScore(
    sessionId: string,
    skillName: string,
    newScore: number
  ): SkillProfile | undefined {
    const profile = this.profiles.get(sessionId);
    if (!profile) return undefined;

    const dim = profile.dimensions.find(
      (d) =>
        d.name.toLowerCase() === skillName.toLowerCase() ||
        d.name.toLowerCase().includes(skillName.toLowerCase()) ||
        skillName.toLowerCase().includes(d.name.toLowerCase())
    );

    if (dim) {
      dim.score = Number(Math.min(10, Math.max(0, newScore)).toFixed(1));
    }

    // Recalculate overall score
    const avgScore =
      profile.dimensions.reduce((acc, curr) => acc + curr.score, 0) /
      (profile.dimensions.length || 1);
    profile.overallScore = Math.round(avgScore * 10);
    profile.updatedAt = Date.now();

    this.profiles.set(sessionId, profile);
    return profile;
  }

  // ------------------------------------
  // Roadmap Methods
  // ------------------------------------
  public getRoadmap(sessionId: string): RoadmapModule[] | undefined {
    return this.roadmaps.get(sessionId);
  }

  public saveRoadmap(sessionId: string, modules: RoadmapModule[]): void {
    this.roadmaps.set(sessionId, modules);
  }

  public updateModuleCompletion(
    sessionId: string,
    moduleId: string,
    reTestSubmission: {
      answer: string;
      evaluatedAt: number;
      scoreAwarded: number;
      passed: boolean;
      feedback: string;
    }
  ): RoadmapModule | undefined {
    const list = this.roadmaps.get(sessionId);
    if (!list) return undefined;

    const target = list.find((m) => m.moduleId === moduleId);
    if (target) {
      target.completed = reTestSubmission.passed;
      target.reTestSubmission = reTestSubmission;
    }
    return target;
  }

  public updateModuleMilestone(
    sessionId: string,
    moduleId: string,
    params: {
      targetDate?: string;
      reminderEmail?: string;
      reminderEnabled?: boolean;
    }
  ): RoadmapModule | undefined {
    const list = this.roadmaps.get(sessionId);
    if (!list) return undefined;

    const target = list.find((m) => m.moduleId === moduleId);
    if (target) {
      if (params.targetDate !== undefined) target.targetDate = params.targetDate;
      if (params.reminderEmail !== undefined) target.reminderEmail = params.reminderEmail;
      if (params.reminderEnabled !== undefined) target.reminderEnabled = params.reminderEnabled;
    }
    return target;
  }

  // ------------------------------------
  // Default Seed for Initial Exploration
  // ------------------------------------
  private seedDefaultState(): void {
    const defaultSessionId = 'session-demo-01';
    const domain: AssessmentDomain = 'Backend Architecture';

    const sampleSession: AssessmentSession = {
      sessionId: defaultSessionId,
      userId: 'user-default-01',
      domain,
      targetRoleTitle: 'Senior Distributed Backend Engineer',
      candidateSummary: '5 years of backend engineering experience with Node.js, Express, Go, and PostgreSQL.',
      status: 'completed',
      currentTurn: 5,
      maxTurns: 5,
      currentDifficulty: 'advanced',
      createdAt: Date.now() - 3600000 * 2,
      updatedAt: Date.now() - 3600000 * 2,
      transcript: [
        {
          turnIndex: 1,
          questionId: 'q-be-1',
          domain,
          difficulty: 'intermediate',
          scenario: 'High-throughput payment webhook processor receiving duplicate idempotency keys during network retries.',
          questionText: 'How do you design database-level locking and Redis distributed locks to guarantee exactly-once processing without deadlocks?',
          userAnswer: 'We use Redis SETNX with a 30-second TTL to lock the incoming idempotency key. In Postgres, we insert into an idempotent_requests table with a unique constraint. If the key exists, we return the cached response. For database updates, we wrap the balance mutation inside a serializable transaction with SELECT FOR UPDATE.',
          evaluatorFeedback: 'Good understanding of atomic lock acquisition and database unique constraints. However, SELECT FOR UPDATE can induce deadlocks under high concurrency if rows are locked in inconsistent orders.',
          score: 8.0,
          timestamp: Date.now() - 3600000 * 2 + 300000,
        },
        {
          turnIndex: 2,
          questionId: 'q-be-2',
          domain,
          difficulty: 'advanced',
          scenario: 'A PostgreSQL table with 80 million rows is experiencing 3-second query latency during multi-tenant dashboard aggregations.',
          questionText: 'Analyze how you diagnose this with EXPLAIN (ANALYZE, BUFFERS). When would you choose a partial index over a composite B-tree index?',
          userAnswer: 'I run EXPLAIN ANALYZE to check whether it is doing a Seq Scan or Bitmap Index Scan. We look at shared hit buffers versus read buffers to identify disk I/O. I would use a composite B-tree on (tenant_id, created_at, status). If 95% of rows are closed and we only query active rows, a partial index WHERE status = active is much smaller and stays entirely in RAM.',
          evaluatorFeedback: 'Solid diagnosis of index size and partial indexing. Did not mention work_mem sizing or index bloat maintenance.',
          score: 7.8,
          timestamp: Date.now() - 3600000 * 2 + 600000,
        },
        {
          turnIndex: 3,
          questionId: 'q-be-3',
          domain,
          difficulty: 'advanced',
          scenario: 'A distributed cluster is experiencing a thundering herd (cache stampede) on a critical product catalog item after cache eviction.',
          questionText: 'Compare probabilistic early expiration (XFetch algorithm) versus singleflight mutex locks in Node.js. Which handles burst traffic better?',
          userAnswer: 'Singleflight or promise deduplication ensures that 5,000 concurrent requests for the same expired key will share the exact same underlying fetch promise. Only one query hits Postgres, and all 5,000 requests resolve with the fetched result. XFetch is also great because it recalculates before the TTL expires based on compute time delta.',
          evaluatorFeedback: 'Accurate technical reasoning. Clear grasp of async promise reuse in Node.js event loop.',
          score: 8.8,
          timestamp: Date.now() - 3600000 * 2 + 900000,
        },
        {
          turnIndex: 4,
          questionId: 'q-be-4',
          domain,
          difficulty: 'advanced',
          scenario: 'Downstream microservice outage causing cascading timeout failures across 12 upstream endpoints.',
          questionText: 'Design a circuit breaker with jittered exponential backoff and rate-limiting fallbacks. Where does the circuit trip?',
          userAnswer: 'We monitor the failure rate in a rolling 10-second window. If error rate exceeds 50% with at least 20 samples, state flips from CLOSED to OPEN and fast-fails with 503 or returns stale cache. After a 15-second cool-down, it flips to HALF-OPEN allowing 5% probe traffic with jittered backoff.',
          evaluatorFeedback: 'Exemplary circuit breaker lifecycle explanation. Addresses rolling windows, half-open probe testing, and jitter.',
          score: 8.5,
          timestamp: Date.now() - 3600000 * 2 + 1200000,
        },
        {
          turnIndex: 5,
          questionId: 'q-be-5',
          domain,
          difficulty: 'advanced',
          scenario: 'Distributed lock TTL expiration while a long database mutation is still running (Martin Kleppmann fencing token problem).',
          questionText: 'How do you prevent a stalled worker from writing corrupt data when another worker acquires the lock after TTL expiry?',
          userAnswer: 'If the lock expires while worker A is frozen in GC, worker B gets the lock. When worker A wakes up, it writes data unless we use a monotonic fencing token. The lock manager increments a counter each time a lock is acquired. The storage layer only accepts writes if the token is strictly greater than the highest token seen so far.',
          evaluatorFeedback: 'Direct and accurate explanation of fencing tokens to prevent zombie writes.',
          score: 8.9,
          timestamp: Date.now() - 3600000 * 2 + 1500000,
        },
      ],
    };

    const sampleProfile: SkillProfile = {
      profileId: 'profile-demo-01',
      sessionId: defaultSessionId,
      userId: 'user-default-01',
      domain,
      overallReadinessTier: 'Senior Distributed Backend Engineer',
      overallScore: 82,
      executiveSummary:
        'The candidate demonstrates senior-grade operational competence in distributed systems, resilience engineering, and API protocols. Reasoning about promise deduplication (singleflight), circuit breaker state machines, and fencing tokens was clear and grounded in production mechanics. Primary growth opportunities lie in query plan buffer tuning and zero-downtime database schema migration locks.',
      dimensions: [
        {
          name: 'Distributed Systems & Concurrency',
          category: 'Core Architecture',
          score: 8.6,
          maxScore: 10,
          benchmarkMinRequired: 8.5,
          description: 'Idempotency, distributed locking, fencing tokens, race condition mitigation.',
          verifiedStrengths: [
            'Clear formulation of monotonic fencing tokens',
            'Strong grasp of promise sharing (singleflight)',
          ],
          criticalGaps: [],
        },
        {
          name: 'Database Optimization & Indexing',
          category: 'Data Systems',
          score: 7.2,
          maxScore: 10,
          benchmarkMinRequired: 8.0,
          description: 'Execution plan analysis, partial indexing, buffer cache metrics, lock contention.',
          verifiedStrengths: ['Proficient with partial indexes and selective RAM retention'],
          criticalGaps: ['Omitted table lock modes and work_mem allocation for sorting'],
        },
        {
          name: 'Caching & State Management',
          category: 'Performance',
          score: 8.4,
          maxScore: 10,
          benchmarkMinRequired: 7.5,
          description: 'Stampede prevention, XFetch probabilistic caching, cache invalidation.',
          verifiedStrengths: ['Detailed understanding of singleflight promise deduplication'],
          criticalGaps: [],
        },
        {
          name: 'API Design & Protocol Architecture',
          category: 'Networking & Protocols',
          score: 8.2,
          maxScore: 10,
          benchmarkMinRequired: 8.0,
          description: 'Idempotency keys, rate limiting algorithms, HTTP status contracts.',
          verifiedStrengths: ['Idempotency key state machine with Redis + PostgreSQL'],
          criticalGaps: [],
        },
        {
          name: 'Reliability & Fault Tolerance',
          category: 'SRE & Systems',
          score: 8.5,
          maxScore: 10,
          benchmarkMinRequired: 7.0,
          description: 'Circuit breakers, jittered exponential backoff, graceful degradation.',
          verifiedStrengths: ['Clear half-open state and jittered backoff formulas'],
          criticalGaps: [],
        },
        {
          name: 'Security & Token Authentication',
          category: 'Security',
          score: 7.0,
          maxScore: 10,
          benchmarkMinRequired: 7.0,
          description: 'Token verification, secret rotation, TLS termination.',
          verifiedStrengths: ['Standard JWT claims verification'],
          criticalGaps: ['Token revocation distribution under multi-region replication'],
        },
      ],
      keyStrengths: [
        'Monotonic fencing tokens to prevent zombie writes during lock expiration',
        'Singleflight concurrency deduplication for cache stampede defense',
        'Calibrated circuit breaker state transitions with rolling failure windows',
      ],
      criticalGaps: [
        'PostgreSQL table lock levels (ACCESS EXCLUSIVE vs SHARE UPDATE EXCLUSIVE) during online schema migrations',
        'Multi-region token revocation list distribution and replay protection',
      ],
      interviewRiskNotes: [
        'May get challenged on deep PostgreSQL planner cost estimation and vacuum maintenance under write-heavy workloads.',
      ],
      createdAt: Date.now() - 3600000 * 2,
      updatedAt: Date.now() - 3600000 * 2,
    };

    const sampleRoadmap: RoadmapModule[] = [
      {
        moduleId: 'mod-pg-locks-01',
        skillName: 'Database Optimization & Indexing',
        priority: 'critical',
        currentScore: 7.2,
        targetScore: 8.0,
        estimatedTimeToComplete: '2.5 hours',
        targetDate: '2026-10-18',
        reminderEmail: 'srikarreddy665@gmail.com',
        reminderEnabled: true,
        stage1Concept: {
          title: 'Zero-Downtime PostgreSQL Schema Migrations & Lock Queues',
          overview:
            'In high-throughput databases, altering a table (e.g. adding a column or index) requests an ACCESS EXCLUSIVE lock. Even if the alter takes 2ms, if it waits behind a slow 10-second SELECT query in the lock queue, all subsequent queries queue behind it, exhausting the connection pool.',
          corePrinciples: [
            'Always set a local lock_timeout (e.g., 2 seconds) and statement_timeout before running DDL.',
            'Create indexes with CONCURRENTLY to avoid blocking read or write queries.',
            'Add foreign keys as NOT VALID first, then validate separately without holding exclusive table locks.',
          ],
          architecturalPattern: 'Safe Migration with lock_timeout and CONCURRENTLY',
          documentationReferences: [
            {
              title: 'PostgreSQL Table Lock Conflicts Table',
              url: 'https://www.postgresql.org/docs/current/explicit-locking.html',
              note: 'Matrix of which lock levels block concurrent reads and writes.',
            },
            {
              title: 'Strong Migrations Guide for Production Databases',
              url: 'https://github.com/ankane/strong_migrations',
              note: 'Standard industry checklist for zero-downtime migrations.',
            },
          ],
        },
        stage2HandsOnTask: {
          title: 'Write a Safe Online Migration Script in SQL',
          scenario:
            'A table "transactions" has 50M rows and receives 2,000 writes/sec. You need to add a new column "risk_score integer default 0 not null" and an index on "(created_at, risk_score)" without causing connection pool starvation.',
          starterCodeSnippet: `-- Unsafe naive approach:\n-- ALTER TABLE transactions ADD COLUMN risk_score integer DEFAULT 0 NOT NULL;\n-- CREATE INDEX idx_risk ON transactions(created_at, risk_score);\n\n-- TODO: Rewrite safely using lock_timeout, 3-step default, and CONCURRENTLY:`,
          taskRequirements: [
            'Set lock_timeout to 2s to abort quickly if another transaction holds a lock.',
            'Add column with DEFAULT without rewrite (Postgres 11+ metadata-only).',
            'Create the index CONCURRENTLY outside a transaction block.',
          ],
          verificationCriteria: [
            'Sets SET LOCAL lock_timeout = "2s";',
            'Executes CREATE INDEX CONCURRENTLY idx_transactions_created_risk ON transactions(created_at, risk_score);',
          ],
        },
        stage3ReTest: {
          questionId: 'retest-pg-locks-01',
          challengeTitle: 'Lock Queue Starvation Resolution',
          scenarioPrompt:
            'Explain what happens when an ALTER TABLE transaction is blocked by a long-running SELECT statement in PostgreSQL, and how specifying "lock_timeout" coupled with automated exponential retry prevents connection pool exhaustion.',
          sampleCodeOrTemplate: `SET lock_timeout = '2s';\n-- Explain behavior when timeout trips:`,
        },
        completed: false,
      },
      {
        moduleId: 'mod-token-revocation-02',
        skillName: 'Security & Token Authentication',
        priority: 'high',
        currentScore: 7.0,
        targetScore: 7.5,
        estimatedTimeToComplete: '2 hours',
        targetDate: '2026-10-25',
        reminderEmail: 'srikarreddy665@gmail.com',
        reminderEnabled: true,
        stage1Concept: {
          title: 'Distributed JWT Revocation & Bloom Filter Blacklists',
          overview:
            'Stateless JWTs cannot be revoked immediately before expiration unless verified against a revocation list. Querying a database on every request destroys the stateless latency benefit of JWTs. A distributed Redis bitset or Bloom filter allows sub-millisecond revocation checking.',
          corePrinciples: [
            'Keep access tokens short-lived (5-15 minutes).',
            'Maintain a fast Redis set of revoked JTI (JWT ID) tokens keyed with the remaining TTL.',
            'Use Bloom filters for fast probabilistic negative lookups, falling back to exact checks only on hits.',
          ],
          architecturalPattern: 'Hybrid Redis JTI Blacklist with Auto-Expiring Keys',
          documentationReferences: [
            {
              title: 'IETF RFC 7519: JSON Web Token (JWT)',
              url: 'https://datatracker.ietf.org/doc/html/rfc7519',
              note: 'Standard specifications for JTI claim and token expiration semantics.',
            },
          ],
        },
        stage2HandsOnTask: {
          title: 'Implement Express JWT Revocation Middleware',
          scenario:
            'When a user clicks "Log out of all devices", write the middleware that checks if the incoming token JTI is blacklisted in Redis before allowing access to /api/secure-vault.',
          starterCodeSnippet: `import { Request, Response, NextFunction } from 'express';\n\nexport async function verifyTokenAndRevocation(req: Request, res: Response, next: NextFunction) {\n  // TODO: Check header, decode JTI, check Redis blacklist\n}`,
          taskRequirements: [
            'Extract Bearer token and decode claims.',
            'Check Redis key `blacklist:${jti}` using GET or EXISTS.',
            'Reject with 401 Unauthorized if present; proceed with next() if clean.',
          ],
          verificationCriteria: [
            'Correctly handles expired blacklists without unbounded memory growth.',
          ],
        },
        stage3ReTest: {
          questionId: 'retest-token-rev-02',
          challengeTitle: 'Instant Session Invalidation Trade-Offs',
          scenarioPrompt:
            'Compare user-level session revocation (e.g. revoking all tokens for a compromised user ID) versus individual token JTI blacklisting in a distributed multi-region application. What is the optimal balance between DB overhead and security?',
        },
        completed: false,
      },
    ];

    this.sessions.set(defaultSessionId, sampleSession);
    this.profiles.set(defaultSessionId, sampleProfile);
    this.roadmaps.set(defaultSessionId, sampleRoadmap);

    // Seed User Memories (Persisting core details about the candidate)
    const initialMemories: UserMemoryItem[] = [
      {
        id: 'mem-1',
        key: 'Candidate Name',
        value: 'Srikar Reddy',
        category: 'identity',
        confidence: 1.0,
        extractedFrom: 'Authenticated Account (srikarreddy665@gmail.com)',
        timestamp: Date.now() - 86400000 * 2,
      },
      {
        id: 'mem-2',
        key: 'Target Career Role',
        value: 'Staff Distributed Systems Engineer / Backend Tech Lead (L6)',
        category: 'goal',
        confidence: 0.98,
        extractedFrom: 'Diagnostic Assessment Onboarding',
        timestamp: Date.now() - 86400000 * 2,
      },
      {
        id: 'mem-3',
        key: 'Target Companies',
        value: 'Google, Stripe, Datadog, Anthropic, Scale AI',
        category: 'goal',
        confidence: 0.95,
        extractedFrom: 'Career Preferences',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'mem-4',
        key: 'Core Tech Stack',
        value: 'Go, Node.js, TypeScript, PostgreSQL, Redis, Kafka, Docker & Kubernetes',
        category: 'skill',
        confidence: 0.96,
        extractedFrom: 'Assessment Transcript & Work Experience',
        timestamp: Date.now() - 86400000,
      },
      {
        id: 'mem-5',
        key: 'Calibrated Strength',
        value: 'High-concurrency caching, singleflight promise deduplication & cache stampede mitigation (Scored 8.8/10)',
        category: 'insight',
        confidence: 1.0,
        extractedFrom: 'Diagnostic Evaluation Turn 3',
        timestamp: Date.now() - 7200000,
      },
      {
        id: 'mem-6',
        key: 'Active Upskilling Focus',
        value: 'Distributed lock safety with monotonic fencing tokens (Redlock) and PostgreSQL index buffer tuning',
        category: 'insight',
        confidence: 0.94,
        extractedFrom: 'Milestone Roadmap Generation',
        timestamp: Date.now() - 3600000,
      },
      {
        id: 'mem-7',
        key: 'Preferred Learning Style',
        value: 'Prefers concise architectural trade-off breakdowns, concrete code templates, and failure-mode analysis over generic high-level summaries',
        category: 'preference',
        confidence: 0.92,
        extractedFrom: 'Advisor Dialogue Analysis',
        timestamp: Date.now() - 1800000,
      },
      {
        id: 'mem-8',
        key: 'Target Compensation Expectation',
        value: '$240k - $290k Total Comp (Base $190k + Equity/RSUs)',
        category: 'goal',
        confidence: 0.9,
        extractedFrom: 'Market Benchmark Query',
        timestamp: Date.now() - 900000,
      },
    ];

    for (const mem of initialMemories) {
      this.memories.set(mem.id, mem);
    }

    // Seed Saved Chat Sessions (Remember every chat)
    const initialChatSessions: ChatSessionRecord[] = [
      {
        id: 'chat-kafka-consensus',
        title: 'Kafka Partition Rebalance & Lag Troubleshooting',
        systemRole: 'interviewer',
        modelUsed: 'gemini-3.8-flash',
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000 + 1200000,
        summary: 'Deep-dive into cooperative sticky assignors and consumer heartbeat threads during partition rebalancing.',
        messages: [
          {
            id: 'msg-k-1',
            role: 'user',
            content: 'How should I design Kafka consumer group processing to prevent stop-the-world partition rebalances during rolling deployments?',
            timestamp: Date.now() - 86400000,
          },
          {
            id: 'msg-k-2',
            role: 'model',
            content: 'To prevent stop-the-world rebalances during rolling deployments:\n\n1. **Adopt CooperativeStickyAssignor**: Unlike the legacy Eager protocol, the incremental cooperative rebalance protocol only revokes partitions that must be migrated. Existing consumers continue processing their untouched partitions without downtime.\n\n2. **Tune `max.poll.interval.ms` vs `heartbeat.interval.ms`**: Ensure long batch processing never starves the background heartbeat thread. If processing spikes beyond `max.poll.interval.ms`, Kafka assumes the consumer died and triggers a rebalance.\n\n3. **Static Group Membership (`group.instance.id`)**: Assign unique stable instance IDs to pods. During rolling restarts, Kafka grants a grace period before reassigning partitions, eliminating unnecessary partition churn.',
            timestamp: Date.now() - 86400000 + 4000,
            modelUsed: 'gemini-3.8-flash',
            speedTokensPerSec: 68,
            memoriesApplied: ['Target Career Role (Staff)', 'Core Tech Stack (Kafka)'],
          },
        ],
      },
      {
        id: 'chat-comp-negotiation',
        title: '2026 Staff Engineer Compensation Calibration',
        systemRole: 'salary_market',
        modelUsed: 'gemini-3.8-flash',
        createdAt: Date.now() - 43200000,
        updatedAt: Date.now() - 43200000 + 900000,
        summary: 'Compensation brackets for Staff Backend Engineers at Tier-1 tech firms and Series B hyper-growth platforms.',
        messages: [
          {
            id: 'msg-c-1',
            role: 'user',
            content: 'What is the current 2026 total compensation band for a Staff Distributed Systems engineer in Tier 1 tech vs Series B startups?',
            timestamp: Date.now() - 43200000,
          },
          {
            id: 'msg-c-2',
            role: 'model',
            content: 'Here is the current calibrated 2026 compensation breakdown based on your profile and target criteria:\n\n### 🏢 Tier-1 Tech (Google L6, Stripe L4, Datadog Principal)\n- **Base Salary**: $210,000 – $245,000\n- **Annual Equity (RSUs)**: $160,000 – $230,000 / year (4-year grant ~$650k-$900k)\n- **Performance Bonus**: 15% – 20% (~$35,000 – $48,000)\n- **Total Annual Comp (TC)**: **$405,000 – $520,000**\n\n### 🚀 High-Growth Series B/C (Pre-IPO Unicorns)\n- **Base Salary**: $195,000 – $230,000\n- **Equity (Options / Early Grants)**: 0.15% – 0.35% equity with strike at last preferred\n- **Total Annual Comp (Cash + Est Equity)**: **$280,000 – $360,000**\n\n**Negotiation Leverage**: Your verified 8.8/10 score in high-throughput caching and distributed systems design places you in the top 12% of tested candidates.',
            timestamp: Date.now() - 43200000 + 3500,
            modelUsed: 'gemini-3.8-flash',
            speedTokensPerSec: 72,
            memoriesApplied: ['Candidate Name (Srikar Reddy)', 'Target Companies (Google, Stripe)', 'Target Comp'],
          },
        ],
      },
      {
        id: 'chat-slikks-coaching',
        title: 'Slikks Mentorship & Career Well-Being',
        systemRole: 'jobs_coaching_search',
        modelUsed: 'gemini-3.8-flash',
        createdAt: Date.now() - 14400000,
        updatedAt: Date.now() - 14400000 + 600000,
        summary: 'Review of Slikks skills coaching platform for Staff engineering, mental clarity, and live 2026 hiring trends.',
        messages: [
          {
            id: 'msg-s-1',
            role: 'user',
            content: 'How does Slikks skills coaching compare to traditional interview bootcamps, and how do I avoid burning out while prepping for Staff roles?',
            timestamp: Date.now() - 14400000,
          },
          {
            id: 'msg-s-2',
            role: 'model',
            content: `Here is a reasonable, balanced perspective grounded in current coaching data:

### 🎓 Slikks Skills Coaching vs Traditional Bootcamps
1. **Targeted 1-on-1 Mentorship**: Unlike generic cohort bootcamps, Slikks pairs you directly with active Staff/Principal engineers at firms like Google, Stripe, and Datadog who tailor sessions specifically to your weak points (e.g., distributed locks and database indexing).
2. **Hiring Committee Alignment**: Sessions focus on real calibration rubrics—how Staff committees evaluate cross-functional architectural ownership rather than just leetcode memorization.
3. **Pacing & Actionable Takeaways**: Flexible scheduling ($120–$250/session) without being locked into rigid multi-month lectures.

### 🧘 Sustainable Prep & Burnout Mitigation
- **The "One Deep Invariant" Principle**: Spend 45 minutes mastering one hard architectural mechanic (like monotonic fencing tokens) rather than grinding 5 random problems.
- **Cognitive Recovery**: Your brain consolidates architectural systems thinking during downtime and sleep. Taking dedicated rest days actually boosts retention.`,
            timestamp: Date.now() - 14400000 + 4000,
            modelUsed: 'gemini-3.8-flash',
            speedTokensPerSec: 74,
            memoriesApplied: ['Candidate Name', 'Target Career Role', 'Critical Skill Gaps'],
            sources: [
              { title: 'Slikks Skills Coaching Network', uri: 'https://www.google.com/search?q=slikks+skills+coaching' },
              { title: 'Engineering Leadership Mentorship', uri: 'https://blog.pragmaticengineer.com' },
            ],
            searchQueries: ['Slikks skills coaching tech mentorship 2026', 'staff engineer prep burnout prevention'],
          },
        ],
      },
    ];

    for (const chat of initialChatSessions) {
      this.chatSessions.set(chat.id, chat);
    }
  }
}

export const store = new AppStateStore();

