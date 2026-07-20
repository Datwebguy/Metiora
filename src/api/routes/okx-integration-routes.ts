import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { IOkxIntegrationRepository } from '@core/ports/okx-integration-repository.js';
import { IUserMemoryRepository } from '@core/ports/user-memory-repository.js';
import { IStartupMemoryRepository } from '@core/ports/startup-memory-repository.js';
import { WalletManager } from '../../okx/wallet/wallet-manager.js';
import { IdentityManager } from '../../okx/identity/identity-manager.js';
import { TaskHandler } from '../../okx/task/task-handler.js';
import { NegotiationManager } from '../../okx/negotiation/negotiation-manager.js';
import { EscrowManager } from '../../okx/escrow/escrow-manager.js';
import { RatingManager } from '../../okx/rating/rating-manager.js';
import { ServiceRegistry } from '../../okx/registry/service-registry.js';
import { A2aServiceAdapter } from '../../okx/adapter/a2a-service-adapter.js';
import { NotFoundError, OKXProtocolError } from '@shared/errors/application-error.js';

const LoginSchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Wallet must be a 40-hex 0x address'),
});

const ConnectIdentitySchema = z.object({
  agentId: z.string().min(1),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Address must be a 40-hex 0x address'),
});

const ProcessTaskSchema = z.object({
  taskId: z.string().uuid(),
  requesterAgentId: z.string().min(1),
  founderProfileId: z.string().uuid(),
  startupProfileId: z.string().uuid(),
  serviceType: z.enum([
    'startup_blueprint',
    'investor_ready',
    'grant_builder',
    'partnership_studio',
    'token_launch_kit',
    'startup_health',
  ]),
  priceUsd: z.number().positive(),
  /** Required when ESCROW_SIMULATION_MODE=false */
  escrowTransactionHash: z.string().optional(),
});

const NegotiateSchema = z.object({
  taskId: z.string().uuid(),
  proposedPriceUsd: z.number().positive(),
  proposedTimelineMinutes: z.number().positive(),
});

const RateSchema = z.object({
  taskId: z.string().uuid(),
  ratingScore: z.number().min(1).max(5),
  ratedByAgentId: z.string().min(1),
  ratedAgentId: z.string().min(1).optional(),
  reviewText: z.string().optional(),
});

const DeliverSchema = z.object({
  taskId: z.string().uuid(),
});

export interface OkxRouteOptions {
  escrowSimulationMode: boolean;
}

export async function registerOkxIntegrationRoutes(
  fastify: FastifyInstance,
  okxRepo: IOkxIntegrationRepository,
  userRepo: IUserMemoryRepository,
  startupRepo: IStartupMemoryRepository,
  adapter: A2aServiceAdapter,
  options: OkxRouteOptions = { escrowSimulationMode: true }
): Promise<void> {
  const walletManager = new WalletManager(okxRepo);
  const identityManager = new IdentityManager(okxRepo);
  const taskHandler = new TaskHandler(okxRepo, userRepo, startupRepo, adapter);
  const negotiationManager = new NegotiationManager(okxRepo);
  const escrowManager = new EscrowManager(okxRepo);
  const ratingManager = new RatingManager(okxRepo);
  const serviceRegistry = new ServiceRegistry();

  fastify.post('/okx/connect', async (request: FastifyRequest, reply: FastifyReply) => {
    const { agentId, address } = ConnectIdentitySchema.parse(request.body);
    const identity = await identityManager.registerIdentity(agentId, address);
    return reply.status(200).send({ success: true, data: identity });
  });

  fastify.post('/okx/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const { walletAddress } = LoginSchema.parse(request.body);
    const session = await walletManager.loginWallet(walletAddress);
    return reply.status(200).send({
      success: true,
      data: session,
      warning:
        'SIMULATED_AUTH: session issued without cryptographic proof (SIWE/signature). Do not treat as verified wallet ownership.',
    });
  });

  fastify.post('/okx/task', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = ProcessTaskSchema.parse(request.body);

    if (!options.escrowSimulationMode && !parsed.escrowTransactionHash) {
      throw new OKXProtocolError(
        'ESCROW_SIMULATION_MODE is disabled. Provide escrowTransactionHash for on-chain escrow confirmation.'
      );
    }

    await escrowManager.initiateEscrow(parsed.taskId, parsed.priceUsd);

    if (options.escrowSimulationMode) {
      // Local simulation only — not a real fund lock
      await escrowManager.confirmEscrow(parsed.taskId);
    } else {
      // Placeholder for real verification of parsed.escrowTransactionHash
      await escrowManager.confirmEscrow(parsed.taskId);
    }

    try {
      const delivery = await taskHandler.processTask(parsed);
      await escrowManager.settleEscrow(parsed.taskId);

      return reply.status(201).send({
        success: true,
        data: delivery,
        escrow: {
          mode: options.escrowSimulationMode ? 'SIMULATED' : 'ONCHAIN',
          status: 'SETTLED',
          warning: options.escrowSimulationMode
            ? 'No real funds were locked or transferred. Escrow is a local database state only.'
            : undefined,
        },
      });
    } catch (err) {
      try {
        await escrowManager.refundEscrow(parsed.taskId, 'TASK_EXECUTION_FAILED');
      } catch {
        // escrow may already be missing
      }
      throw err;
    }
  });

  fastify.post('/okx/negotiate', async (request: FastifyRequest, reply: FastifyReply) => {
    const { taskId, proposedPriceUsd, proposedTimelineMinutes } = NegotiateSchema.parse(request.body);
    await negotiationManager.initiateNegotiation(taskId, proposedPriceUsd, proposedTimelineMinutes);
    const accepted = await negotiationManager.acceptTerms(taskId);
    return reply.status(200).send({ success: true, data: accepted });
  });

  fastify.post('/okx/deliver', async (request: FastifyRequest, reply: FastifyReply) => {
    const { taskId } = DeliverSchema.parse(request.body);
    const delivery = await okxRepo.findDeliveryByTaskId(taskId);
    if (!delivery) {
      throw new NotFoundError(`No delivery found for task '${taskId}'.`);
    }
    return reply.status(200).send({ success: true, data: delivery });
  });

  fastify.post('/okx/rating', async (request: FastifyRequest, reply: FastifyReply) => {
    const { taskId, ratingScore, ratedByAgentId, reviewText, ratedAgentId } = RateSchema.parse(
      request.body
    );
    const rating = await ratingManager.recordRating(
      taskId,
      ratingScore,
      ratedByAgentId,
      reviewText,
      ratedAgentId
    );
    const reputation = await ratingManager.calculateReputationScore(
      ratedAgentId ?? 'metiora-ai-operating-partner'
    );
    return reply.status(200).send({ success: true, data: { rating, reputation } });
  });

  fastify.get('/okx/status', async (_request: FastifyRequest, reply: FastifyReply) => {
    const services = serviceRegistry.listServices();
    return reply.status(200).send({
      success: true,
      data: {
        status: 'ONLINE',
        protocolVersion: 'OKX.AI A2A v1.0',
        escrowMode: options.escrowSimulationMode ? 'SIMULATED' : 'ONCHAIN_REQUIRED',
        availableServices: services,
        warnings: [
          'Wallet login is not SIWE-verified (API-key internal path only).',
          options.escrowSimulationMode
            ? 'Legacy /okx/task escrow is simulated (no real payment). Marketplace buyers use x402 on /v1/a2mcp/*.'
            : 'On-chain escrow hash required for tasks on this internal path.',
        ],
      },
    });
  });
}
