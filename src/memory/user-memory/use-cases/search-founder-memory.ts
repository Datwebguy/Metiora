import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { FounderProfileAggregate } from '@core/domain/user-memory.js';

export class SearchFounderMemory {
  constructor(private readonly repository: IUserMemoryRepository) {}

  public async execute(query: string): Promise<FounderProfileAggregate[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }
    return this.repository.searchProfiles(query.trim());
  }
}
