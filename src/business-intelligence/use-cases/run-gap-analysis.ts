import { GapDetector } from '../domain/gap-detector.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { StrategicObjective, GapAnalysisResult } from '@core/domain/business-intelligence.js';

export class RunGapAnalysis {
  private gapDetector: GapDetector;

  constructor() {
    this.gapDetector = new GapDetector();
  }

  public execute(snapshot: StartupMemorySnapshot, objective: StrategicObjective): GapAnalysisResult {
    return this.gapDetector.runGapAnalysis(snapshot, objective);
  }
}
