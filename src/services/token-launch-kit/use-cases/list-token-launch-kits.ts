import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { TokenLaunchKitVersionRecord } from '@core/domain/token-launch-kit.js';

export class ListTokenLaunchKits {
  constructor(private readonly tokenRepo: ITokenLaunchKitRepository) {}

  public async execute(kitId: string): Promise<TokenLaunchKitVersionRecord[]> {
    return this.tokenRepo.getVersionHistory(kitId);
  }
}
