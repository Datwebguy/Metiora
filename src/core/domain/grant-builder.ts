import { ApprovalStatus } from './user-memory.js';

export interface GrantReadinessAssessment {
  overallScore: number; // 0 - 100
  strengths: string[];
  weaknesses: string[];
  missingInformation: string[];
  applicationRisks: string[];
  recommendations: string[];
}

export interface GrantProjectDescription {
  projectTitle: string;
  executiveSummary: string;
  problemStatement: string;
  proposedSolution: string;
  technicalOverview: string;
}

export interface GrantInnovationStatement {
  noveltyDescription: string;
  technicalBreakthrough: string;
  intellectualPropertyStrategy?: string;
  competitiveDifferentiation: string;
}

export interface GrantImpactStatement {
  targetBeneficiaries: string;
  communityEcosystemImpact: string;
  economicOrSocialValue: string;
}

export interface GrantBudgetNarrative {
  requestedAmount: string;
  fundingDurationMonths: number;
  categoryBreakdown: { category: string; amount: string; justification: string }[];
  sustainabilityPlan: string;
}

export interface GrantMilestonePlan {
  milestones: { title: string; targetMonth: number; deliverable: string; kpi: string }[];
  successMetrics: string[];
}

export interface GrantRiskAssessment {
  technicalRisks: string[];
  operationalRisks: string[];
  mitigationPlans: string[];
}

export interface GrantPackageContent {
  projectDescription: GrantProjectDescription;
  innovation: GrantInnovationStatement;
  impact: GrantImpactStatement;
  budgetNarrative: GrantBudgetNarrative;
  milestonePlan: GrantMilestonePlan;
  riskAssessment: GrantRiskAssessment;
  teamOverview: { name: string; role: string; bio: string }[];
  supportingNarrative: string;
}

export interface GrantPackageAggregate {
  id: string;
  startupProfileId: string;
  founderProfileId: string;
  blueprintId?: string;
  version: number;
  status: ApprovalStatus;
  readinessScore: number;
  content: GrantPackageContent;
  contentMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GrantPackageVersionRecord {
  id: string;
  packageId: string;
  versionNumber: number;
  contentJson: GrantPackageContent;
  contentMarkdown: string;
  changeSummary: string;
  createdAt: Date;
}
