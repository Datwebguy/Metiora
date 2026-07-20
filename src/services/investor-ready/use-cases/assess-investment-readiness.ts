import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { InvestmentReadinessAssessment } from '@core/domain/investor-ready.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { ReadinessAssessor } from '../domain/readiness-assessor.js';

export class AssessInvestmentReadiness {
  private assessor: ReadinessAssessor;

  constructor(
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.assessor = new ReadinessAssessor();
  }

  public async execute(founderProfileId: string, startupProfileId: string): Promise<InvestmentReadinessAssessment> {
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
