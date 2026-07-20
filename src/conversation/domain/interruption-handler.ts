import { ConversationSessionAggregate, ResumePoint } from '@core/domain/conversation.js';

export class InterruptionHandler {
  public isPauseCommand(messageText: string): boolean {
    const lower = messageText.toLowerCase();
    return (
      lower.includes('pause') ||
      lower.includes('continue tomorrow') ||
      lower.includes('stop for now') ||
      lower.includes('work on something else') ||
      lower.includes('hold on')
    );
  }

  public isResumeCommand(messageText: string): boolean {
    const lower = messageText.toLowerCase();
    return (
      lower.includes('resume') ||
      lower.includes('continue') ||
      lower.includes("let's get back") ||
      lower.includes('pick up where we left off')
    );
  }

  public createResumePoint(session: ConversationSessionAggregate): ResumePoint {
    return {
      pausedMode: session.currentMode,
      pausedObjective: session.currentObjective,
      pausedWorkflow: session.currentWorkflow,
      pendingQuestions: session.resumePoint?.pendingQuestions || [],
      stepIndex: session.resumePoint?.stepIndex || 0,
    };
  }
}
