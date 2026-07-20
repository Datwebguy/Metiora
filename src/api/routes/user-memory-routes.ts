import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { CreateFounderProfile } from '../../memory/user-memory/use-cases/create-founder-profile.js';
import { GetFounderProfile } from '../../memory/user-memory/use-cases/get-founder-profile.js';
import { UpdateFounderProfile } from '../../memory/user-memory/use-cases/update-founder-profile.js';
import { ApproveMemoryUpdate } from '../../memory/user-memory/use-cases/approve-memory-update.js';
import { RejectMemoryUpdate } from '../../memory/user-memory/use-cases/reject-memory-update.js';
import { GenerateMemorySnapshot } from '../../memory/user-memory/use-cases/generate-memory-snapshot.js';
import { GetMemoryHistory } from '../../memory/user-memory/use-cases/get-memory-history.js';

const CreateFounderSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  preferredName: z.string().optional(),
  title: z.string().optional(),
  bio: z.string().optional(),
  country: z.string().optional(),
  timezone: z.string().optional(),
  skills: z.array(z.string()).optional(),
  industries: z.array(z.string()).optional(),
  experienceYears: z.number().optional(),
});

const ProposalActionSchema = z.object({
  proposalId: z.string().uuid(),
});

export async function registerUserMemoryRoutes(
  fastify: FastifyInstance,
  repository: IUserMemoryRepository
): Promise<void> {
  const createProfileUseCase = new CreateFounderProfile(repository);
  const getProfileUseCase = new GetFounderProfile(repository);
  const updateProfileUseCase = new UpdateFounderProfile(repository);
  const approveUpdateUseCase = new ApproveMemoryUpdate(repository);
  const rejectUpdateUseCase = new RejectMemoryUpdate(repository);
  const generateSnapshotUseCase = new GenerateMemorySnapshot(repository);
  const getHistoryUseCase = new GetMemoryHistory(repository);

  // POST /founder
  fastify.post('/founder', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreateFounderSchema.parse(request.body);
    const profile = await createProfileUseCase.execute(parsed);
    return reply.status(201).send({ success: true, data: profile });
  });

  // GET /founder/:id
  fastify.get('/founder/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const profile = await getProfileUseCase.execute(id);
    return reply.status(200).send({ success: true, data: profile });
  });

  // PATCH /founder/:id
  fastify.patch('/founder/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const body = request.body as Record<string, unknown>;
    const result = await updateProfileUseCase.execute({
      founderId: id,
      incomingData: body as any,
    });
    return reply.status(200).send({ success: true, data: result });
  });

  // GET /founder/:id/history
  fastify.get('/founder/:id/history', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const history = await getHistoryUseCase.execute(id);
    return reply.status(200).send({ success: true, data: history });
  });

  // POST /founder/:id/approve
  fastify.post('/founder/:id/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const { proposalId } = ProposalActionSchema.parse(request.body);
    const updatedProfile = await approveUpdateUseCase.execute(proposalId);
    return reply.status(200).send({ success: true, data: updatedProfile });
  });

  // POST /founder/:id/reject
  fastify.post('/founder/:id/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const { proposalId } = ProposalActionSchema.parse(request.body);
    const rejectedProposal = await rejectUpdateUseCase.execute(proposalId);
    return reply.status(200).send({ success: true, data: rejectedProposal });
  });

  // GET /founder/:id/snapshot
  fastify.get('/founder/:id/snapshot', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const snapshot = await generateSnapshotUseCase.execute(id);
    return reply.status(200).send({ success: true, data: snapshot });
  });
}
