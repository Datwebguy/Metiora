import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { SnapshotBuilder } from '../domain/snapshot-builder.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GenerateMemorySnapshot {
  constructor(private readonly repository: IUserMemoryRepository) {}

  public async execute(founderId: string): Promise<UserMemorySnapshot> {
    const profile = await this.repository.findById(founderId);
    if (!profile) {
      throw new ApplicationError(`Founder profile not found for ID '${founderId}'.`);
    }

    return SnapshotBuilder.buildSnapshot(profile);
  }
}
