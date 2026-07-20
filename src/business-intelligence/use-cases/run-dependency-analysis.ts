import { DependencyChecker } from '../domain/dependency-checker.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { DependencyAnalysisResult } from '@core/domain/business-intelligence.js';

export class RunDependencyAnalysis {
  private dependencyChecker: DependencyChecker;

  constructor() {
    this.dependencyChecker = new DependencyChecker();
  }

  public execute(snapshot: StartupMemorySnapshot, targetWorkflow: string): DependencyAnalysisResult {
    return this.dependencyChecker.checkWorkflowDependencies(snapshot, targetWorkflow);
  }
}
