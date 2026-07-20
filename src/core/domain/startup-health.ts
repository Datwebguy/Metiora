import { ApprovalStatus } from './user-memory.js';

export type HealthDimension =
  | 'FOUNDER_READINESS'
  | 'VISION_AND_STRATEGY'
  | 'PRODUCT'
  | 'MARKET_VALIDATION'
  | 'CUSTOMER_DEFINITION'
  | 'BUSINESS_MODEL'
  | 'REVENUE_STRATEGY'
  | 'FINANCIAL_READINESS'
  | 'FUNDRAISING_READINESS'
  | 'GRANT_READINESS'
  | 'PARTNERSHIP_READINESS'
  | 'TOKEN_READINESS'
  | 'GTM_READINESS'
  | 'OPERATIONAL_MATURITY'
  | 'GROWTH_READINESS';

export interface CategoryScore {
  dimension: HealthDimension;
  categoryName: string;
  score: number; // 0 - 100
  status: 'EXCELLENT' | 'GOOD' | 'NEEDS_ATTENTION' | 'CRITICAL';
  keyObservations: string[];
}

export interface HealthStrength {
  title: string;
  dimension: string;
  detail: string;
}

export interface HealthWeakness {
  title: string;
  dimension: string;
  detail: string;
}

export interface HealthRisk {
  title: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  detail: string;
}

export interface CriticalIssue {
  title: string;
  dimension: string;
  impact: string;
}

export interface RecommendedPriority {
  priorityOrder: number;
  title: string;
  rationale: string;
}

export interface ImmediateAction {
  action: string;
  ownerRole: string;
  timeframeDays: number;
}

export interface StartupHealthAssessment {
  overallScore: number; // 0 - 100
  categoryScores: CategoryScore[];
  strengths: HealthStrength[];
  weaknesses: HealthWeakness[];
  risks: HealthRisk[];
  criticalIssues: CriticalIssue[];
  recommendedPriorities: RecommendedPriority[];
  immediateActions: ImmediateAction[];
  longTermRecommendations: string[];
}

export interface StartupHealthReportContent {
  startupName: string;
  assessmentDate: Date;
  assessment: StartupHealthAssessment;
  executiveSummary: string;
}

export interface StartupHealthReportAggregate {
  id: string;
  startupProfileId: string;
  founderProfileId: string;
  blueprintId?: string;
  version: number;
  status: ApprovalStatus;
  overallScore: number;
  categoryScores: CategoryScore[];
  content: StartupHealthReportContent;
  contentMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StartupHealthReportVersionRecord {
  id: string;
  reportId: string;
  versionNumber: number;
  overallScore: number;
  categoryScoresJson: CategoryScore[];
  contentJson: StartupHealthReportContent;
  contentMarkdown: string;
  changeSummary: string;
  createdAt: Date;
}
