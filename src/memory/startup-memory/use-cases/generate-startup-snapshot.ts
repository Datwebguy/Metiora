import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { StartupSnapshotBuilder } from '../domain/startup-snapshot-builder.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GenerateStartupSnapshot {
  constructor(private readonly repository: IStartupMemoryRepository) {}

  public async execute(startupId: string): Promise<StartupMemorySnapshot> {
    const startup = await this.repository.findById(startupId);
    if (!startup) {
      throw new ApplicationError(`Startup profile not found for ID '${startupId}'.`);
    }

    return StartupSnapshotBuilder.buildSnapshot(startup);
  }
}
