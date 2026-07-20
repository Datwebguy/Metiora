import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { StartupBlueprintAggregate } from '@core/domain/startup-blueprint.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetBlueprint {
  constructor(private readonly blueprintRepo: IStartupBlueprintRepository) {}

  public async execute(blueprintId: string): Promise<StartupBlueprintAggregate> {
    const blueprint = await this.blueprintRepo.findById(blueprintId);
    if (!blueprint) {
      throw new ApplicationError(`Startup Blueprint not found for ID '${blueprintId}'.`);
    }
    return blueprint;
  }
}
