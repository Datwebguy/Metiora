import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupBlueprintAggregate } from '@core/domain/startup-blueprint.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { assertStartupOwnedByFounder } from '@shared/security/ownership.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { BlueprintGenerator } from '../domain/blueprint-generator.js';
import { BlueprintValidator } from '../domain/blueprint-validator.js';

export interface CreateStartupBlueprintDTO {
  founderProfileId: string;
  startupProfileId: string;
}

export class CreateStartupBlueprint {
  private generator: BlueprintGenerator;
  private validator: BlueprintValidator;

  constructor(
    private readonly blueprintRepo: IStartupBlueprintRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.generator = new BlueprintGenerator();
    this.validator = new BlueprintValidator();
  }

  public async execute(dto: CreateStartupBlueprintDTO): Promise<StartupBlueprintAggregate> {
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

    const content = this.generator.generateContent(startupSnapshot, userSnapshot);
    const validation = this.validator.validate(content);

    // Soft-fail: always deliver a blueprint after pay. Gaps are annotated, not rejected.
    let markdown = this.generator.generateMarkdown(content);
    if (!validation.isValid) {
      const gaps = [
        ...validation.missingSections.map((s) => `missing: ${s}`),
        ...validation.conflicts,
        ...validation.errors,
      ].join('; ');
      markdown =
        `> **Completeness notice**: Blueprint delivered with gaps — ${gaps || 'incomplete memory'}. ` +
        `Enrich founder/startup profiles and regenerate for a fuller plan.\n\n` +
        markdown;
    }
    const now = new Date();

    const aggregate: StartupBlueprintAggregate = {
      id: crypto.randomUUID(),
      startupProfileId: dto.startupProfileId,
      founderProfileId: dto.founderProfileId,
      version: 1,
      status: 'PENDING',
      content,
      contentMarkdown: markdown,
      createdAt: now,
      updatedAt: now,
    };

    return this.blueprintRepo.createBlueprint(aggregate);
  }
}
