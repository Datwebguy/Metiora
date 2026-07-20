import { ReadinessEvaluator } from '../domain/readiness-evaluator.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { StrategicObjective, ReadinessAssessment } from '@core/domain/business-intelligence.js';

export class AnalyzeReadiness {
  private readinessEvaluator: ReadinessEvaluator;

  constructor() {
    this.readinessEvaluator = new ReadinessEvaluator();
  }

  public execute(snapshot: StartupMemorySnapshot, objective: StrategicObjective): ReadinessAssessment {
    return this.readinessEvaluator.evaluateReadiness(snapshot, objective);
  }
}
