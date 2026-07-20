import { ConsistencyChecker } from '../domain/consistency-checker.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { ConsistencyAnalysisResult } from '@core/domain/business-intelligence.js';

export class RunConsistencyAnalysis {
  private consistencyChecker: ConsistencyChecker;

  constructor() {
    this.consistencyChecker = new ConsistencyChecker();
  }

  public execute(startupSnapshot: StartupMemorySnapshot, userSnapshot: UserMemorySnapshot): ConsistencyAnalysisResult {
    return this.consistencyChecker.checkConsistency(startupSnapshot, userSnapshot);
  }
}
