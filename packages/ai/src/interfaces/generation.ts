import { IAIProvider, AIProviderId } from './provider.js';

export interface IAIFactory {
  registerProvider(provider: IAIProvider): void;
  getProvider(providerId: AIProviderId): IAIProvider;
  getDefaultProvider(): IAIProvider;
}
