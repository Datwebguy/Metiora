import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import {
  StartupHealthReportAggregate,
  StartupHealthReportVersionRecord,
} from '@core/domain/startup-health.js';

export class InMemoryStartupHealthRepository implements IStartupHealthRepository {
  private reports: Map<string, StartupHealthReportAggregate> = new Map();
  private versions: Map<string, StartupHealthReportVersionRecord[]> = new Map();

  public async createReport(reportAgg: StartupHealthReportAggregate): Promise<StartupHealthReportAggregate> {
    this.reports.set(reportAgg.id, reportAgg);

    const initialVersion: StartupHealthReportVersionRecord = {
      id: crypto.randomUUID(),
      reportId: reportAgg.id,
      versionNumber: reportAgg.version,
      overallScore: reportAgg.overallScore,
      categoryScoresJson: reportAgg.categoryScores,
      contentJson: reportAgg.content,
      contentMarkdown: reportAgg.contentMarkdown,
      changeSummary: 'Initial Startup Health Report generation',
      createdAt: new Date(),
    };
    this.versions.set(reportAgg.id, [initialVersion]);

    return reportAgg;
  }

  public async findById(id: string): Promise<StartupHealthReportAggregate | null> {
    return this.reports.get(id) || null;
  }

  public async findByStartupId(startupProfileId: string): Promise<StartupHealthReportAggregate | null> {
    for (const report of this.reports.values()) {
      if (report.startupProfileId === startupProfileId) {
        return report;
      }
    }
    return null;
  }

  public async updateReport(
    id: string,
    updated: StartupHealthReportAggregate,
    changeSummary: string
  ): Promise<StartupHealthReportAggregate> {
    this.reports.set(id, updated);

    const newVersion: StartupHealthReportVersionRecord = {
      id: crypto.randomUUID(),
      reportId: id,
      versionNumber: updated.version,
      overallScore: updated.overallScore,
      categoryScoresJson: updated.categoryScores,
      contentJson: updated.content,
      contentMarkdown: updated.contentMarkdown,
      changeSummary,
      createdAt: new Date(),
    };

    const existing = this.versions.get(id) || [];
    this.versions.set(id, [newVersion, ...existing]);

    return updated;
  }

  public async getVersionHistory(reportId: string): Promise<StartupHealthReportVersionRecord[]> {
    return this.versions.get(reportId) || [];
  }
}
