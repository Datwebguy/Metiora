import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import {
  StartupBlueprintAggregate,
  BlueprintVersionRecord,
} from '@core/domain/startup-blueprint.js';

export class InMemoryStartupBlueprintRepository implements IStartupBlueprintRepository {
  private blueprints: Map<string, StartupBlueprintAggregate> = new Map();
  private versions: Map<string, BlueprintVersionRecord[]> = new Map();

  public async createBlueprint(blueprint: StartupBlueprintAggregate): Promise<StartupBlueprintAggregate> {
    this.blueprints.set(blueprint.id, blueprint);

    const initialVersion: BlueprintVersionRecord = {
      id: crypto.randomUUID(),
      blueprintId: blueprint.id,
      versionNumber: blueprint.version,
      contentJson: blueprint.content,
      contentMarkdown: blueprint.contentMarkdown,
      changeSummary: 'Initial Startup Blueprint generation',
      createdAt: new Date(),
    };
    this.versions.set(blueprint.id, [initialVersion]);

    return blueprint;
  }

  public async findById(id: string): Promise<StartupBlueprintAggregate | null> {
    return this.blueprints.get(id) || null;
  }

  public async findByStartupId(startupProfileId: string): Promise<StartupBlueprintAggregate | null> {
    for (const bp of this.blueprints.values()) {
      if (bp.startupProfileId === startupProfileId) {
        return bp;
      }
    }
    return null;
  }

  public async updateBlueprint(
    id: string,
    updated: StartupBlueprintAggregate,
    changeSummary: string
  ): Promise<StartupBlueprintAggregate> {
    this.blueprints.set(id, updated);

    const newVersion: BlueprintVersionRecord = {
      id: crypto.randomUUID(),
      blueprintId: id,
      versionNumber: updated.version,
      contentJson: updated.content,
      contentMarkdown: updated.contentMarkdown,
      changeSummary,
      createdAt: new Date(),
    };

    const existing = this.versions.get(id) || [];
    this.versions.set(id, [newVersion, ...existing]);

    return updated;
  }

  public async getVersionHistory(blueprintId: string): Promise<BlueprintVersionRecord[]> {
    return this.versions.get(blueprintId) || [];
  }
}
