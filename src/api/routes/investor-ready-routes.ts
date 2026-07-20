import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IInvestorReadyRepository } from '@core/ports/investor-ready-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { AssessInvestmentReadiness } from '../../services/investor-ready/use-cases/assess-investment-readiness.js';
import { GenerateInvestorPackage } from '../../services/investor-ready/use-cases/generate-investor-package.js';
import { ValidateInvestorPackage } from '../../services/investor-ready/use-cases/validate-investor-package.js';
import { ApproveInvestorPackage } from '../../services/investor-ready/use-cases/approve-investor-package.js';
import { RejectInvestorPackage } from '../../services/investor-ready/use-cases/reject-investor-package.js';
import { GetInvestorPackage } from '../../services/investor-ready/use-cases/get-investor-package.js';
import { ListInvestorPackages } from '../../services/investor-ready/use-cases/list-investor-packages.js';

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

export async function registerInvestorReadyRoutes(
  fastify: FastifyInstance,
  investorRepo: IInvestorReadyRepository,
  userRepo: IUserMemoryRepository,
  startupRepo: IStartupMemoryRepository
): Promise<void> {
  const assessReadiness = new AssessInvestmentReadiness(userRepo, startupRepo);
  const generatePackage = new GenerateInvestorPackage(investorRepo, userRepo, startupRepo);
  const validatePackage = new ValidateInvestorPackage();
  const approvePackage = new ApproveInvestorPackage(investorRepo, startupRepo);
  const rejectPackage = new RejectInvestorPackage(investorRepo);
  const getPackage = new GetInvestorPackage(investorRepo);
  const listVersions = new ListInvestorPackages(investorRepo);

  // POST /services/investor-ready/assess
  fastify.post('/services/investor-ready/assess', async (request: FastifyRequest, reply: FastifyReply) => {
    const { founderProfileId, startupProfileId } = AssessSchema.parse(request.body);
    const result = await assessReadiness.execute(founderProfileId, startupProfileId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/investor-ready/create
  fastify.post('/services/investor-ready/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreatePackageSchema.parse(request.body);
    const result = await generatePackage.execute(parsed);
    return reply.status(201).send({ success: true, data: result });
  });

  // POST /services/investor-ready/validate
  fastify.post('/services/investor-ready/validate', async (request: FastifyRequest, reply: FastifyReply) => {
    const { content } = ValidatePackageSchema.parse(request.body);
    const result = validatePackage.execute(content);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/investor-ready/approve
  fastify.post('/services/investor-ready/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const { packageId } = PackageActionSchema.parse(request.body);
    const result = await approvePackage.execute(packageId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/investor-ready/reject
  fastify.post('/services/investor-ready/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const { packageId } = PackageActionSchema.parse(request.body);
    const result = await rejectPackage.execute(packageId);
    return reply.status(200).send({ success: true, data: result });
  });

  // GET /services/investor-ready/:id
  fastify.get('/services/investor-ready/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const pkg = await getPackage.execute(id);
    return reply.status(200).send({ success: true, data: pkg });
  });

  // GET /services/investor-ready/:id/versions
  fastify.get('/services/investor-ready/:id/versions', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const versions = await listVersions.execute(id);
    return reply.status(200).send({ success: true, data: versions });
  });
}
