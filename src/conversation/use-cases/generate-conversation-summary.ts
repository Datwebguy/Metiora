import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { ConversationSummary } from '@core/domain/conversation.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class GenerateConversationSummary {
  constructor(private readonly conversationRepo: IConversationRepository) {}

  public async execute(sessionId: string): Promise<ConversationSummary> {
    const session = await this.conversationRepo.findById(sessionId);
    if (!session) {
      throw new ApplicationError(`Conversation session not found for ID '${sessionId}'.`);
    }

    const keyInsights = session.messages
      .filter((m) => m.sender === 'FOUNDER')
      .slice(-3)
      .map((m) => m.contentText);

    return {
      sessionId: session.id,
      founderId: session.founderProfileId,
      startupId: session.startupProfileId,
      totalTurns: session.messages.length,
      objective: session.currentObjective,
      workflow: session.currentWorkflow,
      status: session.status,
      keyInsights,
    };
  }
}
