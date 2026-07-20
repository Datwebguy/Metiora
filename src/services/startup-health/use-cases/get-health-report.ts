import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { StartupHealthReportAggregate } from '@core/domain/startup-health.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetHealthReport {
  constructor(private readonly healthRepo: IStartupHealthRepository) {}

  public async execute(reportId: string): Promise<StartupHealthReportAggregate> {
    const report = await this.healthRepo.findById(reportId);
    if (!report) {
      throw new ApplicationError(`Startup health report not found for ID '${reportId}'.`);
    }
    return report;
  }
}
