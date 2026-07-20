export type StrategicObjective = 
  | 'BUILD_STARTUP'
  | 'REFINE_STARTUP'
  | 'RAISE_INVESTMENT'
  | 'APPLY_FOR_GRANTS'
  | 'BUILD_PARTNERSHIPS'
  | 'LAUNCH_PRODUCT'
  | 'LAUNCH_TOKEN'
  | 'IMPROVE_HEALTH'
  | 'STRATEGIC_GUIDANCE';

export type StartupStage = 
  | 'IDEATION'
  | 'VALIDATION'
  | 'BUILDING'
  | 'MVP'
  | 'BETA'
  | 'EARLY_TRACTION'
  | 'GROWTH'
  | 'SCALING';

export interface IntentAnalysisResult {
  rawGoal: string;
  detectedObjective: StrategicObjective;
  confidenceScore: number;
  detectedMode: string;
  keywordsMatched: string[];
}

export interface ReadinessAssessment {
  objective: StrategicObjective;
  score: number; // 0 - 100
  missingComponents: string[];
  risks: string[];
  recommendedImprovements: string[];
}

export interface GapAnalysisResult {
  objective: StrategicObjective;
  missingFields: string[];
  missingDeliverables: string[];
  impactSeverity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface DependencyAnalysisResult {
  targetWorkflow: string;
  dependenciesResolved: boolean;
  missingPrerequisites: string[];
  canProceed: boolean;
}

export interface ConsistencyAnalysisResult {
  hasContradictions: boolean;
  conflicts: {
    locationA: string;
    locationB: string;
    description: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
  }[];
}

export interface RecommendationItem {
  id: string;
  title: string;
  reasoning: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedService?: string;
}

export interface ExecutionPlan {
  planId: string;
  objective: StrategicObjective;
  startupStage: StartupStage;
  readinessScore: number;
  missingDependencies: string[];
  recommendedService?: string;
  actionSteps: string[];
  generatedAt: Date;
}
