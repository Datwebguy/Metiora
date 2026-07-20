import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { InvestorPackageAggregate } from '@core/domain/investor-ready.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetInvestorPackage {
  constructor(private readonly investorRepo: IInvestorReadyRepository) {}

  public async execute(packageId: string): Promise<InvestorPackageAggregate> {
    const pkg = await this.investorRepo.findById(packageId);
    if (!pkg) {
      throw new ApplicationError(`Investor package not found for ID '${packageId}'.`);
    }
    return pkg;
  }
}
