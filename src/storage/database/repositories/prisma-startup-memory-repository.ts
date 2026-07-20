import { PrismaClient } from '@prisma/client';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import {
  StartupMemoryAggregate,
  StartupPendingUpdateProposal,
  StartupMemoryVersionRecord,
  StartupDeliverableRecordDomain,
} from '@core/domain/startup-memory.js';
import { ApprovalStatus } from '@core/domain/user-memory.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';

export class PrismaStartupMemoryRepository implements IStartupMemoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createStartup(startup: StartupMemoryAggregate): Promise<StartupMemoryAggregate> {
    const snapshot = StartupSnapshotBuilder.buildSnapshot(startup);

    const created = await this.prisma.startupProfile.create({
      data: {
        id: startup.id,
        founderProfileId: startup.founderProfileId,
        name: startup.name,
        tagline: startup.identity.tagline?.value,
        oneSentenceDescription: startup.identity.oneSentenceDescription?.value,
        websiteUrl: startup.identity.websiteUrl?.value,
        industry: startup.identity.industry.value,
        stage: startup.identity.stage.value,
        version: startup.version,
        vision: {
          create: {
            mission: startup.vision.mission?.value,
            coreValues: startup.vision.coreValues.value,
            longTermGoals: startup.vision.longTermGoals.value,
          },
        },
        problem: {
          create: {
            problemStatement: startup.problem.problemStatement?.value,
            existingAlternatives: startup.problem.existingAlternatives.value,
            marketPainPoints: startup.problem.marketPainPoints.value,
          },
        },
        solution: {
          create: {
            productDescription: startup.solution.productDescription?.value,
            uniqueValueProp: startup.solution.uniqueValueProp?.value,
            competitiveAdvantage: startup.solution.competitiveAdvantage?.value,
            coreFeatures: startup.solution.coreFeatures.value,
          },
        },
        customers: {
          create: {
            targetAudience: startup.customers.targetAudience?.value,
            geographicMarkets: startup.customers.geographicMarkets.value,
          },
        },
        businessModel: {
          create: {
            businessModel: startup.businessModel.businessModel?.value,
          },
        },
        market: {
          create: {
            competitors: startup.market.competitors.value,
            marketTrends: startup.market.marketTrends.value,
          },
        },
        roadmap: {
          create: {
            upcomingReleases: startup.roadmap.upcomingReleases.value,
          },
        },
        funding: {
          create: {
            investors: startup.funding.investors.value,
            grants: startup.funding.grants.value,
            acceleratorPrograms: startup.funding.acceleratorPrograms.value,
          },
        },
        partnerships: {
          create: {
            existingPartners: startup.partnerships.existingPartners.value,
            desiredPartners: startup.partnerships.desiredPartners.value,
            strategicOpportunities: startup.partnerships.strategicOpportunities.value,
          },
        },
        versions: {
          create: {
            versionNumber: startup.version,
            snapshotJson: snapshot as any,
            changeSummary: 'Initial startup profile creation',
          },
        },
      },
      include: {
        vision: true,
        problem: true,
        solution: true,
        customers: true,
        businessModel: true,
        market: true,
        roadmap: true,
        funding: true,
        partnerships: true,
        tokenomics: true,
        deliverables: true,
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<StartupMemoryAggregate | null> {
    const raw = await this.prisma.startupProfile.findUnique({
      where: { id },
      include: {
        vision: true,
        problem: true,
        solution: true,
        customers: true,
        businessModel: true,
        market: true,
        roadmap: true,
        funding: true,
        partnerships: true,
        tokenomics: true,
        deliverables: true,
      },
    });

    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async findByFounderId(founderProfileId: string): Promise<StartupMemoryAggregate[]> {
    const rawList = await this.prisma.startupProfile.findMany({
      where: { founderProfileId },
      include: {
        vision: true,
        problem: true,
        solution: true,
        customers: true,
        businessModel: true,
        market: true,
        roadmap: true,
        funding: true,
        partnerships: true,
        tokenomics: true,
        deliverables: true,
      },
    });

    return rawList.map((raw) => this.mapToAggregate(raw));
  }

  public async updateStartup(
    id: string,
    updatedStartup: StartupMemoryAggregate,
    changeSummary: string
  ): Promise<StartupMemoryAggregate> {
    const snapshot = StartupSnapshotBuilder.buildSnapshot(updatedStartup);

    const updated = await this.prisma.startupProfile.update({
      where: { id },
      data: {
        name: updatedStartup.identity.name.value,
        tagline: updatedStartup.identity.tagline?.value,
        oneSentenceDescription: updatedStartup.identity.oneSentenceDescription?.value,
        websiteUrl: updatedStartup.identity.websiteUrl?.value,
        industry: updatedStartup.identity.industry.value,
        stage: updatedStartup.identity.stage.value,
        version: updatedStartup.version,
        updatedAt: new Date(),
        vision: {
          update: {
            mission: updatedStartup.vision.mission?.value,
          },
        },
        problem: {
          update: {
            problemStatement: updatedStartup.problem.problemStatement?.value,
          },
        },
        solution: {
          update: {
            productDescription: updatedStartup.solution.productDescription?.value,
            uniqueValueProp: updatedStartup.solution.uniqueValueProp?.value,
          },
        },
        businessModel: {
          update: {
            businessModel: updatedStartup.businessModel.businessModel?.value,
          },
        },
        customers: {
          update: {
            targetAudience: updatedStartup.customers.targetAudience?.value,
            idealCustomerProfile: updatedStartup.customers.idealCustomerProfile?.value,
            customerPersonas: updatedStartup.customers.customerPersonas?.value as any,
            geographicMarkets: updatedStartup.customers.geographicMarkets.value,
          },
        },
        market: {
          update: {
            competitors: updatedStartup.market.competitors.value,
            marketPosition: updatedStartup.market.marketPosition?.value,
            marketSize: updatedStartup.market.marketSize?.value,
            marketTrends: updatedStartup.market.marketTrends.value,
          },
        },
        funding: {
          update: {
            fundingStage: updatedStartup.funding.fundingStage?.value,
            previousFunding: updatedStartup.funding.previousFunding?.value,
            investors: updatedStartup.funding.investors.value,
            grants: updatedStartup.funding.grants.value,
            acceleratorPrograms: updatedStartup.funding.acceleratorPrograms.value,
          },
        },
        partnerships: {
          update: {
            existingPartners: updatedStartup.partnerships.existingPartners.value,
            desiredPartners: updatedStartup.partnerships.desiredPartners.value,
            strategicOpportunities: updatedStartup.partnerships.strategicOpportunities.value,
          },
        },
        tokenomics: updatedStartup.tokenomics
          ? {
              update: {
                tokenName: updatedStartup.tokenomics.tokenName?.value,
                tokenSymbol: updatedStartup.tokenomics.tokenSymbol?.value,
                utility: updatedStartup.tokenomics.utility?.value,
                governance: updatedStartup.tokenomics.governance?.value,
                distribution: updatedStartup.tokenomics.distribution?.value as any,
                treasury: updatedStartup.tokenomics.treasury?.value,
                vesting: updatedStartup.tokenomics.vesting?.value,
              },
            }
          : undefined,
        versions: {
          create: {
            versionNumber: updatedStartup.version,
            snapshotJson: snapshot as any,
            changeSummary,
          },
        },
      },
      include: {
        vision: true,
        problem: true,
        solution: true,
        customers: true,
        businessModel: true,
        market: true,
        roadmap: true,
        funding: true,
        partnerships: true,
        tokenomics: true,
        deliverables: true,
      },
    });

    return this.mapToAggregate(updated);
  }

  public async createPendingUpdate(
    proposal: Omit<StartupPendingUpdateProposal, 'id' | 'createdAt'>
  ): Promise<StartupPendingUpdateProposal> {
    const created = await this.prisma.startupPendingUpdate.create({
      data: {
        startupProfileId: proposal.startupProfileId,
        proposedDataJson: proposal.proposedData as any,
        conflictsJson: proposal.conflicts as any,
        status: proposal.status,
        source: proposal.source,
      },
    });

    return {
      id: created.id,
      startupProfileId: created.startupProfileId,
      proposedData: created.proposedDataJson as any,
      conflicts: created.conflictsJson as any,
      status: created.status as ApprovalStatus,
      source: created.source,
      createdAt: created.createdAt,
      resolvedAt: created.resolvedAt || undefined,
    };
  }

  public async getPendingUpdateById(proposalId: string): Promise<StartupPendingUpdateProposal | null> {
    const raw = await this.prisma.startupPendingUpdate.findUnique({
      where: { id: proposalId },
    });

    if (!raw) return null;
    return {
      id: raw.id,
      startupProfileId: raw.startupProfileId,
      proposedData: raw.proposedDataJson as any,
      conflicts: raw.conflictsJson as any,
      status: raw.status as ApprovalStatus,
      source: raw.source,
      createdAt: raw.createdAt,
      resolvedAt: raw.resolvedAt || undefined,
    };
  }

  public async resolvePendingUpdate(proposalId: string, status: ApprovalStatus): Promise<StartupPendingUpdateProposal> {
    const updated = await this.prisma.startupPendingUpdate.update({
      where: { id: proposalId },
      data: {
        status,
        resolvedAt: new Date(),
      },
    });

    return {
      id: updated.id,
      startupProfileId: updated.startupProfileId,
      proposedData: updated.proposedDataJson as any,
      conflicts: updated.conflictsJson as any,
      status: updated.status as ApprovalStatus,
      source: updated.source,
      createdAt: updated.createdAt,
      resolvedAt: updated.resolvedAt || undefined,
    };
  }

  public async getVersionHistory(startupProfileId: string): Promise<StartupMemoryVersionRecord[]> {
    const rawVersions = await this.prisma.startupMemoryVersion.findMany({
      where: { startupProfileId },
      orderBy: { versionNumber: 'desc' },
    });

    return rawVersions.map((v) => ({
      id: v.id,
      startupProfileId: v.startupProfileId,
      versionNumber: v.versionNumber,
      snapshotJson: v.snapshotJson as Record<string, unknown>,
      changeSummary: v.changeSummary,
      createdAt: v.createdAt,
    }));
  }

  public async recordDeliverable(
    startupProfileId: string,
    deliverable: Omit<StartupDeliverableRecordDomain, 'id' | 'createdAt'>
  ): Promise<StartupDeliverableRecordDomain> {
    const created = await this.prisma.startupDeliverableRecord.create({
      data: {
        startupProfileId,
        serviceType: deliverable.serviceType,
        title: deliverable.title,
        contentMarkdown: deliverable.contentMarkdown,
        versionNumber: deliverable.versionNumber,
        metadataJson: deliverable.metadata as any,
      },
    });

    return {
      id: created.id,
      serviceType: created.serviceType,
      title: created.title,
      contentMarkdown: created.contentMarkdown,
      versionNumber: created.versionNumber,
      metadata: (created.metadataJson as Record<string, unknown>) || undefined,
      createdAt: created.createdAt,
    };
  }

  private mapToAggregate(raw: any): StartupMemoryAggregate {
    const now = raw.updatedAt || new Date();
    return {
      id: raw.id,
      founderProfileId: raw.founderProfileId,
      name: raw.name,
      version: raw.version,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      identity: {
        name: { value: raw.name, confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        tagline: raw.tagline ? { value: raw.tagline, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        oneSentenceDescription: raw.oneSentenceDescription ? { value: raw.oneSentenceDescription, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        websiteUrl: raw.websiteUrl ? { value: raw.websiteUrl, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        industry: { value: raw.industry || 'Technology', confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        stage: { value: raw.stage || 'IDEATION', confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        headquarters: raw.headquarters ? { value: raw.headquarters, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        foundedDate: raw.foundedDate ? { value: raw.foundedDate, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
      },
      vision: {
        mission: raw.vision?.mission ? { value: raw.vision.mission, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        vision: raw.vision?.vision ? { value: raw.vision.vision, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        coreValues: { value: raw.vision?.coreValues || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        longTermGoals: { value: raw.vision?.longTermGoals || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      problem: {
        problemStatement: raw.problem?.problemStatement ? { value: raw.problem.problemStatement, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        existingAlternatives: { value: raw.problem?.existingAlternatives || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        marketPainPoints: { value: raw.problem?.marketPainPoints || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      solution: {
        productDescription: raw.solution?.productDescription ? { value: raw.solution.productDescription, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        uniqueValueProp: raw.solution?.uniqueValueProp ? { value: raw.solution.uniqueValueProp, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        competitiveAdvantage: raw.solution?.competitiveAdvantage ? { value: raw.solution.competitiveAdvantage, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        coreFeatures: { value: raw.solution?.coreFeatures || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      customers: {
        targetAudience: raw.customers?.targetAudience ? { value: raw.customers.targetAudience, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        idealCustomerProfile: raw.customers?.idealCustomerProfile ? { value: raw.customers.idealCustomerProfile, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        geographicMarkets: { value: raw.customers?.geographicMarkets || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      businessModel: {
        businessModel: raw.businessModel?.businessModel ? { value: raw.businessModel.businessModel, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        revenueModel: raw.businessModel?.revenueModel ? { value: raw.businessModel.revenueModel, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        pricingStrategy: raw.businessModel?.pricingStrategy ? { value: raw.businessModel.pricingStrategy, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
      },
      market: {
        competitors: { value: raw.market?.competitors || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        marketPosition: raw.market?.marketPosition ? { value: raw.market.marketPosition, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        marketSize: raw.market?.marketSize ? { value: raw.market.marketSize, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        marketTrends: { value: raw.market?.marketTrends || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      roadmap: {
        currentStage: raw.roadmap?.currentStage ? { value: raw.roadmap.currentStage, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        milestones: raw.roadmap?.milestones ? { value: raw.roadmap.milestones, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        upcomingReleases: { value: raw.roadmap?.upcomingReleases || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      funding: {
        fundingStage: raw.funding?.fundingStage ? { value: raw.funding.fundingStage, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        previousFunding: raw.funding?.previousFunding ? { value: raw.funding.previousFunding, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
        investors: { value: raw.funding?.investors || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        grants: { value: raw.funding?.grants || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        acceleratorPrograms: { value: raw.funding?.acceleratorPrograms || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      partnerships: {
        existingPartners: { value: raw.partnerships?.existingPartners || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        desiredPartners: { value: raw.partnerships?.desiredPartners || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        strategicOpportunities: { value: raw.partnerships?.strategicOpportunities || [], confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      },
      tokenomics: raw.tokenomics
        ? {
            tokenName: raw.tokenomics.tokenName ? { value: raw.tokenomics.tokenName, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
            tokenSymbol: raw.tokenomics.tokenSymbol ? { value: raw.tokenomics.tokenSymbol, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
            utility: raw.tokenomics.utility ? { value: raw.tokenomics.utility, confidence: 'HIGH', source: 'user_explicit', updatedAt: now } : undefined,
          }
        : undefined,
      deliverables: (raw.deliverables || []).map((d: any) => ({
        id: d.id,
        serviceType: d.serviceType,
        title: d.title,
        contentMarkdown: d.contentMarkdown,
        versionNumber: d.versionNumber,
        metadata: d.metadataJson || undefined,
        createdAt: d.createdAt,
      })),
    };
  }
}
