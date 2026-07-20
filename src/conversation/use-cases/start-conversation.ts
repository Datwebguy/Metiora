import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { ConversationSessionAggregate, ConversationTurnResponse } from '@core/domain/conversation.js';
import { ApplicationError } from '@shared/errors/application-error.js';
import { AnalyzeObjective } from '../../business-intelligence/use-cases/analyze-objective.js';
import { SnapshotBuilder } from '../../memory/user-memory/domain/snapshot-builder.js';
import { StartupSnapshotBuilder } from '../../memory/startup-memory/domain/startup-snapshot-builder.js';
import { QuestionSequencer } from '../domain/question-sequencer.js';

export interface StartConversationDTO {
  founderProfileId: string;
  startupProfileId: string;
  initialMessage: string;
}

export class StartConversation {
  private analyzeObjective: AnalyzeObjective;
  private questionSequencer: QuestionSequencer;

  constructor(
    private readonly conversationRepo: IConversationRepository,
    private readonly userRepo: IUserMemoryRepository,
    private readonly startupRepo: IStartupMemoryRepository
  ) {
    this.analyzeObjective = new AnalyzeObjective();
    this.questionSequencer = new QuestionSequencer();
  }

  public async execute(dto: StartConversationDTO): Promise<ConversationTurnResponse> {
    const founder = await this.userRepo.findById(dto.founderProfileId);
    if (!founder) {
      throw new ApplicationError(`Founder profile not found for ID '${dto.founderProfileId}'.`);
    }

    const startup = await this.startupRepo.findById(dto.startupProfileId);
    if (!startup) {
      throw new ApplicationError(`Startup profile not found for ID '${dto.startupProfileId}'.`);
    }

    const userSnapshot = SnapshotBuilder.buildSnapshot(founder);
    const startupSnapshot = StartupSnapshotBuilder.buildSnapshot(startup);

    // Coordinate with Business Intelligence
    const biAnalysis = this.analyzeObjective.execute(dto.initialMessage, startupSnapshot, userSnapshot);

    const now = new Date();
    const sessionId = crypto.randomUUID();

    const nextQuestion = this.questionSequencer.determineNextQuestion(
      biAnalysis.executionPlan.missingDependencies,
      userSnapshot,
      startupSnapshot
    );

    const newSession: ConversationSessionAggregate = {
      id: sessionId,
      founderProfileId: dto.founderProfileId,
      startupProfileId: dto.startupProfileId,
      status: 'ACTIVE',
      currentMode: nextQuestion ? 'INFORMATION_COLLECTION' : 'RECOMMENDATION',
      currentObjective: biAnalysis.executionPlan.objective,
      currentWorkflow: biAnalysis.executionPlan.recommendedService,
      createdAt: now,
      updatedAt: now,
      messages: [],
    };

    await this.conversationRepo.createSession(newSession);
    await this.conversationRepo.addMessage(sessionId, 'FOUNDER', dto.initialMessage);

    let agentResponseText = '';
    if (nextQuestion) {
      agentResponseText = `${nextQuestion.questionText}`;
      await this.conversationRepo.addMessage(sessionId, 'AGENT', agentResponseText, nextQuestion.questionKey);
    } else {
      agentResponseText = `I have completed the strategic analysis for your objective: ${biAnalysis.executionPlan.objective}. Recommended next step: ${biAnalysis.executionPlan.recommendedService || 'Strategic Guidance'}.`;
      await this.conversationRepo.addMessage(sessionId, 'AGENT', agentResponseText);
    }

    return {
      sessionId,
      responseMessage: agentResponseText,
      mode: newSession.currentMode,
      questionToFounder: nextQuestion,
      isReadyForWorkflow: !nextQuestion,
      targetWorkflow: biAnalysis.executionPlan.recommendedService,
      executionPlan: biAnalysis.executionPlan,
    };
  }
}
