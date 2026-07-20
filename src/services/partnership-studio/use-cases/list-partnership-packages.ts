import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { PartnershipPackageVersionRecord } from '@core/domain/partnership-studio.js';

export class ListPartnershipPackages {
  constructor(private readonly partnershipRepo: IPartnershipStudioRepository) {}

  public async execute(packageId: string): Promise<PartnershipPackageVersionRecord[]> {
    return this.partnershipRepo.getVersionHistory(packageId);
  }
}
