export type OkxServiceType =
  | 'startup_blueprint'
  | 'investor_ready'
  | 'grant_builder'
  | 'partnership_studio'
  | 'token_launch_kit'
  | 'startup_health';

export type OkxTaskLifecycleState =
  | 'RECEIVED'
  | 'VALIDATED'
  | 'NEGOTIATING'
  | 'ESCROW_LOCKED'
  | 'EXECUTING'
  | 'DELIVERED'
  | 'SETTLED'
  | 'REJECTED'
  | 'FAILED'
  | 'ARBITRATION';

export interface OkxAgentIdentity {
  agentId: string;
  address: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OkxWalletSession {
  walletAddress: string;
  sessionToken: string;
  status: 'ACTIVE' | 'EXPIRED';
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OkxMarketplaceServiceMetadata {
  serviceType: OkxServiceType;
  name: string;
  description: string;
  capabilities: string[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  basePriceUsd: number;
  estimatedCompletionMinutes: number;
  version: string;
}

export interface OkxTask {
  taskId: string;
  requesterAgentId: string;
  founderProfileId: string;
  startupProfileId: string;
  serviceType: OkxServiceType;
  status: OkxTaskLifecycleState;
  scope: Record<string, unknown>;
  pricing: { priceUsd: number; currency: string };
  createdAt: Date;
  updatedAt: Date;
}

export interface OkxNegotiation {
  taskId: string;
  status: 'OPEN' | 'ACCEPTED' | 'REJECTED';
  proposedPriceUsd: number;
  proposedTimelineMinutes: number;
  history: { timestamp: Date; sender: string; action: string; priceUsd: number }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface OkxEscrow {
  taskId: string;
  escrowId: string;
  amountUsd: number;
  status: 'INITIATED' | 'CONFIRMED' | 'SETTLED' | 'REFUNDED' | 'ARBITRATION';
  arbitrationStatus?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OkxDelivery {
  taskId: string;
  deliveryId: string;
  contentJson: Record<string, unknown>;
  contentMarkdown: string;
  metadata: Record<string, unknown>;
  executionSummary: string;
  versionInfo: { serviceVersion: string; startupVersion: number };
  memoryUpdatesSummary: string;
  confidenceScore: number;
  executionTimestamp: Date;
}

export interface OkxRating {
  taskId: string;
  ratingScore: number; // 1.0 - 5.0
  reviewText?: string;
  ratedByAgentId: string;
  /** ASP / provider agent being rated */
  ratedAgentId: string;
  createdAt: Date;
}
