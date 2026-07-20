import {
  StrategicObjective,
  StartupStage,
  ReadinessAssessment,
  GapAnalysisResult,
  RecommendationItem,
} from '@core/domain/business-intelligence.js';

export class RecommendationEngine {
  public generateRecommendations(
    objective: StrategicObjective,
    stage: StartupStage,
    readiness: ReadinessAssessment,
    gaps: GapAnalysisResult
  ): RecommendationItem[] {
    const items: RecommendationItem[] = [];

    // Gap-driven recommendations
    if (gaps.missingFields.length > 0) {
      items.push({
        id: crypto.randomUUID(),
        title: 'Complete Missing Memory Facts',
        reasoning: `Startup memory is missing key facts: ${gaps.missingFields.join(', ')}. Populating these fields strengthens asset quality.`,
        priority: 'MEDIUM',
      });
    }

    // Objective mapping to target service
    if (objective === 'BUILD_STARTUP' || stage === 'IDEATION') {
      items.push({
        id: crypto.randomUUID(),
        title: 'Initialize Startup Blueprint',
        reasoning: 'The startup is in early ideation. Creating a foundational Startup Blueprint establishes core mission, problem, and solution facts.',
        priority: 'HIGH',
        recommendedService: 'startup_blueprint',
      });
    }

    if (objective === 'RAISE_INVESTMENT') {
      if (readiness.score < 70) {
        items.push({
          id: crypto.randomUUID(),
          title: 'Resolve Missing Investment Prerequisites',
          reasoning: `Investment readiness score is ${readiness.score}%. Resolve missing components (${readiness.missingComponents.join(', ')}) before pitch deck generation.`,
          priority: 'HIGH',
          recommendedService: 'startup_blueprint',
        });
      } else {
        items.push({
          id: crypto.randomUUID(),
          title: 'Generate Investor Ready Package',
          reasoning: 'Startup memory contains complete business foundation facts. Proceeding to generate Pitch Deck, Executive Summary, and Investment Memo.',
          priority: 'HIGH',
          recommendedService: 'investor_ready',
        });
      }
    }

    if (objective === 'APPLY_FOR_GRANTS') {
      items.push({
        id: crypto.randomUUID(),
        title: 'Generate Ecosystem Grant Application',
        reasoning: 'Produce tailored grant proposal narrative based on current startup memory.',
        priority: 'HIGH',
        recommendedService: 'grant_builder',
      });
    }

    if (objective === 'BUILD_PARTNERSHIPS') {
      items.push({
        id: crypto.randomUUID(),
        title: 'Create Partnership Studio Assets',
        reasoning: 'Generate partnership proposal and ecosystem outreach materials.',
        priority: 'MEDIUM',
        recommendedService: 'partnership_studio',
      });
    }

    if (objective === 'LAUNCH_TOKEN') {
      items.push({
        id: crypto.randomUUID(),
        title: 'Generate Token Launch Kit',
        reasoning: 'Produce tokenomics draft, utility specification, and governance documentation.',
        priority: 'HIGH',
        recommendedService: 'token_launch_kit',
      });
    }

    if (objective === 'IMPROVE_HEALTH' || items.length === 0) {
      items.push({
        id: crypto.randomUUID(),
        title: 'Perform Startup Health Audit',
        reasoning: 'Evaluate readiness scores across fundraising, grant, launch, and partnership categories to identify asset gaps.',
        priority: 'MEDIUM',
        recommendedService: 'startup_health',
      });
    }

    return items;
  }
}
