export interface StartupMemoryState {
  startupId: string;
  founderId: string;
  name: string;
  mission?: string;
  vision?: string;
  problemStatement?: string;
  solution?: string;
  targetMarket?: string;
  productDescription?: string;
  businessModel?: string;
  revenueModel?: string;
  roadmap?: {
    milestone: string;
    targetDate?: string;
    completed: boolean;
  }[];
  tokenomics?: {
    tokenSymbol: string;
    utility: string;
    totalSupply?: string;
  };
  brandVoice?: string;
  websiteUrl?: string;
  githubUrl?: string;
  walletAddress?: string;
  deliverableHistoryIds: string[];
  version: number;
}
