import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AnalyzeObjective } from '../../business-intelligence/use-cases/analyze-objective.js';
import { AnalyzeReadiness } from '../../business-intelligence/use-cases/analyze-readiness.js';
import { StrategicObjective } from '@core/domain/business-intelligence.js';

const AnalyzeRequestSchema = z.object({
  rawGoal: z.string().min(1),
  startupSnapshot: z.any(),
  userSnapshot: z.any().optional(),
});

const ReadinessRequestSchema = z.object({
  objective: z.string(),
  startupSnapshot: z.any(),
});

export async function registerBusinessIntelligenceRoutes(fastify: FastifyInstance): Promise<void> {
  const analyzeObjective = new AnalyzeObjective();
  const analyzeReadiness = new AnalyzeReadiness();

  // GET /intelligence/objectives
  fastify.get('/intelligence/objectives', async () => {
    const objectives: StrategicObjective[] = [
      'BUILD_STARTUP',
      'REFINE_STARTUP',
      'RAISE_INVESTMENT',
      'APPLY_FOR_GRANTS',
      'BUILD_PARTNERSHIPS',
      'LAUNCH_PRODUCT',
      'LAUNCH_TOKEN',
      'IMPROVE_HEALTH',
      'STRATEGIC_GUIDANCE',
    ];
    return { success: true, data: objectives };
  });

  // POST /intelligence/analyze
  fastify.post('/intelligence/analyze', async (request: FastifyRequest, reply: FastifyReply) => {
    const { rawGoal, startupSnapshot, userSnapshot } = AnalyzeRequestSchema.parse(request.body);
    const result = analyzeObjective.execute(rawGoal, startupSnapshot, userSnapshot);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /intelligence/readiness
  fastify.post('/intelligence/readiness', async (request: FastifyRequest, reply: FastifyReply) => {
    const { objective, startupSnapshot } = ReadinessRequestSchema.parse(request.body);
    const result = analyzeReadiness.execute(startupSnapshot, objective as StrategicObjective);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /intelligence/recommend
  fastify.post('/intelligence/recommend', async (request: FastifyRequest, reply: FastifyReply) => {
    const { rawGoal, startupSnapshot } = AnalyzeRequestSchema.parse(request.body);
    const intent = analyzeObjective.execute(rawGoal, startupSnapshot);
    return reply.status(200).send({ success: true, data: intent.recommendations });
  });

  // POST /intelligence/plan
  fastify.post('/intelligence/plan', async (request: FastifyRequest, reply: FastifyReply) => {
    const { rawGoal, startupSnapshot } = AnalyzeRequestSchema.parse(request.body);
    const intent = analyzeObjective.execute(rawGoal, startupSnapshot);
    return reply.status(200).send({ success: true, data: intent.executionPlan });
  });
}
