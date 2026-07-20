import { OKXFacilitatorClient } from '@okxweb3/x402-core';
import {
  x402ResourceServer,
  x402HTTPResourceServer,
  type RoutesConfig,
} from '@okxweb3/x402-core/server';
import { ExactEvmScheme } from '@okxweb3/x402-evm/exact/server';
import type { EnvironmentConfig } from '@shared/config/environment.js';

/**
 * Official X Layer mainnet USDT0 (OKX marketplace fee token).
 * MUST match marketplace registration — never quote Polygon/other USDT.
 * Ref: OKX delist feedback 4187 (0x779ded… vs wrong 0x1E4a…)
 */
export const XLAYER_USDT0_ASSET = '0x779ded0c9e1022225f8e0630b35a9b54be713736';
export const XLAYER_NETWORK = 'eip155:196' as const;

/** Metiora marketplace prices (USD strings for SDK). */
export const A2MCP_SERVICE_PRICES = {
  /** Mainnet payment-path smoke only — $0.01 USDT0 */
  smoke_test: '$0.01',
  startup_blueprint: '$7',
  investor_ready: '$7',
  grant_builder: '$3',
  partnership_studio: '$3',
  token_launch_kit: '$3',
  startup_health: '$2',
} as const;

export type A2mcpServiceKey = keyof typeof A2MCP_SERVICE_PRICES;

export const A2MCP_ROUTE_PATHS: Record<A2mcpServiceKey, string> = {
  smoke_test: '/v1/a2mcp/smoke-test',
  startup_blueprint: '/v1/a2mcp/startup-blueprint',
  investor_ready: '/v1/a2mcp/investor-ready',
  grant_builder: '/v1/a2mcp/grant-builder',
  partnership_studio: '/v1/a2mcp/partnership-studio',
  token_launch_kit: '/v1/a2mcp/token-launch-kit',
  startup_health: '/v1/a2mcp/startup-health',
};

/** Required JSON body fields after payment (publish in listing metadata). */
export const A2MCP_REQUIRED_BODY_FIELDS = [
  'founderProfileId',
  'startupProfileId',
] as const;

export const A2MCP_OPTIONAL_BODY_FIELDS = ['blueprintId'] as const;

/** Full public HTTPS base used in resource.url — must match custom domain / Fly. */
export const A2MCP_PUBLIC_BASE_URL =
  process.env.API_BASE_URL?.replace(/\/$/, '') || 'https://agentmetiora.xyz';

export interface X402ServerBundle {
  enabled: boolean;
  httpServer: x402HTTPResourceServer | null;
  network: string;
  payTo: string;
  reasonDisabled?: string;
}

/**
 * Build OKX x402 HTTP resource server when credentials are present.
 * Network is X Layer mainnet: eip155:196 (OKX docs).
 */
export function createX402Server(env: EnvironmentConfig): X402ServerBundle {
  // CAIP-2 network id — X Layer mainnet is eip155:196 per OKX docs
  const network = (env.OKX_PAYMENT_NETWORK || XLAYER_NETWORK) as `${string}:${string}`;
  const payTo = env.PAY_TO_ADDRESS?.trim() ?? '';
  const apiKey = env.OKX_API_KEY?.trim() ?? '';
  const secretKey = env.OKX_SECRET_KEY?.trim() ?? '';
  const passphrase = env.OKX_PASSPHRASE?.trim() ?? '';

  if (!apiKey || !secretKey || !passphrase || !payTo) {
    return {
      enabled: false,
      httpServer: null,
      network,
      payTo,
      reasonDisabled:
        'Missing OKX_API_KEY, OKX_SECRET_KEY, OKX_PASSPHRASE, or PAY_TO_ADDRESS',
    };
  }

  if (!payTo.startsWith('0x') || payTo.length !== 42) {
    return {
      enabled: false,
      httpServer: null,
      network,
      payTo,
      reasonDisabled: 'PAY_TO_ADDRESS must be a 42-char 0x EVM address',
    };
  }

  if (network !== XLAYER_NETWORK) {
    // Guard against accidental testnet/mainnet drift in production listing
    console.warn(
      `[x402] OKX_PAYMENT_NETWORK=${network} — marketplace mainnet expects ${XLAYER_NETWORK}`
    );
  }

  const facilitatorClient = new OKXFacilitatorClient({
    apiKey,
    secretKey,
    passphrase,
    syncSettle: true,
  });

  // ExactEvmScheme on eip155:196 resolves asset to official X Layer USDT0 (0x779ded…)
  const resourceServer = new x402ResourceServer(facilitatorClient).register(
    network,
    new ExactEvmScheme()
  );

  const routes: RoutesConfig = {};
  for (const [service, path] of Object.entries(A2MCP_ROUTE_PATHS) as [
    A2mcpServiceKey,
    string,
  ][]) {
    const price = A2MCP_SERVICE_PRICES[service];
    const publicUrl = `${A2MCP_PUBLIC_BASE_URL}${path}`;
    const isSmoke = service === 'smoke_test';
    routes[`POST ${path}`] = {
      accepts: [
        {
          scheme: 'exact',
          network,
          payTo,
          price,
          maxTimeoutSeconds: 300,
          // Explicit fee-token hint for clients; SDK still sets accepts[].asset from network
          extra: {
            name: 'USD₮0',
            version: '1',
            expectedAsset: XLAYER_USDT0_ASSET,
            requiredBodyFields: isSmoke ? [] : [...A2MCP_REQUIRED_BODY_FIELDS],
          },
        },
      ],
      resource: publicUrl,
      description: isSmoke
        ? 'Metiora x402 mainnet smoke test ($0.01) — payment path verification only'
        : `Metiora A2MCP — ${service.replace(/_/g, ' ')}. Required JSON body: ${A2MCP_REQUIRED_BODY_FIELDS.join(', ')}`,
      mimeType: 'application/json',
      unpaidResponseBody: () => ({
        contentType: 'application/json',
        body: {
          success: false,
          errorCode: 'PAYMENT_REQUIRED',
          message: 'x402 payment required for this Metiora A2MCP service',
          service,
          endpoint: publicUrl,
          priceUsd: price,
          network,
          payTo,
          /** Official X Layer USDT0 — must match marketplace fee token registration */
          feeToken: XLAYER_USDT0_ASSET,
          requiredBodyFields: isSmoke ? [] : [...A2MCP_REQUIRED_BODY_FIELDS],
          optionalBodyFields: isSmoke ? [] : [...A2MCP_OPTIONAL_BODY_FIELDS],
          // Marketplace listables only (smoke is internal payment-path probe)
          validOperations: Object.keys(A2MCP_ROUTE_PATHS).filter((k) => k !== 'smoke_test'),
          bootstrapUrl: `${A2MCP_PUBLIC_BASE_URL}/v1/a2mcp/bootstrap`,
          docs: 'https://web3.okx.com/onchainos/dev-docs/okxai/howtomcp',
        },
      }),
    };
  }

  const httpServer = new x402HTTPResourceServer(resourceServer, routes);

  return {
    enabled: true,
    httpServer,
    network,
    payTo,
  };
}
