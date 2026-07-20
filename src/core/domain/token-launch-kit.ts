import { ApprovalStatus } from './user-memory.js';

export interface TokenReadinessAssessment {
  isAppropriate: boolean;
  overallScore: number; // 0 - 100
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  missingInformation: string[];
  recommendations: string[];
  recommendationReasoning: string;
}

export interface TokenStrategy {
  tokenName: string;
  tokenSymbol: string;
  primaryPurpose: string;
  tokenType: 'UTILITY' | 'GOVERNANCE' | 'HYBRID';
  targetEcosystem: string;
}

export interface UtilityModel {
  coreUtilities: string[];
  stakingMechanisms?: string;
  feeDiscountsOrBurn?: string;
  accessOrPrivileges: string;
}

export interface SupplyStrategy {
  totalSupply: string;
  initialCirculatingSupply: string;
  inflationOrDeflationModel: string;
  mintBurnMechanics?: string;
}

export interface DistributionStrategy {
  allocations: { category: string; percentage: number; vestingPeriodMonths: number; lockupMonths: number }[];
  publicSaleStrategy?: string;
  airdropStrategy?: string;
}

export interface GovernanceModel {
  governanceScope: string;
  votingMechanics: string;
  daoTransitionPlan?: string;
}

export interface TreasuryStrategy {
  treasuryAllocationPercentage: number;
  grantProgramBudget?: string;
  reserveManagementStrategy: string;
}

export interface IncentiveModel {
  userIncentives: string[];
  developerIncentives: string[];
  liquidityIncentives?: string;
}

export interface LaunchRoadmap {
  phases: { phaseName: string; targetQuarter: string; milestone: string }[];
}

export interface RiskAssessment {
  regulatoryRisks: string[];
  economicSecurityRisks: string[];
  mitigationPlans: string[];
}

export interface TokenLaunchKitContent {
  isAppropriate: boolean;
  strategy: TokenStrategy;
  utilityModel: UtilityModel;
  supplyStrategy: SupplyStrategy;
  distributionStrategy: DistributionStrategy;
  governanceModel: GovernanceModel;
  treasuryStrategy: TreasuryStrategy;
  incentiveModel: IncentiveModel;
  launchRoadmap: LaunchRoadmap;
  riskAssessment: RiskAssessment;
}

export interface TokenLaunchKitAggregate {
  id: string;
  startupProfileId: string;
  founderProfileId: string;
  blueprintId?: string;
  version: number;
  status: ApprovalStatus;
  readinessScore: number;
  content: TokenLaunchKitContent;
  contentMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TokenLaunchKitVersionRecord {
  id: string;
  kitId: string;
  versionNumber: number;
  contentJson: TokenLaunchKitContent;
  contentMarkdown: string;
  changeSummary: string;
  createdAt: Date;
}
