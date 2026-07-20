import { InvestorPackageContent } from '@core/domain/investor-ready.js';

export interface InvestorPackageValidationResult {
  isValid: boolean;
  conflicts: string[];
  missingElements: string[];
}

export class ValidateInvestorPackage {
  public execute(content: InvestorPackageContent): InvestorPackageValidationResult {
    const conflicts: string[] = [];
    const missingElements: string[] = [];

    if (!content.fundingAsk.targetRaiseAmount) missingElements.push('Target Raise Amount');
    if (!content.executiveSummary.companyName) missingElements.push('Company Name');
    if (content.fundingAsk.useOfFundsBreakdown.length === 0) missingElements.push('Use of Funds Breakdown');

    // Check financial consistency
    const totalPercentage = content.fundingAsk.useOfFundsBreakdown.reduce((sum, u) => sum + u.percentage, 0);
    if (totalPercentage !== 100) {
      conflicts.push(`Use of funds percentages sum to ${totalPercentage}%, but must equal 100%.`);
    }

    return {
      isValid: missingElements.length === 0 && conflicts.length === 0,
      conflicts,
      missingElements,
    };
  }
}
