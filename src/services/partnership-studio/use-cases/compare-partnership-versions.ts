import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface PartnershipComparisonResult {
  versionA: number;
  versionB: number;
  differences: { field: string; valA: any; valB: any }[];
}

export class ComparePartnershipVersions {
  constructor(private readonly partnershipRepo: IPartnershipStudioRepository) {}

  public async execute(
    packageId: string,
    versionNumberA: number,
    versionNumberB: number
  ): Promise<PartnershipComparisonResult> {
    const history = await this.partnershipRepo.getVersionHistory(packageId);
    const verA = history.find((v) => v.versionNumber === versionNumberA);
    const verB = history.find((v) => v.versionNumber === versionNumberB);

    if (!verA || !verB) {
      throw new ApplicationError(
        `One or both partnership package version numbers (${versionNumberA}, ${versionNumberB}) do not exist for package '${packageId}'.`
      );
    }

    const differences: { field: string; valA: any; valB: any }[] = [];
    if (verA.contentJson.proposal.title !== verB.contentJson.proposal.title) {
      differences.push({
        field: 'proposal.title',
        valA: verA.contentJson.proposal.title,
        valB: verB.contentJson.proposal.title,
      });
    }

    return {
      versionA: versionNumberA,
      versionB: versionNumberB,
      differences,
    };
  }
}
