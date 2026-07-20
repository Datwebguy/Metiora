import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { TokenLaunchKitAggregate } from '@core/domain/token-launch-kit.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { assertStartupOwnedByFounder } from '@shared/security/ownership.js';
import { SnapshotBuilder } from '../../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { TokenReadinessAssessor } from '../domain/token-readiness-assessor.js';
import { KitGenerator } from '../domain/kit-generator.js';

export interface GenerateTokenLaunchKitDTO {
  founderProfileId: string;
  startupProfileId: string;
  blueprintId?: string;
}

export class GenerateTokenLaunchKit {
  private assessor: TokenReadinessAssessor;
  private generator: KitGenerator;

  constructor(
    private readonly tokenRepo: ITokenLaunchKitRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.assessor = new TokenReadinessAssessor();
    this.generator = new KitGenerator();
  }

  public async execute(dto: GenerateTokenLaunchKitDTO): Promise<TokenLaunchKitAggregate> {
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

    const content = this.generator.generateContent(startupSnapshot, userSnapshot, assessment.isAppropriate);
    const markdown = this.generator.generateMarkdown(content);
    const now = new Date();

    const aggregate: TokenLaunchKitAggregate = {
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

    return this.tokenRepo.createKit(aggregate);
  }
}
