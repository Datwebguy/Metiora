import {
  StrategicObjective,
  StartupStage,
  ReadinessAssessment,
  GapAnalysisResult,
  RecommendationItem,
  ExecutionPlan,
} from '@core/domain/business-intelligence.js';

export class PlanGenerator {
  public generatePlan(
    objective: StrategicObjective,
    stage: StartupStage,
    readiness: ReadinessAssessment,
    gaps: GapAnalysisResult,
    recommendations: RecommendationItem[]
  ): ExecutionPlan {
    const primaryRecommendation = recommendations.find((r) => r.priority === 'HIGH') || recommendations[0];

    const actionSteps: string[] = [];
    if (gaps.missingFields.length > 0) {
      actionSteps.push(`Fill missing memory fields: ${gaps.missingFields.join(', ')}`);
    }
    recommendations.forEach((rec) => {
      actionSteps.push(`${rec.title}: ${rec.reasoning}`);
    });

    return {
      planId: crypto.randomUUID(),
      objective,
      startupStage: stage,
      readinessScore: readiness.score,
      missingDependencies: gaps.missingFields,
      recommendedService: primaryRecommendation?.recommendedService,
      actionSteps,
      generatedAt: new Date(),
    };
  }
}
