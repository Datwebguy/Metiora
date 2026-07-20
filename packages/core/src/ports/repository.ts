import { UserMemoryProfile } from '../domain/user-memory.js';
import { StartupMemoryState } from '../domain/startup-memory.js';

export interface IUserMemoryRepository {
  findByFounderId(founderId: string): Promise<UserMemoryProfile | null>;
  save(memory: UserMemoryProfile): Promise<void>;
}

export interface IStartupMemoryRepository {
  findByStartupId(startupId: string): Promise<StartupMemoryState | null>;
  save(memory: StartupMemoryState): Promise<void>;
}
