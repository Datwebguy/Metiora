import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupHealthReportAggregate } from '@core/domain/startup-health.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { assertStartupOwnedByFounder } from '@shared/security/ownership.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { HealthScoringEngine } from '../domain/health-scoring-engine.js';
import { HealthReportGenerator } from '../domain/health-report-generator.js';

export interface GenerateHealthReportDTO {
  founderProfileId: string;
  startupProfileId: string;
  blueprintId?: string;
}

export class GenerateHealthReport {
  private engine: HealthScoringEngine;
  private generator: HealthReportGenerator;

  constructor(
    private readonly healthRepo: IStartupHealthRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.engine = new HealthScoringEngine();
    this.generator = new HealthReportGenerator();
  }

  public async execute(dto: GenerateHealthReportDTO): Promise<StartupHealthReportAggregate> {
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

    const assessment = this.engine.evaluate(startupSnapshot, userSnapshot);
    const content = this.generator.generateContent(startupSnapshot, userSnapshot, assessment);
    const markdown = this.generator.generateMarkdown(content);
    const now = new Date();

    const aggregate: StartupHealthReportAggregate = {
      id: crypto.randomUUID(),
      startupProfileId: dto.startupProfileId,
      founderProfileId: dto.founderProfileId,
      blueprintId: dto.blueprintId,
      version: 1,
      status: 'PENDING',
      overallScore: assessment.overallScore,
      categoryScores: assessment.categoryScores,
      content,
      contentMarkdown: markdown,
      createdAt: now,
      updatedAt: now,
    };

    return this.healthRepo.createReport(aggregate);
  }
}
