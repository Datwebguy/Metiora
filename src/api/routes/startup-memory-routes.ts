import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { CreateStartup } from '../../memory/startup-memory/use-cases/create-startup.js';
import { GetStartup } from '../../memory/startup-memory/use-cases/get-startup.js';
import { UpdateStartup } from '../../memory/startup-memory/use-cases/update-startup.js';
import { ApproveStartupUpdate } from '../../memory/startup-memory/use-cases/approve-startup-update.js';
import { RejectStartupUpdate } from '../../memory/startup-memory/use-cases/reject-startup-update.js';
import { GenerateStartupSnapshot } from '../../memory/startup-memory/use-cases/generate-startup-snapshot.js';
import { GetStartupHistory } from '../../memory/startup-memory/use-cases/get-startup-history.js';
import { ListFounderStartups } from '../../memory/startup-memory/use-cases/list-founder-startups.js';

const CreateStartupSchema = z.object({
  founderProfileId: z.string().uuid(),
  name: z.string().min(1),
  tagline: z.string().optional(),
  oneSentenceDescription: z.string().optional(),
  industry: z.string().min(1),
  stage: z.string().optional(),
  websiteUrl: z.string().optional(),
  mission: z.string().optional(),
  problemStatement: z.string().optional(),
  productDescription: z.string().optional(),
  businessModel: z.string().optional(),
});

const ProposalActionSchema = z.object({
  proposalId: z.string().uuid(),
});

export async function registerStartupMemoryRoutes(
  fastify: FastifyInstance,
  startupRepository: IStartupMemoryRepository,
  userRepository: IUserMemoryRepository
): Promise<void> {
  const createStartupUseCase = new CreateStartup(startupRepository, userRepository);
  const getStartupUseCase = new GetStartup(startupRepository);
  const updateStartupUseCase = new UpdateStartup(startupRepository);
  const approveStartupUseCase = new ApproveStartupUpdate(startupRepository);
  const rejectStartupUseCase = new RejectStartupUpdate(startupRepository);
  const generateSnapshotUseCase = new GenerateStartupSnapshot(startupRepository);
  const getHistoryUseCase = new GetStartupHistory(startupRepository);
  const listFounderStartupsUseCase = new ListFounderStartups(startupRepository, userRepository);

  // POST /startups
  fastify.post('/startups', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreateStartupSchema.parse(request.body);
    const startup = await createStartupUseCase.execute(parsed);
    return reply.status(201).send({ success: true, data: startup });
  });

  // GET /startups/:id
  fastify.get('/startups/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const startup = await getStartupUseCase.execute(id);
    return reply.status(200).send({ success: true, data: startup });
  });

  // PATCH /startups/:id
  fastify.patch('/startups/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const result = await updateStartupUseCase.execute({
      startupId: id,
      incomingData: body as any,
    });
    return reply.status(200).send({ success: true, data: result });
  });

  // GET /startups/:id/history
  fastify.get('/startups/:id/history', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const history = await getHistoryUseCase.execute(id);
    return reply.status(200).send({ success: true, data: history });
  });

  // GET /startups/:id/snapshot
  fastify.get('/startups/:id/snapshot', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const snapshot = await generateSnapshotUseCase.execute(id);
    return reply.status(200).send({ success: true, data: snapshot });
  });

  // POST /startups/:id/approve
  fastify.post('/startups/:id/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const { proposalId } = ProposalActionSchema.parse(request.body);
    const updatedStartup = await approveStartupUseCase.execute(proposalId);
    return reply.status(200).send({ success: true, data: updatedStartup });
  });

  // POST /startups/:id/reject
  fastify.post('/startups/:id/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const { proposalId } = ProposalActionSchema.parse(request.body);
    const rejectedProposal = await rejectStartupUseCase.execute(proposalId);
    return reply.status(200).send({ success: true, data: rejectedProposal });
  });

  // GET /founders/:id/startups
  fastify.get('/founders/:id/startups', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const startups = await listFounderStartupsUseCase.execute(id);
    return reply.status(200).send({ success: true, data: startups });
  });
}
