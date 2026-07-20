import { PlanGenerator } from '../domain/plan-generator.js';
import {
  StrategicObjective,
  StartupStage,
  ReadinessAssessment,
  GapAnalysisResult,
  RecommendationItem,
  ExecutionPlan,
} from '@core/domain/business-intelligence.js';

export class GenerateExecutionPlan {
  private planGenerator: PlanGenerator;

  constructor() {
    this.planGenerator = new PlanGenerator();
  }

  public execute(
    objective: StrategicObjective,
    stage: StartupStage,
    readiness: ReadinessAssessment,
    gaps: GapAnalysisResult,
    recommendations: RecommendationItem[]
  ): ExecutionPlan {
    return this.planGenerator.generatePlan(objective, stage, readiness, gaps, recommendations);
  }
}
