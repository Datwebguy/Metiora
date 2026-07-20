import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { ConversationSessionAggregate } from '@core/domain/conversation.js';

export class SaveConversationContext {
  constructor(private readonly conversationRepo: IConversationRepository) {}

  public async execute(session: ConversationSessionAggregate): Promise<ConversationSessionAggregate> {
    session.updatedAt = new Date();
    return this.conversationRepo.updateSession(session);
  }
}
