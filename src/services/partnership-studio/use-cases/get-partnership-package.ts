import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { PartnershipPackageAggregate } from '@core/domain/partnership-studio.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetPartnershipPackage {
  constructor(private readonly partnershipRepo: IPartnershipStudioRepository) {}

  public async execute(packageId: string): Promise<PartnershipPackageAggregate> {
    const pkg = await this.partnershipRepo.findById(packageId);
    if (!pkg) {
      throw new ApplicationError(`Partnership package not found for ID '${packageId}'.`);
    }
    return pkg;
  }
}
