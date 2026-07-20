import { OkxMarketplaceServiceMetadata, OkxServiceType } from '@core/domain/okx-integration.js';

export class ServiceRegistry {
  private services: Map<OkxServiceType, OkxMarketplaceServiceMetadata> = new Map();

  constructor() {
    this.registerDefaultServices();
  }

  private registerDefaultServices(): void {
    this.services.set('startup_blueprint', {
      serviceType: 'startup_blueprint',
      name: 'Metiora Startup Blueprint',
      description: 'Canonical dual JSON & Markdown strategic business plan generation.',
      capabilities: ['Business Planning', 'UVP Design', 'Market Analysis'],
      inputSchema: { founderProfileId: 'string', startupProfileId: 'string' },
      outputSchema: { blueprintId: 'string', contentJson: 'object', contentMarkdown: 'string' },
      basePriceUsd: 7,
      estimatedCompletionMinutes: 5,
      version: '1.0.0',
    });

    this.services.set('investor_ready', {
      serviceType: 'investor_ready',
      name: 'Metiora Investor Ready Package',
      description: 'Investment readiness evaluation, investor memo, pitch deck outline, and FAQ generation.',
      capabilities: ['Investor Readiness Assessment', 'Investment Memo', 'Investor FAQ'],
      inputSchema: { founderProfileId: 'string', startupProfileId: 'string' },
      outputSchema: { packageId: 'string', readinessScore: 'number', contentMarkdown: 'string' },
      basePriceUsd: 7,
      estimatedCompletionMinutes: 5,
      version: '1.0.0',
    });

    this.services.set('grant_builder', {
      serviceType: 'grant_builder',
      name: 'Metiora Grant Builder Package',
      description: 'Grant readiness assessment, innovation statement, ecosystem impact, and budget narrative.',
      capabilities: ['Grant Readiness Assessment', 'Ecosystem Impact Statement', 'Budget Narrative'],
      inputSchema: { founderProfileId: 'string', startupProfileId: 'string' },
      outputSchema: { packageId: 'string', readinessScore: 'number', contentMarkdown: 'string' },
      basePriceUsd: 3,
      estimatedCompletionMinutes: 5,
      version: '1.0.0',
    });

    this.services.set('partnership_studio', {
      serviceType: 'partnership_studio',
      name: 'Metiora Partnership Studio Package',
      description: 'Strategic alliance proposal, ideal partner profile, mutual benefits, and outreach letter.',
      capabilities: ['Partnership Readiness Assessment', 'Integration Proposal', 'Outreach Template'],
      inputSchema: { founderProfileId: 'string', startupProfileId: 'string', category: 'string' },
      outputSchema: { packageId: 'string', readinessScore: 'number', contentMarkdown: 'string' },
      basePriceUsd: 3,
      estimatedCompletionMinutes: 5,
      version: '1.0.0',
    });

    this.services.set('token_launch_kit', {
      serviceType: 'token_launch_kit',
      name: 'Metiora Token Launch Kit',
      description: 'Token strategy, utility model, distribution vesting breakdown, and governance design.',
      capabilities: ['Token Readiness Assessment', 'Tokenomics Design', 'Governance Model'],
      inputSchema: { founderProfileId: 'string', startupProfileId: 'string' },
      outputSchema: { kitId: 'string', readinessScore: 'number', contentMarkdown: 'string' },
      basePriceUsd: 3,
      estimatedCompletionMinutes: 5,
      version: '1.0.0',
    });

    this.services.set('startup_health', {
      serviceType: 'startup_health',
      name: 'Metiora Continuous Startup Health Assessment',
      description: '15-dimension business health evaluation, category scoring, and 7-day priority action sprint.',
      capabilities: ['15-Dimension Business Health Assessment', 'Historical Score Comparison', '7-Day Priority Action Sprint'],
      inputSchema: { founderProfileId: 'string', startupProfileId: 'string' },
      outputSchema: { reportId: 'string', overallScore: 'number', contentMarkdown: 'string' },
      basePriceUsd: 2,
      estimatedCompletionMinutes: 3,
      version: '1.0.0',
    });
  }

  public listServices(): OkxMarketplaceServiceMetadata[] {
    return Array.from(this.services.values());
  }

  public getServiceMetadata(serviceType: OkxServiceType): OkxMarketplaceServiceMetadata | undefined {
    return this.services.get(serviceType);
  }
}
