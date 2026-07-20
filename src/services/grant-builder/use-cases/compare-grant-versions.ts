import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface GrantComparisonResult {
  versionA: number;
  versionB: number;
  differences: { field: string; valA: any; valB: any }[];
}

export class CompareGrantVersions {
  constructor(private readonly grantRepo: IGrantBuilderRepository) {}

  public async execute(
    packageId: string,
    versionNumberA: number,
    versionNumberB: number
  ): Promise<GrantComparisonResult> {
    const history = await this.grantRepo.getVersionHistory(packageId);
    const verA = history.find((v) => v.versionNumber === versionNumberA);
    const verB = history.find((v) => v.versionNumber === versionNumberB);

    if (!verA || !verB) {
      throw new ApplicationError(
        `One or both grant package version numbers (${versionNumberA}, ${versionNumberB}) do not exist for package '${packageId}'.`
      );
    }

    const differences: { field: string; valA: any; valB: any }[] = [];
    if (verA.contentJson.budgetNarrative.requestedAmount !== verB.contentJson.budgetNarrative.requestedAmount) {
      differences.push({
        field: 'budgetNarrative.requestedAmount',
        valA: verA.contentJson.budgetNarrative.requestedAmount,
        valB: verB.contentJson.budgetNarrative.requestedAmount,
      });
    }

    return {
      versionA: versionNumberA,
      versionB: versionNumberB,
      differences,
    };
  }
}
