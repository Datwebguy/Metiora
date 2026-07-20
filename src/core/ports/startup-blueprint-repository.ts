import {
  StartupBlueprintAggregate,
  BlueprintVersionRecord,
} from '../domain/startup-blueprint.js';

export interface IStartupBlueprintRepository {
  createBlueprint(blueprint: StartupBlueprintAggregate): Promise<StartupBlueprintAggregate>;
  findById(id: string): Promise<StartupBlueprintAggregate | null>;
  findByStartupId(startupProfileId: string): Promise<StartupBlueprintAggregate | null>;
  updateBlueprint(
    id: string,
    updated: StartupBlueprintAggregate,
    changeSummary: string
  ): Promise<StartupBlueprintAggregate>;
  getVersionHistory(blueprintId: string): Promise<BlueprintVersionRecord[]>;
}
