import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { TokenLaunchKitAggregate } from '@core/domain/token-launch-kit.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetTokenLaunchKit {
  constructor(private readonly tokenRepo: ITokenLaunchKitRepository) {}

  public async execute(kitId: string): Promise<TokenLaunchKitAggregate> {
    const kit = await this.tokenRepo.findById(kitId);
    if (!kit) {
      throw new ApplicationError(`Token Launch Kit not found for ID '${kitId}'.`);
    }
    return kit;
  }
}
