import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { ConversationSessionAggregate } from '@core/domain/conversation.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class ResumeConversation {
  constructor(private readonly conversationRepo: IConversationRepository) {}

  public async execute(sessionId: string): Promise<ConversationSessionAggregate> {
    const session = await this.conversationRepo.findById(sessionId);
    if (!session) {
      throw new ApplicationError(`Conversation session not found for ID '${sessionId}'.`);
    }

    session.status = 'ACTIVE';
    session.updatedAt = new Date();

    return this.conversationRepo.updateSession(session);
  }
}
