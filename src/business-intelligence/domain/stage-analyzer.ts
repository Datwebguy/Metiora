import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { StartupStage } from '@core/domain/business-intelligence.js';

export class StageAnalyzer {
  public determineStage(snapshot: StartupMemorySnapshot): StartupStage {
    const rawStage = snapshot.companyProfile.stage?.toUpperCase();
    if (rawStage && ['IDEATION', 'VALIDATION', 'BUILDING', 'MVP', 'BETA', 'EARLY_TRACTION', 'GROWTH', 'SCALING'].includes(rawStage)) {
      return rawStage as StartupStage;
    }

    // Heuristic stage inference if stage field is default
    const hasProduct = Boolean(snapshot.problemAndSolution.productDescription);
    const hasFeatures = snapshot.problemAndSolution.coreFeatures.length > 0;
    const hasToken = Boolean(snapshot.tokenomics?.tokenSymbol);

    if (hasToken) return 'EARLY_TRACTION';
    if (hasProduct && hasFeatures) return 'MVP';
    if (hasProduct) return 'BUILDING';
    return 'IDEATION';
  }
}
