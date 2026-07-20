import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { StartupHealthAssessment } from '@core/domain/startup-health.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { HealthScoringEngine } from '../domain/health-scoring-engine.js';

export class AssessStartupHealth {
  private engine: HealthScoringEngine;

  constructor(
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.engine = new HealthScoringEngine();
  }

  public async execute(founderProfileId: string, startupProfileId: string): Promise<StartupHealthAssessment> {
    const founder = await this.userRepo.findById(founderProfileId);
    if (!founder) {
      throw new ApplicationError(`Founder profile not found for ID '${founderProfileId}'.`);
    }

    const startup = await this.startupRepo.findById(startupProfileId);
    if (!startup) {
      throw new ApplicationError(`Startup profile not found for ID '${startupProfileId}'.`);
    }

    const userSnapshot = SnapshotBuilder.buildSnapshot(founder);
    const startupSnapshot = StartupSnapshotBuilder.buildSnapshot(startup);

    return this.engine.evaluate(startupSnapshot, userSnapshot);
  }
}
