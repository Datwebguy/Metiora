export interface OKXMarketplaceTaskRequest {
  taskId: string;
  requesterAgentId: string;
  aspId: string;
  serviceCategory: string;
  rawTaskPrompt: string;
  escrowTransactionHash?: string;
  proposedBudget: {
    amount: string;
    currency: string;
  };
  negotiationTerms?: Record<string, unknown>;
}

export interface OKXMarketplaceTaskResult {
  taskId: string;
  status: 'accepted' | 'negotiating' | 'completed' | 'rejected';
  deliverablesMarkdown: string[];
  updatedMemoryVersion: number;
  escrowReleaseClaimHash?: string;
  recommendations: string[];
}

export interface IOKXASPProtocolHandler {
  receiveTask(request: OKXMarketplaceTaskRequest): Promise<OKXMarketplaceTaskResult>;
}
