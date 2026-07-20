import {
  ConversationSessionAggregate,
  ConversationMessageDomain,
  MessageSender,
} from '../domain/conversation.js';

export interface IConversationRepository {
  createSession(session: ConversationSessionAggregate): Promise<ConversationSessionAggregate>;
  findById(id: string): Promise<ConversationSessionAggregate | null>;
  updateSession(session: ConversationSessionAggregate): Promise<ConversationSessionAggregate>;
  addMessage(sessionId: string, sender: MessageSender, contentText: string, questionKey?: string): Promise<ConversationMessageDomain>;
  markQuestionAnswered(sessionId: string, questionKey: string): Promise<void>;
  getActiveSession(founderProfileId: string, startupProfileId: string): Promise<ConversationSessionAggregate | null>;
}
