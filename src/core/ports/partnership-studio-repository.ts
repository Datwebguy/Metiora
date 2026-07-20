import {
  PartnershipPackageAggregate,
  PartnershipPackageVersionRecord,
} from '../domain/partnership-studio.js';

export interface IPartnershipStudioRepository {
  createPackage(packageAgg: PartnershipPackageAggregate): Promise<PartnershipPackageAggregate>;
  findById(id: string): Promise<PartnershipPackageAggregate | null>;
  findByStartupId(startupProfileId: string): Promise<PartnershipPackageAggregate | null>;
  updatePackage(
    id: string,
    updated: PartnershipPackageAggregate,
    changeSummary: string
  ): Promise<PartnershipPackageAggregate>;
  getVersionHistory(packageId: string): Promise<PartnershipPackageVersionRecord[]>;
}
