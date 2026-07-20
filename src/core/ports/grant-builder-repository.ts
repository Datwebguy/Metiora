import {
  GrantPackageAggregate,
  GrantPackageVersionRecord,
} from '../domain/grant-builder.js';

export interface IGrantBuilderRepository {
  createPackage(packageAgg: GrantPackageAggregate): Promise<GrantPackageAggregate>;
  findById(id: string): Promise<GrantPackageAggregate | null>;
  findByStartupId(startupProfileId: string): Promise<GrantPackageAggregate | null>;
  updatePackage(
    id: string,
    updated: GrantPackageAggregate,
    changeSummary: string
  ): Promise<GrantPackageAggregate>;
  getVersionHistory(packageId: string): Promise<GrantPackageVersionRecord[]>;
}
