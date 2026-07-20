import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IStartupBlueprintRepository } from '@core/ports/startup-blueprint-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { CreateStartupBlueprint } from '../../services/startup-blueprint/use-cases/create-startup-blueprint.js';
import { ValidateBlueprint } from '../../services/startup-blueprint/use-cases/validate-blueprint.js';
import { ApproveBlueprint } from '../../services/startup-blueprint/use-cases/approve-blueprint.js';
import { RejectBlueprint } from '../../services/startup-blueprint/use-cases/reject-blueprint.js';
import { GetBlueprint } from '../../services/startup-blueprint/use-cases/get-blueprint.js';
import { ListBlueprintVersions } from '../../services/startup-blueprint/use-cases/list-blueprint-versions.js';

const CreateBlueprintSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
});

const BlueprintActionSchema = z.object({
  blueprintId: z.string().uuid(),
});

const ValidateBlueprintSchema = z.object({
  content: z.any(),
});

export async function registerStartupBlueprintRoutes(
  fastify: FastifyInstance,
  blueprintRepo: IStartupBlueprintRepository,
  userRepo: IUserMemoryRepository,
  startupRepo: IStartupMemoryRepository
): Promise<void> {
  const createBlueprint = new CreateStartupBlueprint(blueprintRepo, userRepo, startupRepo);
  const validateBlueprint = new ValidateBlueprint();
  const approveBlueprint = new ApproveBlueprint(blueprintRepo, startupRepo);
  const rejectBlueprint = new RejectBlueprint(blueprintRepo);
  const getBlueprint = new GetBlueprint(blueprintRepo);
  const listVersions = new ListBlueprintVersions(blueprintRepo);

  // POST /services/startup-blueprint/create
  fastify.post('/services/startup-blueprint/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreateBlueprintSchema.parse(request.body);
    const result = await createBlueprint.execute(parsed);
    return reply.status(201).send({ success: true, data: result });
  });

  // POST /services/startup-blueprint/validate
  fastify.post('/services/startup-blueprint/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    const { content } = ValidateBlueprintSchema.parse(request.body);
    const result = validateBlueprint.execute(content);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/startup-blueprint/approve
  fastify.post('/services/startup-blueprint/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const { blueprintId } = BlueprintActionSchema.parse(request.body);
    const result = await approveBlueprint.execute(blueprintId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/startup-blueprint/reject
  fastify.post('/services/startup-blueprint/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const { blueprintId } = BlueprintActionSchema.parse(request.body);
    const result = await rejectBlueprint.execute(blueprintId);
    return reply.status(200).send({ success: true, data: result });
  });

  // GET /services/startup-blueprint/:id
  fastify.get('/services/startup-blueprint/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const blueprint = await getBlueprint.execute(id);
    return reply.status(200).send({ success: true, data: blueprint });
  });

  // GET /services/startup-blueprint/:id/versions
  fastify.get('/services/startup-blueprint/:id/versions', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const versions = await listVersions.execute(id);
    return reply.status(200).send({ success: true, data: versions });
  });
}
