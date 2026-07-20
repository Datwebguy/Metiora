import { PrismaClient } from '@prisma/client';
import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import {
  InvestorPackageAggregate,
  InvestorPackageVersionRecord,
} from '@core/domain/investor-ready.js';
import { ApprovalStatus } from '@core/domain/user-memory.js';

export class PrismaInvestorReadyRepository implements IInvestorReadyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createPackage(packageAgg: InvestorPackageAggregate): Promise<InvestorPackageAggregate> {
    const created = await this.prisma.investorPackageRecord.create({
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
            changeSummary: 'Initial Investor Ready Package generation',
          },
        },
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<InvestorPackageAggregate | null> {
    const raw = await this.prisma.investorPackageRecord.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async findByStartupId(startupProfileId: string): Promise<InvestorPackageAggregate | null> {
    const raw = await this.prisma.investorPackageRecord.findFirst({
      where: { startupProfileId },
      orderBy: { version: 'desc' },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async updatePackage(
    id: string,
    updated: InvestorPackageAggregate,
    changeSummary: string
  ): Promise<InvestorPackageAggregate> {
    const raw = await this.prisma.investorPackageRecord.update({
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

  public async getVersionHistory(packageId: string): Promise<InvestorPackageVersionRecord[]> {
    const rawVersions = await this.prisma.investorPackageVersion.findMany({
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

  private mapToAggregate(raw: any): InvestorPackageAggregate {
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
