import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { BlueprintVersionRecord } from '@core/domain/startup-blueprint.js';

export class ListBlueprintVersions {
  constructor(private readonly blueprintRepo: IStartupBlueprintRepository) {}

  public async execute(blueprintId: string): Promise<BlueprintVersionRecord[]> {
    return this.blueprintRepo.getVersionHistory(blueprintId);
  }
}
