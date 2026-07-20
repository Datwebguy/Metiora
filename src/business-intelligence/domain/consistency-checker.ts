import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';
import { ConsistencyAnalysisResult } from '@core/domain/business-intelligence.js';

export class ConsistencyChecker {
  public checkConsistency(
    startupSnapshot: StartupMemorySnapshot,
    userSnapshot: UserMemorySnapshot
  ): ConsistencyAnalysisResult {
    const conflicts: ConsistencyAnalysisResult['conflicts'] = [];

    // Check if founder industries match startup industry
    if (
      userSnapshot.professionalProfile.industries.length > 0 &&
      startupSnapshot.companyProfile.industry &&
      !userSnapshot.professionalProfile.industries.some(
        (ind) => ind.toLowerCase() === startupSnapshot.companyProfile.industry.toLowerCase()
      )
    ) {
      conflicts.push({
        locationA: `User Memory Industries: [${userSnapshot.professionalProfile.industries.join(', ')}]`,
        locationB: `Startup Memory Industry: '${startupSnapshot.companyProfile.industry}'`,
        description: `Founder's listed professional industries do not include the startup's target industry '${startupSnapshot.companyProfile.industry}'.`,
        severity: 'LOW',
      });
    }

    // Check if personal mission contradicts company mission keyword alignment
    if (userSnapshot.strategicVision.personalMission && startupSnapshot.foundation.mission) {
      const userMissionLower = userSnapshot.strategicVision.personalMission.toLowerCase();
      const companyMissionLower = startupSnapshot.foundation.mission.toLowerCase();

      if (userMissionLower.includes('web3') && companyMissionLower.includes('traditional web2')) {
        conflicts.push({
          locationA: `User Personal Mission: '${userSnapshot.strategicVision.personalMission}'`,
          locationB: `Startup Mission: '${startupSnapshot.foundation.mission}'`,
          description: 'Potential vision mismatch: Founder personal mission prioritizes Web3 while company mission targets Web2.',
          severity: 'HIGH',
        });
      }
    }

    return {
      hasContradictions: conflicts.length > 0,
      conflicts,
    };
  }
}
