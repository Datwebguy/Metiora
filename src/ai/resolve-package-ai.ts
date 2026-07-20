import type { EnvironmentConfig } from '../shared/config/environment.js';
import type { IAIProvider } from './providers/provider-interface.js';
import { OpenAICompatibleProvider } from './providers/openai-compatible-provider.js';

export interface PackageAiRuntime {
  enabled: boolean;
  provider: IAIProvider | null;
  model: string;
  timeoutMs: number;
  reasonDisabled?: string;
}

/**
 * Resolve which LLM (if any) enriches paid A2MCP packages.
 * Never throws — missing keys simply disable enrichment.
 */
export function resolvePackageAi(env: EnvironmentConfig): PackageAiRuntime {
  if (!env.AI_PACKAGE_LLM_ENABLED) {
    return {
      enabled: false,
      provider: null,
      model: '',
      timeoutMs: env.AI_PACKAGE_TIMEOUT_MS,
      reasonDisabled: 'AI_PACKAGE_LLM_ENABLED=false',
    };
  }

  const openrouterKey = env.OPENROUTER_API_KEY?.trim();
  const openaiKey = env.OPENAI_API_KEY?.trim();
  const prefer = env.AI_PROVIDER;

  if (prefer === 'openrouter' || (prefer === 'auto' && openrouterKey)) {
    if (!openrouterKey) {
      return {
        enabled: false,
        provider: null,
        model: '',
        timeoutMs: env.AI_PACKAGE_TIMEOUT_MS,
        reasonDisabled: 'OPENROUTER_API_KEY missing',
      };
    }
    const model = env.AI_MODEL?.trim() || 'openai/gpt-4o-mini';
    return {
      enabled: true,
      provider: new OpenAICompatibleProvider({
        providerId: 'openrouter',
        apiKey: openrouterKey,
        baseUrl: 'https://openrouter.ai/api/v1',
        defaultModel: model,
        siteUrl: 'https://agentmetiora.xyz',
        siteName: 'Metiora',
      }),
      model,
      timeoutMs: env.AI_PACKAGE_TIMEOUT_MS,
    };
  }

  if (prefer === 'openai' || (prefer === 'auto' && openaiKey)) {
    if (!openaiKey) {
      return {
        enabled: false,
        provider: null,
        model: '',
        timeoutMs: env.AI_PACKAGE_TIMEOUT_MS,
        reasonDisabled: 'OPENAI_API_KEY missing',
      };
    }
    const model = env.AI_MODEL?.trim() || 'gpt-4o-mini';
    return {
      enabled: true,
      provider: new OpenAICompatibleProvider({
        providerId: 'openai',
        apiKey: openaiKey,
        baseUrl: 'https://api.openai.com/v1',
        defaultModel: model,
      }),
      model,
      timeoutMs: env.AI_PACKAGE_TIMEOUT_MS,
    };
  }

  // auto with no keys
  if (openrouterKey) {
    return resolvePackageAi({ ...env, AI_PROVIDER: 'openrouter' });
  }
  if (openaiKey) {
    return resolvePackageAi({ ...env, AI_PROVIDER: 'openai' });
  }

  return {
    enabled: false,
    provider: null,
    model: '',
    timeoutMs: env.AI_PACKAGE_TIMEOUT_MS,
    reasonDisabled: 'No OPENROUTER_API_KEY or OPENAI_API_KEY configured',
  };
}
