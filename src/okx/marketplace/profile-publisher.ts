import { IOkxMarketplaceRepository } from '@core/ports/okx-marketplace-repository.js';
import { OkxAspProfile } from '@core/domain/okx-marketplace.js';

export class ProfilePublisher {
  constructor(private readonly repo: IOkxMarketplaceRepository) {}

  public async publishProfile(): Promise<OkxAspProfile> {
    const existing = await this.repo.getAspProfile();
    if (existing) {
      return existing;
    }

    const now = new Date();
    const profile: OkxAspProfile = {
      id: crypto.randomUUID(),
      agentName: 'metiora-ai-operating-partner',
      displayName: 'Metiora — AI Operating Partner for Founders',
      description:
        'Production-grade Agent Service Provider (ASP) delivering persistent Company Memory, Business Intelligence, Startup Blueprints, Investor Pitch Packages, Grant Proposals, Strategic Partnership Kits, Tokenomics Design, and Continuous Health Assessment.',
      category: 'Professional Asset Creation & Business Intelligence',
      logoUrl: 'https://agentmetiora.xyz/avatar.png',
      bannerUrl: 'https://agentmetiora.xyz/avatar.png',
      supportedLanguages: ['en', 'zh', 'es'],
      contactEmail: 'asp@agentmetiora.xyz',
      websiteUrl: 'https://agentmetiora.xyz',
      docsUrl: 'https://agentmetiora.xyz',
      version: '1.0.0',
      providerMetadata: {
        architecture: 'Clean Architecture Decoupled Runtime',
        ecosystem: 'OKX.AI Marketplace',
        a2aProtocolVersion: '1.0.0',
      },
      createdAt: now,
      updatedAt: now,
    };

    return this.repo.saveAspProfile(profile);
  }
}
