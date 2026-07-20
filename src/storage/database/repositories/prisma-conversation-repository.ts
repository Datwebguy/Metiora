import { PrismaClient } from '@prisma/client';
import { IConversationRepository } from '@core/ports/conversation-repository.js';
import {
  ConversationSessionAggregate,
  ConversationMessageDomain,
  MessageSender,
  SessionStatus,
  ConversationMode,
} from '@core/domain/conversation.js';

export class PrismaConversationRepository implements IConversationRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async createSession(session: ConversationSessionAggregate): Promise<ConversationSessionAggregate> {
    const created = await this.prisma.conversationSession.create({
      data: {
        id: session.id,
        founderProfileId: session.founderProfileId,
        startupProfileId: session.startupProfileId,
        status: session.status,
        currentMode: session.currentMode,
        currentObjective: session.currentObjective,
        currentWorkflow: session.currentWorkflow,
        resumePointJson: session.resumePoint as any,
      },
      include: {
        messages: true,
      },
    });

    return this.mapToAggregate(created);
  }

  public async findById(id: string): Promise<ConversationSessionAggregate | null> {
    const raw = await this.prisma.conversationSession.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  public async updateSession(session: ConversationSessionAggregate): Promise<ConversationSessionAggregate> {
    const updated = await this.prisma.conversationSession.update({
      where: { id: session.id },
      data: {
        status: session.status,
        currentMode: session.currentMode,
        currentObjective: session.currentObjective,
        currentWorkflow: session.currentWorkflow,
        resumePointJson: session.resumePoint as any,
        updatedAt: new Date(),
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    return this.mapToAggregate(updated);
  }

  public async addMessage(
    sessionId: string,
    sender: MessageSender,
    contentText: string,
    questionKey?: string
  ): Promise<ConversationMessageDomain> {
    const created = await this.prisma.conversationMessage.create({
      data: {
        sessionId,
        sender,
        contentText,
        questionKey,
      },
    });

    return {
      id: created.id,
      sessionId: created.sessionId,
      sender: created.sender as MessageSender,
      contentText: created.contentText,
      questionKey: created.questionKey || undefined,
      isAnswered: created.isAnswered,
      createdAt: created.createdAt,
    };
  }

  public async markQuestionAnswered(sessionId: string, questionKey: string): Promise<void> {
    await this.prisma.conversationMessage.updateMany({
      where: {
        sessionId,
        questionKey,
      },
      data: {
        isAnswered: true,
      },
    });
  }

  public async getActiveSession(founderProfileId: string, startupProfileId: string): Promise<ConversationSessionAggregate | null> {
    const raw = await this.prisma.conversationSession.findFirst({
      where: {
        founderProfileId,
        startupProfileId,
        status: 'ACTIVE',
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!raw) return null;
    return this.mapToAggregate(raw);
  }

  private mapToAggregate(raw: any): ConversationSessionAggregate {
    return {
      id: raw.id,
      founderProfileId: raw.founderProfileId,
      startupProfileId: raw.startupProfileId,
      status: raw.status as SessionStatus,
      currentMode: raw.currentMode as ConversationMode,
      currentObjective: raw.currentObjective || undefined,
      currentWorkflow: raw.currentWorkflow || undefined,
      resumePoint: (raw.resumePointJson as any) || undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      messages: (raw.messages || []).map((m: any) => ({
        id: m.id,
        sessionId: m.sessionId,
        sender: m.sender as MessageSender,
        contentText: m.contentText,
        questionKey: m.questionKey || undefined,
        isAnswered: m.isAnswered,
        createdAt: m.createdAt,
      })),
    };
  }
}
