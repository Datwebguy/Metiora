import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { TokenReadinessAssessment } from '@core/domain/token-launch-kit.js';

export class TokenReadinessAssessor {
  public assess(
    startupSnapshot: StartupMemorySnapshot,
    _userSnapshot: UserMemorySnapshot
  ): TokenReadinessAssessment {
    let score = 100;
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const risks: string[] = [];
    const missingInformation: string[] = [];
    const recommendations: string[] = [];

    const isWeb3OrDeFi =
      startupSnapshot.companyProfile.industry?.toLowerCase().includes('web3') ||
      startupSnapshot.companyProfile.industry?.toLowerCase().includes('crypto') ||
      startupSnapshot.companyProfile.industry?.toLowerCase().includes('blockchain') ||
      startupSnapshot.companyProfile.industry?.toLowerCase().includes('defi') ||
      Boolean(startupSnapshot.tokenomics?.tokenSymbol);

    // Appropriateness check
    if (!isWeb3OrDeFi && !startupSnapshot.tokenomics?.utility) {
      return {
        isAppropriate: false,
        overallScore: 30,
        strengths: [],
        weaknesses: ['Startup operates in traditional business domain without decentralized token utility requirements.'],
        risks: ['Launching a token without real utility creates severe regulatory risk and damages business credibility.'],
        missingInformation: ['Decentralized Protocol Utility Specification'],
        recommendations: [
          'Focus on traditional equity, B2B SaaS revenue, or grant funding rather than issuing a token.',
        ],
        recommendationReasoning:
          'Tokenization is NOT recommended for this startup because core business operations do not require a decentralized utility token.',
      };
    }

    // Evaluate token readiness for Web3 startups
    if (startupSnapshot.tokenomics?.tokenSymbol) {
      strengths.push(`Token symbol identified (${startupSnapshot.tokenomics.tokenSymbol}).`);
    } else {
      score -= 15;
      missingInformation.push('Token Symbol / Name');
    }

    if (startupSnapshot.tokenomics?.utility) {
      strengths.push('Token utility defined.');
    } else {
      score -= 20;
      weaknesses.push('Token utility mechanism is undefined.');
      missingInformation.push('Token Utility Model');
      recommendations.push('Formulate explicit staking, fee-discount, or access utility.');
    }

    if (startupSnapshot.problemAndSolution.productDescription) {
      strengths.push('Product technical architecture established.');
    } else {
      score -= 20;
      missingInformation.push('Product Technical Description');
    }

    const finalScore = Math.max(0, score);

    return {
      isAppropriate: true,
      overallScore: finalScore,
      strengths,
      weaknesses,
      risks,
      missingInformation,
      recommendations,
      recommendationReasoning:
        'Tokenization is appropriate. The startup benefits from a structured utility token launch strategy.',
    };
  }
}
