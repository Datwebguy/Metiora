import { GrantPackageContent } from '@core/domain/grant-builder.js';

export interface GrantPackageValidationResult {
  isValid: boolean;
  conflicts: string[];
  missingElements: string[];
}

export class ValidateGrantPackage {
  public execute(content: GrantPackageContent): GrantPackageValidationResult {
    const conflicts: string[] = [];
    const missingElements: string[] = [];

    if (!content.projectDescription.projectTitle) missingElements.push('Project Title');
    if (!content.budgetNarrative.requestedAmount) missingElements.push('Requested Amount');
    if (content.milestonePlan.milestones.length === 0) missingElements.push('Milestone Plan');

    return {
      isValid: missingElements.length === 0 && conflicts.length === 0,
      conflicts,
      missingElements,
    };
  }
}
