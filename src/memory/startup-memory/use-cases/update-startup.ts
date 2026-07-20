import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupMemoryAggregate, StartupPendingUpdateProposal } from '@core/domain/startup-memory.js';
import { StartupConflictDetector } from '../domain/startup-conflict-detector.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface UpdateStartupDTO {
  startupId: string;
  incomingData: Partial<StartupMemoryAggregate>;
  source?: string;
  requireApproval?: boolean;
}

export type StartupUpdateResult =
  | { type: 'UPDATED'; startup: StartupMemoryAggregate }
  | { type: 'PROPOSAL_CREATED'; proposal: StartupPendingUpdateProposal };

export class UpdateStartup {
  private conflictDetector: StartupConflictDetector;

  constructor(private readonly repository: IStartupMemoryRepository) {
    this.conflictDetector = new StartupConflictDetector();
  }

  public async execute(dto: UpdateStartupDTO): Promise<StartupUpdateResult> {
    const existing = await this.repository.findById(dto.startupId);
    if (!existing) {
      throw new ApplicationError(`Startup profile not found for ID '${dto.startupId}'.`);
    }

    const conflicts = this.conflictDetector.detectConflicts(existing, dto.incomingData);

    if (conflicts.length > 0 || dto.requireApproval) {
      const proposal = await this.repository.createPendingUpdate({
        startupProfileId: dto.startupId,
        proposedData: dto.incomingData,
        conflicts,
        status: 'PENDING',
        source: dto.source || 'ai_inferred',
      });
      return { type: 'PROPOSAL_CREATED', proposal };
    }

    const updated: StartupMemoryAggregate = {
      ...existing,
      version: existing.version + 1,
      updatedAt: new Date(),
      identity: {
        ...existing.identity,
        ...(dto.incomingData.identity || {}),
      },
      vision: {
        ...existing.vision,
        ...(dto.incomingData.vision || {}),
      },
      problem: {
        ...existing.problem,
        ...(dto.incomingData.problem || {}),
      },
      solution: {
        ...existing.solution,
        ...(dto.incomingData.solution || {}),
      },
      businessModel: {
        ...existing.businessModel,
        ...(dto.incomingData.businessModel || {}),
      },
    };

    const saved = await this.repository.updateStartup(dto.startupId, updated, 'Direct startup update applied without conflicts');
    return { type: 'UPDATED', startup: saved };
  }
}
