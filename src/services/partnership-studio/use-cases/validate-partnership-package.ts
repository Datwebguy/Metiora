import { PartnershipPackageContent } from '@core/domain/partnership-studio.js';

export interface PartnershipPackageValidationResult {
  isValid: boolean;
  conflicts: string[];
  missingElements: string[];
}

export class ValidatePartnershipPackage {
  public execute(content: PartnershipPackageContent): PartnershipPackageValidationResult {
    const conflicts: string[] = [];
    const missingElements: string[] = [];

    if (!content.proposal.title) missingElements.push('Proposal Title');
    if (!content.strategy.objective) missingElements.push('Partnership Objective');
    if (content.benefitsAnalysis.benefitsToPartner.length === 0) missingElements.push('Partner Benefits');

    return {
      isValid: missingElements.length === 0 && conflicts.length === 0,
      conflicts,
      missingElements,
    };
  }
}
