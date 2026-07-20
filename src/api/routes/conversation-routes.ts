import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IConversationRepository } from '@core/ports/conversation-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { StartConversation } from '../../conversation/use-cases/start-conversation.js';
import { ContinueConversation } from '../../conversation/use-cases/continue-conversation.js';
import { PauseConversation } from '../../conversation/use-cases/pause-conversation.js';
import { ResumeConversation } from '../../conversation/use-cases/resume-conversation.js';
import { EndConversation } from '../../conversation/use-cases/end-conversation.js';
import { LoadConversationContext } from '../../conversation/use-cases/load-conversation-context.js';

const StartConversationSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
  initialMessage: z.string().min(1),
});

const ContinueConversationSchema = z.object({
  sessionId: z.string().uuid(),
  userMessage: z.string().min(1),
});

const SessionActionSchema = z.object({
  sessionId: z.string().uuid(),
});

export async function registerConversationRoutes(
  fastify: FastifyInstance,
  conversationRepo: IConversationRepository,
  userRepo: IUserMemoryRepository,
  startupRepo: IStartupMemoryRepository
): Promise<void> {
  const startConversation = new StartConversation(conversationRepo, userRepo, startupRepo);
  const continueConversation = new ContinueConversation(conversationRepo, userRepo, startupRepo);
  const pauseConversation = new PauseConversation(conversationRepo);
  const resumeConversation = new ResumeConversation(conversationRepo);
  const endConversation = new EndConversation(conversationRepo);
  const loadContext = new LoadConversationContext(conversationRepo, userRepo, startupRepo);

  // POST /conversation/start
  fastify.post('/conversation/start', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = StartConversationSchema.parse(request.body);
    const result = await startConversation.execute(parsed);
    return reply.status(201).send({ success: true, data: result });
  });

  // POST /conversation/message
  fastify.post('/conversation/message', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = ContinueConversationSchema.parse(request.body);
    const result = await continueConversation.execute(parsed);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /conversation/pause
  fastify.post('/conversation/pause', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sessionId } = SessionActionSchema.parse(request.body);
    const session = await pauseConversation.execute(sessionId);
    return reply.status(200).send({ success: true, data: session });
  });

  // POST /conversation/resume
  fastify.post('/conversation/resume', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sessionId } = SessionActionSchema.parse(request.body);
    const session = await resumeConversation.execute(sessionId);
    return reply.status(200).send({ success: true, data: session });
  });

  // POST /conversation/end
  fastify.post('/conversation/end', async (request: FastifyRequest, reply: FastifyReply) => {
    const { sessionId } = SessionActionSchema.parse(request.body);
    const session = await endConversation.execute(sessionId);
    return reply.status(200).send({ success: true, data: session });
  });

  // GET /conversation/:id
  fastify.get('/conversation/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const context = await loadContext.execute(id);
    return reply.status(200).send({ success: true, data: context });
  });
}
