import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupPendingUpdateProposal } from '@core/domain/startup-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class RejectStartupUpdate {
  constructor(private readonly repository: IStartupMemoryRepository) {}

  public async execute(proposalId: string): Promise<StartupPendingUpdateProposal> {
    const proposal = await this.repository.getPendingUpdateById(proposalId);
    if (!proposal) {
      throw new ApplicationError(`Pending startup update proposal not found for ID '${proposalId}'.`);
    }

    if (proposal.status !== 'PENDING') {
      throw new ApplicationError(`Proposal '${proposalId}' is already ${proposal.status}.`);
    }

    return this.repository.resolvePendingUpdate(proposalId, 'REJECTED');
  }
}
