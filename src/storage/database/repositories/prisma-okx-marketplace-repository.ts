import { PrismaClient } from '@prisma/client';
import { IOkxMarketplaceRepository } from '@core/ports/okx-marketplace-repository.js';
import { OkxAspProfile, OkxMarketplaceCatalogItem } from '@core/domain/okx-marketplace.js';

export class PrismaOkxMarketplaceRepository implements IOkxMarketplaceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async saveAspProfile(profile: OkxAspProfile): Promise<OkxAspProfile> {
    const raw = await this.prisma.okxAspProfileRecord.upsert({
      where: { agentName: profile.agentName },
      create: {
        id: profile.id,
        agentName: profile.agentName,
        displayName: profile.displayName,
        description: profile.description,
        category: profile.category,
        logoUrl: profile.logoUrl,
        bannerUrl: profile.bannerUrl,
        websiteUrl: profile.websiteUrl,
        docsUrl: profile.docsUrl,
        version: profile.version,
        metadataJson: {
          supportedLanguages: profile.supportedLanguages,
          contactEmail: profile.contactEmail,
          providerMetadata: profile.providerMetadata,
        } as any,
      },
      update: {
        displayName: profile.displayName,
        description: profile.description,
        category: profile.category,
        logoUrl: profile.logoUrl,
        bannerUrl: profile.bannerUrl,
        websiteUrl: profile.websiteUrl,
        docsUrl: profile.docsUrl,
        version: profile.version,
        metadataJson: {
          supportedLanguages: profile.supportedLanguages,
          contactEmail: profile.contactEmail,
          providerMetadata: profile.providerMetadata,
        } as any,
        updatedAt: new Date(),
      },
    });

    const meta = raw.metadataJson as any;

    return {
      id: raw.id,
      agentName: raw.agentName,
      displayName: raw.displayName,
      description: raw.description,
      category: raw.category,
      logoUrl: raw.logoUrl,
      bannerUrl: raw.bannerUrl,
      supportedLanguages: meta?.supportedLanguages || ['en'],
      contactEmail: meta?.contactEmail || 'asp@metiora.ai',
      websiteUrl: raw.websiteUrl,
      docsUrl: raw.docsUrl,
      version: raw.version,
      providerMetadata: meta?.providerMetadata || {},
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async getAspProfile(): Promise<OkxAspProfile | null> {
    const raw = await this.prisma.okxAspProfileRecord.findFirst();
    if (!raw) return null;

    const meta = raw.metadataJson as any;

    return {
      id: raw.id,
      agentName: raw.agentName,
      displayName: raw.displayName,
      description: raw.description,
      category: raw.category,
      logoUrl: raw.logoUrl,
      bannerUrl: raw.bannerUrl,
      supportedLanguages: meta?.supportedLanguages || ['en'],
      contactEmail: meta?.contactEmail || 'asp@metiora.ai',
      websiteUrl: raw.websiteUrl,
      docsUrl: raw.docsUrl,
      version: raw.version,
      providerMetadata: meta?.providerMetadata || {},
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async saveCatalogItem(item: OkxMarketplaceCatalogItem): Promise<OkxMarketplaceCatalogItem> {
    const raw = await this.prisma.okxMarketplaceCatalogRecord.upsert({
      where: { serviceType: item.serviceType },
      create: {
        id: item.id,
        serviceType: item.serviceType,
        name: item.name,
        description: item.description,
        capabilitiesJson: item.capabilities as any,
        inputSchemaJson: item.inputSchema as any,
        outputSchemaJson: item.outputSchema as any,
        pricingJson: {
          pricing: item.pricing,
          estimatedCompletionMinutes: item.estimatedCompletionMinutes,
          keywords: item.keywords,
        } as any,
        executionModesJson: item.executionModes as any,
        version: item.version,
        isVerified: item.isVerified,
      },
      update: {
        name: item.name,
        description: item.description,
        capabilitiesJson: item.capabilities as any,
        inputSchemaJson: item.inputSchema as any,
        outputSchemaJson: item.outputSchema as any,
        pricingJson: {
          pricing: item.pricing,
          estimatedCompletionMinutes: item.estimatedCompletionMinutes,
          keywords: item.keywords,
        } as any,
        executionModesJson: item.executionModes as any,
        version: item.version,
        isVerified: item.isVerified,
        updatedAt: new Date(),
      },
    });

    const pricingData = raw.pricingJson as any;

    return {
      id: raw.id,
      serviceType: raw.serviceType,
      name: raw.name,
      description: raw.description,
      capabilities: raw.capabilitiesJson as any,
      inputSchema: raw.inputSchemaJson as any,
      outputSchema: raw.outputSchemaJson as any,
      pricing: pricingData?.pricing || { mode: 'FIXED', basePriceUsd: 50 },
      executionModes: raw.executionModesJson as any,
      estimatedCompletionMinutes: pricingData?.estimatedCompletionMinutes || 5,
      keywords: pricingData?.keywords || [],
      version: raw.version,
      isVerified: raw.isVerified,
    };
  }

  public async getCatalogItems(): Promise<OkxMarketplaceCatalogItem[]> {
    const rawItems = await this.prisma.okxMarketplaceCatalogRecord.findMany();

    return rawItems.map((raw) => {
      const pricingData = raw.pricingJson as any;
      return {
        id: raw.id,
        serviceType: raw.serviceType,
        name: raw.name,
        description: raw.description,
        capabilities: raw.capabilitiesJson as any,
        inputSchema: raw.inputSchemaJson as any,
        outputSchema: raw.outputSchemaJson as any,
        pricing: pricingData?.pricing || { mode: 'FIXED', basePriceUsd: 50 },
        executionModes: raw.executionModesJson as any,
        estimatedCompletionMinutes: pricingData?.estimatedCompletionMinutes || 5,
        keywords: pricingData?.keywords || [],
        version: raw.version,
        isVerified: raw.isVerified,
      };
    });
  }

  public async getCatalogItemByServiceType(serviceType: string): Promise<OkxMarketplaceCatalogItem | null> {
    const raw = await this.prisma.okxMarketplaceCatalogRecord.findUnique({
      where: { serviceType },
    });
    if (!raw) return null;

    const pricingData = raw.pricingJson as any;

    return {
      id: raw.id,
      serviceType: raw.serviceType,
      name: raw.name,
      description: raw.description,
      capabilities: raw.capabilitiesJson as any,
      inputSchema: raw.inputSchemaJson as any,
      outputSchema: raw.outputSchemaJson as any,
      pricing: pricingData?.pricing || { mode: 'FIXED', basePriceUsd: 50 },
      executionModes: raw.executionModesJson as any,
      estimatedCompletionMinutes: pricingData?.estimatedCompletionMinutes || 5,
      keywords: pricingData?.keywords || [],
      version: raw.version,
      isVerified: raw.isVerified,
    };
  }
}
