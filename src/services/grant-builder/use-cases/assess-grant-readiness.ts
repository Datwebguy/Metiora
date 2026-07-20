import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { GrantReadinessAssessment } from '@core/domain/grant-builder.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { GrantReadinessAssessor } from '../domain/grant-readiness-assessor.js';

export class AssessGrantReadiness {
  private assessor: GrantReadinessAssessor;

  constructor(
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.assessor = new GrantReadinessAssessor();
  }

  public async execute(founderProfileId: string, startupProfileId: string): Promise<GrantReadinessAssessment> {
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

    return this.assessor.assess(startupSnapshot, userSnapshot);
  }
}
