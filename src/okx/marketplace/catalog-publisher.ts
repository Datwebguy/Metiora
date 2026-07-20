import { IOkxMarketplaceRepository } from '@core/ports/okx-marketplace-repository.js';
import { OkxMarketplaceCatalogItem, OkxMarketplaceDiscoveryQuery } from '@core/domain/okx-marketplace.js';

export class CatalogPublisher {
  constructor(private readonly repo: IOkxMarketplaceRepository) {}

  public async registerAllServices(): Promise<OkxMarketplaceCatalogItem[]> {
    const items: OkxMarketplaceCatalogItem[] = [
      {
        id: crypto.randomUUID(),
        serviceType: 'startup_blueprint',
        name: 'Startup Blueprint Service',
        description: 'Comprehensive dual JSON & Markdown strategic business plan generation based on persistent Company Memory.',
        capabilities: ['Business Planning', 'Unique Value Proposition Design', 'Market Analysis', 'Roadmap Formulation'],
        inputSchema: { founderProfileId: 'string (UUID)', startupProfileId: 'string (UUID)' },
        outputSchema: { blueprintId: 'string', contentJson: 'object', contentMarkdown: 'string' },
        pricing: {
          mode: 'FIXED',
          basePriceUsd: 7,
          tiers: [{ name: 'Standard', priceUsd: 7, scopeLimit: 'Full Business Plan' }],
        },
        executionModes: ['AUTO_MATCH', 'DIRECT_ASSIGNMENT', 'PUBLIC_LISTING'],
        estimatedCompletionMinutes: 5,
        keywords: ['startup', 'blueprint', 'business plan', 'strategy', 'mvp'],
        version: '1.0.0',
        isVerified: true,
      },
      {
        id: crypto.randomUUID(),
        serviceType: 'investor_ready',
        name: 'Investor Ready Package Service',
        description: 'Investment readiness evaluation score (0-100), investor memo, pitch deck outline, and investor FAQ.',
        capabilities: ['Investment Readiness Assessment', 'Investor Memo Generation', 'Pitch Outline', 'Investor FAQ'],
        inputSchema: { founderProfileId: 'string (UUID)', startupProfileId: 'string (UUID)' },
        outputSchema: { packageId: 'string', readinessScore: 'number', contentMarkdown: 'string' },
        pricing: {
          mode: 'FIXED',
          basePriceUsd: 7,
          tiers: [{ name: 'Standard Investor Package', priceUsd: 7, scopeLimit: 'Full Pitch Deck & Memo' }],
        },
        executionModes: ['AUTO_MATCH', 'DIRECT_ASSIGNMENT', 'PUBLIC_LISTING'],
        estimatedCompletionMinutes: 5,
        keywords: ['investor', 'fundraising', 'pitch deck', 'investor memo', 'vc'],
        version: '1.0.0',
        isVerified: true,
      },
      {
        id: crypto.randomUUID(),
        serviceType: 'grant_builder',
        name: 'Grant Builder Service',
        description: 'Grant readiness assessment score (0-100), innovation statement, community impact narrative, and budget breakdown.',
        capabilities: ['Grant Readiness Assessment', 'Technical Feasibility Narrative', 'Ecosystem Impact', 'Budget Breakdown'],
        inputSchema: { founderProfileId: 'string (UUID)', startupProfileId: 'string (UUID)' },
        outputSchema: { packageId: 'string', readinessScore: 'number', contentMarkdown: 'string' },
        pricing: {
          mode: 'FIXED',
          basePriceUsd: 3,
          tiers: [{ name: 'Ecosystem Grant Proposal', priceUsd: 3, scopeLimit: 'Full Proposal Package' }],
        },
        executionModes: ['AUTO_MATCH', 'DIRECT_ASSIGNMENT', 'PUBLIC_LISTING'],
        estimatedCompletionMinutes: 5,
        keywords: ['grant', 'funding', 'innovation', 'budget', 'web3 grant'],
        version: '1.0.0',
        isVerified: true,
      },
      {
        id: crypto.randomUUID(),
        serviceType: 'partnership_studio',
        name: 'Partnership Studio Service',
        description: 'Strategic alliance proposal across Technology, Integration, Distribution, Enterprise, and Ecosystem categories.',
        capabilities: ['Partnership Readiness Assessment', 'Integration Proposal', 'Ideal Partner Profile', 'Outreach Template'],
        inputSchema: { founderProfileId: 'string (UUID)', startupProfileId: 'string (UUID)', category: 'string' },
        outputSchema: { packageId: 'string', readinessScore: 'number', contentMarkdown: 'string' },
        pricing: {
          mode: 'FIXED',
          basePriceUsd: 3,
          tiers: [{ name: 'Strategic Alliance Kit', priceUsd: 3, scopeLimit: 'Full Partnership Package' }],
        },
        executionModes: ['AUTO_MATCH', 'DIRECT_ASSIGNMENT', 'PUBLIC_LISTING'],
        estimatedCompletionMinutes: 5,
        keywords: ['partnership', 'alliance', 'integration', 'enterprise', 'outreach'],
        version: '1.0.0',
        isVerified: true,
      },
      {
        id: crypto.randomUUID(),
        serviceType: 'token_launch_kit',
        name: 'Token Launch Kit Service',
        description: 'Token strategy, core utility framework, hard cap supply allocations (summing to 100%), and governance model design.',
        capabilities: ['Token Readiness Assessment', 'Tokenomics Design', 'Supply Allocation Strategy', 'Governance Model'],
        inputSchema: { founderProfileId: 'string (UUID)', startupProfileId: 'string (UUID)' },
        outputSchema: { kitId: 'string', readinessScore: 'number', contentMarkdown: 'string' },
        pricing: {
          mode: 'FIXED',
          basePriceUsd: 3,
          tiers: [{ name: 'Full Tokenomics Strategy', priceUsd: 3, scopeLimit: 'Token Launch Kit' }],
        },
        executionModes: ['AUTO_MATCH', 'DIRECT_ASSIGNMENT', 'PUBLIC_LISTING'],
        estimatedCompletionMinutes: 5,
        keywords: ['token', 'tokenomics', 'crypto', 'web3', 'governance'],
        version: '1.0.0',
        isVerified: true,
      },
      {
        id: crypto.randomUUID(),
        serviceType: 'startup_health',
        name: 'Continuous Startup Health Assessment Service',
        description: '15-dimension business health evaluation score (0-100), category scoring matrix, and 7-day action sprint.',
        capabilities: ['15-Dimension Business Health Assessment', 'Historical Score Comparison', '7-Day Priority Action Sprint'],
        inputSchema: { founderProfileId: 'string (UUID)', startupProfileId: 'string (UUID)' },
        outputSchema: { reportId: 'string', overallScore: 'number', contentMarkdown: 'string' },
        pricing: {
          mode: 'FIXED',
          basePriceUsd: 2,
          tiers: [{ name: 'Continuous Health Review', priceUsd: 2, scopeLimit: 'Full Health Report' }],
        },
        executionModes: ['AUTO_MATCH', 'DIRECT_ASSIGNMENT', 'PUBLIC_LISTING'],
        estimatedCompletionMinutes: 3,
        keywords: ['health', 'assessment', 'audit', 'analytics', 'growth'],
        version: '1.0.0',
        isVerified: true,
      },
    ];

    const saved: OkxMarketplaceCatalogItem[] = [];
    for (const item of items) {
      const result = await this.repo.saveCatalogItem(item);
      saved.push(result);
    }
    return saved;
  }

  public async queryCatalog(query: OkxMarketplaceDiscoveryQuery): Promise<OkxMarketplaceCatalogItem[]> {
    const all = await this.repo.getCatalogItems();
    return all.filter((item) => {
      if (query.maxPriceUsd !== undefined && item.pricing.basePriceUsd > query.maxPriceUsd) {
        return false;
      }
      if (query.executionMode !== undefined && !item.executionModes.includes(query.executionMode as any)) {
        return false;
      }
      if (query.keyword !== undefined) {
        const kw = query.keyword.toLowerCase();
        const matchesKeyword =
          item.keywords.some((k) => k.toLowerCase().includes(kw)) ||
          item.name.toLowerCase().includes(kw) ||
          item.description.toLowerCase().includes(kw);
        if (!matchesKeyword) return false;
      }
      return true;
    });
  }
}
