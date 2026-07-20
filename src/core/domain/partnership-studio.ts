import { ApprovalStatus } from './user-memory.js';

export type PartnershipCategory =
  | 'TECHNOLOGY'
  | 'DISTRIBUTION'
  | 'STRATEGIC_ALLIANCE'
  | 'MARKETING'
  | 'INTEGRATION'
  | 'ENTERPRISE'
  | 'ECOSYSTEM'
  | 'CHANNEL';

export interface PartnershipReadinessAssessment {
  overallScore: number; // 0 - 100
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  missingInformation: string[];
  recommendations: string[];
}

export interface PartnershipStrategy {
  category: PartnershipCategory;
  objective: string;
  targetPartnerTypes: string[];
  strategicGoals: string[];
}

export interface PartnerProfile {
  idealPartnerIndustry: string;
  partnerCompanySize: string;
  keyRequirements: string[];
  synergyFactors: string[];
}

export interface PartnershipProposal {
  title: string;
  executiveSummary: string;
  proposedCollaboration: string;
  valueProposition: string;
  mutualBenefits: string[];
}

export interface ExecutivePartnershipBrief {
  headline: string;
  companyOverview: string;
  collaborationHighlights: string[];
}

export interface BenefitsAnalysis {
  benefitsToStartup: string[];
  benefitsToPartner: string[];
  sharedEcosystemValue: string;
}

export interface IntegrationPlan {
  technicalRequirements: string[];
  workflowIntegration: string;
  launchTimelineMonths: number;
}

export interface PartnershipOutreachLetter {
  subjectLine: string;
  emailBody: string;
  callToAction: string;
}

export interface CollaborationRoadmap {
  phases: { phaseName: string; durationWeeks: number; milestone: string }[];
}

export interface PartnershipFAQ {
  question: string;
  answer: string;
}

export interface RiskAssessment {
  operationalRisks: string[];
  strategicRisks: string[];
  mitigationPlans: string[];
}

export interface PartnershipPackageContent {
  category: PartnershipCategory;
  strategy: PartnershipStrategy;
  partnerProfile: PartnerProfile;
  proposal: PartnershipProposal;
  executiveBrief: ExecutivePartnershipBrief;
  benefitsAnalysis: BenefitsAnalysis;
  integrationPlan: IntegrationPlan;
  outreachLetter: PartnershipOutreachLetter;
  collaborationRoadmap: CollaborationRoadmap;
  faq: PartnershipFAQ[];
  riskAssessment: RiskAssessment;
}

export interface PartnershipPackageAggregate {
  id: string;
  startupProfileId: string;
  founderProfileId: string;
  blueprintId?: string;
  version: number;
  status: ApprovalStatus;
  readinessScore: number;
  content: PartnershipPackageContent;
  contentMarkdown: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnershipPackageVersionRecord {
  id: string;
  packageId: string;
  versionNumber: number;
  contentJson: PartnershipPackageContent;
  contentMarkdown: string;
  changeSummary: string;
  createdAt: Date;
}
