import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface InvestorComparisonResult {
  versionA: number;
  versionB: number;
  differences: { field: string; valA: any; valB: any }[];
}

export class CompareInvestorVersions {
  constructor(private readonly investorRepo: IInvestorReadyRepository) {}

  public async execute(
    packageId: string,
    versionNumberA: number,
    versionNumberB: number
  ): Promise<InvestorComparisonResult> {
    const history = await this.investorRepo.getVersionHistory(packageId);
    const verA = history.find((v) => v.versionNumber === versionNumberA);
    const verB = history.find((v) => v.versionNumber === versionNumberB);

    if (!verA || !verB) {
      throw new ApplicationError(
        `One or both investor package version numbers (${versionNumberA}, ${versionNumberB}) do not exist for package '${packageId}'.`
      );
    }

    const differences: { field: string; valA: any; valB: any }[] = [];
    if (verA.contentJson.fundingAsk.targetRaiseAmount !== verB.contentJson.fundingAsk.targetRaiseAmount) {
      differences.push({
        field: 'fundingAsk.targetRaiseAmount',
        valA: verA.contentJson.fundingAsk.targetRaiseAmount,
        valB: verB.contentJson.fundingAsk.targetRaiseAmount,
      });
    }

    return {
      versionA: versionNumberA,
      versionB: versionNumberB,
      differences,
    };
  }
}
