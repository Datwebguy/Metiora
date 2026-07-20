import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { TokenLaunchKitAggregate } from '@core/domain/token-launch-kit.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ApproveTokenLaunchKit {
  constructor(
    private readonly tokenRepo: ITokenLaunchKitRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {}

  public async execute(kitId: string): Promise<TokenLaunchKitAggregate> {
    const kit = await this.tokenRepo.findById(kitId);
    if (!kit) {
      throw new ApplicationError(`Token Launch Kit not found for ID '${kitId}'.`);
    }

    if (kit.status === 'APPROVED') {
      return kit;
    }

    kit.status = 'APPROVED';
    kit.updatedAt = new Date();

    const updatedKit = await this.tokenRepo.updateKit(
      kitId,
      kit,
      `Approved Token Launch Kit v${kit.version}`
    );

    // Persist approved tokenomics into Startup Memory
    const startup = await this.startupRepo.findById(kit.startupProfileId);
    if (startup) {
      const now = new Date();
      startup.version += 1;
      startup.updatedAt = now;

      startup.tokenomics = {
        tokenName: { value: kit.content.strategy.tokenName, confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        tokenSymbol: { value: kit.content.strategy.tokenSymbol, confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
        utility: { value: kit.content.utilityModel.coreUtilities.join(', '), confidence: 'HIGH', source: 'user_explicit', updatedAt: now },
      };

      await this.startupRepo.updateStartup(
        startup.id,
        startup,
        `Updated tokenomics from approved Token Launch Kit v${kit.version}`
      );

      // Record deliverable in Startup Memory Registry
      await this.startupRepo.recordDeliverable(startup.id, {
        serviceType: 'token_launch_kit',
        title: `${kit.content.strategy.tokenName} ($${kit.content.strategy.tokenSymbol}) — Token Launch Kit`,
        contentMarkdown: kit.contentMarkdown,
        versionNumber: kit.version,
        metadata: { kitId: kit.id, readinessScore: kit.readinessScore, isAppropriate: kit.content.isAppropriate },
      });
    }

    return updatedKit;
  }
}
