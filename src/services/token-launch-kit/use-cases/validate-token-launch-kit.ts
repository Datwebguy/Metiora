import { TokenLaunchKitContent } from '@core/domain/token-launch-kit.js';

export interface TokenLaunchKitValidationResult {
  isValid: boolean;
  conflicts: string[];
  missingElements: string[];
}

export class ValidateTokenLaunchKit {
  public execute(content: TokenLaunchKitContent): TokenLaunchKitValidationResult {
    const conflicts: string[] = [];
    const missingElements: string[] = [];

    if (!content.strategy.tokenSymbol) missingElements.push('Token Symbol');
    if (!content.strategy.tokenName) missingElements.push('Token Name');
    if (content.utilityModel.coreUtilities.length === 0) missingElements.push('Core Utilities');

    if (content.isAppropriate) {
      const totalPercentage = content.distributionStrategy.allocations.reduce((sum, a) => sum + a.percentage, 0);
      if (totalPercentage !== 100) {
        conflicts.push(`Distribution allocations sum to ${totalPercentage}%, but must equal 100%.`);
      }
    }

    return {
      isValid: missingElements.length === 0 && conflicts.length === 0,
      conflicts,
      missingElements,
    };
  }
}
