import { ConfidenceLevel, ApprovalStatus } from './user-memory.js';

export interface FieldMeta<T> {
  value: T;
  confidence: ConfidenceLevel;
  source: string;
  updatedAt: Date;
}

export interface StartupIdentityDomain {
  name: FieldMeta<string>;
  tagline?: FieldMeta<string>;
  oneSentenceDescription?: FieldMeta<string>;
  websiteUrl?: FieldMeta<string>;
  industry: FieldMeta<string>;
  stage: FieldMeta<string>;
  headquarters?: FieldMeta<string>;
  foundedDate?: FieldMeta<Date>;
}

export interface StartupVisionDomain {
  mission?: FieldMeta<string>;
  vision?: FieldMeta<string>;
  coreValues: FieldMeta<string[]>;
  longTermGoals: FieldMeta<string[]>;
}

export interface StartupProblemDomain {
  problemStatement?: FieldMeta<string>;
  existingAlternatives: FieldMeta<string[]>;
  marketPainPoints: FieldMeta<string[]>;
}

export interface StartupSolutionDomain {
  productDescription?: FieldMeta<string>;
  uniqueValueProp?: FieldMeta<string>;
  competitiveAdvantage?: FieldMeta<string>;
  coreFeatures: FieldMeta<string[]>;
}

export interface StartupCustomersDomain {
  targetAudience?: FieldMeta<string>;
  idealCustomerProfile?: FieldMeta<string>;
  customerPersonas?: FieldMeta<Record<string, unknown>[]>;
  geographicMarkets: FieldMeta<string[]>;
}

export interface StartupBusinessModelDomain {
  businessModel?: FieldMeta<string>;
  revenueModel?: FieldMeta<string>;
  pricingStrategy?: FieldMeta<string>;
  salesStrategy?: FieldMeta<string>;
  distributionStrategy?: FieldMeta<string>;
}

export interface StartupMarketDomain {
  competitors: FieldMeta<string[]>;
  marketPosition?: FieldMeta<string>;
  marketSize?: FieldMeta<string>;
  marketTrends: FieldMeta<string[]>;
}

export interface StartupRoadmapDomain {
  currentStage?: FieldMeta<string>;
  milestones?: FieldMeta<{ milestone: string; targetDate?: string; completed: boolean }[]>;
  upcomingReleases: FieldMeta<string[]>;
  longTermRoadmap?: FieldMeta<string>;
}

export interface StartupFundingDomain {
  fundingStage?: FieldMeta<string>;
  previousFunding?: FieldMeta<string>;
  investors: FieldMeta<string[]>;
  grants: FieldMeta<string[]>;
  acceleratorPrograms: FieldMeta<string[]>;
}

export interface StartupPartnershipsDomain {
  existingPartners: FieldMeta<string[]>;
  desiredPartners: FieldMeta<string[]>;
  strategicOpportunities: FieldMeta<string[]>;
}

export interface StartupTokenomicsDomain {
  tokenName?: FieldMeta<string>;
  tokenSymbol?: FieldMeta<string>;
  utility?: FieldMeta<string>;
  governance?: FieldMeta<string>;
  distribution?: FieldMeta<Record<string, unknown>>;
  treasury?: FieldMeta<string>;
  vesting?: FieldMeta<string>;
}

export interface StartupDeliverableRecordDomain {
  id: string;
  serviceType: string;
  title: string;
  contentMarkdown: string;
  versionNumber: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface StartupMemoryAggregate {
  id: string;
  founderProfileId: string;
  name: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  identity: StartupIdentityDomain;
  vision: StartupVisionDomain;
  problem: StartupProblemDomain;
  solution: StartupSolutionDomain;
  customers: StartupCustomersDomain;
  businessModel: StartupBusinessModelDomain;
  market: StartupMarketDomain;
  roadmap: StartupRoadmapDomain;
  funding: StartupFundingDomain;
  partnerships: StartupPartnershipsDomain;
  tokenomics?: StartupTokenomicsDomain;
  deliverables: StartupDeliverableRecordDomain[];
}

// Backward compatibility alias
export type StartupMemoryState = StartupMemoryAggregate;

export interface StartupConflictDescriptor {
  fieldPath: string;
  currentValue: unknown;
  suggestedValue: unknown;
  reasonForConflict: string;
  confidenceDiff?: string;
}

export interface StartupPendingUpdateProposal {
  id: string;
  startupProfileId: string;
  proposedData: Partial<StartupMemoryAggregate>;
  conflicts: StartupConflictDescriptor[];
  status: ApprovalStatus;
  source: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface StartupMemoryVersionRecord {
  id: string;
  startupProfileId: string;
  versionNumber: number;
  snapshotJson: Record<string, unknown>;
  changeSummary: string;
  createdAt: Date;
}

export interface StartupMemorySnapshot {
  startupId: string;
  founderId: string;
  version: number;
  generatedAt: string;
  companyProfile: {
    name: string;
    tagline?: string;
    oneSentenceDescription?: string;
    industry: string;
    stage: string;
    websiteUrl?: string;
  };
  foundation: {
    mission?: string;
    vision?: string;
    coreValues: string[];
  };
  problemAndSolution: {
    problemStatement?: string;
    productDescription?: string;
    uniqueValueProp?: string;
    coreFeatures: string[];
  };
  marketAndCustomers: {
    targetAudience?: string;
    businessModel?: string;
    revenueModel?: string;
    competitors: string[];
  };
  fundingAndRoadmap: {
    fundingStage?: string;
    milestones?: { milestone: string; targetDate?: string; completed: boolean }[];
  };
  tokenomics?: {
    tokenName?: string;
    tokenSymbol?: string;
    utility?: string;
  };
}
