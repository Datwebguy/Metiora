import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import { OkxNegotiation } from '@core/domain/okx-integration.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class NegotiationManager {
  constructor(private readonly repo: IOkxIntegrationRepository) {}

  public async initiateNegotiation(
    taskId: string,
    proposedPriceUsd: number,
    proposedTimelineMinutes: number
  ): Promise<OkxNegotiation> {
    const task = await this.repo.findTaskById(taskId);
    if (!task) {
      throw new ApplicationError(
        `Cannot negotiate: task '${taskId}' does not exist. Create the task first.`
      );
    }
    if (proposedPriceUsd <= 0) {
      throw new ApplicationError('Proposed price must be greater than zero.');
    }
    if (proposedTimelineMinutes <= 0) {
      throw new ApplicationError('Proposed timeline must be greater than zero minutes.');
    }

    const now = new Date();
    const negotiation: OkxNegotiation = {
      taskId,
      status: 'OPEN',
      proposedPriceUsd,
      proposedTimelineMinutes,
      history: [
        {
          timestamp: now,
          sender: 'REQUESTER_AGENT',
          action: 'PROPOSE_TERMS',
          priceUsd: proposedPriceUsd,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    return this.repo.saveNegotiation(negotiation);
  }

  public async acceptTerms(taskId: string): Promise<OkxNegotiation> {
    const neg = await this.repo.findNegotiationByTaskId(taskId);
    if (!neg) {
      throw new ApplicationError(`Negotiation not found for task ID '${taskId}'.`);
    }

    neg.status = 'ACCEPTED';
    neg.updatedAt = new Date();
    neg.history.push({
      timestamp: neg.updatedAt,
      sender: 'METIORA_ASP',
      action: 'ACCEPT_TERMS',
      priceUsd: neg.proposedPriceUsd,
    });

    return this.repo.saveNegotiation(neg);
  }
}
