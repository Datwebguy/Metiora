import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { InvestorPackageVersionRecord } from '@core/domain/investor-ready.js';

export class ListInvestorPackages {
  constructor(private readonly investorRepo: IInvestorReadyRepository) {}

  public async execute(packageId: string): Promise<InvestorPackageVersionRecord[]> {
    return this.investorRepo.getVersionHistory(packageId);
  }
}
