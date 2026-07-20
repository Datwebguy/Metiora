import { RecommendationEngine } from '../domain/recommendation-engine.js';
import {
  StrategicObjective,
  StartupStage,
  ReadinessAssessment,
  GapAnalysisResult,
  RecommendationItem,
} from '@core/domain/business-intelligence.js';

export class GenerateRecommendations {
  private recommendationEngine: RecommendationEngine;

  constructor() {
    this.recommendationEngine = new RecommendationEngine();
  }

  public execute(
    objective: StrategicObjective,
    stage: StartupStage,
    readiness: ReadinessAssessment,
    gaps: GapAnalysisResult
  ): RecommendationItem[] {
    return this.recommendationEngine.generateRecommendations(objective, stage, readiness, gaps);
  }
}
