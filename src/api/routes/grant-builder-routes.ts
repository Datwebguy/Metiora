import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IGrantBuilderRepository } from '@core/ports/grant-builder-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { AssessGrantReadiness } from '../../services/grant-builder/use-cases/assess-grant-readiness.js';
import { GenerateGrantPackage } from '../../services/grant-builder/use-cases/generate-grant-package.js';
import { ValidateGrantPackage } from '../../services/grant-builder/use-cases/validate-grant-package.js';
import { ApproveGrantPackage } from '../../services/grant-builder/use-cases/approve-grant-package.js';
import { RejectGrantPackage } from '../../services/grant-builder/use-cases/reject-grant-package.js';
import { GetGrantPackage } from '../../services/grant-builder/use-cases/get-grant-package.js';
import { ListGrantPackages } from '../../services/grant-builder/use-cases/list-grant-packages.js';

const AssessSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
});

const CreatePackageSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
  blueprintId: z.string().uuid().optional(),
});

const PackageActionSchema = z.object({
  packageId: z.string().uuid(),
});

const ValidatePackageSchema = z.object({
  content: z.any(),
});

export async function registerGrantBuilderRoutes(
  fastify: FastifyInstance,
  grantRepo: IGrantBuilderRepository,
  userRepo: IUserMemoryRepository,
  startupRepo: IStartupMemoryRepository
): Promise<void> {
  const assessReadiness = new AssessGrantReadiness(userRepo, startupRepo);
  const generatePackage = new GenerateGrantPackage(grantRepo, userRepo, startupRepo);
  const validatePackage = new ValidateGrantPackage();
  const approvePackage = new ApproveGrantPackage(grantRepo, startupRepo);
  const rejectPackage = new RejectGrantPackage(grantRepo);
  const getPackage = new GetGrantPackage(grantRepo);
  const listVersions = new ListGrantPackages(grantRepo);

  // POST /services/grant-builder/assess
  fastify.post('/services/grant-builder/assess', async (request: FastifyRequest, reply: FastifyReply) => {
    const { founderProfileId, startupProfileId } = AssessSchema.parse(request.body);
    const result = await assessReadiness.execute(founderProfileId, startupProfileId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/grant-builder/create
  fastify.post('/services/grant-builder/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreatePackageSchema.parse(request.body);
    const result = await generatePackage.execute(parsed);
    return reply.status(201).send({ success: true, data: result });
  });

  // POST /services/grant-builder/validate
  fastify.post('/services/grant-builder/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    const { content } = ValidatePackageSchema.parse(request.body);
    const result = validatePackage.execute(content);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/grant-builder/approve
  fastify.post('/services/grant-builder/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const { packageId } = PackageActionSchema.parse(request.body);
    const result = await approvePackage.execute(packageId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/grant-builder/reject
  fastify.post('/services/grant-builder/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const { packageId } = PackageActionSchema.parse(request.body);
    const result = await rejectPackage.execute(packageId);
    return reply.status(200).send({ success: true, data: result });
  });

  // GET /services/grant-builder/:id
  fastify.get('/services/grant-builder/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const pkg = await getPackage.execute(id);
    return reply.status(200).send({ success: true, data: pkg });
  });

  // GET /services/grant-builder/:id/versions
  fastify.get('/services/grant-builder/:id/versions', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const versions = await listVersions.execute(id);
    return reply.status(200).send({ success: true, data: versions });
  });
}
