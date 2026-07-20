import { UserMemorySnapshot } from './user-memory.js';
import { StartupMemorySnapshot } from './startup-memory.js';
import { ExecutionPlan } from './business-intelligence.js';

export type ConversationMode = 
  | 'STRATEGIC_DISCUSSION'
  | 'INFORMATION_COLLECTION'
  | 'REVIEW'
  | 'CLARIFICATION'
  | 'MEMORY_CONFIRMATION'
  | 'RECOMMENDATION'
  | 'STATUS_UPDATE'
  | 'WORKFLOW_COMPLETION';

export type SessionStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED';
export type MessageSender = 'FOUNDER' | 'AGENT';

export interface PendingQuestion {
  questionKey: string;
  questionText: string;
  targetField: string;
  isAnswered: boolean;
  reasoning: string;
}

export interface ResumePoint {
  pausedMode: ConversationMode;
  pausedObjective?: string;
  pausedWorkflow?: string;
  pendingQuestions: PendingQuestion[];
  stepIndex: number;
}

export interface ConversationMessageDomain {
  id: string;
  sessionId: string;
  sender: MessageSender;
  contentText: string;
  questionKey?: string;
  isAnswered: boolean;
  createdAt: Date;
}

export interface ConversationSessionAggregate {
  id: string;
  founderProfileId: string;
  startupProfileId: string;
  status: SessionStatus;
  currentMode: ConversationMode;
  currentObjective?: string;
  currentWorkflow?: string;
  resumePoint?: ResumePoint;
  createdAt: Date;
  updatedAt: Date;
  messages: ConversationMessageDomain[];
}

export interface ConversationContext {
  session: ConversationSessionAggregate;
  userSnapshot: UserMemorySnapshot;
  startupSnapshot: StartupMemorySnapshot;
  executionPlan?: ExecutionPlan;
}

export interface ConversationTurnResponse {
  sessionId: string;
  responseMessage: string;
  mode: ConversationMode;
  questionToFounder?: PendingQuestion;
  isReadyForWorkflow: boolean;
  targetWorkflow?: string;
  executionPlan?: ExecutionPlan;
}

export interface ConversationSummary {
  sessionId: string;
  founderId: string;
  startupId: string;
  totalTurns: number;
  objective?: string;
  workflow?: string;
  status: SessionStatus;
  keyInsights: string[];
}
