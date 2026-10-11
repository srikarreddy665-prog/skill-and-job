import {
  SkillProfile,
  UserMemoryItem,
  ChatSessionRecord,
  AdvisorSystemRole,
  MemoryCategory,
} from '../types/index.ts';
import { store } from './store.ts';

/**
 * Builds an advanced prompt grounding the AI in the user's permanent memory bank,
 * verified assessment diagnostics, history of past chats, and deep reasoning models.
 */
export function buildMemoryGroundedSystemInstruction(params: {
  systemRole: AdvisorSystemRole;
  profile: SkillProfile | null;
  memories: UserMemoryItem[];
  previousSessions: ChatSessionRecord[];
  currentChatId?: string;
  enableSearch?: boolean;
}): string {
  const { systemRole, profile, memories, previousSessions, currentChatId, enableSearch } = params;

  let rolePersona = '';

  switch (systemRole) {
    case 'general_reasoning':
      rolePersona = `You are a brilliant, reasonable, balanced, and empathetic mentor and conversational partner at SkillPulse.
You excel at GENERAL CHATS, reasoned decision-making, mental models, career philosophy, work-life balance, stress management, everyday curiosity, and nuanced advice.
When the user chats casually ("Hey", "How are you?", "What should I do about burnout?"), converse naturally, warmly, and authentically without forcing a robotic technical drill on them.
When asked complex questions, provide balanced reasoning: explore multiple perspectives, evaluate practical trade-offs, and offer pragmatic, grounded recommendations.`;
      break;

    case 'jobs_coaching_search':
      rolePersona = `You are a Live Market Intelligence Specialist powered by Google Search data.
Your mandate is to provide real-time, verified insights on LIVE TECH JOBS, hiring companies (Google, Stripe, Datadog, Meta, startups, remote teams), and SKILLS COACHING (including Slikks platform, interview mentorship, system design academies, and 1-on-1 coaching).
Always cite specific companies actively recruiting, live salary bands, verified qualifications, and direct career/coaching resources with URLs whenever search data is available.`;
      break;

    case 'interviewer':
      rolePersona = `You are an elite Principal Technical Interviewer (L7/L8).
You conduct rigorous mock architectural and coding deep-dives. Probe invariant violations, race conditions, network partition handling, and CAP theorem trade-offs. Be challenging yet constructive.`;
      break;

    case 'salary_market':
      rolePersona = `You are a Senior Tech Talent Partner and 2026 Compensation Strategist.
Provide calibrated market salary bands (base, bonus, equity/RSUs), offer negotiation tactics, competing offer leverage, and hiring manager expectations across top tech tiers.`;
      break;

    case 'mentor':
    default:
      rolePersona = `You are the Lead Technical & Career Mentor at SkillPulse.
You combine deep distributed systems architecture expertise with practical, reasonable career mentorship. You deliver actionable engineering solutions, code patterns, and benchmark data.`;
      break;
  }

  // 1. Compile User Memory Bank
  const memoryBankText =
    memories.length > 0
      ? memories
          .map(
            (m) =>
              `- [${m.category.toUpperCase()}] ${m.key}: ${m.value} (Confidence: ${Math.round(
                m.confidence * 100
              )}%, Source: ${m.extractedFrom})`
          )
          .join('\n')
      : '- No explicit user memories recorded yet.';

  // 2. Compile Cross-Chat Historical Context (Remember Every Chat)
  const otherChats = previousSessions.filter((s) => s.id !== currentChatId).slice(0, 6);
  const chatHistoryText =
    otherChats.length > 0
      ? otherChats
          .map(
            (c) =>
              `- "${c.title}" [Role: ${c.systemRole || 'mentor'}] (${new Date(c.updatedAt).toLocaleDateString()}): ${
                c.summary ||
                c.messages
                  .slice(-2)
                  .map((m) => `${m.role}: ${m.content.slice(0, 90)}...`)
                  .join(' | ')
              }`
          )
          .join('\n')
      : '- No previous archived conversations.';

  // 3. Compile Diagnostic Assessment Context
  let candidateContext = '';
  if (profile) {
    candidateContext = `
CANDIDATE VERIFIED DIAGNOSTIC MATRIX:
- Target Domain: ${profile.domain}
- Overall Readiness Tier: ${profile.overallReadinessTier}
- Calibrated Score: ${profile.overallScore}/100
- Verified Strengths: ${(profile.keyStrengths || []).join(', ') || 'High concurrency caching, singleflight dedup'}
- Critical Skill Gaps: ${(profile.criticalGaps || []).join(', ') || 'Distributed locks with fencing tokens, index buffer tuning'}
- Dimension Breakdown:
${profile.dimensions.map((d) => `  * ${d.name}: ${d.score}/10 (Category: ${d.category})`).join('\n')}`;
  }

  return `${rolePersona}

==================================================
OPERATIONAL PRINCIPLES & TRAINING GUIDELINES:
==================================================
1. BE REASONABLE & VERSATILE IN GENERAL CHATS:
   - Handle everyday conversations, greetings, jokes, philosophical musings, and general questions with natural conversational intelligence and warmth.
   - Do NOT sound like a rigid script or robot. Adapt your tone to the user: friendly and relatable for casual chats, razor-sharp and structured for architectural or compensation deep-dives.
   - Use clear logic: explain "why" a solution works, contrast pros & cons, and give reasonable, pragmatic answers.

2. PERSISTENT LONG-TERM MEMORY & MULTI-CHAT RECALL:
   - You REMEMBER details about the user across all sessions: their target role (Staff Distributed Systems Engineer, L6), target companies (Google, Stripe, Datadog), current target comp ($320k-$380k TC), confirmed strengths (caching, dedup), and active upskilling areas.
   - Weave these remembered facts into answers naturally and respectfully.
   - You REMEMBER EVERY PAST CHAT with the candidate. Proactively refer back to prior discussions when relevant.

3. GOOGLE DATA & LIVE SEARCH GROUNDING:
   ${
     enableSearch
       ? `- Google Search data is ACTIVE for this turn. Ground your response in real-time web results for live job vacancies, hiring companies, salary updates, and skills coaching platforms (including Slikks, top tech academies, interview bootcamps).
- Mention specific verifiable details and include real company names, job titles, and links.`
       : `- If the user asks about live hiring, current open roles, market trends, or skills coaching platforms (like Slikks), provide realistic, accurate, and actionable current-year data.`
   }

4. EFFICIENCY & STRUCTURE:
   - High information density with zero fluff or repetitive throat-clearing.
   - Format responses cleanly with readable markdown headers, bullet points, and code blocks where applicable.
   - Summarize key recommendations or next steps at the end of longer responses.

USER'S ACTIVE MEMORY BANK:
${memoryBankText}

PREVIOUS CONVERSATION SESSIONS (CROSS-CHAT MEMORY):
${chatHistoryText}
${candidateContext}
`;
}

/**
 * Identifies which memories were relevant or applied in the AI response
 */
export function identifyAppliedMemories(query: string, memories: UserMemoryItem[]): string[] {
  const q = query.toLowerCase();
  const applied: string[] = [];

  for (const m of memories) {
    const keyLower = m.key.toLowerCase();
    const valLower = m.value.toLowerCase();

    if (
      q.includes('role') ||
      q.includes('career') ||
      q.includes('staff') ||
      q.includes('senior') ||
      keyLower.includes('role')
    ) {
      if (m.category === 'goal' && !applied.includes(m.key)) applied.push(m.key);
    }
    if (
      q.includes('comp') ||
      q.includes('salary') ||
      q.includes('offer') ||
      q.includes('money') ||
      keyLower.includes('compensation')
    ) {
      if (m.key.includes('Compensation') && !applied.includes(m.key)) applied.push(m.key);
    }
    if (
      q.includes('cache') ||
      q.includes('lock') ||
      q.includes('redis') ||
      q.includes('postgres') ||
      q.includes('kafka')
    ) {
      if (m.category === 'insight' || m.category === 'skill') {
        if (!applied.includes(m.key)) applied.push(m.key);
      }
    }
    if (valLower.split(' ').some((word) => word.length > 4 && q.includes(word))) {
      if (!applied.includes(m.key)) applied.push(m.key);
    }
  }

  // Always at least show the identity/role if none matched
  if (applied.length === 0 && memories.length > 0) {
    const defaultMem = memories.find((m) => m.category === 'goal' || m.category === 'identity');
    if (defaultMem) applied.push(defaultMem.key);
  }

  return applied.slice(0, 3);
}

/**
 * Rapid heuristic extractor to learn new facts about the user in real time
 */
export function extractAndPersistUserFacts(userText: string): void {
  const text = userText.trim();
  if (text.length < 10) return;

  // 1. Target Company regex
  const companyMatch = text.match(
    /(?:target|aiming for|interviewing with|applying to|want to join|dream company is)\s+([A-Za-z0-9\s,]+?)(?:\.|$|,|\band\b)/i
  );
  if (companyMatch && companyMatch[1].trim().length > 2) {
    const company = companyMatch[1].trim();
    if (!['a', 'an', 'the', 'some'].includes(company.toLowerCase())) {
      store.addOrUpdateMemory({
        key: 'Target Company Mentioned',
        value: company,
        category: 'goal',
        confidence: 0.95,
        extractedFrom: 'Live Chat Dialogue',
      });
    }
  }

  // 2. Target Role regex
  const roleMatch = text.match(
    /(?:target role|aiming for|want to become|transitioning to|looking for a role as|applying for)\s+(?:a|an)?\s+([A-Za-z0-9\s-]+?)(?:\.|$|,|\bjob\b|\brole\b)/i
  );
  if (roleMatch && roleMatch[1].trim().length > 3) {
    const role = roleMatch[1].trim();
    if (!['job', 'role', 'position'].includes(role.toLowerCase())) {
      store.addOrUpdateMemory({
        key: 'Target Role Discussed',
        value: role,
        category: 'goal',
        confidence: 0.92,
        extractedFrom: 'Live Chat Dialogue',
      });
    }
  }

  // 3. Experience years regex
  const expMatch = text.match(/(?:have|with|got)\s+(\d+\+?\s+years?)\s+(?:of\s+experience|in|with)/i);
  if (expMatch) {
    store.addOrUpdateMemory({
      key: 'Years of Experience',
      value: expMatch[1].trim(),
      category: 'experience',
      confidence: 0.98,
      extractedFrom: 'Live Chat Dialogue',
    });
  }

  // 4. Tech stack preference
  const stackMatch = text.match(
    /(?:i use|i work with|my primary stack is|experienced in|proficient in|i build with)\s+([A-Za-z0-9\s,./#+-]+?)(?:\.|$|\band\b)/i
  );
  if (stackMatch && stackMatch[1].trim().length > 2) {
    store.addOrUpdateMemory({
      key: 'Mentioned Tech Stack',
      value: stackMatch[1].trim(),
      category: 'skill',
      confidence: 0.88,
      extractedFrom: 'Live Chat Dialogue',
    });
  }

  // 5. Compensation goal
  const compMatch = text.match(
    /(?:targeting|looking for|expecting|want|need)\s+(\$?\d{2,3}k?(?:\s*-\s*\$?\d{2,3}k?)?)\s*(?:tc|total comp|salary|base)?/i
  );
  if (compMatch) {
    store.addOrUpdateMemory({
      key: 'Compensation Target Stated',
      value: compMatch[1].trim(),
      category: 'goal',
      confidence: 0.92,
      extractedFrom: 'Live Chat Dialogue',
    });
  }

  // 6. Coaching & Upskilling Interest (e.g. Slikks, mentoring, academies)
  const coachingMatch = text.match(
    /(?:slikks|coaching|mentor|interview prep|bootcamp|academy|mock interview)/i
  );
  if (coachingMatch) {
    store.addOrUpdateMemory({
      key: 'Coaching & Mentorship Focus',
      value: 'Actively exploring live skills coaching & interview mentorship platforms (including Slikks)',
      category: 'preference',
      confidence: 0.9,
      extractedFrom: 'Live Chat Dialogue',
    });
  }

  // 7. Work Mode preference (Remote, Hybrid, Bay Area, etc.)
  const locMatch = text.match(/(?:prefer|want|looking for)\s+(remote|hybrid|in-office|onsite)\s+(?:roles|work|jobs)?/i);
  if (locMatch) {
    store.addOrUpdateMemory({
      key: 'Work Environment Preference',
      value: locMatch[1].toLowerCase(),
      category: 'preference',
      confidence: 0.93,
      extractedFrom: 'Live Chat Dialogue',
    });
  }
}
