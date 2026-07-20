import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { PartnershipPackageAggregate, PartnershipCategory } from '@core/domain/partnership-studio.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { assertStartupOwnedByFounder } from '@shared/security/ownership.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { PartnershipReadinessAssessor } from '../domain/partnership-readiness-assessor.js';
import { PartnershipPackageGenerator } from '../domain/partnership-package-generator.js';

export interface GeneratePartnershipPackageDTO {
  founderProfileId: string;
  startupProfileId: string;
  blueprintId?: string;
  category?: PartnershipCategory;
}

export class GeneratePartnershipPackage {
  private assessor: PartnershipReadinessAssessor;
  private generator: PartnershipPackageGenerator;

  constructor(
    private readonly partnershipRepo: IPartnershipStudioRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.assessor = new PartnershipReadinessAssessor();
    this.generator = new PartnershipPackageGenerator();
  }

  public async execute(dto: GeneratePartnershipPackageDTO): Promise<PartnershipPackageAggregate> {
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

    const category = dto.category || 'STRATEGIC_ALLIANCE';
    const content = this.generator.generateContent(startupSnapshot, userSnapshot, category);
    let markdown = this.generator.generateMarkdown(content);
    if (!isReady) {
      const missing =
        assessment.missingInformation.length > 0
          ? assessment.missingInformation.join('; ')
          : 'complete partnership-related memory fields';
      markdown =
        `> **Readiness notice**: Score ${assessment.overallScore}% (threshold ${readinessThreshold}%). ` +
        `Package delivered; strengthen: ${missing}.\n\n` +
        markdown;
    }
    const now = new Date();

    const aggregate: PartnershipPackageAggregate = {
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

    return this.partnershipRepo.createPackage(aggregate);
  }
}
