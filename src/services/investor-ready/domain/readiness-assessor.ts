import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { InvestmentReadinessAssessment } from '@core/domain/investor-ready.js';

export class ReadinessAssessor {
  public assess(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot
  ): InvestmentReadinessAssessment {
    let score = 100;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const missingInformation: string[] = [];
    const investmentRisks: string[] = [];
    const recommendations: string[] = [];

    // Core Identity & Team (20 pts)
    if (userSnapshot.founderSummary.fullName) {
      strengths.push(`Clear founder identity (${userSnapshot.founderSummary.fullName}).`);
    } else {
      score -= 10;
      missingInformation.push('Founder Full Name');
    }

    // Problem & Solution (25 pts)
    if (startupSnapshot.problemAndSolution.problemStatement) {
      strengths.push('Defined market problem statement.');
    } else {
      score -= 15;
      weaknesses.push('Problem statement is missing or incomplete.');
      missingInformation.push('Problem Statement');
    }

    if (startupSnapshot.problemAndSolution.productDescription) {
      strengths.push('Defined product solution.');
    } else {
      score -= 15;
      weaknesses.push('Product description is missing.');
      missingInformation.push('Product Description');
    }

    // Business & Revenue Model (25 pts)
    if (startupSnapshot.marketAndCustomers.businessModel) {
      strengths.push(`Business model established: ${startupSnapshot.marketAndCustomers.businessModel}.`);
    } else {
      score -= 20;
      weaknesses.push('Business model is not specified.');
      missingInformation.push('Business Model');
      investmentRisks.push('Lack of business model prevents monetization evaluation.');
      recommendations.push('Formulate business model before pitch deck creation.');
    }

    // Market & Competitors (15 pts)
    if (startupSnapshot.marketAndCustomers.competitors.length > 0) {
      strengths.push(`Competitive analysis completed (${startupSnapshot.marketAndCustomers.competitors.length} competitors identified).`);
    } else {
      score -= 10;
      weaknesses.push('Competitor analysis missing.');
      recommendations.push('Map key competitors and market positioning.');
    }

    // Traction & Target Audience (15 pts)
    if (startupSnapshot.marketAndCustomers.targetAudience) {
      strengths.push(`Target audience defined: ${startupSnapshot.marketAndCustomers.targetAudience}.`);
    } else {
      score -= 10;
      missingInformation.push('Target Audience');
    }

    const finalScore = Math.max(0, score);

    return {
      overallScore: finalScore,
      strengths,
      weaknesses,
      missingInformation,
      investmentRisks,
      recommendations,
    };
  }
}
