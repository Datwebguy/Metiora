import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { ConversationTurnResponse } from '@core/domain/conversation.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { AnalyzeObjective } from '../../business-intelligence/use-cases/analyze-objective.js';
import { SnapshotBuilder } from '../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { QuestionSequencer } from '../domain/question-sequencer.js';
import { InterruptionHandler } from '../domain/interruption-handler.js';

export interface ContinueConversationDTO {
  sessionId: string;
  userMessage: string;
}

export class ContinueConversation {
  private analyzeObjective: AnalyzeObjective;
  private questionSequencer: QuestionSequencer;
  private interruptionHandler: InterruptionHandler;

  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.analyzeObjective = new AnalyzeObjective();
    this.questionSequencer = new QuestionSequencer();
    this.interruptionHandler = new InterruptionHandler();
  }

  public async execute(dto: ContinueConversationDTO): Promise<ConversationTurnResponse> {
    const session = await this.conversationRepo.findById(dto.sessionId);
    if (!session) {
      throw new ApplicationError(`Conversation session not found for ID '${dto.sessionId}'.`);
    }

    if (session.status === 'COMPLETED') {
      throw new ApplicationError(`Conversation session '${dto.sessionId}' has already completed.`);
    }

    // Interruption check
    if (this.interruptionHandler.isPauseCommand(dto.userMessage)) {
      session.status = 'PAUSED';
      session.resumePoint = this.interruptionHandler.createResumePoint(session);
      await this.conversationRepo.updateSession(session);
      await this.conversationRepo.addMessage(dto.sessionId, 'FOUNDER', dto.userMessage);

      const pauseMsg = "Conversation paused. Your progress has been saved. Whenever you're ready, say 'resume' to pick up where we left off.";
      await this.conversationRepo.addMessage(dto.sessionId, 'AGENT', pauseMsg);

      return {
        sessionId: session.id,
        responseMessage: pauseMsg,
        mode: 'STATUS_UPDATE',
        isReadyForWorkflow: false,
      };
    }

    // Resume check
    if (session.status === 'PAUSED' && this.interruptionHandler.isResumeCommand(dto.userMessage)) {
      session.status = 'ACTIVE';
      await this.conversationRepo.updateSession(session);
      await this.conversationRepo.addMessage(dto.sessionId, 'FOUNDER', dto.userMessage);

      const resumeMsg = "Resuming our conversation. Let's continue from where we left off.";
      await this.conversationRepo.addMessage(dto.sessionId, 'AGENT', resumeMsg);

      return {
        sessionId: session.id,
        responseMessage: resumeMsg,
        mode: session.currentMode,
        isReadyForWorkflow: false,
      };
    }

    // Normal conversation turn
    await this.conversationRepo.addMessage(dto.sessionId, 'FOUNDER', dto.userMessage);

    const founder = await this.userRepo.findById(session.founderProfileId);
    const startup = await this.startupRepo.findById(session.startupProfileId);
    if (!founder || !startup) {
      throw new ApplicationError('Founder or Startup profile missing for conversation context.');
    }

    const userSnapshot = SnapshotBuilder.buildSnapshot(founder);
    const startupSnapshot = StartupSnapshotBuilder.buildSnapshot(startup);

    const biAnalysis = this.analyzeObjective.execute(
      dto.userMessage || session.currentObjective || 'Strategic Guidance',
      startupSnapshot,
      userSnapshot
    );

    const nextQuestion = this.questionSequencer.determineNextQuestion(
      biAnalysis.executionPlan.missingDependencies,
      userSnapshot,
      startupSnapshot
    );

    session.currentMode = nextQuestion ? 'INFORMATION_COLLECTION' : 'RECOMMENDATION';
    session.currentObjective = biAnalysis.executionPlan.objective;
    session.currentWorkflow = biAnalysis.executionPlan.recommendedService;
    session.updatedAt = new Date();
    await this.conversationRepo.updateSession(session);

    let agentResponseText = '';
    if (nextQuestion) {
      agentResponseText = `${nextQuestion.questionText}`;
      await this.conversationRepo.addMessage(session.id, 'AGENT', agentResponseText, nextQuestion.questionKey);
    } else {
      agentResponseText = `All required context for ${biAnalysis.executionPlan.objective} is complete. Ready to hand off execution to service: ${biAnalysis.executionPlan.recommendedService || 'strategic_guidance'}.`;
      await this.conversationRepo.addMessage(session.id, 'AGENT', agentResponseText);
    }

    return {
      sessionId: session.id,
      responseMessage: agentResponseText,
      mode: session.currentMode,
      questionToFounder: nextQuestion,
      isReadyForWorkflow: !nextQuestion,
      targetWorkflow: biAnalysis.executionPlan.recommendedService,
      executionPlan: biAnalysis.executionPlan,
    };
  }
}
