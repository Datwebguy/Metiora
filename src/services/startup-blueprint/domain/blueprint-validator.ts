import { StartupBlueprintContent, BlueprintValidationResult } from '@core/domain/startup-blueprint.js';

export class BlueprintValidator {
  public validate(content: StartupBlueprintContent): BlueprintValidationResult {
    const missingSections: string[] = [];
    const conflicts: string[] = [];
    const errors: string[] = [];

    if (!content.executiveSummary.startupName) missingSections.push('Startup Name');
    if (!content.executiveSummary.industry) missingSections.push('Industry');
    if (!content.problem.problemStatement) missingSections.push('Problem Statement');
    if (!content.solution.productDescription) missingSections.push('Product Description');
    if (!content.businessModel.businessModel) missingSections.push('Business Model');
    if (!content.growthStrategy.targetCustomers) missingSections.push('Target Customers');

    // Consistency Checks
    if (
      content.problem.problemStatement &&
      content.solution.productDescription &&
      content.problem.problemStatement.toLowerCase().includes('b2c') &&
      content.growthStrategy.targetCustomers.toLowerCase().includes('enterprise b2b')
    ) {
      conflicts.push('Target customer profile (B2B) conflicts with problem statement domain (B2C).');
    }

    const isValid = missingSections.length === 0 && conflicts.length === 0 && errors.length === 0;

    return {
      isValid,
      missingSections,
      conflicts,
      errors,
    };
  }
}
