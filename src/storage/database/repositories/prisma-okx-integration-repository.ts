import { PrismaClient } from '@prisma/client';
import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import {
  OkxAgentIdentity,
  OkxWalletSession,
  OkxTask,
  OkxNegotiation,
  OkxEscrow,
  OkxDelivery,
  OkxRating,
} from '@core/domain/okx-integration.js';

export class PrismaOkxIntegrationRepository implements IOkxIntegrationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async saveAgentIdentity(identity: OkxAgentIdentity): Promise<OkxAgentIdentity> {
    const raw = await this.prisma.okxAgentIdentityRecord.upsert({
      where: { agentId: identity.agentId },
      create: {
        agentId: identity.agentId,
        address: identity.address,
        status: identity.status,
        metadataJson: identity.metadata as any,
      },
      update: {
        address: identity.address,
        status: identity.status,
        metadataJson: identity.metadata as any,
        updatedAt: new Date(),
      },
    });

    return {
      agentId: raw.agentId,
      address: raw.address,
      status: raw.status as any,
      metadata: raw.metadataJson as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async findAgentIdentity(agentId: string): Promise<OkxAgentIdentity | null> {
    const raw = await this.prisma.okxAgentIdentityRecord.findUnique({
      where: { agentId },
    });
    if (!raw) return null;

    return {
      agentId: raw.agentId,
      address: raw.address,
      status: raw.status as any,
      metadata: raw.metadataJson as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async saveWalletSession(session: OkxWalletSession): Promise<OkxWalletSession> {
    const raw = await this.prisma.okxWalletSessionRecord.upsert({
      where: { walletAddress: session.walletAddress },
      create: {
        walletAddress: session.walletAddress,
        sessionToken: session.sessionToken,
        status: session.status,
        expiresAt: session.expiresAt,
      },
      update: {
        sessionToken: session.sessionToken,
        status: session.status,
        expiresAt: session.expiresAt,
        updatedAt: new Date(),
      },
    });

    return {
      walletAddress: raw.walletAddress,
      sessionToken: raw.sessionToken,
      status: raw.status as any,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async findWalletSession(sessionToken: string): Promise<OkxWalletSession | null> {
    const raw = await this.prisma.okxWalletSessionRecord.findUnique({
      where: { sessionToken },
    });
    if (!raw) return null;

    return {
      walletAddress: raw.walletAddress,
      sessionToken: raw.sessionToken,
      status: raw.status as any,
      expiresAt: raw.expiresAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async saveTask(task: OkxTask): Promise<OkxTask> {
    const raw = await this.prisma.okxMarketplaceTaskRecord.upsert({
      where: { taskId: task.taskId },
      create: {
        taskId: task.taskId,
        requesterAgentId: task.requesterAgentId,
        founderProfileId: task.founderProfileId,
        startupProfileId: task.startupProfileId,
        serviceType: task.serviceType,
        status: task.status,
        scopeJson: task.scope as any,
        pricingJson: task.pricing as any,
      },
      update: {
        status: task.status,
        founderProfileId: task.founderProfileId,
        startupProfileId: task.startupProfileId,
        scopeJson: task.scope as any,
        pricingJson: task.pricing as any,
        updatedAt: new Date(),
      },
    });

    return {
      taskId: raw.taskId,
      requesterAgentId: raw.requesterAgentId,
      founderProfileId: raw.founderProfileId,
      startupProfileId: raw.startupProfileId,
      serviceType: raw.serviceType as any,
      status: raw.status as any,
      scope: raw.scopeJson as any,
      pricing: raw.pricingJson as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async findTaskById(taskId: string): Promise<OkxTask | null> {
    const raw = await this.prisma.okxMarketplaceTaskRecord.findUnique({
      where: { taskId },
    });
    if (!raw) return null;

    return {
      taskId: raw.taskId,
      requesterAgentId: raw.requesterAgentId,
      founderProfileId: raw.founderProfileId,
      startupProfileId: raw.startupProfileId,
      serviceType: raw.serviceType as any,
      status: raw.status as any,
      scope: raw.scopeJson as any,
      pricing: raw.pricingJson as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async saveNegotiation(negotiation: OkxNegotiation): Promise<OkxNegotiation> {
    const raw = await this.prisma.okxNegotiationRecord.upsert({
      where: { taskId: negotiation.taskId },
      create: {
        taskId: negotiation.taskId,
        status: negotiation.status,
        proposedPrice: negotiation.proposedPriceUsd.toString(),
        proposedTimeline: negotiation.proposedTimelineMinutes.toString(),
        historyJson: negotiation.history as any,
      },
      update: {
        status: negotiation.status,
        proposedPrice: negotiation.proposedPriceUsd.toString(),
        proposedTimeline: negotiation.proposedTimelineMinutes.toString(),
        historyJson: negotiation.history as any,
        updatedAt: new Date(),
      },
    });

    return {
      taskId: raw.taskId,
      status: raw.status as any,
      proposedPriceUsd: parseFloat(raw.proposedPrice),
      proposedTimelineMinutes: parseInt(raw.proposedTimeline, 10),
      history: raw.historyJson as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async findNegotiationByTaskId(taskId: string): Promise<OkxNegotiation | null> {
    const raw = await this.prisma.okxNegotiationRecord.findUnique({
      where: { taskId },
    });
    if (!raw) return null;

    return {
      taskId: raw.taskId,
      status: raw.status as any,
      proposedPriceUsd: parseFloat(raw.proposedPrice),
      proposedTimelineMinutes: parseInt(raw.proposedTimeline, 10),
      history: raw.historyJson as any,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async saveEscrow(escrow: OkxEscrow): Promise<OkxEscrow> {
    const raw = await this.prisma.okxEscrowRecord.upsert({
      where: { taskId: escrow.taskId },
      create: {
        taskId: escrow.taskId,
        escrowId: escrow.escrowId,
        amount: escrow.amountUsd.toString(),
        status: escrow.status,
        arbitrationStatus: escrow.arbitrationStatus,
      },
      update: {
        status: escrow.status,
        arbitrationStatus: escrow.arbitrationStatus,
        updatedAt: new Date(),
      },
    });

    return {
      taskId: raw.taskId,
      escrowId: raw.escrowId,
      amountUsd: parseFloat(raw.amount),
      status: raw.status as any,
      arbitrationStatus: raw.arbitrationStatus || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async findEscrowByTaskId(taskId: string): Promise<OkxEscrow | null> {
    const raw = await this.prisma.okxEscrowRecord.findUnique({
      where: { taskId },
    });
    if (!raw) return null;

    return {
      taskId: raw.taskId,
      escrowId: raw.escrowId,
      amountUsd: parseFloat(raw.amount),
      status: raw.status as any,
      arbitrationStatus: raw.arbitrationStatus || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  public async saveDelivery(delivery: OkxDelivery): Promise<OkxDelivery> {
    const raw = await this.prisma.okxDeliveryRecord.create({
      data: {
        taskId: delivery.taskId,
        deliveryId: delivery.deliveryId,
        contentJson: delivery.contentJson as any,
        contentMarkdown: delivery.contentMarkdown,
        confidenceScore: delivery.confidenceScore,
      },
    });

    return {
      taskId: raw.taskId,
      deliveryId: raw.deliveryId,
      contentJson: raw.contentJson as any,
      contentMarkdown: raw.contentMarkdown,
      metadata: delivery.metadata,
      executionSummary: delivery.executionSummary,
      versionInfo: delivery.versionInfo,
      memoryUpdatesSummary: delivery.memoryUpdatesSummary,
      confidenceScore: raw.confidenceScore,
      executionTimestamp: raw.createdAt,
    };
  }

  public async findDeliveryByTaskId(taskId: string): Promise<OkxDelivery | null> {
    const raw = await this.prisma.okxDeliveryRecord.findUnique({
      where: { taskId },
    });
    if (!raw) return null;

    return {
      taskId: raw.taskId,
      deliveryId: raw.deliveryId,
      contentJson: raw.contentJson as any,
      contentMarkdown: raw.contentMarkdown,
      metadata: {},
      executionSummary: 'Loaded from database delivery record.',
      versionInfo: { serviceVersion: '1.0.0', startupVersion: 1 },
      memoryUpdatesSummary: 'Delivery verified.',
      confidenceScore: raw.confidenceScore,
      executionTimestamp: raw.createdAt,
    };
  }

  public async saveRating(rating: OkxRating): Promise<OkxRating> {
    const raw = await this.prisma.okxRatingRecord.create({
      data: {
        taskId: rating.taskId,
        ratingScore: rating.ratingScore,
        reviewText: rating.reviewText,
        ratedByAgentId: rating.ratedByAgentId,
        ratedAgentId: rating.ratedAgentId,
      },
    });

    return {
      taskId: raw.taskId,
      ratingScore: raw.ratingScore,
      reviewText: raw.reviewText || undefined,
      ratedByAgentId: raw.ratedByAgentId,
      ratedAgentId: raw.ratedAgentId,
      createdAt: raw.createdAt,
    };
  }

  public async getRatingsForAgent(agentId: string): Promise<OkxRating[]> {
    // Aggregate ratings *about* this agent (ASP), not ratings *submitted by* them
    const rawRatings = await this.prisma.okxRatingRecord.findMany({
      where: { ratedAgentId: agentId },
    });

    return rawRatings.map((r) => ({
      taskId: r.taskId,
      ratingScore: r.ratingScore,
      reviewText: r.reviewText || undefined,
      ratedByAgentId: r.ratedByAgentId,
      ratedAgentId: r.ratedAgentId,
      createdAt: r.createdAt,
    }));
  }
}
