import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { StartupMemoryAggregate } from '@core/domain/startup-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ListFounderStartups {
  constructor(
    private readonly startupRepository: IStartupMemoryRepository,
    private readonly userRepository: IUserMemoryRepository
  ) {}

  public async execute(founderProfileId: string): Promise<StartupMemoryAggregate[]> {
    const founder = await this.userRepository.findById(founderProfileId);
    if (!founder) {
      throw new ApplicationError(`Founder profile not found for ID '${founderProfileId}'.`);
    }

    return this.startupRepository.findByFounderId(founderProfileId);
  }
}
