import { timingSafeEqual } from 'node:crypto';
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuthorizationError } from '@shared/errors/application-error.js';

/**
 * Absolute minimum public surface for load balancers / uptime probes.
 * Business data still requires Metiora API key.
 * A2MCP paid routes are public path-wise; x402 payment is the gate.
 */
const PUBLIC_GET_PATHS = new Set([
  '/',
  '/health',
  '/ready',
  '/version',
  '/status',
  '/blog',
  '/docs',
]);

function normalizePath(url: string): string {
  const path = url.split('?')[0] ?? url;
  // Strip trailing slash except root
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1);
  return path;
}

function isPublicRoute(method: string, url: string, metricsPublic: boolean): boolean {
  const path = normalizePath(url);
  const m = method.toUpperCase();

  // Health probes must work with GET and HEAD
  if ((m === 'GET' || m === 'HEAD') && PUBLIC_GET_PATHS.has(path)) {
    return true;
  }

  // Public branding assets + marketing site (OKX style product website)
  if (
    (m === 'GET' || m === 'HEAD') &&
    (path === '/avatar.png' ||
      path === '/logo.png' ||
      path === '/favicon.ico' ||
      path === '/favicon.png' ||
      path === '/favicon.svg' ||
      path === '/apple-touch-icon.png' ||
      path === '/site.webmanifest' ||
      path.startsWith('/assets/') ||
      path.startsWith('/public/assets/') ||
      path.startsWith('/site/') ||
      path.startsWith('/blog/') ||
      path.startsWith('/docs/'))
  ) {
    return true;
  }

  // OKX marketplace A2MCP endpoints (x402 payment gate, not Metiora API key)
  if (path === '/v1/a2mcp/services' || path.startsWith('/v1/a2mcp/')) {
    return true;
  }

  if (metricsPublic && (m === 'GET' || m === 'HEAD') && path === '/metrics') {
    return true;
  }

  // CORS preflight must not require API key (browser sends OPTIONS without custom headers sometimes)
  if (m === 'OPTIONS') {
    return true;
  }

  return false;
}

function extractApiKey(request: FastifyRequest): string | undefined {
  const headerKey = request.headers['x-api-key'];
  if (typeof headerKey === 'string' && headerKey.length > 0) return headerKey;

  const auth = request.headers.authorization;
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim();
  }
  return undefined;
}

/** Constant-time compare to reduce timing side-channels on API key checks. */
function keysEqual(provided: string, expected: string): boolean {
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    // Still do a dummy compare to keep timing flatter
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * When METIORA_API_KEY is configured, enforce it on non-public routes.
 * Public routes are GET-only health probes — no business or catalog data.
 */
export function registerApiKeyAuth(
  fastify: FastifyInstance,
  apiKey: string | undefined,
  metricsPublic: boolean
): void {
  if (!apiKey) {
    fastify.log.warn(
      'METIORA_API_KEY is not set — API routes are publicly writable. Set a key for production.'
    );
    return;
  }

  fastify.log.info('API key authentication enabled for protected routes');

  fastify.addHook('onRequest', async (request: FastifyRequest, _reply: FastifyReply) => {
    if (isPublicRoute(request.method, request.url, metricsPublic)) return;

    const provided = extractApiKey(request);
    if (!provided || !keysEqual(provided, apiKey)) {
      throw new AuthorizationError(
        'Valid API key required. Send header x-api-key or Authorization: Bearer <key>.'
      );
    }
  });
}
