import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IStartupHealthRepository } from '@core/ports/startup-health-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { AssessStartupHealth } from '../../services/startup-health/use-cases/assess-startup-health.js';
import { GenerateHealthReport } from '../../services/startup-health/use-cases/generate-health-report.js';
import { ApproveHealthAssessment } from '../../services/startup-health/use-cases/approve-health-assessment.js';
import { RejectHealthAssessment } from '../../services/startup-health/use-cases/reject-health-assessment.js';
import { GetHealthReport } from '../../services/startup-health/use-cases/get-health-report.js';
import { ListHealthReports } from '../../services/startup-health/use-cases/list-health-reports.js';

const AssessSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
});

const CreateReportSchema = z.object({
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
  blueprintId: z.string().uuid().optional(),
});

const ReportActionSchema = z.object({
  reportId: z.string().uuid(),
});

export async function registerStartupHealthRoutes(
  fastify: FastifyInstance,
  healthRepo: IStartupHealthRepository,
  userRepo: IUserMemoryRepository,
  startupRepo: IStartupMemoryRepository
): Promise<void> {
  const assessHealth = new AssessStartupHealth(userRepo, startupRepo);
  const generateReport = new GenerateHealthReport(healthRepo, userRepo, startupRepo);
  const approveAssessment = new ApproveHealthAssessment(healthRepo, startupRepo);
  const rejectAssessment = new RejectHealthAssessment(healthRepo);
  const getReport = new GetHealthReport(healthRepo);
  const listHistory = new ListHealthReports(healthRepo);

  // POST /services/startup-health/assess
  fastify.post('/services/startup-health/assess', async (request: FastifyRequest, reply: FastifyReply) => {
    const { founderProfileId, startupProfileId } = AssessSchema.parse(request.body);
    const result = await assessHealth.execute(founderProfileId, startupProfileId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/startup-health/create
  fastify.post('/services/startup-health/create', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = CreateReportSchema.parse(request.body);
    const result = await generateReport.execute(parsed);
    return reply.status(201).send({ success: true, data: result });
  });

  // POST /services/startup-health/approve
  fastify.post('/services/startup-health/approve', async (request: FastifyRequest, reply: FastifyReply) => {
    const { reportId } = ReportActionSchema.parse(request.body);
    const result = await approveAssessment.execute(reportId);
    return reply.status(200).send({ success: true, data: result });
  });

  // POST /services/startup-health/reject
  fastify.post('/services/startup-health/reject', async (request: FastifyRequest, reply: FastifyReply) => {
    const { reportId } = ReportActionSchema.parse(request.body);
    const result = await rejectAssessment.execute(reportId);
    return reply.status(200).send({ success: true, data: result });
  });

  // GET /services/startup-health/:id
  fastify.get('/services/startup-health/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const report = await getReport.execute(id);
    return reply.status(200).send({ success: true, data: report });
  });

  // GET /services/startup-health/:id/history
  fastify.get('/services/startup-health/:id/history', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id } = request.params as { id: string };
    const history = await listHistory.execute(id);
    return reply.status(200).send({ success: true, data: history });
  });
}
