export interface OkxAspProfile {
  id: string;
  agentName: string;
  displayName: string;
  description: string;
  category: string;
  logoUrl: string;
  bannerUrl: string;
  supportedLanguages: string[];
  contactEmail: string;
  websiteUrl: string;
  docsUrl: string;
  version: string;
  providerMetadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface OkxMarketplaceCatalogItem {
  id: string;
  serviceType: string;
  name: string;
  description: string;
  capabilities: string[];
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  pricing: {
    mode: 'FIXED' | 'TIERED' | 'USAGE';
    basePriceUsd: number;
    tiers?: { name: string; priceUsd: number; scopeLimit: string }[];
  };
  executionModes: ('AUTO_MATCH' | 'DIRECT_ASSIGNMENT' | 'PUBLIC_LISTING')[];
  estimatedCompletionMinutes: number;
  keywords: string[];
  version: string;
  isVerified: boolean;
}

export interface OkxMarketplaceDiscoveryQuery {
  category?: string;
  capability?: string;
  maxPriceUsd?: number;
  executionMode?: string;
  keyword?: string;
}

export interface OkxValidationResult {
  isValid: boolean;
  serviceType: string;
  checkedCapabilities: string[];
  validationErrors: string[];
}
