import path from 'node:path';
import { createReadStream, existsSync } from 'node:fs';
import { access, readFile, stat } from 'node:fs/promises';
import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import compress from '@fastify/compress';
import rateLimit from '@fastify/rate-limit';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import { IOkxMarketplaceRepository } from '@core/ports/okx-marketplace-repository.js';
import { registerUserMemoryRoutes } from './routes/user-memory-routes.js';
import { registerStartupMemoryRoutes } from './routes/startup-memory-routes.js';
import { registerBusinessIntelligenceRoutes } from './routes/business-intelligence-routes.js';
import { registerConversationRoutes } from './routes/conversation-routes.js';
import { registerStartupBlueprintRoutes } from './routes/startup-blueprint-routes.js';
import { registerInvestorReadyRoutes } from './routes/investor-ready-routes.js';
import { registerGrantBuilderRoutes } from './routes/grant-builder-routes.js';
import { registerPartnershipStudioRoutes } from './routes/partnership-studio-routes.js';
import { registerTokenLaunchKitRoutes } from './routes/token-launch-kit-routes.js';
import { registerStartupHealthRoutes } from './routes/startup-health-routes.js';
import { registerOkxIntegrationRoutes } from './routes/okx-integration-routes.js';
import { registerOkxMarketplaceRoutes } from './routes/okx-marketplace-routes.js';
import { registerA2mcpRoutes } from './routes/a2mcp-routes.js';
import { A2aServiceAdapter } from '../okx/adapter/a2a-service-adapter.js';
import { createX402Server } from '../okx/x402/payment-server.js';
import {
  EnvironmentConfig,
  loadEnvironment,
  parseCorsOrigins,
} from '../shared/config/environment.js';
import { registerErrorHandler } from './error-handler.js';
import { registerApiKeyAuth } from './auth-hook.js';

const SERVER_START_TIME = Date.now();
const SYSTEM_VERSION = '1.0.9-prod';

let requestCount = 0;
let errorCount = 0;

export interface BuildApiServerOptions {
  configOverride?: Partial<EnvironmentConfig>;
  /** Real DB/readiness probe. When provided, /ready returns 503 if this throws. */
  readinessCheck?: () => Promise<void>;
}

export async function buildApiServer(
  userMemoryRepo: IUserMemoryRepository,
  startupMemoryRepo?: IStartupMemoryRepository,
  conversationRepo?: IConversationRepository,
  blueprintRepo?: IStartupBlueprintRepository,
  investorRepo?: IInvestorReadyRepository,
  grantRepo?: IGrantBuilderRepository,
  partnershipRepo?: IPartnershipStudioRepository,
  tokenRepo?: ITokenLaunchKitRepository,
  healthRepo?: IStartupHealthRepository,
  okxRepo?: IOkxIntegrationRepository,
  marketplaceRepo?: IOkxMarketplaceRepository,
  configOverrideOrOptions?: Partial<EnvironmentConfig> | BuildApiServerOptions
): Promise<FastifyInstance> {
  const options: BuildApiServerOptions =
    configOverrideOrOptions &&
    ('configOverride' in configOverrideOrOptions || 'readinessCheck' in configOverrideOrOptions)
      ? (configOverrideOrOptions as BuildApiServerOptions)
      : { configOverride: configOverrideOrOptions as Partial<EnvironmentConfig> | undefined };

  const env = { ...loadEnvironment(), ...options.configOverride };

  const fastify = Fastify({
    logger: {
      level: env.LOG_LEVEL,
    },
    // Trailing slash: /v1/a2mcp/startup-blueprint/ == without slash (scanners / clients)
    ignoreTrailingSlash: true,
    // Allow full pay → generate → settle windows under Fly idle_timeout (120s)
    connectionTimeout: 0,
    requestTimeout: 120_000,
    // Keep above Fly proxy idle (120s) so long A2MCP generations are not cut mid-response
    keepAliveTimeout: 125_000,
  });

  registerErrorHandler(fastify);
  registerApiKeyAuth(fastify, env.METIORA_API_KEY, env.METRICS_PUBLIC);

  fastify.addHook('onRequest', async () => {
    requestCount++;
  });

  fastify.addHook('onError', async () => {
    errorCount++;
  });

  // CORS allowlist — production default is no browser origins (server-to-server / agents only)
  const allowedOrigins = parseCorsOrigins(env.CORS_ORIGINS);
  await fastify.register(cors, {
    origin: (origin, cb) => {
      // Non-browser clients (curl, agents, server-side) send no Origin
      if (!origin) {
        cb(null, true);
        return;
      }
      if (env.NODE_ENV !== 'production' && allowedOrigins.length === 0) {
        // Dev convenience when CORS_ORIGINS unset
        cb(null, true);
        return;
      }
      if (allowedOrigins.includes(origin)) {
        cb(null, true);
        return;
      }
      // Reject browser origin without throwing (avoids 500 on preflight)
      cb(null, false);
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Include x402 payment headers so browser-based agent UIs can preflight successfully
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-api-key',
      'PAYMENT-SIGNATURE',
      'payment-signature',
      'X-PAYMENT',
      'x-payment',
      'PAYMENT-RESPONSE',
      'payment-response',
    ],
  });

  await fastify.register(helmet, { contentSecurityPolicy: false });
  await fastify.register(compress, { global: true });
  await fastify.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
  });

  // Public branding assets for OKX marketplace avatar/logo
  // Docker: /app/public ; local: project root public/
  const publicRoot = path.resolve(process.cwd(), 'public');
  const assetsDir = path.join(publicRoot, 'assets');

  const sendPng = async (reply: FastifyReply, fileName: string) => {
    const filePath = path.join(assetsDir, fileName);
    try {
      await access(filePath);
    } catch {
      return reply.status(404).send({ success: false, errorCode: 'NOT_FOUND', message: 'Asset not found' });
    }
    void reply.header('Content-Type', 'image/png');
    void reply.header('Cache-Control', 'public, max-age=86400');
    return reply.send(createReadStream(filePath));
  };

  // Marketing website assets under /site/*
  const siteDir = path.join(publicRoot, 'site');

  // Canonical marketplace avatar URLs (public, no API key)
  fastify.get('/avatar.png', async (_req, reply) => sendPng(reply, 'metiora-avatar.png'));
  fastify.get('/logo.png', async (_req, reply) => sendPng(reply, 'logo.png'));

  // Root favicons (browsers request /favicon.ico by default)
  const sendPublicFile = async (reply: FastifyReply, absPath: string, contentType: string) => {
    try {
      await access(absPath);
    } catch {
      return reply.status(404).send({ success: false, errorCode: 'NOT_FOUND' });
    }
    void reply.header('Content-Type', contentType);
    void reply.header('Cache-Control', 'public, max-age=604800');
    return reply.send(createReadStream(absPath));
  };
  fastify.get('/favicon.ico', async (_req, reply) =>
    sendPublicFile(reply, path.join(publicRoot, 'favicon.png'), 'image/png')
  );
  fastify.get('/favicon.png', async (_req, reply) =>
    sendPublicFile(reply, path.join(publicRoot, 'favicon.png'), 'image/png')
  );
  fastify.get('/favicon.svg', async (_req, reply) =>
    sendPublicFile(reply, path.join(siteDir, 'favicon.svg'), 'image/svg+xml')
  );
  fastify.get('/apple-touch-icon.png', async (_req, reply) =>
    sendPublicFile(reply, path.join(publicRoot, 'apple-touch-icon.png'), 'image/png')
  );
  fastify.get('/assets/metiora-avatar.png', async (_req, reply) => sendPng(reply, 'metiora-avatar.png'));
  fastify.get('/assets/logo.png', async (_req, reply) => sendPng(reply, 'logo.png'));
  fastify.get('/public/assets/metiora-avatar.png', async (_req, reply) => sendPng(reply, 'metiora-avatar.png'));
  fastify.get('/public/assets/logo.png', async (_req, reply) => sendPng(reply, 'logo.png'));
  const siteMime: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff2': 'font/woff2',
  };

  const sendSiteFile = async (reply: FastifyReply, relativePath: string) => {
    const safeRel = relativePath.replace(/^[/\\]+/, '').replace(/\.\./g, '');
    const filePath = path.join(siteDir, safeRel);
    if (!filePath.startsWith(siteDir)) {
      return reply.status(404).send({ success: false, errorCode: 'NOT_FOUND' });
    }
    try {
      await access(filePath);
      const st = await stat(filePath);
      if (!st.isFile()) {
        return reply.status(404).send({ success: false, errorCode: 'NOT_FOUND' });
      }
    } catch {
      return reply.status(404).send({ success: false, errorCode: 'NOT_FOUND' });
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = siteMime[ext] ?? 'application/octet-stream';
    void reply.header('Content-Type', type);
    void reply.header('Cache-Control', ext === '.html' ? 'public, max-age=60' : 'public, max-age=86400');
    return reply.send(createReadStream(filePath));
  };

  fastify.get('/site/*', async (req: FastifyRequest, reply: FastifyReply) => {
    const raw = (req.params as { '*': string })['*'] || 'index.html';
    return sendSiteFile(reply, raw);
  });

  // Clean marketing paths: /blog, /docs (+ nested posts)
  const serveMarketingPage = async (reply: FastifyReply, rel: string) => {
    let candidate = rel.replace(/^[/\\]+/, '').replace(/\.\./g, '');
    if (!candidate || candidate.endsWith('/')) candidate = `${candidate}index.html`;
    if (!path.extname(candidate)) candidate = `${candidate}/index.html`;
    return sendSiteFile(reply, candidate);
  };

  // ignoreTrailingSlash is on — only register each path once
  fastify.get('/blog', async (_req, reply) => serveMarketingPage(reply, 'blog/index.html'));
  fastify.get('/blog/*', async (req, reply) => {
    const star = (req.params as { '*': string })['*'] || 'index.html';
    return serveMarketingPage(reply, `blog/${star}`);
  });
  fastify.get('/docs', async (_req, reply) => serveMarketingPage(reply, 'docs/index.html'));
  fastify.get('/docs/*', async (req, reply) => {
    const star = (req.params as { '*': string })['*'] || 'index.html';
    return serveMarketingPage(reply, `docs/${star}`);
  });

  const x402 = createX402Server(env);

  // Public root — full marketing site for browsers; JSON for API clients
  fastify.get('/', async (req: FastifyRequest, reply: FastifyReply) => {
    const base = (env.API_BASE_URL || 'https://agentmetiora.xyz').replace(/\/$/, '');
    const payload = {
      name: 'Metiora',
      description: 'AI Operating Partner for founders and startups on OKX.AI',
      status: 'online',
      version: SYSTEM_VERSION,
      marketplacePayment: x402.enabled ? 'x402_mainnet' : 'disabled',
      paymentNetwork: x402.network,
      website: `${base}/`,
      public: {
        health: `${base}/health`,
        services: `${base}/v1/a2mcp/services`,
        bootstrap: `${base}/v1/a2mcp/bootstrap`,
        avatar: `${base}/avatar.png`,
        logo: `${base}/logo.png`,
      },
      note: 'Paid marketplace services use x402 on /v1/a2mcp/* (no Metiora API key). Internal routes require x-api-key.',
    };

    const accept = String(req.headers.accept ?? '');
    const wantsHtml = accept.includes('text/html') || accept === '' || accept.includes('*/*');
    const indexPath = path.join(siteDir, 'index.html');
    if (wantsHtml && existsSync(indexPath)) {
      try {
        const html = await readFile(indexPath, 'utf8');
        return reply.type('text/html; charset=utf-8').header('Cache-Control', 'public, max-age=60').status(200).send(html);
      } catch {
        // fall through to JSON
      }
    }

    return reply.status(200).send(payload);
  });

  fastify.get('/health', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      status: 'HEALTHY',
      version: SYSTEM_VERSION,
      environment: env.NODE_ENV,
      uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      timestamp: new Date().toISOString(),
      /** Legacy /okx/task escrow path (API-key only). Marketplace buyers use x402, not this. */
      escrowMode: env.ESCROW_SIMULATION_MODE ? 'SIMULATED' : 'ONCHAIN_REQUIRED',
      /** Real marketplace payment path for A2MCP (X Layer USDT0). */
      marketplacePayment: x402.enabled ? 'x402_mainnet' : 'disabled',
      x402Enabled: x402.enabled,
      paymentNetwork: x402.network,
      publicBaseUrl: env.API_BASE_URL,
    });
  });

  fastify.get('/ready', async (_req: FastifyRequest, reply: FastifyReply) => {
    let database: 'CONNECTED' | 'DISCONNECTED' = 'CONNECTED';
    let ready = true;

    if (options.readinessCheck) {
      try {
        await options.readinessCheck();
      } catch {
        database = 'DISCONNECTED';
        ready = false;
      }
    }

    const body = {
      ready,
      database,
      services: ready ? 'INITIALIZED' : 'DEGRADED',
      memoryEngine: ready ? 'READY' : 'UNKNOWN',
      businessIntelligence: ready ? 'READY' : 'UNKNOWN',
      conversationEngine: ready ? 'READY' : 'UNKNOWN',
    };

    return reply.status(ready ? 200 : 503).send(body);
  });

  fastify.get('/version', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      name: 'Metiora AI Operating Partner Backend',
      version: SYSTEM_VERSION,
      buildCommit: 'prod-release-v1.0.9',
      nodeVersion: process.version,
    });
  });

  fastify.get('/metrics', async (_req: FastifyRequest, reply: FastifyReply) => {
    return reply.status(200).send({
      totalRequests: requestCount,
      totalErrors: errorCount,
      uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
      memoryUsage: process.memoryUsage(),
    });
  });

  fastify.get('/status', async () => ({
    status: 'ok',
    version: SYSTEM_VERSION,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor((Date.now() - SERVER_START_TIME) / 1000),
  }));

  await registerUserMemoryRoutes(fastify, userMemoryRepo);

  if (startupMemoryRepo) {
    await registerStartupMemoryRoutes(fastify, startupMemoryRepo, userMemoryRepo);
  }

  await registerBusinessIntelligenceRoutes(fastify);

  if (conversationRepo && startupMemoryRepo) {
    await registerConversationRoutes(fastify, conversationRepo, userMemoryRepo, startupMemoryRepo);
  }

  if (blueprintRepo && startupMemoryRepo) {
    await registerStartupBlueprintRoutes(fastify, blueprintRepo, userMemoryRepo, startupMemoryRepo);
  }

  if (investorRepo && startupMemoryRepo) {
    await registerInvestorReadyRoutes(fastify, investorRepo, userMemoryRepo, startupMemoryRepo);
  }

  if (grantRepo && startupMemoryRepo) {
    await registerGrantBuilderRoutes(fastify, grantRepo, userMemoryRepo, startupMemoryRepo);
  }

  if (partnershipRepo && startupMemoryRepo) {
    await registerPartnershipStudioRoutes(fastify, partnershipRepo, userMemoryRepo, startupMemoryRepo);
  }

  if (tokenRepo && startupMemoryRepo) {
    await registerTokenLaunchKitRoutes(fastify, tokenRepo, userMemoryRepo, startupMemoryRepo);
  }

  if (healthRepo && startupMemoryRepo) {
    await registerStartupHealthRoutes(fastify, healthRepo, userMemoryRepo, startupMemoryRepo);
  }

  if (okxRepo && startupMemoryRepo) {
    const adapter = new A2aServiceAdapter(
      userMemoryRepo,
      startupMemoryRepo,
      blueprintRepo,
      investorRepo,
      grantRepo,
      partnershipRepo,
      tokenRepo,
      healthRepo
    );
    await registerOkxIntegrationRoutes(
      fastify,
      okxRepo,
      userMemoryRepo,
      startupMemoryRepo,
      adapter,
      { escrowSimulationMode: env.ESCROW_SIMULATION_MODE }
    );
  }

  if (marketplaceRepo) {
    await registerOkxMarketplaceRoutes(fastify, marketplaceRepo);
  }

  // Public A2MCP x402 endpoints (marketplace buyers; payment is the gate)
  if (startupMemoryRepo) {
    await registerA2mcpRoutes(fastify, {
      userRepo: userMemoryRepo,
      startupRepo: startupMemoryRepo,
      blueprintRepo,
      investorRepo,
      grantRepo,
      partnershipRepo,
      tokenRepo,
      healthRepo,
      x402,
    });
  }

  if (x402.enabled) {
    fastify.log.info(
      { network: x402.network, payTo: `${x402.payTo.slice(0, 6)}…${x402.payTo.slice(-4)}` },
      'OKX x402 A2MCP payment gate enabled'
    );
  } else {
    fastify.log.warn(
      { reason: x402.reasonDisabled },
      'OKX x402 A2MCP payment gate disabled'
    );
  }

  return fastify;
}
