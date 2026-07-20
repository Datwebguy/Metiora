import { StrategicObjective, IntentAnalysisResult } from '@core/domain/business-intelligence.js';

interface ObjectiveRule {
  objective: StrategicObjective;
  mode: string;
  keywords: string[];
}

export class IntentClassifier {
  private rules: ObjectiveRule[] = [
    {
      objective: 'RAISE_INVESTMENT',
      mode: 'fundraising',
      keywords: ['funding', 'investment', 'investor', 'pitch', 'raise', 'capital', 'series a', 'seed round', 'term sheet'],
    },
    {
      objective: 'APPLY_FOR_GRANTS',
      mode: 'grant',
      keywords: ['grant', 'accelerator', 'okx grant', 'foundation grant', 'ecosystem grant', 'incubator', 'bounty'],
    },
    {
      objective: 'BUILD_PARTNERSHIPS',
      mode: 'growth',
      keywords: ['partner', 'partnership', 'integration', 'collaboration', 'outreach', 'sponsor', 'co-marketing'],
    },
    {
      objective: 'LAUNCH_TOKEN',
      mode: 'launch',
      keywords: ['token', 'tokenomics', 'tge', 'airdrop', 'utility token', 'governance', 'vesting', 'web3 launch'],
    },
    {
      objective: 'LAUNCH_PRODUCT',
      mode: 'launch',
      keywords: ['launch', 'releasing', 'go to market', 'product launch', 'public release', 'deploy'],
    },
    {
      objective: 'BUILD_STARTUP',
      mode: 'founder',
      keywords: ['idea', 'start a startup', 'new company', 'blueprint', 'foundation', 'begin'],
    },
    {
      objective: 'IMPROVE_HEALTH',
      mode: 'strategy',
      keywords: ['health', 'readiness', 'audit', 'score', 'check startup', 'status'],
    },
  ];

  public classifyIntent(rawGoal: string): IntentAnalysisResult {
    const lower = rawGoal.toLowerCase();
    let bestMatch: ObjectiveRule | null = null;
    let maxMatchedCount = 0;
    const matchedKeywords: string[] = [];

    for (const rule of this.rules) {
      const hits = rule.keywords.filter((k) => lower.includes(k));
      if (hits.length > maxMatchedCount) {
        maxMatchedCount = hits.length;
        bestMatch = rule;
        matchedKeywords.push(...hits);
      }
    }

    if (!bestMatch || maxMatchedCount === 0) {
      return {
        rawGoal,
        detectedObjective: 'STRATEGIC_GUIDANCE',
        confidenceScore: 0.5,
        detectedMode: 'strategy',
        keywordsMatched: [],
      };
    }

    const confidenceScore = Math.min(0.95, 0.6 + maxMatchedCount * 0.15);

    return {
      rawGoal,
      detectedObjective: bestMatch.objective,
      confidenceScore,
      detectedMode: bestMatch.mode,
      keywordsMatched: Array.from(new Set(matchedKeywords)),
    };
  }
}
