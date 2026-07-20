import { QuestionSequencer } from '../domain/question-sequencer.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { PendingQuestion } from '@core/domain/conversation.js';

export class DetermineNextQuestion {
  private sequencer: QuestionSequencer;

  constructor() {
    this.sequencer = new QuestionSequencer();
  }

  public execute(
    missingDependencies: string[],
    userSnapshot: UserMemorySnapshot,
    startupSnapshot: StartupMemorySnapshot
  ): PendingQuestion | undefined {
    return this.sequencer.determineNextQuestion(missingDependencies, userSnapshot, startupSnapshot);
  }
}
