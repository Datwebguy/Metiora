import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupMemoryAggregate, StartupConflictDescriptor } from '@core/domain/startup-memory.js';
import { StartupConflictDetector } from '../domain/startup-conflict-detector.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface CompareStartupMemoryResult {
  startupId: string;
  hasConflicts: boolean;
  conflicts: StartupConflictDescriptor[];
}

export class CompareStartupMemory {
  private conflictDetector: StartupConflictDetector;

  constructor(private readonly repository: IStartupMemoryRepository) {
    this.conflictDetector = new StartupConflictDetector();
  }

  public async execute(startupId: string, incomingData: Partial<StartupMemoryAggregate>): Promise<CompareStartupMemoryResult> {
    const existing = await this.repository.findById(startupId);
    if (!existing) {
      throw new ApplicationError(`Startup profile not found for ID '${startupId}'.`);
    }

    const conflicts = this.conflictDetector.detectConflicts(existing, incomingData);
    return {
      startupId,
      hasConflicts: conflicts.length > 0,
      conflicts,
    };
  }
}
