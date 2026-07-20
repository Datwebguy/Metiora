import {
  TokenLaunchKitAggregate,
  TokenLaunchKitVersionRecord,
} from '../domain/token-launch-kit.js';

export interface ITokenLaunchKitRepository {
  createKit(kitAgg: TokenLaunchKitAggregate): Promise<TokenLaunchKitAggregate>;
  findById(id: string): Promise<TokenLaunchKitAggregate | null>;
  findByStartupId(startupProfileId: string): Promise<TokenLaunchKitAggregate | null>;
  updateKit(
    id: string,
    updated: TokenLaunchKitAggregate,
    changeSummary: string
  ): Promise<TokenLaunchKitAggregate>;
  getVersionHistory(kitId: string): Promise<TokenLaunchKitVersionRecord[]>;
}
