import {
  StartupHealthReportAggregate,
  StartupHealthReportVersionRecord,
} from '../domain/startup-health.js';

export interface IStartupHealthRepository {
  createReport(reportAgg: StartupHealthReportAggregate): Promise<StartupHealthReportAggregate>;
  findById(id: string): Promise<StartupHealthReportAggregate | null>;
  findByStartupId(startupProfileId: string): Promise<StartupHealthReportAggregate | null>;
  updateReport(
    id: string,
    updated: StartupHealthReportAggregate,
    changeSummary: string
  ): Promise<StartupHealthReportAggregate>;
  getVersionHistory(reportId: string): Promise<StartupHealthReportVersionRecord[]>;
}
