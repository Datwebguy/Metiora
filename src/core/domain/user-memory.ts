export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type ApprovalStatus = 'APPROVED' | 'PENDING' | 'REJECTED';
export type HistoryType = 'PREVIOUS_STARTUP' | 'ACCELERATOR' | 'AWARD' | 'INVESTMENT' | 'PUBLIC_SPEAKING';

export interface FieldMetadata<T> {
  value: T;
  confidence: ConfidenceLevel;
  source: string;
  updatedAt: Date;
}

export interface FounderIdentityDomain {
  fullName: FieldMetadata<string>;
  preferredName?: FieldMetadata<string>;
  title?: FieldMetadata<string>;
  bio?: FieldMetadata<string>;
  country?: FieldMetadata<string>;
  timezone?: FieldMetadata<string>;
}

export interface FounderProfessionalDomain {
  skills: FieldMetadata<string[]>;
  industries: FieldMetadata<string[]>;
  experienceYears?: FieldMetadata<number>;
  areasOfExpertise: FieldMetadata<string[]>;
  certifications: FieldMetadata<string[]>;
}

export interface FounderPersonalDomain {
  story?: FieldMetadata<string>;
  personalMission?: FieldMetadata<string>;
  leadershipStyle?: FieldMetadata<string>;
  longTermVision?: FieldMetadata<string>;
}

export interface FounderCommunicationDomain {
  writingStyle?: FieldMetadata<string>;
  tone?: FieldMetadata<string>;
  preferredLanguage: FieldMetadata<string>;
  documentStyle?: FieldMetadata<string>;
}

export interface FounderPublicPresenceDomain {
  websiteUrl?: FieldMetadata<string>;
  twitterHandle?: FieldMetadata<string>;
  linkedinUrl?: FieldMetadata<string>;
  githubUrl?: FieldMetadata<string>;
  portfolioUrl?: FieldMetadata<string>;
}

export interface FounderHistoryEntryDomain {
  id: string;
  type: HistoryType;
  organizationName: string;
  role: string;
  year?: number;
  details?: string;
}

export interface FounderPreferencesDomain {
  brandStyle?: FieldMetadata<string>;
  investorPreferences: FieldMetadata<string[]>;
  grantPreferences: FieldMetadata<string[]>;
}

export interface FounderProfileAggregate {
  id: string;
  email: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  identity: FounderIdentityDomain;
  professional: FounderProfessionalDomain;
  personal: FounderPersonalDomain;
  communication: FounderCommunicationDomain;
  publicPresence: FounderPublicPresenceDomain;
  history: FounderHistoryEntryDomain[];
  preferences: FounderPreferencesDomain;
}

// Alias for downstream service compatibility
export type UserMemoryProfile = FounderProfileAggregate;

export interface ConflictDescriptor {
  fieldPath: string;
  currentValue: unknown;
  suggestedValue: unknown;
  explanation: string;
  confidenceDiff: string;
}

export interface FounderPendingUpdateProposal {
  id: string;
  founderProfileId: string;
  proposedData: Partial<FounderProfileAggregate>;
  conflicts: ConflictDescriptor[];
  status: ApprovalStatus;
  source: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface FounderMemoryVersionRecord {
  id: string;
  founderProfileId: string;
  versionNumber: number;
  snapshotJson: Record<string, unknown>;
  changeSummary: String;
  createdAt: Date;
}

export interface UserMemorySnapshot {
  founderId: string;
  version: number;
  generatedAt: string;
  founderSummary: {
    fullName: string;
    preferredName?: string;
    title?: string;
    bio?: string;
    location?: string;
  };
  professionalProfile: {
    skills: string[];
    industries: string[];
    expertise: string[];
  };
  strategicVision: {
    personalMission?: string;
    longTermVision?: string;
    leadershipStyle?: string;
  };
  communicationPreferences: {
    writingStyle?: string;
    tone?: string;
    preferredLanguage: string;
    documentStyle?: string;
  };
  publicProfiles: {
    websiteUrl?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
    githubUrl?: string;
  };
  trackRecord: {
    type: HistoryType;
    organization: string;
    role: string;
  }[];
}
