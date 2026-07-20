import { ApprovalStatus } from './user-memory.js';

export interface BlueprintExecutiveSummary {
  startupName: string;
  tagline?: string;
  oneSentenceDescription?: string;
  industry: string;
  stage: string;
  executiveOverview: string;
}

export interface BlueprintProblemStatement {
  problemStatement: string;
  marketPainPoints: string[];
  existingAlternatives: string[];
}

export interface BlueprintSolution {
  productDescription: string;
  uniqueValueProp: string;
  competitiveAdvantage: string;
  coreFeatures: string[];
}

export interface BlueprintBusinessModel {
  businessModel: string;
  revenueModel?: string;
  pricingStrategy?: string;
  salesStrategy?: string;
  distributionStrategy?: string;
}

export interface BlueprintRoadmap {
  currentStage: string;
  keyMilestones: { milestone: string; targetQuarter?: string; status?: string }[];
  upcomingReleases: string[];
}

export interface BlueprintRiskAssessment {
  identifiedRisks: string[];
  mitigationStrategies: string[];
}

export interface BlueprintGrowthStrategy {
  targetCustomers: string;
  marketOpportunity: string;
  goToMarketStrategy: string;
  successMetrics: string[];
}

export interface StartupBlueprintContent {
  executiveSummary: BlueprintExecutiveSummary;
  problem: BlueprintProblemStatement;
  solution: BlueprintSolution;
  businessModel: BlueprintBusinessModel;
  roadmap: BlueprintRoadmap;
  riskAssessment: BlueprintRiskAssessment;
  growthStrategy: BlueprintGrowthStrategy;
}

export interface StartupBlueprintAggregate {
  id: string;
  startupProfileId: string;
  founderProfileId: string;
  version: number;
  status: ApprovalStatus;
  content: StartupBlueprintContent;
  contentMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlueprintVersionRecord {
  id: string;
  blueprintId: string;
  versionNumber: number;
  contentJson: StartupBlueprintContent;
  contentMarkdown: string;
  changeSummary: string;
  createdAt: Date;
}

export interface BlueprintValidationResult {
  isValid: boolean;
  missingSections: string[];
  conflicts: string[];
  errors: string[];
}
