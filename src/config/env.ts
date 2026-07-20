import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  DATABASE_URL: z.string().url().default('postgresql://postgres:postgres@localhost:5432/metiora?schema=public'),
  REDIS_URL: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  OKX_ASP_ID: z.string().default('asp_metiora_v1'),
  OKX_MARKETPLACE_ENDPOINT: z.string().url().default('https://api.okx.ai/marketplace/v1'),
  ONCHAIN_OS_RPC_ENDPOINT: z.string().url().default('https://rpc.onchainos.org/v1'),
});

export type EnvironmentConfig = z.infer<typeof EnvSchema>;

export function parseEnvironment(): EnvironmentConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    console.error('[Configuration Error] Invalid environment variables:', result.error.format());
    throw new Error('Environment validation failed');
  }
  return result.data;
}
