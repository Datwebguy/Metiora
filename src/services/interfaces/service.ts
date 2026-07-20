import { StartupMemoryState } from '@core/domain/startup-memory.js';
import { UserMemoryProfile } from '@core/domain/user-memory.js';
import { DeliverableAsset } from '@core/domain/deliverable.js';

export type ServiceType = 
  | 'startup_blueprint'
  | 'investor_ready'
  | 'grant_builder'
  | 'token_launch_kit'
  | 'partnership_studio'
  | 'startup_health';

export interface ServiceInputContext {
  startupMemory: StartupMemoryState;
  userMemory: UserMemoryProfile;
  customParameters?: Record<string, unknown>;
}

export interface ServiceOutputResult {
  serviceType: ServiceType;
  generatedDeliverables: DeliverableAsset[];
  updatedMemoryFacts: Partial<StartupMemoryState>;
  nextRecommendedServices: ServiceType[];
}

export interface IMetioraService {
  readonly serviceType: ServiceType;
  execute(context: ServiceInputContext): Promise<ServiceOutputResult>;
}
