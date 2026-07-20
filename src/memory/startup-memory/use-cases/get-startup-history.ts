import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupMemoryVersionRecord } from '@core/domain/startup-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetStartupHistory {
  constructor(private readonly repository: IStartupMemoryRepository) {}

  public async execute(startupId: string): Promise<StartupMemoryVersionRecord[]> {
    const history = await this.repository.getVersionHistory(startupId);
    if (!history || history.length === 0) {
      throw new ApplicationError(`No version history found for startup ID '${startupId}'.`);
    }
    return history;
  }
}
