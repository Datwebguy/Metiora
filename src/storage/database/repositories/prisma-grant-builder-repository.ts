import { PrismaClient } from '@prisma/client';
import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import {
  GrantPackageAggregate,
  GrantPackageVersionRecord,
} from '@core/domain/grant-builder.js';
import { ApprovalStatus } from '@core/domain/user-memory.js';

export class PrismaGrantBuilderRepository implements IGrantBuilderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createPackage(packageAgg: GrantPackageAggregate): Promise<GrantPackageAggregate> {
    const created = await this.prisma.grantPackageRecord.create({
      data: {
        id: packageAgg.id,
        startupProfileId: packageAgg.startupProfileId,
        founderProfileId: packageAgg.founderProfileId,
        blueprintId: packageAgg.blueprintId,
        version: packageAgg.version,
        status: packageAgg.status,
        readinessScore: packageAgg.readinessScore,
        contentJson: packageAgg.content as any,
        contentMarkdown: packageAgg.contentMarkdown,
        versions: {
          create: {
            versionNumber: packageAgg.version,
            contentJson: packageAgg.content as any,
            contentMarkdown: packageAgg.contentMarkdown,
            changeSummary: 'Initial Grant Builder Package generation',
          },
        },
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<GrantPackageAggregate | null> {
    const raw = await this.prisma.grantPackageRecord.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async findByStartupId(startupProfileId: string): Promise<GrantPackageAggregate | null> {
    const raw = await this.prisma.grantPackageRecord.findFirst({
      where: { startupProfileId },
      orderBy: { version: 'desc' },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async updatePackage(
    id: string,
    updated: GrantPackageAggregate,
    changeSummary: string
  ): Promise<GrantPackageAggregate> {
    const raw = await this.prisma.grantPackageRecord.update({
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

  public async getVersionHistory(packageId: string): Promise<GrantPackageVersionRecord[]> {
    const rawVersions = await this.prisma.grantPackageVersion.findMany({
      where: { packageId },
      orderBy: { versionNumber: 'desc' },
    });

    return rawVersions.map((v) => ({
      id: v.id,
      packageId: v.packageId,
      versionNumber: v.versionNumber,
      contentJson: v.contentJson as any,
      contentMarkdown: v.contentMarkdown,
      changeSummary: v.changeSummary,
      createdAt: v.createdAt,
    }));
  }

  private mapToAggregate(raw: any): GrantPackageAggregate {
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
