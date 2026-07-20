import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { DependencyAnalysisResult } from '@core/domain/business-intelligence.js';

export class DependencyChecker {
  public checkWorkflowDependencies(snapshot: StartupMemorySnapshot, targetWorkflow: string): DependencyAnalysisResult {
    const missingPrerequisites: string[] = [];

    // All workflows require core identity, mission, and problem
    if (!snapshot.companyProfile.name) missingPrerequisites.push('Startup Name');
    if (!snapshot.foundation.mission) missingPrerequisites.push('Mission Statement');
    if (!snapshot.problemAndSolution.problemStatement) missingPrerequisites.push('Problem Statement');

    if (targetWorkflow === 'investor_ready') {
      if (!snapshot.marketAndCustomers.businessModel) missingPrerequisites.push('Business Model');
      if (!snapshot.problemAndSolution.productDescription) missingPrerequisites.push('Product Description');
    } else if (targetWorkflow === 'token_launch_kit') {
      if (!snapshot.marketAndCustomers.businessModel) missingPrerequisites.push('Business Model');
    }

    const dependenciesResolved = missingPrerequisites.length === 0;

    return {
      targetWorkflow,
      dependenciesResolved,
      missingPrerequisites,
      canProceed: dependenciesResolved,
    };
  }
}
