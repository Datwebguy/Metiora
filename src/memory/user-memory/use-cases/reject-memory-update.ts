import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { FounderPendingUpdateProposal } from '@core/domain/user-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class RejectMemoryUpdate {
  constructor(private readonly repository: IUserMemoryRepository) {}

  public async execute(proposalId: string): Promise<FounderPendingUpdateProposal> {
    const proposal = await this.repository.getPendingUpdateById(proposalId);
    if (!proposal) {
      throw new ApplicationError(`Pending update proposal not found for ID '${proposalId}'.`);
    }

    if (proposal.status !== 'PENDING') {
      throw new ApplicationError(`Proposal '${proposalId}' is already ${proposal.status}.`);
    }

    return this.repository.resolvePendingUpdate(proposalId, 'REJECTED');
  }
}
