import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { FounderProfileAggregate, FounderPendingUpdateProposal } from '@core/domain/user-memory.js';
import { ConflictDetector } from '../domain/conflict-detector.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export interface UpdateFounderProfileDTO {
  founderId: string;
  incomingData: Partial<FounderProfileAggregate>;
  source?: string;
  requireApproval?: boolean;
}

export type UpdateResult = 
  | { type: 'UPDATED'; profile: FounderProfileAggregate }
  | { type: 'PROPOSAL_CREATED'; proposal: FounderPendingUpdateProposal };

export class UpdateFounderProfile {
  private conflictDetector: ConflictDetector;

  constructor(private readonly repository: IUserMemoryRepository) {
    this.conflictDetector = new ConflictDetector();
  }

  public async execute(dto: UpdateFounderProfileDTO): Promise<UpdateResult> {
    const existing = await this.repository.findById(dto.founderId);
    if (!existing) {
      throw new ApplicationError(`Founder profile not found for ID '${dto.founderId}'.`);
    }

    const conflicts = this.conflictDetector.detectConflicts(existing, dto.incomingData);

    // If conflicts exist or approval explicitly required, create pending proposal
    if (conflicts.length > 0 || dto.requireApproval) {
      const proposal = await this.repository.createPendingUpdate({
        founderProfileId: dto.founderId,
        proposedData: dto.incomingData,
        conflicts,
        status: 'PENDING',
        source: dto.source || 'ai_inferred',
      });
      return { type: 'PROPOSAL_CREATED', proposal };
    }

    // Otherwise apply update directly and bump version
    const updated: FounderProfileAggregate = {
      ...existing,
      version: existing.version + 1,
      updatedAt: new Date(),
      identity: {
        ...existing.identity,
        ...dto.incomingData.identity,
      },
      professional: {
        ...existing.professional,
        ...dto.incomingData.professional,
      },
    };

    const saved = await this.repository.updateProfile(dto.founderId, updated, 'Direct update applied without conflicts');
    return { type: 'UPDATED', profile: saved };
  }
}
