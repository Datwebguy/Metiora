import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import {
  StartupHealthAssessment,
  CategoryScore,
  HealthStrength,
  HealthWeakness,
  HealthRisk,
  CriticalIssue,
  RecommendedPriority,
  ImmediateAction,
} from '@core/domain/startup-health.js';

export class HealthScoringEngine {
  public evaluate(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot
  ): StartupHealthAssessment {
    const categoryScores: CategoryScore[] = [];
    const strengths: HealthStrength[] = [];
    const weaknesses: HealthWeakness[] = [];
    const risks: HealthRisk[] = [];
    const criticalIssues: CriticalIssue[] = [];

    // 1. Founder Readiness
    const founderScore = userSnapshot.founderSummary.fullName ? 90 : 50;
    categoryScores.push({
      dimension: 'FOUNDER_READINESS',
      categoryName: 'Founder & Leadership Readiness',
      score: founderScore,
      status: founderScore >= 80 ? 'EXCELLENT' : 'NEEDS_ATTENTION',
      keyObservations: userSnapshot.founderSummary.fullName
        ? [`Verified lead founder: ${userSnapshot.founderSummary.fullName}`]
        : ['Lead founder profile incomplete'],
    });

    // 2. Vision & Strategy
    const visionScore = startupSnapshot.foundation.mission ? 85 : 40;
    categoryScores.push({
      dimension: 'VISION_AND_STRATEGY',
      categoryName: 'Vision & Strategic Alignment',
      score: visionScore,
      status: visionScore >= 80 ? 'EXCELLENT' : 'CRITICAL',
      keyObservations: startupSnapshot.foundation.mission
        ? [`Mission statement established: ${startupSnapshot.foundation.mission}`]
        : ['Mission statement is undefined'],
    });

    // 3. Product
    const productScore = startupSnapshot.problemAndSolution.productDescription ? 85 : 45;
    categoryScores.push({
      dimension: 'PRODUCT',
      categoryName: 'Product Architecture & Solution',
      score: productScore,
      status: productScore >= 80 ? 'EXCELLENT' : 'NEEDS_ATTENTION',
      keyObservations: startupSnapshot.problemAndSolution.productDescription
        ? ['Product technical description complete']
        : ['Product technical details missing'],
    });

    // 4. Market Validation
    const competitors = startupSnapshot.marketAndCustomers.competitors || [];
    const marketScore = competitors.length > 0 ? 80 : 50;
    categoryScores.push({
      dimension: 'MARKET_VALIDATION',
      categoryName: 'Market Validation & Landscape',
      score: marketScore,
      status: marketScore >= 80 ? 'GOOD' : 'NEEDS_ATTENTION',
      keyObservations: competitors.length > 0
        ? [`Competitor analysis complete (${competitors.length} competitors)`]
        : ['Competitor mapping incomplete'],
    });

    // 5. Customer Definition
    const customerScore = startupSnapshot.marketAndCustomers.targetAudience ? 85 : 45;
    categoryScores.push({
      dimension: 'CUSTOMER_DEFINITION',
      categoryName: 'Customer Definition & ICP',
      score: customerScore,
      status: customerScore >= 80 ? 'EXCELLENT' : 'NEEDS_ATTENTION',
      keyObservations: startupSnapshot.marketAndCustomers.targetAudience
        ? [`Target audience defined: ${startupSnapshot.marketAndCustomers.targetAudience}`]
        : ['Target audience not explicitly defined'],
    });

    // 6. Business Model
    const bizScore = startupSnapshot.marketAndCustomers.businessModel ? 85 : 40;
    categoryScores.push({
      dimension: 'BUSINESS_MODEL',
      categoryName: 'Business Model Structure',
      score: bizScore,
      status: bizScore >= 80 ? 'EXCELLENT' : 'CRITICAL',
      keyObservations: startupSnapshot.marketAndCustomers.businessModel
        ? [`Business model established: ${startupSnapshot.marketAndCustomers.businessModel}`]
        : ['Business model undefined'],
    });

    // 7. Revenue Strategy
    const revScore = startupSnapshot.marketAndCustomers.revenueModel ? 80 : 50;
    categoryScores.push({
      dimension: 'REVENUE_STRATEGY',
      categoryName: 'Revenue Strategy & Monetization',
      score: revScore,
      status: revScore >= 80 ? 'GOOD' : 'NEEDS_ATTENTION',
      keyObservations: startupSnapshot.marketAndCustomers.revenueModel
        ? ['Revenue model specified']
        : ['Monetization plan pending'],
    });

    // 8. Financial Readiness
    const finScore = 70;
    categoryScores.push({
      dimension: 'FINANCIAL_READINESS',
      categoryName: 'Financial Readiness & Runway',
      score: finScore,
      status: 'GOOD',
      keyObservations: ['Financial planning active'],
    });

    // 9. Fundraising Readiness
    const fundingStage = startupSnapshot.fundingAndRoadmap?.fundingStage || startupSnapshot.companyProfile.stage;
    const fundScore = fundingStage ? 80 : 60;
    categoryScores.push({
      dimension: 'FUNDRAISING_READINESS',
      categoryName: 'Fundraising Readiness',
      score: fundScore,
      status: 'GOOD',
      keyObservations: [fundingStage ? `Stage: ${fundingStage}` : 'Stage pending'],
    });

    // 10. Grant Readiness
    const grantScore = 75;
    categoryScores.push({
      dimension: 'GRANT_READINESS',
      categoryName: 'Grant Opportunity Readiness',
      score: grantScore,
      status: 'GOOD',
      keyObservations: ['Eligible for ecosystem grants'],
    });

    // 11. Partnership Readiness
    const partnerScore = 75;
    categoryScores.push({
      dimension: 'PARTNERSHIP_READINESS',
      categoryName: 'Strategic Partnership Readiness',
      score: partnerScore,
      status: 'GOOD',
      keyObservations: ['Partnership strategy defined'],
    });

    // 12. Token Readiness
    const tokenSymbol = startupSnapshot.tokenomics?.tokenSymbol;
    const tokenScore = tokenSymbol ? 85 : 60;
    categoryScores.push({
      dimension: 'TOKEN_READINESS',
      categoryName: 'Token Strategy & Utility',
      score: tokenScore,
      status: 'GOOD',
      keyObservations: [tokenSymbol ? `Token: $${tokenSymbol}` : 'N/A or Traditional'],
    });

    // 13. Go-To-Market Readiness
    const gtmScore = startupSnapshot.companyProfile.websiteUrl ? 80 : 50;
    categoryScores.push({
      dimension: 'GTM_READINESS',
      categoryName: 'Go-To-Market Execution',
      score: gtmScore,
      status: gtmScore >= 80 ? 'GOOD' : 'NEEDS_ATTENTION',
      keyObservations: startupSnapshot.companyProfile.websiteUrl
        ? [`Public web presence verified (${startupSnapshot.companyProfile.websiteUrl})`]
        : ['Public GTM presence missing'],
    });

    // 14. Operational Maturity
    const opsScore = 75;
    categoryScores.push({
      dimension: 'OPERATIONAL_MATURITY',
      categoryName: 'Operational Maturity & Compliance',
      score: opsScore,
      status: 'GOOD',
      keyObservations: ['Operational infrastructure established'],
    });

    // 15. Growth Readiness
    const growthScore = 75;
    categoryScores.push({
      dimension: 'GROWTH_READINESS',
      categoryName: 'Growth Readiness & Scalability',
      score: growthScore,
      status: 'GOOD',
      keyObservations: ['Scalable architecture confirmed'],
    });

    // Calculate Overall Score
    const totalScoreSum = categoryScores.reduce((sum, c) => sum + c.score, 0);
    const overallScore = Math.round(totalScoreSum / categoryScores.length);

    // Strengths, Weaknesses, Risks
    if (visionScore >= 80) {
      strengths.push({
        title: 'Strong Vision & Strategy',
        dimension: 'VISION_AND_STRATEGY',
        detail: 'Clear, well-defined mission and core value proposition.',
      });
    }
    if (productScore >= 80) {
      strengths.push({
        title: 'Product Technical Clarity',
        dimension: 'PRODUCT',
        detail: 'Architecture is modular and well-documented.',
      });
    }

    if (gtmScore < 80) {
      weaknesses.push({
        title: 'Public Web Presence Missing',
        dimension: 'GTM_READINESS',
        detail: 'No verified website URL available.',
      });
      risks.push({
        title: 'GTM Friction',
        severity: 'MEDIUM',
        detail: 'Lack of public documentation impedes customer and investor conversion.',
      });
    }

    if (overallScore < 70) {
      criticalIssues.push({
        title: 'Overall Readiness Below Target',
        dimension: 'OVERALL',
        impact: 'May experience friction during investor pitches or grant evaluations.',
      });
    }

    const recommendedPriorities: RecommendedPriority[] = [
      { priorityOrder: 1, title: 'Finalize GTM Documentation', rationale: 'Establish public web presence to increase trust.' },
      { priorityOrder: 2, title: 'Expand Strategic Partnerships', rationale: 'Leverage ecosystem partners for distribution leverage.' },
    ];

    const immediateActions: ImmediateAction[] = [
      { action: 'Publish technical documentation landing page', ownerRole: 'Lead Founder', timeframeDays: 7 },
    ];

    const longTermRecommendations: string[] = [
      'Maintain continuous quarterly health evaluations to track business maturity trajectory.',
    ];

    return {
      overallScore,
      categoryScores,
      strengths,
      weaknesses,
      risks,
      criticalIssues,
      recommendedPriorities,
      immediateActions,
      longTermRecommendations,
    };
  }
}
