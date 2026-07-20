import {
  InvestorPackageAggregate,
  InvestorPackageVersionRecord,
} from '../domain/investor-ready.js';

export interface IInvestorReadyRepository {
  createPackage(packageAgg: InvestorPackageAggregate): Promise<InvestorPackageAggregate>;
  findById(id: string): Promise<InvestorPackageAggregate | null>;
  findByStartupId(startupProfileId: string): Promise<InvestorPackageAggregate | null>;
  updatePackage(
    id: string,
    updated: InvestorPackageAggregate,
    changeSummary: string
  ): Promise<InvestorPackageAggregate>;
  getVersionHistory(packageId: string): Promise<InvestorPackageVersionRecord[]>;
}
