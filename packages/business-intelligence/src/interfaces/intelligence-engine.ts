import { StartupMemoryState, UserMemoryProfile, TaskIntent } from '@metiora/core';

export interface ConsistencyCheckResult {
  hasConflicts: boolean;
  conflicts: {
    fieldA: string;
    fieldB: string;
    description: string;
  }[];
}

export interface StartupHealthReport {
  readinessScore: number;
  presentAssets: string[];
  missingAssets: string[];
  gapsIdentified: string[];
  recommendations: string[];
}

export interface IBusinessIntelligenceEngine {
  understandIntent(rawGoal: string): Promise<TaskIntent>;
  assessStartupState(startupMemory: StartupMemoryState): Promise<StartupHealthReport>;
  detectGaps(startupMemory: StartupMemoryState, targetCategory: string): Promise<string[]>;
  checkConsistency(startupMemory: StartupMemoryState, userMemory: UserMemoryProfile): Promise<ConsistencyCheckResult>;
  recommendNextActions(startupMemory: StartupMemoryState): Promise<string[]>;
}
