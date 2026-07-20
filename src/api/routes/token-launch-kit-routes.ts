import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ITokenLaunchKitRepository } from '@core/ports/token-launch-kit-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { AssessTokenReadiness } from '../../services/token-launch-kit/use-cases/assess-token-readiness.js';
import { GenerateTokenLaunchKit } from '../../services/token-launch-kit/use-cases/generate-token-launch-kit.js';
import { ValidateTokenLaunchKit } from '../../services/token-launch-kit/use-cases/validate-token-launch-kit.js';
import { ApproveTokenLaunchKit } from '../../services/token-launch-kit/use-cases/approve-token-launch-kit.js';
import { RejectTokenLaunchKit } from '../../services/token-launch-kit/use-cases/reject-token-launch-kit.js';
import { GetTokenLaunchKit } from '../../services/token-launch-kit/use-cases/get-token-launch-kit.js';
import { ListTokenLaunchKits } from '../../services/token-launch-kit/use-cases/list-token-launch-kits.js';

const AssessSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
});

const CreateKitSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
  blueprintId: z.string().uuid().optional(),
});

const KitActionSchema = z.object({
  kitId: z.string().uuid(),
});

const ValidateKitSchema = z.object({
  content: z.any(),
});

export async function registerTokenLaunchKitRoutes(
  fastify: FastifyInstance,
  tokenRepo: ITokenLaunchKitRepository,
  userRepo: IUserMemoryRepository,
  startupRepo: IStartupMemoryRepository
): Promise<void> {
  const assessReadiness = new AssessTokenReadiness(userRepo, startupRepo);
  const generateKit = new GenerateTokenLaunchKit(tokenRepo, userRepo, startupRepo);
  const validateKit = new ValidateTokenLaunchKit();
  const approveKit = new ApproveTokenLaunchKit(tokenRepo, startupRepo);
  const rejectKit = new RejectTokenLaunchKit(tokenRepo);
  const getKit = new GetTokenLaunchKit(tokenRepo);
  const listVersions = new ListTokenLaunchKits(tokenRepo);

  // POST /services/token-launch-kit/assess
  fastify.post('/services/token-launch-kit/assess', async (request: FastifyRequest, reply: FastifyReply) => {
    const { founderProfileId, startupProfileId } = AssessSchema.parse(request.body);
    const result = await assessReadiness.execute(founderProfileId, startupProfileId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/token-launch-kit/create
  fastify.post('/services/token-launch-kit/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreateKitSchema.parse(request.body);
    const result = await generateKit.execute(parsed);
    return reply.status(201).send({ success: true, data: result });
  });

  // POST /services/token-launch-kit/validate
  fastify.post('/services/token-launch-kit/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    const { content } = ValidateKitSchema.parse(request.body);
    const result = validateKit.execute(content);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/token-launch-kit/approve
  fastify.post('/services/token-launch-kit/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const { kitId } = KitActionSchema.parse(request.body);
    const result = await approveKit.execute(kitId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/token-launch-kit/reject
  fastify.post('/services/token-launch-kit/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const { kitId } = KitActionSchema.parse(request.body);
    const result = await rejectKit.execute(kitId);
    return reply.status(200).send({ success: true, data: result });
  });

  // GET /services/token-launch-kit/:id
  fastify.get('/services/token-launch-kit/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const kit = await getKit.execute(id);
    return reply.status(200).send({ success: true, data: kit });
  });

  // GET /services/token-launch-kit/:id/versions
  fastify.get('/services/token-launch-kit/:id/versions', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const versions = await listVersions.execute(id);
    return reply.status(200).send({ success: true, data: versions });
  });
}
