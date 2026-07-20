import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { StrategicObjective, GapAnalysisResult } from '@core/domain/business-intelligence.js';

export class GapDetector {
  public runGapAnalysis(snapshot: StartupMemorySnapshot, objective: StrategicObjective): GapAnalysisResult {
    const missingFields: string[] = [];
    const missingDeliverables: string[] = [];

    if (!snapshot.foundation.mission) missingFields.push('mission');
    if (!snapshot.problemAndSolution.problemStatement) missingFields.push('problemStatement');
    if (!snapshot.problemAndSolution.productDescription) missingFields.push('productDescription');
    if (!snapshot.marketAndCustomers.businessModel) missingFields.push('businessModel');

    if (objective === 'RAISE_INVESTMENT') {
      if (!snapshot.problemAndSolution.uniqueValueProp) missingFields.push('uniqueValueProp');
      if (snapshot.marketAndCustomers.competitors.length === 0) missingFields.push('competitors');
      missingDeliverables.push('Investor Ready Package (Pitch Deck & Memo)');
    } else if (objective === 'APPLY_FOR_GRANTS') {
      missingDeliverables.push('Grant Builder Narrative');
    } else if (objective === 'BUILD_PARTNERSHIPS') {
      missingDeliverables.push('Partnership Studio Proposal');
    } else if (objective === 'LAUNCH_TOKEN') {
      if (!snapshot.tokenomics?.tokenSymbol) missingFields.push('tokenomics');
      missingDeliverables.push('Token Launch Kit');
    }

    const impactSeverity = missingFields.length > 3 ? 'HIGH' : missingFields.length > 1 ? 'MEDIUM' : 'LOW';

    return {
      objective,
      missingFields,
      missingDeliverables,
      impactSeverity,
    };
  }
}
