import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { ConversationSessionAggregate } from '@core/domain/conversation.js';
import { InterruptionHandler } from '../domain/interruption-handler.js';
import { ApplicationError } from '@shared/errors/application-error.js';

export class PauseConversation {
  private interruptionHandler: InterruptionHandler;

  constructor(private readonly conversationRepo: IConversationRepository) {
    this.interruptionHandler = new InterruptionHandler();
  }

  public async execute(sessionId: string): Promise<ConversationSessionAggregate> {
    const session = await this.conversationRepo.findById(sessionId);
    if (!session) {
      throw new ApplicationError(`Conversation session not found for ID '${sessionId}'.`);
    }

    session.status = 'PAUSED';
    session.resumePoint = this.interruptionHandler.createResumePoint(session);
    session.updatedAt = new Date();

    return this.conversationRepo.updateSession(session);
  }
}
