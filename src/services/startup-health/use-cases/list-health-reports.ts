import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { StartupHealthReportVersionRecord } from '@core/domain/startup-health.js';

export class ListHealthReports {
  constructor(private readonly healthRepo: IStartupHealthRepository) {}

  public async execute(reportId: string): Promise<StartupHealthReportVersionRecord[]> {
    return this.healthRepo.getVersionHistory(reportId);
  }
}
