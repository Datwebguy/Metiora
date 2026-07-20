import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import {
  TokenLaunchKitAggregate,
  TokenLaunchKitVersionRecord,
} from '@core/domain/token-launch-kit.js';

export class InMemoryTokenLaunchKitRepository implements ITokenLaunchKitRepository {
  private kits: Map<string, TokenLaunchKitAggregate> = new Map();
  private versions: Map<string, TokenLaunchKitVersionRecord[]> = new Map();

  public async createKit(kitAgg: TokenLaunchKitAggregate): Promise<TokenLaunchKitAggregate> {
    this.kits.set(kitAgg.id, kitAgg);

    const initialVersion: TokenLaunchKitVersionRecord = {
      id: crypto.randomUUID(),
      kitId: kitAgg.id,
      versionNumber: kitAgg.version,
      contentJson: kitAgg.content,
      contentMarkdown: kitAgg.contentMarkdown,
      changeSummary: 'Initial Token Launch Kit generation',
      createdAt: new Date(),
    };
    this.versions.set(kitAgg.id, [initialVersion]);

    return kitAgg;
  }

  public async findById(id: string): Promise<TokenLaunchKitAggregate | null> {
    return this.kits.get(id) || null;
  }

  public async findByStartupId(startupProfileId: string): Promise<TokenLaunchKitAggregate | null> {
    for (const kit of this.kits.values()) {
      if (kit.startupProfileId === startupProfileId) {
        return kit;
      }
    }
    return null;
  }

  public async updateKit(
    id: string,
    updated: TokenLaunchKitAggregate,
    changeSummary: string
  ): Promise<TokenLaunchKitAggregate> {
    this.kits.set(id, updated);

    const newVersion: TokenLaunchKitVersionRecord = {
      id: crypto.randomUUID(),
      kitId: id,
      versionNumber: updated.version,
      contentJson: updated.content,
      contentMarkdown: updated.contentMarkdown,
      changeSummary,
      createdAt: new Date(),
    };

    const existing = this.versions.get(id) || [];
    this.versions.set(id, [newVersion, ...existing]);

    return updated;
  }

  public async getVersionHistory(kitId: string): Promise<TokenLaunchKitVersionRecord[]> {
    return this.versions.get(kitId) || [];
  }
}
