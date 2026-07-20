import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { InvestorPackageAggregate } from '@core/domain/investor-ready.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { assertStartupOwnedByFounder } from '@shared/security/ownership.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { ReadinessAssessor } from '../domain/readiness-assessor.js';
import { PackageGenerator } from '../domain/package-generator.js';

export interface GenerateInvestorPackageDTO {
  founderProfileId: string;
  startupProfileId: string;
  blueprintId?: string;
}

export class GenerateInvestorPackage {
  private assessor: ReadinessAssessor;
  private generator: PackageGenerator;

  constructor(
    private readonly investorRepo: IInvestorReadyRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.assessor = new ReadinessAssessor();
    this.generator = new PackageGenerator();
  }

  public async execute(dto: GenerateInvestorPackageDTO): Promise<InvestorPackageAggregate> {
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
    // Soft-fail: always deliver a package after pay. Low readiness is documented, not rejected.
    const readinessThreshold = 60;
    const isReady = assessment.overallScore >= readinessThreshold;

    const content = this.generator.generateContent(startupSnapshot, userSnapshot);
    let markdown = this.generator.generateMarkdown(content);
    if (!isReady) {
      const missing =
        assessment.missingInformation.length > 0
          ? assessment.missingInformation.join('; ')
          : 'fill founder/startup memory fields';
      markdown =
        `> **Readiness notice**: Score ${assessment.overallScore}% (threshold ${readinessThreshold}%). ` +
        `Package delivered for paid use; strengthen: ${missing}.\n\n` +
        markdown;
      content.executiveSummary.summaryText =
        `[Readiness ${assessment.overallScore}% — below ${readinessThreshold}%] ` +
        content.executiveSummary.summaryText;
    }
    const now = new Date();

    const aggregate: InvestorPackageAggregate = {
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

    return this.investorRepo.createPackage(aggregate);
  }
}
