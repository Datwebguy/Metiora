import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { FounderMemoryVersionRecord } from '@core/domain/user-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetMemoryHistory {
  constructor(private readonly repository: IUserMemoryRepository) {}

  public async execute(founderId: string): Promise<FounderMemoryVersionRecord[]> {
    const history = await this.repository.getVersionHistory(founderId);
    if (!history || history.length === 0) {
      throw new ApplicationError(`No version history found for founder ID '${founderId}'.`);
    }
    return history;
  }
}
