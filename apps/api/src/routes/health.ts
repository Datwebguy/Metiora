import { FastifyInstance } from 'fastify';
import { HealthStatus } from '@metiora/shared';

const SERVER_START_TIME = Date.now();
const SYSTEM_VERSION = '1.0.0';

export async function registerHealthRoutes(fastify: FastifyInstance): Promise<void> {
  // /version endpoint
  fastify.get('/version', async (_request, reply) => {
    return reply.status(200).send({
      name: 'Metiora API',
      version: SYSTEM_VERSION,
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // /status endpoint
  fastify.get('/status', async (_request, reply) => {
    const uptimeSeconds = Math.floor((Date.now() - SERVER_START_TIME) / 1000);
    const statusPayload: HealthStatus = {
      status: 'ok',
      version: SYSTEM_VERSION,
      environment: (process.env.NODE_ENV as any) || 'development',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
    };
    return reply.status(200).send(statusPayload);
  });
}
