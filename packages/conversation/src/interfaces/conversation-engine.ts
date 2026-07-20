import { TaskDescriptor, DeliverableAsset } from '@metiora/core';

export interface ConversationTurnRequest {
  founderId: string;
  startupId: string;
  userMessage: string;
  conversationId?: string;
}

export interface ConversationTurnResponse {
  conversationId: string;
  responseMessage: string;
  task?: TaskDescriptor;
  deliverables?: DeliverableAsset[];
  recommendedNextActions: string[];
  missingQuestions?: string[];
}

export interface IConversationEngine {
  processTurn(request: ConversationTurnRequest): Promise<ConversationTurnResponse>;
}
