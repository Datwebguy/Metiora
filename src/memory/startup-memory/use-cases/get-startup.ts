import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupMemoryAggregate } from '@core/domain/startup-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetStartup {
  constructor(private readonly repository: IStartupMemoryRepository) {}

  public async execute(startupId: string): Promise<StartupMemoryAggregate> {
    const startup = await this.repository.findById(startupId);
    if (!startup) {
      throw new ApplicationError(`Startup profile not found for ID '${startupId}'.`);
    }
    return startup;
  }
}
