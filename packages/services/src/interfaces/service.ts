import { StartupMemoryState, UserMemoryProfile, DeliverableAsset } from '@metiora/core';

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
