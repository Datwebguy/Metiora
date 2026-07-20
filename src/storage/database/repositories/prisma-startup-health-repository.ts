import { PrismaClient } from '@prisma/client';
import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import {
  StartupHealthReportAggregate,
  StartupHealthReportVersionRecord,
} from '@core/domain/startup-health.js';
import { ApprovalStatus } from '@core/domain/user-memory.js';

export class PrismaStartupHealthRepository implements IStartupHealthRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createReport(reportAgg: StartupHealthReportAggregate): Promise<StartupHealthReportAggregate> {
    const created = await this.prisma.startupHealthReportRecord.create({
      data: {
        id: reportAgg.id,
        startupProfileId: reportAgg.startupProfileId,
        founderProfileId: reportAgg.founderProfileId,
        blueprintId: reportAgg.blueprintId,
        version: reportAgg.version,
        status: reportAgg.status,
        overallScore: reportAgg.overallScore,
        categoryScoresJson: reportAgg.categoryScores as any,
        contentJson: reportAgg.content as any,
        contentMarkdown: reportAgg.contentMarkdown,
        versions: {
          create: {
            versionNumber: reportAgg.version,
            overallScore: reportAgg.overallScore,
            categoryScoresJson: reportAgg.categoryScores as any,
            contentJson: reportAgg.content as any,
            contentMarkdown: reportAgg.contentMarkdown,
            changeSummary: 'Initial Startup Health Report generation',
          },
        },
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<StartupHealthReportAggregate | null> {
    const raw = await this.prisma.startupHealthReportRecord.findUnique({
      where: { id },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async findByStartupId(startupProfileId: string): Promise<StartupHealthReportAggregate | null> {
    const raw = await this.prisma.startupHealthReportRecord.findFirst({
      where: { startupProfileId },
      orderBy: { version: 'desc' },
    });
    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async updateReport(
    id: string,
    updated: StartupHealthReportAggregate,
    changeSummary: string
  ): Promise<StartupHealthReportAggregate> {
    const raw = await this.prisma.startupHealthReportRecord.update({
      where: { id },
      data: {
        version: updated.version,
        status: updated.status,
        overallScore: updated.overallScore,
        categoryScoresJson: updated.categoryScores as any,
        contentJson: updated.content as any,
        contentMarkdown: updated.contentMarkdown,
        updatedAt: new Date(),
        versions: {
          create: {
            versionNumber: updated.version,
            overallScore: updated.overallScore,
            categoryScoresJson: updated.categoryScores as any,
            contentJson: updated.content as any,
            contentMarkdown: updated.contentMarkdown,
            changeSummary,
          },
        },
      },
    });

    return this.mapToAggregate(raw);
  }

  public async getVersionHistory(reportId: string): Promise<StartupHealthReportVersionRecord[]> {
    const rawVersions = await this.prisma.startupHealthReportVersion.findMany({
      where: { reportId },
      orderBy: { versionNumber: 'desc' },
    });

    return rawVersions.map((v) => ({
      id: v.id,
      reportId: v.reportId,
      versionNumber: v.versionNumber,
      overallScore: v.overallScore,
      categoryScoresJson: v.categoryScoresJson as any,
      contentJson: v.contentJson as any,
      contentMarkdown: v.contentMarkdown,
      changeSummary: v.changeSummary,
      createdAt: v.createdAt,
    }));
  }

  private mapToAggregate(raw: any): StartupHealthReportAggregate {
    return {
      id: raw.id,
      startupProfileId: raw.startupProfileId,
      founderProfileId: raw.founderProfileId,
      blueprintId: raw.blueprintId || undefined,
      version: raw.version,
      status: raw.status as ApprovalStatus,
      overallScore: raw.overallScore,
      categoryScores: raw.categoryScoresJson as any,
      content: raw.contentJson as any,
      contentMarkdown: raw.contentMarkdown,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
