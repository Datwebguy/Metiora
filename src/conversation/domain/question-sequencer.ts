import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { PendingQuestion } from '@core/domain/conversation.js';

export class QuestionSequencer {
  public determineNextQuestion(
    missingDependencies: string[],
    userSnapshot: UserMemorySnapshot,
    startupSnapshot: StartupMemorySnapshot
  ): PendingQuestion | undefined {
    if (missingDependencies.length === 0) {
      return undefined;
    }

    const firstMissing = missingDependencies[0];

    // Memory Awareness: Check if field is already filled in User Memory or Startup Memory with HIGH confidence
    if (userSnapshot.founderSummary.fullName && firstMissing.toLowerCase().includes('foundername')) {
      return undefined;
    }
    if (startupSnapshot.foundation.mission && firstMissing.toLowerCase().includes('mission')) {
      return undefined;
    }

    // Formulate 1 concise, focused question explaining why it is needed
    if (firstMissing.toLowerCase().includes('customer') || firstMissing.toLowerCase().includes('targetaudience')) {
      return {
        questionKey: 'targetAudience',
        questionText: 'To continue refining your strategic plan, I need one thing. Who is your primary target customer?',
        targetField: 'customers.targetAudience',
        isAnswered: false,
        reasoning: 'Target customer definition is required to align business strategy and investor narrative.',
      };
    }

    if (firstMissing.toLowerCase().includes('businessmodel')) {
      return {
        questionKey: 'businessModel',
        questionText: 'To prepare your startup assets, could you clarify your primary revenue and business model?',
        targetField: 'businessModel.businessModel',
        isAnswered: false,
        reasoning: 'Business model strategy is required before pitch deck generation.',
      };
    }

    if (firstMissing.toLowerCase().includes('problem')) {
      return {
        questionKey: 'problemStatement',
        questionText: 'What is the core market problem or pain point your startup solves?',
        targetField: 'problem.problemStatement',
        isAnswered: false,
        reasoning: 'A strong problem statement is the foundation of all startup materials.',
      };
    }

    // Generic fallback for any other missing dependency field
    return {
      questionKey: firstMissing.replace(/\s+/g, '_').toLowerCase(),
      questionText: `To move forward with your strategic objective, please provide details for: ${firstMissing}.`,
      targetField: firstMissing,
      isAnswered: false,
      reasoning: `Prerequisite field '${firstMissing}' is required for downstream execution.`,
    };
  }
}
