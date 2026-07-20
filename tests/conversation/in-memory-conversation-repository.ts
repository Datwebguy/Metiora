import { IConversationRepository } from '@core/ports/conversation-repository.js';
import {
  ConversationSessionAggregate,
  ConversationMessageDomain,
  MessageSender,
} from '@core/domain/conversation.js';

export class InMemoryConversationRepository implements IConversationRepository {
  private sessions: Map<string, ConversationSessionAggregate> = new Map();
  private messages: Map<string, ConversationMessageDomain[]> = new Map();

  public async createSession(session: ConversationSessionAggregate): Promise<ConversationSessionAggregate> {
    this.sessions.set(session.id, session);
    this.messages.set(session.id, []);
    return session;
  }

  public async findById(id: string): Promise<ConversationSessionAggregate | null> {
    const session = this.sessions.get(id);
    if (!session) return null;
    return {
      ...session,
      messages: this.messages.get(id) || [],
    };
  }

  public async updateSession(session: ConversationSessionAggregate): Promise<ConversationSessionAggregate> {
    this.sessions.set(session.id, session);
    return {
      ...session,
      messages: this.messages.get(session.id) || [],
    };
  }

  public async addMessage(
    sessionId: string,
    sender: MessageSender,
    contentText: string,
    questionKey?: string
  ): Promise<ConversationMessageDomain> {
    const created: ConversationMessageDomain = {
      id: crypto.randomUUID(),
      sessionId,
      sender,
      contentText,
      questionKey,
      isAnswered: false,
      createdAt: new Date(),
    };

    const existing = this.messages.get(sessionId) || [];
    this.messages.set(sessionId, [...existing, created]);

    const session = this.sessions.get(sessionId);
    if (session) {
      session.messages = [...existing, created];
      this.sessions.set(sessionId, session);
    }

    return created;
  }

  public async markQuestionAnswered(sessionId: string, questionKey: string): Promise<void> {
    const msgs = this.messages.get(sessionId) || [];
    for (const m of msgs) {
      if (m.questionKey === questionKey) {
        m.isAnswered = true;
      }
    }
  }

  public async getActiveSession(founderProfileId: string, startupProfileId: string): Promise<ConversationSessionAggregate | null> {
    for (const s of this.sessions.values()) {
      if (s.founderProfileId === founderProfileId && s.startupProfileId === startupProfileId && s.status === 'ACTIVE') {
        return {
          ...s,
          messages: this.messages.get(s.id) || [],
        };
      }
    }
    return null;
  }
}
