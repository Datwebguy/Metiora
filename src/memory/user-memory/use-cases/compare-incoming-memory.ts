import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { FounderProfileAggregate, ConflictDescriptor } from '@core/domain/user-memory.js';
import { ConflictDetector } from '../domain/conflict-detector.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface CompareMemoryResult {
  founderId: string;
  hasConflicts: boolean;
  conflicts: ConflictDescriptor[];
}

export class CompareIncomingMemory {
  private conflictDetector: ConflictDetector;

  constructor(private readonly repository: IUserMemoryRepository) {
    this.conflictDetector = new ConflictDetector();
  }

  public async execute(founderId: string, incomingData: Partial<FounderProfileAggregate>): Promise<CompareMemoryResult> {
    const existing = await this.repository.findById(founderId);
    if (!existing) {
      throw new ApplicationError(`Founder profile not found for ID '${founderId}'.`);
    }

    const conflicts = this.conflictDetector.detectConflicts(existing, incomingData);
    return {
      founderId,
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }
}
