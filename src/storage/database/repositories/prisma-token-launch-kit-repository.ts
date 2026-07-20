import { PrismaClient } from '@prisma/client';
import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import {
  TokenLaunchKitAggregate,
  TokenLaunchKitVersionRecord,
} from '@core/domain/token-launch-kit.js';
import { ApprovalStatus } from '@core/domain/user-memory.js';

export class PrismaTokenLaunchKitRepository implements ITokenLaunchKitRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createKit(kitAgg: TokenLaunchKitAggregate): Promise<TokenLaunchKitAggregate> {
    const created = await this.prisma.tokenLaunchKitRecord.create({
      data: {
        id: kitAgg.id,
        startupProfileId: kitAgg.startupProfileId,
        founderProfileId: kitAgg.founderProfileId,
        blueprintId: kitAgg.blueprintId,
        version: kitAgg.version,
        status: kitAgg.status,
        readinessScore: kitAgg.readinessScore,
        contentJson: kitAgg.content as any,
        contentMarkdown: kitAgg.contentMarkdown,
        versions: {
          create: {
            versionNumber: kitAgg.version,
            contentJson: kitAgg.content as any,
            contentMarkdown: kitAgg.contentMarkdown,
            changeSummary: 'Initial Token Launch Kit generation',
          },
        },
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<TokenLaunchKitAggregate | null> {
    const raw = await this.prisma.tokenLaunchKitRecord.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async findByStartupId(startupProfileId: string): Promise<TokenLaunchKitAggregate | null> {
    const raw = await this.prisma.tokenLaunchKitRecord.findFirst({
      where: { startupProfileId },
      orderBy: { version: 'desc' },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async updateKit(
    id: string,
    updated: TokenLaunchKitAggregate,
    changeSummary: string
  ): Promise<TokenLaunchKitAggregate> {
    const raw = await this.prisma.tokenLaunchKitRecord.update({
      where: { id },
      data: {
        version: updated.version,
        status: updated.status,
        readinessScore: updated.readinessScore,
        contentJson: updated.content as any,
        contentMarkdown: updated.contentMarkdown,
        updatedAt: new Date(),
        versions: {
          create: {
            versionNumber: updated.version,
            contentJson: updated.content as any,
            contentMarkdown: updated.contentMarkdown,
            changeSummary,
          },
        },
      },
    });

    return this.mapToAggregate(raw);
  }

  public async getVersionHistory(kitId: string): Promise<TokenLaunchKitVersionRecord[]> {
    const rawVersions = await this.prisma.tokenLaunchKitVersion.findMany({
      where: { kitId },
      orderBy: { versionNumber: 'desc' },
    });

    return rawVersions.map((v) => ({
      id: v.id,
      kitId: v.kitId,
      versionNumber: v.versionNumber,
      contentJson: v.contentJson as any,
      contentMarkdown: v.contentMarkdown,
      changeSummary: v.changeSummary,
      createdAt: v.createdAt,
    }));
  }

  private mapToAggregate(raw: any): TokenLaunchKitAggregate {
    return {
      id: raw.id,
      startupProfileId: raw.startupProfileId,
      founderProfileId: raw.founderProfileId,
      blueprintId: raw.blueprintId || undefined,
      version: raw.version,
      status: raw.status as ApprovalStatus,
      readinessScore: raw.readinessScore,
      content: raw.contentJson as any,
      contentMarkdown: raw.contentMarkdown,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
