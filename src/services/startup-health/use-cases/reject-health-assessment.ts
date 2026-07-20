import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { StartupHealthReportAggregate } from '@core/domain/startup-health.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class RejectHealthAssessment {
  constructor(private readonly healthRepo: IStartupHealthRepository) {}

  public async execute(reportId: string): Promise<StartupHealthReportAggregate> {
    const report = await this.healthRepo.findById(reportId);
    if (!report) {
      throw new ApplicationError(`Startup health report not found for ID '${reportId}'.`);
    }

    report.status = 'REJECTED';
    report.updatedAt = new Date();

    return this.healthRepo.updateReport(reportId, report, 'Rejected Startup Health report');
  }
}
