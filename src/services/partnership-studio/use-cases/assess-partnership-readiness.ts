import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { PartnershipReadinessAssessment } from '@core/domain/partnership-studio.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { PartnershipReadinessAssessor } from '../domain/partnership-readiness-assessor.js';

export class AssessPartnershipReadiness {
  private assessor: PartnershipReadinessAssessor;

  constructor(
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.assessor = new PartnershipReadinessAssessor();
  }

  public async execute(founderProfileId: string, startupProfileId: string): Promise<PartnershipReadinessAssessment> {
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
