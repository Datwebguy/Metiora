import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { registerHealthRoutes } from './routes/health.js';

export async function buildServer(): Promise<FastifyInstance> {
  const fastify = Fastify({
    logger: {
      level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    },
  });

  await fastify.register(cors, {
    origin: true,
  });

  await fastify.register(registerHealthRoutes);

  return fastify;
}
