import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface BlueprintComparisonResult {
  versionA: number;
  versionB: number;
  differences: { field: string; valA: any; valB: any }[];
}

export class CompareBlueprintVersions {
  constructor(private readonly blueprintRepo: IStartupBlueprintRepository) {}

  public async execute(
    blueprintId: string,
    versionNumberA: number,
    versionNumberB: number
  ): Promise<BlueprintComparisonResult> {
    const history = await this.blueprintRepo.getVersionHistory(blueprintId);
    const verA = history.find((v) => v.versionNumber === versionNumberA);
    const verB = history.find((v) => v.versionNumber === versionNumberB);

    if (!verA || !verB) {
      throw new ApplicationError(
        `One or both blueprint version numbers (${versionNumberA}, ${versionNumberB}) do not exist for blueprint '${blueprintId}'.`
      );
    }

    const differences: { field: string; valA: any; valB: any }[] = [];
    if (verA.contentJson.problem.problemStatement !== verB.contentJson.problem.problemStatement) {
      differences.push({
        field: 'problem.problemStatement',
        valA: verA.contentJson.problem.problemStatement,
        valB: verB.contentJson.problem.problemStatement,
      });
    }

    return {
      versionA: versionNumberA,
      versionB: versionNumberB,
      differences,
    };
  }
}
