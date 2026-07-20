import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApiServer } from '../../src/api/server.js';
import { InMemoryUserMemoryRepository } from '../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryOkxIntegrationRepository } from '../okx/in-memory-okx-integration-repository.js';
import { InMemoryOkxMarketplaceRepository } from '../okx/in-memory-okx-marketplace-repository.js';
import { loadEnvironment } from '../../src/shared/config/environment.js';

describe('Production Readiness & Deployment Tests', () => {
  let server: FastifyInstance;
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let okxRepo: InMemoryOkxIntegrationRepository;
  let marketplaceRepo: InMemoryOkxMarketplaceRepository;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    okxRepo = new InMemoryOkxIntegrationRepository();
    marketplaceRepo = new InMemoryOkxMarketplaceRepository();

    server = await buildApiServer(
      userRepo,
      startupRepo,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      okxRepo,
      marketplaceRepo,
      {
        configOverride: {
          NODE_ENV: 'test',
          PORT: 3001,
          LOG_LEVEL: 'fatal',
          METRICS_PUBLIC: true,
        },
        readinessCheck: async () => {
          // Simulated healthy probe
        },
      }
    );
    await server.ready();
  });

  afterEach(async () => {
    if (server) {
      await server.close();
    }
  });

  it('should validate environment variables cleanly', () => {
    const config = loadEnvironment();
    expect(config).toBeDefined();
    expect(config.PORT).toBeGreaterThan(0);
    expect(config.DATABASE_URL).toBeDefined();
  });

  it('should respond with status 200 HEALTHY on GET /health', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.status).toBe('HEALTHY');
    expect(body.environment).toBe('test');
    expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
    expect(body.escrowMode).toBe('SIMULATED');
  });

  it('should respond with status 200 ready on GET /ready when probe passes', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/ready',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.ready).toBe(true);
    expect(body.database).toBe('CONNECTED');
    expect(body.memoryEngine).toBe('READY');
  });

  it('should return 503 on GET /ready when probe fails', async () => {
    const failing = await buildApiServer(
      userRepo,
      startupRepo,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      okxRepo,
      marketplaceRepo,
      {
        configOverride: { NODE_ENV: 'test', LOG_LEVEL: 'fatal' },
        readinessCheck: async () => {
          throw new Error('db down');
        },
      }
    );
    await failing.ready();
    const response = await failing.inject({ method: 'GET', url: '/ready' });
    expect(response.statusCode).toBe(503);
    const body = JSON.parse(response.body);
    expect(body.ready).toBe(false);
    expect(body.database).toBe('DISCONNECTED');
    await failing.close();
  });

  it('should map Zod validation errors to HTTP 400', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/founder',
      payload: { email: 'not-an-email', fullName: '' },
    });
    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.errorCode).toBe('VALIDATION_ERROR');
  });

  it('should map ApplicationError (missing founder) to HTTP 400/404', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/founder/00000000-0000-0000-0000-000000000000',
    });
    expect([400, 404]).toContain(response.statusCode);
    const body = JSON.parse(response.body);
    expect(body.success).toBe(false);
    expect(body.message).toBeDefined();
  });

  it('should respond with status 200 version details on GET /version', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/version',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.name).toBe('Metiora AI Operating Partner Backend');
    expect(body.version).toContain('1.0.');
  });

  it('should track observability metrics on GET /metrics', async () => {
    await server.inject({ method: 'GET', url: '/health' });

    const response = await server.inject({
      method: 'GET',
      url: '/metrics',
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body.totalRequests).toBeGreaterThan(0);
    expect(body.memoryUsage).toBeDefined();
  });

  it('should enforce security headers via Helmet', async () => {
    const response = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.headers['x-dns-prefetch-control']).toBe('off');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('should enforce API key when METIORA_API_KEY is configured', async () => {
    const apiKey = 'test-secret-key-32chars-long!!';
    const locked = await buildApiServer(
      userRepo,
      startupRepo,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      okxRepo,
      marketplaceRepo,
      {
        configOverride: {
          NODE_ENV: 'test',
          LOG_LEVEL: 'fatal',
          METIORA_API_KEY: apiKey,
          METRICS_PUBLIC: false,
          CORS_ORIGINS: 'https://metiora.ai',
        },
      }
    );
    await locked.ready();

    const denied = await locked.inject({ method: 'POST', url: '/founder', payload: {} });
    expect(denied.statusCode).toBe(403);

    const allowedHealth = await locked.inject({ method: 'GET', url: '/health' });
    expect(allowedHealth.statusCode).toBe(200);

    // Metrics locked when METRICS_PUBLIC=false
    const metricsDenied = await locked.inject({ method: 'GET', url: '/metrics' });
    expect(metricsDenied.statusCode).toBe(403);

    const metricsOk = await locked.inject({
      method: 'GET',
      url: '/metrics',
      headers: { 'x-api-key': apiKey },
    });
    expect(metricsOk.statusCode).toBe(200);

    // Marketplace is fully locked (no public business/catalog data)
    const catalogDenied = await locked.inject({ method: 'GET', url: '/okx/marketplace/catalog' });
    expect(catalogDenied.statusCode).toBe(403);

    const catalogOk = await locked.inject({
      method: 'GET',
      url: '/okx/marketplace/catalog',
      headers: { 'x-api-key': apiKey },
    });
    expect(catalogOk.statusCode).toBe(200);

    const publishDenied = await locked.inject({
      method: 'POST',
      url: '/okx/marketplace/profile',
      payload: {},
    });
    expect(publishDenied.statusCode).toBe(403);

    const okxStatusDenied = await locked.inject({ method: 'GET', url: '/okx/status' });
    expect(okxStatusDenied.statusCode).toBe(403);

    const withKey = await locked.inject({
      method: 'POST',
      url: '/founder',
      headers: { 'x-api-key': apiKey },
      payload: { email: 'auth-test@metiora.test', fullName: 'Auth Test' },
    });
    expect(withKey.statusCode).toBe(201);

    // Allowed CORS origin reflected
    const corsOk = await locked.inject({
      method: 'OPTIONS',
      url: '/founder',
      headers: {
        Origin: 'https://metiora.ai',
        'Access-Control-Request-Method': 'POST',
      },
    });
    expect(corsOk.headers['access-control-allow-origin']).toBe('https://metiora.ai');

    // Disallowed origin not reflected
    const corsBad = await locked.inject({
      method: 'OPTIONS',
      url: '/founder',
      headers: {
        Origin: 'https://evil.example',
        'Access-Control-Request-Method': 'POST',
      },
    });
    expect(corsBad.headers['access-control-allow-origin']).toBeUndefined();

    await locked.close();
  });
});

