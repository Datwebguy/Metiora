import { ApprovalStatus } from './user-memory.js';

export interface InvestmentReadinessAssessment {
  overallScore: number; // 0 - 100
  strengths: string[];
  weaknesses: string[];
  missingInformation: string[];
  investmentRisks: string[];
  recommendations: string[];
}

export interface ExecutiveSummaryDeliverable {
  companyName: string;
  tagline: string;
  oneSentenceDescription: string;
  industry: string;
  stage: string;
  summaryText: string;
}

export interface InvestmentMemoDeliverable {
  thesis: string;
  marketProblem: string;
  solutionOverview: string;
  marketSize: string;
  competitiveAdvantage: string;
  businessModel: string;
  financialProjectionsSummary: string;
}

export interface OnePageCompanyOverview {
  headline: string;
  keyHighlights: string[];
  productOverview: string;
  targetMarket: string;
}

export interface InvestorFAQ {
  question: string;
  answer: string;
}

export interface InvestmentNarrative {
  founderStory: string;
  visionNarrative: string;
  whyNow: string;
}

export interface FundingAskDeliverable {
  targetRaiseAmount: string;
  valuationCap?: string;
  fundingRoundStage: string;
  useOfFundsBreakdown: { category: string; percentage: number; description: string }[];
  runwayMonths: number;
}

export interface TractionDeliverable {
  currentStage: string;
  milestonesAchieved: string[];
  keyMetrics: { metricName: string; value: string }[];
}

export interface GrowthStrategyDeliverable {
  customerAcquisitionChannels: string[];
  growthMilestones: string[];
  scalingStrategy: string;
}

export interface RiskAnalysisDeliverable {
  marketRisks: string[];
  executionRisks: string[];
  mitigationPlans: string[];
}

export interface InvestorPackageContent {
  executiveSummary: ExecutiveSummaryDeliverable;
  investmentMemo: InvestmentMemoDeliverable;
  onePageOverview: OnePageCompanyOverview;
  narrative: InvestmentNarrative;
  fundingAsk: FundingAskDeliverable;
  traction: TractionDeliverable;
  growthStrategy: GrowthStrategyDeliverable;
  riskAnalysis: RiskAnalysisDeliverable;
  investorFaq: InvestorFAQ[];
  investmentHighlights: string[];
}

export interface InvestorPackageAggregate {
  id: string;
  startupProfileId: string;
  founderProfileId: string;
  blueprintId?: string;
  version: number;
  status: ApprovalStatus;
  readinessScore: number;
  content: InvestorPackageContent;
  contentMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InvestorPackageVersionRecord {
  id: string;
  packageId: string;
  versionNumber: number;
  contentJson: InvestorPackageContent;
  contentMarkdown: string;
  changeSummary: string;
  createdAt: Date;
}
