import { JobBenchmark, JobMatchResult, SkillGapAnalysis, SkillProfile } from '../types/index.ts';

export function calculateJobMatch(
  profile: SkillProfile,
  job: JobBenchmark
): JobMatchResult {
  let weightedRatioSum = 0;
  let totalWeight = 0;

  const gapDetails: SkillGapAnalysis[] = [];
  const provenStrengths: string[] = [];
  const blockingGaps: string[] = [];

  for (const req of job.requiredSkills) {
    // Find closest matching dimension in user's profile
    // Match either by exact name or case-insensitive partial match
    const userDim = profile.dimensions.find(
      (d) =>
        d.name.toLowerCase() === req.skillName.toLowerCase() ||
        d.name.toLowerCase().includes(req.skillName.toLowerCase()) ||
        req.skillName.toLowerCase().includes(d.name.toLowerCase())
    );

    const userScore = userDim ? userDim.score : Math.max(3.0, (profile.overallScore / 10) - 2.0);
    const requiredScore = req.minRequiredScore;
    const ratio = Math.min(1.0, userScore / requiredScore);
    const delta = Number((userScore - requiredScore).toFixed(1));

    weightedRatioSum += req.weight * ratio;
    totalWeight += req.weight;

    let status: SkillGapAnalysis['status'] = 'met';
    let isGap = false;
    let remedyAction = '';

    if (userScore >= requiredScore) {
      status = 'surpassed';
      provenStrengths.push(
        `${req.skillName}: scored ${userScore.toFixed(1)}/10 vs ${requiredScore} required.`
      );
      remedyAction = 'Maintains required enterprise competency benchmark.';
    } else if (ratio >= 0.85) {
      status = 'met';
      remedyAction = `Minor gap (${Math.abs(delta)} pts); review advanced edge cases.`;
    } else if (ratio >= 0.65) {
      status = 'moderate_gap';
      isGap = true;
      blockingGaps.push(
        `${req.skillName} (${userScore.toFixed(1)}/10, needs ${requiredScore}/10 - ${req.importance} priority)`
      );
      remedyAction = `Targeted upskilling module required: ${req.description}`;
    } else {
      status = 'critical_gap';
      isGap = true;
      blockingGaps.push(
        `${req.skillName} (${userScore.toFixed(1)}/10, needs ${requiredScore}/10 - ${req.importance} priority)`
      );
      remedyAction = `Core foundation gap: study system patterns and complete hands-on scenario.`;
    }

    gapDetails.push({
      skillName: req.skillName,
      userScore: Number(userScore.toFixed(1)),
      requiredScore,
      ratio: Number(ratio.toFixed(2)),
      delta,
      isGap,
      status,
      remedyAction,
    });
  }

  const rawMatch = totalWeight > 0 ? (weightedRatioSum / totalWeight) * 100 : 0;
  const matchPercentage = Math.round(rawMatch);

  let status: JobMatchResult['status'] = 'upskill_needed';
  let statusLabel = '2-3 Weeks Upskilling';
  let aiVerdict = '';

  if (matchPercentage >= 80) {
    status = 'ready';
    statusLabel = 'Ready to Apply';
    aiVerdict = `Verified competency in ${provenStrengths.length} critical skills. Your architecture responses directly proved senior reasoning readiness.`;
  } else if (matchPercentage >= 50) {
    status = 'upskill_needed';
    statusLabel = '2-3 Weeks Upskilling';
    aiVerdict = `Strong foundation in core workflows, but ${blockingGaps.length} blocking skill gap(s) must be resolved to clear technical screen rounds.`;
  } else {
    status = 'critical_foundation';
    statusLabel = 'Fundamental Gaps';
    aiVerdict = `Candidate has foundational awareness but lacks deep architectural invariants and production concurrency patterns needed for this tier.`;
  }

  return {
    job,
    matchPercentage,
    status,
    statusLabel,
    aiVerdict,
    provenStrengths,
    blockingGaps,
    gapDetails,
  };
}

export function calculateAllJobMatches(
  profile: SkillProfile,
  benchmarks: JobBenchmark[]
): JobMatchResult[] {
  return benchmarks
    .map((job) => calculateJobMatch(profile, job))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
