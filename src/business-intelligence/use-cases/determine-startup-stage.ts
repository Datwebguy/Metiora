import { StageAnalyzer } from '../domain/stage-analyzer.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { StartupStage } from '@core/domain/business-intelligence.js';

export class DetermineStartupStage {
  private stageAnalyzer: StageAnalyzer;

  constructor() {
    this.stageAnalyzer = new StageAnalyzer();
  }

  public execute(snapshot: StartupMemorySnapshot): StartupStage {
    return this.stageAnalyzer.determineStage(snapshot);
  }
}
