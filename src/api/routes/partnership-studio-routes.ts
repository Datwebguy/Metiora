import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IPartnershipStudioRepository } from '@core/ports/partnership-studio-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { AssessPartnershipReadiness } from '../../services/partnership-studio/use-cases/assess-partnership-readiness.js';
import { GeneratePartnershipPackage } from '../../services/partnership-studio/use-cases/generate-partnership-package.js';
import { ValidatePartnershipPackage } from '../../services/partnership-studio/use-cases/validate-partnership-package.js';
import { ApprovePartnershipPackage } from '../../services/partnership-studio/use-cases/approve-partnership-package.js';
import { RejectPartnershipPackage } from '../../services/partnership-studio/use-cases/reject-partnership-package.js';
import { GetPartnershipPackage } from '../../services/partnership-studio/use-cases/get-partnership-package.js';
import { ListPartnershipPackages } from '../../services/partnership-studio/use-cases/list-partnership-packages.js';

const AssessSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
});

const CreatePackageSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
  blueprintId: z.string().uuid().optional(),
  category: z.any().optional(),
});

const PackageActionSchema = z.object({
  packageId: z.string().uuid(),
});

const ValidatePackageSchema = z.object({
  content: z.any(),
});

export async function registerPartnershipStudioRoutes(
  fastify: FastifyInstance,
  partnershipRepo: IPartnershipStudioRepository,
  userRepo: IUserMemoryRepository,
  startupRepo: IStartupMemoryRepository
): Promise<void> {
  const assessReadiness = new AssessPartnershipReadiness(userRepo, startupRepo);
  const generatePackage = new GeneratePartnershipPackage(partnershipRepo, userRepo, startupRepo);
  const validatePackage = new ValidatePartnershipPackage();
  const approvePackage = new ApprovePartnershipPackage(partnershipRepo, startupRepo);
  const rejectPackage = new RejectPartnershipPackage(partnershipRepo);
  const getPackage = new GetPartnershipPackage(partnershipRepo);
  const listVersions = new ListPartnershipPackages(partnershipRepo);

  // POST /services/partnership-studio/assess
  fastify.post('/services/partnership-studio/assess', async (request: FastifyRequest, reply: FastifyReply) => {
    const { founderProfileId, startupProfileId } = AssessSchema.parse(request.body);
    const result = await assessReadiness.execute(founderProfileId, startupProfileId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/partnership-studio/create
  fastify.post('/services/partnership-studio/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreatePackageSchema.parse(request.body);
    const result = await generatePackage.execute(parsed);
    return reply.status(201).send({ success: true, data: result });
  });

  // POST /services/partnership-studio/validate
  fastify.post('/services/partnership-studio/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    const { content } = ValidatePackageSchema.parse(request.body);
    const result = validatePackage.execute(content);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/partnership-studio/approve
  fastify.post('/services/partnership-studio/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const { packageId } = PackageActionSchema.parse(request.body);
    const result = await approvePackage.execute(packageId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/partnership-studio/reject
  fastify.post('/services/partnership-studio/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const { packageId } = PackageActionSchema.parse(request.body);
    const result = await rejectPackage.execute(packageId);
    return reply.status(200).send({ success: true, data: result });
  });

  // GET /services/partnership-studio/:id
  fastify.get('/services/partnership-studio/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const pkg = await getPackage.execute(id);
    return reply.status(200).send({ success: true, data: pkg });
  });

  // GET /services/partnership-studio/:id/versions
  fastify.get('/services/partnership-studio/:id/versions', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const versions = await listVersions.execute(id);
    return reply.status(200).send({ success: true, data: versions });
  });
}
