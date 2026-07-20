import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartupMemoryAggregate } from '@core/domain/startup-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ApproveStartupUpdate {
  constructor(private readonly repository: IStartupMemoryRepository) {}

  public async execute(proposalId: string): Promise<StartupMemoryAggregate> {
    const proposal = await this.repository.getPendingUpdateById(proposalId);
    if (!proposal) {
      throw new ApplicationError(`Pending startup update proposal not found for ID '${proposalId}'.`);
    }

    if (proposal.status !== 'PENDING') {
      throw new ApplicationError(`Proposal '${proposalId}' is already ${proposal.status}.`);
    }

    const existing = await this.repository.findById(proposal.startupProfileId);
    if (!existing) {
      throw new ApplicationError(`Startup profile not found for ID '${proposal.startupProfileId}'.`);
    }

    const updated: StartupMemoryAggregate = {
      ...existing,
      version: existing.version + 1,
      updatedAt: new Date(),
      identity: {
        ...existing.identity,
        ...(proposal.proposedData.identity || {}),
      },
      vision: {
        ...existing.vision,
        ...(proposal.proposedData.vision || {}),
      },
      problem: {
        ...existing.problem,
        ...(proposal.proposedData.problem || {}),
      },
      solution: {
        ...existing.solution,
        ...(proposal.proposedData.solution || {}),
      },
      businessModel: {
        ...existing.businessModel,
        ...(proposal.proposedData.businessModel || {}),
      },
    };

    await this.repository.resolvePendingUpdate(proposalId, 'APPROVED');
    return this.repository.updateStartup(existing.id, updated, `Approved proposal ${proposalId}`);
  }
}
