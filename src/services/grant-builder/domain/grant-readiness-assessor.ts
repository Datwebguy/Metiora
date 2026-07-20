import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { GrantReadinessAssessment } from '@core/domain/grant-builder.js';

export class GrantReadinessAssessor {
  public assess(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot
  ): GrantReadinessAssessment {
    let score = 100;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingInformation: string[] = [];
    const applicationRisks: string[] = [];
    const recommendations: string[] = [];

    // Technical Feasibility & Product (30 pts)
    if (startupSnapshot.problemAndSolution.productDescription) {
      strengths.push('Defined technical product specification.');
    } else {
      score -= 20;
      weaknesses.push('Product description missing.');
      missingInformation.push('Product Description');
      applicationRisks.push('Grants require clear technical feasibility specifications.');
      recommendations.push('Flesh out product description and core features.');
    }

    // Mission & Community Impact (25 pts)
    if (startupSnapshot.foundation.mission) {
      strengths.push('Clear mission statement.');
    } else {
      score -= 15;
      weaknesses.push('Mission statement missing.');
      missingInformation.push('Mission Statement');
    }

    // Website & Documentation (15 pts)
    if (startupSnapshot.companyProfile.websiteUrl) {
      strengths.push(`Public documentation URL verified (${startupSnapshot.companyProfile.websiteUrl}).`);
    } else {
      score -= 10;
      weaknesses.push('Public website or documentation link missing.');
      missingInformation.push('Website / Documentation URL');
    }

    // Target Audience & Market (15 pts)
    if (startupSnapshot.marketAndCustomers.targetAudience) {
      strengths.push(`Target ecosystem beneficiaries defined: ${startupSnapshot.marketAndCustomers.targetAudience}.`);
    } else {
      score -= 10;
      missingInformation.push('Target Audience / Beneficiaries');
    }

    // Founder Team (15 pts)
    if (userSnapshot.founderSummary.fullName) {
      strengths.push(`Verified lead applicant (${userSnapshot.founderSummary.fullName}).`);
    } else {
      score -= 10;
      missingInformation.push('Lead Applicant Name');
    }

    const finalScore = Math.max(0, score);

    return {
      overallScore: finalScore,
      strengths,
      weaknesses,
      missingInformation,
      applicationRisks,
      recommendations,
    };
  }
}
