import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import {
  ExecutionPlan,
  IntentAnalysisResult,
  ReadinessAssessment,
  GapAnalysisResult,
  ConsistencyAnalysisResult,
  RecommendationItem,
} from '@core/domain/business-intelligence.js';
import { DetectIntent } from './detect-intent.js';
import { DetermineStartupStage } from './determine-startup-stage.js';
import { AnalyzeReadiness } from './analyze-readiness.js';
import { RunGapAnalysis } from './run-gap-analysis.js';
import { RunConsistencyAnalysis } from './run-consistency-analysis.js';
import { GenerateRecommendations } from './generate-recommendations.js';
import { GenerateExecutionPlan } from './generate-execution-plan.js';

export interface ObjectiveAnalysisOutput {
  intent: IntentAnalysisResult;
  startupStage: string;
  readiness: ReadinessAssessment;
  gaps: GapAnalysisResult;
  consistency: ConsistencyAnalysisResult;
  recommendations: RecommendationItem[];
  executionPlan: ExecutionPlan;
}

export class AnalyzeObjective {
  private detectIntent: DetectIntent;
  private determineStage: DetermineStartupStage;
  private analyzeReadiness: AnalyzeReadiness;
  private runGapAnalysis: RunGapAnalysis;
  private runConsistency: RunConsistencyAnalysis;
  private generateRecommendations: GenerateRecommendations;
  private generateExecutionPlan: GenerateExecutionPlan;

  constructor() {
    this.detectIntent = new DetectIntent();
    this.determineStage = new DetermineStartupStage();
    this.analyzeReadiness = new AnalyzeReadiness();
    this.runGapAnalysis = new RunGapAnalysis();
    this.runConsistency = new RunConsistencyAnalysis();
    this.generateRecommendations = new GenerateRecommendations();
    this.generateExecutionPlan = new GenerateExecutionPlan();
  }

  public execute(
    rawGoal: string,
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot?: UserMemorySnapshot
  ): ObjectiveAnalysisOutput {
    const intent = this.detectIntent.execute(rawGoal);
    const stage = this.determineStage.execute(startupSnapshot);
    const readiness = this.analyzeReadiness.execute(startupSnapshot, intent.detectedObjective);
    const gaps = this.runGapAnalysis.execute(startupSnapshot, intent.detectedObjective);
    const consistency = userSnapshot
      ? this.runConsistency.execute(startupSnapshot, userSnapshot)
      : { hasContradictions: false, conflicts: [] };

    const recommendations = this.generateRecommendations.execute(intent.detectedObjective, stage, readiness, gaps);
    const executionPlan = this.generateExecutionPlan.execute(
      intent.detectedObjective,
      stage,
      readiness,
      gaps,
      recommendations
    );

    return {
      intent,
      startupStage: stage,
      readiness,
      gaps,
      consistency,
      recommendations,
      executionPlan,
    };
  }
}
