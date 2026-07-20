import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { FounderProfileAggregate } from '@core/domain/user-memory.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ApproveMemoryUpdate {
  constructor(private readonly repository: IUserMemoryRepository) {}

  public async execute(proposalId: string): Promise<FounderProfileAggregate> {
    const proposal = await this.repository.getPendingUpdateById(proposalId);
    if (!proposal) {
      throw new ApplicationError(`Pending update proposal not found for ID '${proposalId}'.`);
    }

    if (proposal.status !== 'PENDING') {
      throw new ApplicationError(`Proposal '${proposalId}' is already ${proposal.status}.`);
    }

    const existingProfile = await this.repository.findById(proposal.founderProfileId);
    if (!existingProfile) {
      throw new ApplicationError(`Founder profile not found for ID '${proposal.founderProfileId}'.`);
    }

    // Merge proposed data cleanly into current aggregate
    const updatedProfile: FounderProfileAggregate = {
      ...existingProfile,
      version: existingProfile.version + 1,
      updatedAt: new Date(),
      identity: {
        ...existingProfile.identity,
        ...(proposal.proposedData.identity || {}),
      },
      professional: {
        ...existingProfile.professional,
        ...(proposal.proposedData.professional || {}),
      },
      personal: {
        ...existingProfile.personal,
        ...(proposal.proposedData.personal || {}),
      },
    };

    await this.repository.resolvePendingUpdate(proposalId, 'APPROVED');
    return this.repository.updateProfile(existingProfile.id, updatedProfile, `Approved proposal ${proposalId}`);
  }
}
