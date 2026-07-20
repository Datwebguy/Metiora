import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { GrantPackageAggregate } from '@core/domain/grant-builder.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class RejectGrantPackage {
  constructor(private readonly grantRepo: IGrantBuilderRepository) {}

  public async execute(packageId: string): Promise<GrantPackageAggregate> {
    const pkg = await this.grantRepo.findById(packageId);
    if (!pkg) {
      throw new ApplicationError(`Grant package not found for ID '${packageId}'.`);
    }

    pkg.status = 'REJECTED';
    pkg.updatedAt = new Date();

    return this.grantRepo.updatePackage(packageId, pkg, 'Rejected Grant Package proposal');
  }
}
