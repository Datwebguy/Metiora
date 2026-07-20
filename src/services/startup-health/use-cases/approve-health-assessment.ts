import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupHealthReportAggregate } from '@core/domain/startup-health.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ApproveHealthAssessment {
  constructor(
    private readonly healthRepo: IStartupHealthRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {}

  public async execute(reportId: string): Promise<StartupHealthReportAggregate> {
    const report = await this.healthRepo.findById(reportId);
    if (!report) {
      throw new ApplicationError(`Startup health report not found for ID '${reportId}'.`);
    }

    if (report.status === 'APPROVED') {
      return report;
    }

    report.status = 'APPROVED';
    report.updatedAt = new Date();

    const updatedReport = await this.healthRepo.updateReport(
      reportId,
      report,
      `Approved Startup Health Assessment v${report.version}`
    );

    // Record deliverable in Startup Memory Registry
    const startup = await this.startupRepo.findById(report.startupProfileId);
    if (startup) {
      const now = new Date();
      startup.version += 1;
      startup.updatedAt = now;

      await this.startupRepo.updateStartup(
        startup.id,
        startup,
        `Approved continuous health evaluation v${report.version}`
      );

      await this.startupRepo.recordDeliverable(startup.id, {
        serviceType: 'startup_health',
        title: `${report.content.startupName} — Continuous Startup Health Assessment Report`,
        contentMarkdown: report.contentMarkdown,
        versionNumber: report.version,
        metadata: { reportId: report.id, overallScore: report.overallScore },
      });
    }

    return updatedReport;
  }
}
