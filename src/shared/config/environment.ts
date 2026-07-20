import { z } from 'zod';

const boolFromEnv = z
  .enum(['true', 'false'])
  .optional()
  .transform((v) => v === 'true');

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z
    .string()
    .default('postgresql://postgres:postgres@localhost:5432/metiora_db?schema=public'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  API_BASE_URL: z.string().default('https://api.metiora.ai'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  /**
   * API key for mutating / private routes.
   * Required when NODE_ENV=production (fail closed at startup).
   */
  METIORA_API_KEY: z.string().min(16).optional(),
  /**
   * Comma-separated browser origins allowed by CORS.
   * Empty in production = no browser Origin reflection (server-to-server only).
   * Example: https://metiora.ai,https://docs.metiora.ai
   */
  CORS_ORIGINS: z.string().default(''),
  /**
   * When true (default), escrow is local-DB simulation only.
   */
  ESCROW_SIMULATION_MODE: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  /** When true, /metrics is public without API key. Default false. */
  METRICS_PUBLIC: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),
  /**
   * When true, refuse to boot without METIORA_API_KEY even outside production.
   * Production always requires the key.
   */
  REQUIRE_API_KEY: boolFromEnv,

  // --- OKX Developer Portal + x402 (A2MCP HTTP Seller) ---
  /** From OKX Developer Portal — used by OKXFacilitatorClient */
  OKX_API_KEY: z.string().optional(),
  OKX_SECRET_KEY: z.string().optional(),
  OKX_PASSPHRASE: z.string().optional(),
  /** X Layer wallet that receives USDT (must match marketplace payTo) */
  PAY_TO_ADDRESS: z.string().optional(),
  /**
   * CAIP-2 network id. Production X Layer mainnet is eip155:196 (official OKX docs).
   * Testnet: eip155:1952
   */
  OKX_PAYMENT_NETWORK: z.string().default('eip155:196'),

  // --- Paid package LLM enrichment (optional; falls back to structured templates) ---
  /**
   * When true (default) and a provider key is present, A2MCP packages are rewritten
   * by an LLM using founder/startup memory + the deterministic template scaffold.
   */
  AI_PACKAGE_LLM_ENABLED: z
    .enum(['true', 'false'])
    .default('true')
    .transform((v) => v === 'true'),
  /** openai | openrouter | auto (prefer openrouter, then openai) */
  AI_PROVIDER: z.enum(['auto', 'openai', 'openrouter']).default('auto'),
  OPENAI_API_KEY: z.string().optional(),
  OPENROUTER_API_KEY: z.string().optional(),
  /** Override model id, e.g. gpt-4o-mini or openrouter/auto */
  AI_MODEL: z.string().optional(),
  /** Soft timeout for package LLM call (ms). Keep under A2MCP service budget. */
  AI_PACKAGE_TIMEOUT_MS: z.coerce.number().default(28_000),
});

export type EnvironmentConfig = z.infer<typeof EnvironmentSchema>;

export function parseCorsOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

export function loadEnvironment(): EnvironmentConfig {
  const result = EnvironmentSchema.safeParse(process.env);
  if (!result.success) {
    const formattedErrors = result.error.format();
    throw new Error(`Invalid production environment configuration: ${JSON.stringify(formattedErrors)}`);
  }

  const config = result.data;
  const requireKey = config.NODE_ENV === 'production' || config.REQUIRE_API_KEY === true;

  if (requireKey && (!config.METIORA_API_KEY || config.METIORA_API_KEY.length < 16)) {
    throw new Error(
      'METIORA_API_KEY is required in production (min 16 chars). Set via fly secrets / environment.'
    );
  }

  return config;
}
