import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { PartnershipReadinessAssessment } from '@core/domain/partnership-studio.js';

export class PartnershipReadinessAssessor {
  public assess(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot
  ): PartnershipReadinessAssessment {
    let score = 100;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const risks: string[] = [];
    const missingInformation: string[] = [];
    const recommendations: string[] = [];

    // Product & Solution Maturity (30 pts)
    if (startupSnapshot.problemAndSolution.productDescription) {
      strengths.push('Product value proposition and core features defined.');
    } else {
      score -= 20;
      weaknesses.push('Product description missing.');
      missingInformation.push('Product Description');
      risks.push('Partners require a defined product solution before integration.');
      recommendations.push('Flesh out product features and value proposition.');
    }

    // Unique Value Proposition & Advantage (25 pts)
    if (startupSnapshot.problemAndSolution.uniqueValueProp) {
      strengths.push(`Clear UVP: ${startupSnapshot.problemAndSolution.uniqueValueProp}.`);
    } else {
      score -= 15;
      weaknesses.push('Unique value proposition missing.');
      missingInformation.push('Unique Value Proposition');
    }

    // Business & Revenue Strategy (25 pts)
    if (startupSnapshot.marketAndCustomers.businessModel) {
      strengths.push(`Business model defined: ${startupSnapshot.marketAndCustomers.businessModel}.`);
    } else {
      score -= 15;
      weaknesses.push('Business model missing.');
      missingInformation.push('Business Model');
    }

    // Lead Partner Contact (20 pts)
    if (userSnapshot.founderSummary.fullName) {
      strengths.push(`Executive point of contact verified (${userSnapshot.founderSummary.fullName}).`);
    } else {
      score -= 10;
      missingInformation.push('Executive Contact Name');
    }

    const finalScore = Math.max(0, score);

    return {
      overallScore: finalScore,
      strengths,
      weaknesses,
      risks,
      missingInformation,
      recommendations,
    };
  }
}
