import { IntentClassifier } from '../domain/intent-classifier.js';
import { IntentAnalysisResult } from '@core/domain/business-intelligence.js';

export class DetectIntent {
  private classifier: IntentClassifier;

  constructor() {
    this.classifier = new IntentClassifier();
  }

  public execute(rawGoal: string): IntentAnalysisResult {
    return this.classifier.classifyIntent(rawGoal);
  }
}
