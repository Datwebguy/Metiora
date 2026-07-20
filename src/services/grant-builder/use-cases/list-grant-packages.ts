import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { GrantPackageVersionRecord } from '@core/domain/grant-builder.js';

export class ListGrantPackages {
  constructor(private readonly grantRepo: IGrantBuilderRepository) {}

  public async execute(packageId: string): Promise<GrantPackageVersionRecord[]> {
    return this.grantRepo.getVersionHistory(packageId);
  }
}
