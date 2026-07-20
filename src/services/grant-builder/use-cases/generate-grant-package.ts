import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { GrantPackageAggregate } from '@core/domain/grant-builder.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { assertStartupOwnedByFounder } from '@shared/security/ownership.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { GrantReadinessAssessor } from '../domain/grant-readiness-assessor.js';
import { GrantPackageGenerator } from '../domain/grant-package-generator.js';

export interface GenerateGrantPackageDTO {
  founderProfileId: string;
  startupProfileId: string;
  blueprintId?: string;
}

export class GenerateGrantPackage {
  private assessor: GrantReadinessAssessor;
  private generator: GrantPackageGenerator;

  constructor(
    private readonly grantRepo: IGrantBuilderRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.assessor = new GrantReadinessAssessor();
    this.generator = new GrantPackageGenerator();
  }

  public async execute(dto: GenerateGrantPackageDTO): Promise<GrantPackageAggregate> {
    const founder = await this.userRepo.findById(dto.founderProfileId);
    if (!founder) {
      throw new ApplicationError(`Founder profile not found for ID '${dto.founderProfileId}'.`);
    }

    const startup = await this.startupRepo.findById(dto.startupProfileId);
    if (!startup) {
      throw new ApplicationError(`Startup profile not found for ID '${dto.startupProfileId}'.`);
    }

    assertStartupOwnedByFounder(startup, dto.founderProfileId);

    const userSnapshot = SnapshotBuilder.buildSnapshot(founder);
    const startupSnapshot = StartupSnapshotBuilder.buildSnapshot(startup);

    const assessment = this.assessor.assess(startupSnapshot, userSnapshot);
    // Soft-fail: always deliver after pay; low readiness is annotated, not rejected.
    const readinessThreshold = 50;
    const isReady = assessment.overallScore >= readinessThreshold;

    const content = this.generator.generateContent(startupSnapshot, userSnapshot);
    let markdown = this.generator.generateMarkdown(content);
    if (!isReady) {
      const missing =
        assessment.missingInformation.length > 0
          ? assessment.missingInformation.join('; ')
          : 'complete grant-related memory fields';
      markdown =
        `> **Readiness notice**: Score ${assessment.overallScore}% (threshold ${readinessThreshold}%). ` +
        `Package delivered; strengthen: ${missing}.\n\n` +
        markdown;
    }
    const now = new Date();

    const aggregate: GrantPackageAggregate = {
      id: crypto.randomUUID(),
      startupProfileId: dto.startupProfileId,
      founderProfileId: dto.founderProfileId,
      blueprintId: dto.blueprintId,
      version: 1,
      status: 'PENDING',
      readinessScore: assessment.overallScore,
      content,
      contentMarkdown: markdown,
      createdAt: now,
      updatedAt: now,
    };

    return this.grantRepo.createPackage(aggregate);
  }
}
