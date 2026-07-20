import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface TokenComparisonResult {
  versionA: number;
  versionB: number;
  differences: { field: string; valA: any; valB: any }[];
}

export class CompareTokenLaunchVersions {
  constructor(private readonly tokenRepo: ITokenLaunchKitRepository) {}

  public async execute(
    kitId: string,
    versionNumberA: number,
    versionNumberB: number
  ): Promise<TokenComparisonResult> {
    const history = await this.tokenRepo.getVersionHistory(kitId);
    const verA = history.find((v) => v.versionNumber === versionNumberA);
    const verB = history.find((v) => v.versionNumber === versionNumberB);

    if (!verA || !verB) {
      throw new ApplicationError(
        `One or both token kit version numbers (${versionNumberA}, ${versionNumberB}) do not exist for kit '${kitId}'.`
      );
    }

    const differences: { field: string; valA: any; valB: any }[] = [];
    if (verA.contentJson.strategy.tokenSymbol !== verB.contentJson.strategy.tokenSymbol) {
      differences.push({
        field: 'strategy.tokenSymbol',
        valA: verA.contentJson.strategy.tokenSymbol,
        valB: verB.contentJson.strategy.tokenSymbol,
      });
    }

    return {
      versionA: versionNumberA,
      versionB: versionNumberB,
      differences,
    };
  }
}
