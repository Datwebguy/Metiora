import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { StrategicObjective, ReadinessAssessment } from '@core/domain/business-intelligence.js';

export class ReadinessEvaluator {
  public evaluateReadiness(snapshot: StartupMemorySnapshot, objective: StrategicObjective): ReadinessAssessment {
    let score = 100;
    const missingComponents: string[] = [];
    const risks: string[] = [];
    const recommendedImprovements: string[] = [];

    // Core identity & mission checks (Base 30%)
    if (!snapshot.foundation.mission) {
      score -= 15;
      missingComponents.push('Company Mission');
      recommendedImprovements.push('Define a clear long-term mission statement.');
    }
    if (!snapshot.problemAndSolution.problemStatement) {
      score -= 15;
      missingComponents.push('Problem Statement');
      recommendedImprovements.push('Articulate the primary market problem and pain points.');
    }

    // Objective-specific rules
    if (objective === 'RAISE_INVESTMENT') {
      if (!snapshot.marketAndCustomers.businessModel) {
        score -= 20;
        missingComponents.push('Business Model');
        risks.push('Investors require a clear monetization and business model.');
        recommendedImprovements.push('Formulate business model and revenue streams.');
      }
      if (!snapshot.problemAndSolution.uniqueValueProp) {
        score -= 15;
        missingComponents.push('Unique Value Proposition');
        recommendedImprovements.push('Highlight competitive advantage over existing market alternatives.');
      }
      if (snapshot.marketAndCustomers.competitors.length === 0) {
        score -= 10;
        missingComponents.push('Competitor Analysis');
        risks.push('Lack of competitor analysis signals incomplete market research.');
      }
    } else if (objective === 'APPLY_FOR_GRANTS') {
      if (!snapshot.problemAndSolution.productDescription) {
        score -= 25;
        missingComponents.push('Product Description');
        risks.push('Grants require detailed technical product specification.');
      }
      if (!snapshot.companyProfile.websiteUrl) {
        score -= 10;
        missingComponents.push('Public Website / Documentation');
      }
    } else if (objective === 'LAUNCH_TOKEN') {
      if (!snapshot.tokenomics?.tokenSymbol) {
        score -= 40;
        missingComponents.push('Tokenomics Specification');
        risks.push('Token launch requested without token utility or distribution design.');
        recommendedImprovements.push('Complete Token Launch Kit.');
      }
    }

    const finalScore = Math.max(0, score);

    return {
      objective,
      score: finalScore,
      missingComponents,
      risks,
      recommendedImprovements,
    };
  }
}
