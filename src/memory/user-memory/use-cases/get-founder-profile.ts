import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { FounderProfileAggregate } from '@core/domain/user-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GetFounderProfile {
  constructor(private readonly repository: IUserMemoryRepository) {}

  public async execute(founderId: string): Promise<FounderProfileAggregate> {
    const profile = await this.repository.findById(founderId);
    if (!profile) {
      throw new ApplicationError(`Founder profile not found for ID '${founderId}'.`);
    }
    return profile;
  }
}
