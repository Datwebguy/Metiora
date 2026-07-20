import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import { OkxRating } from '@core/domain/okx-integration.js';
import { ApplicationError } from '@shared/errors/application-error.js';

const DEFAULT_ASP_AGENT_ID = 'metiora-ai-operating-partner';

export class RatingManager {
  constructor(private readonly repo: IOkxIntegrationRepository) {}

  public async recordRating(
    taskId: string,
    ratingScore: number,
    ratedByAgentId: string,
    reviewText?: string,
    ratedAgentId: string = DEFAULT_ASP_AGENT_ID
  ): Promise<OkxRating> {
    if (ratingScore < 1 || ratingScore > 5) {
      throw new ApplicationError(`Rating score must be between 1.0 and 5.0. Received ${ratingScore}.`);
    }

    const task = await this.repo.findTaskById(taskId);
    if (!task) {
      throw new ApplicationError(`Cannot rate unknown task '${taskId}'.`);
    }

    const rating: OkxRating = {
      taskId,
      ratingScore,
      ratedByAgentId,
      ratedAgentId,
      reviewText,
      createdAt: new Date(),
    };

    return this.repo.saveRating(rating);
  }

  public async calculateReputationScore(
    agentId: string = DEFAULT_ASP_AGENT_ID
  ): Promise<{ averageScore: number; totalRatings: number; agentId: string }> {
    const ratings = await this.repo.getRatingsForAgent(agentId);
    if (ratings.length === 0) {
      return { averageScore: 5.0, totalRatings: 0, agentId };
    }

    const totalSum = ratings.reduce((sum, r) => sum + r.ratingScore, 0);
    const averageScore = Math.round((totalSum / ratings.length) * 100) / 100;

    return { averageScore, totalRatings: ratings.length, agentId };
  }
}
