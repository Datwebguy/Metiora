import { PrismaClient } from '@prisma/client';
import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import {
  PartnershipPackageAggregate,
  PartnershipPackageVersionRecord,
} from '@core/domain/partnership-studio.js';
import { ApprovalStatus } from '@core/domain/user-memory.js';

export class PrismaPartnershipStudioRepository implements IPartnershipStudioRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createPackage(packageAgg: PartnershipPackageAggregate): Promise<PartnershipPackageAggregate> {
    const created = await this.prisma.partnershipPackageRecord.create({
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
            changeSummary: 'Initial Partnership Studio Package generation',
          },
        },
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<PartnershipPackageAggregate | null> {
    const raw = await this.prisma.partnershipPackageRecord.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async findByStartupId(startupProfileId: string): Promise<PartnershipPackageAggregate | null> {
    const raw = await this.prisma.partnershipPackageRecord.findFirst({
      where: { startupProfileId },
      orderBy: { version: 'desc' },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async updatePackage(
    id: string,
    updated: PartnershipPackageAggregate,
    changeSummary: string
  ): Promise<PartnershipPackageAggregate> {
    const raw = await this.prisma.partnershipPackageRecord.update({
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

  public async getVersionHistory(packageId: string): Promise<PartnershipPackageVersionRecord[]> {
    const rawVersions = await this.prisma.partnershipPackageVersion.findMany({
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

  private mapToAggregate(raw: any): PartnershipPackageAggregate {
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
