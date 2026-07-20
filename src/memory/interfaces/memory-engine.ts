import { UserMemoryProfile } from '@core/domain/user-memory.js';
import { StartupMemoryState } from '@core/domain/startup-memory.js';

export interface IMemoryEngine {
  loadUserMemory(founderId: string): Promise<UserMemoryProfile | null>;
  saveUserMemory(profile: UserMemoryProfile): Promise<void>;
  
  loadStartupMemory(startupId: string): Promise<StartupMemoryState | null>;
  saveStartupMemory(state: StartupMemoryState): Promise<void>;
  
  updateStartupMemoryWithDeliverable(
    startupId: string,
    deliverableId: string,
    extractedFacts: Partial<StartupMemoryState>
  ): Promise<StartupMemoryState>;
}
