import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryStartupBlueprintRepository } from '../services/startup-blueprint/in-memory-startup-blueprint-repository.js';
import { InMemoryOkxIntegrationRepository } from './in-memory-okx-integration-repository.js';
import { CreateFounderProfile } from '../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../src/memory/startup-memory/use-cases/create-startup.js';
import { WalletManager } from '../../src/okx/wallet/wallet-manager.js';
import { IdentityManager } from '../../src/okx/identity/identity-manager.js';
import { ServiceRegistry } from '../../src/okx/registry/service-registry.js';
import { NegotiationManager } from '../../src/okx/negotiation/negotiation-manager.js';
import { EscrowManager } from '../../src/okx/escrow/escrow-manager.js';
import { RatingManager } from '../../src/okx/rating/rating-manager.js';
import { TaskHandler } from '../../src/okx/task/task-handler.js';
import { A2aServiceAdapter } from '../../src/okx/adapter/a2a-service-adapter.js';

describe('OKX.AI Ecosystem & OnchainOS Integration Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let blueprintRepo: InMemoryStartupBlueprintRepository;
  let okxRepo: InMemoryOkxIntegrationRepository;

  let walletManager: WalletManager;
  let identityManager: IdentityManager;
  let serviceRegistry: ServiceRegistry;
  let negotiationManager: NegotiationManager;
  let escrowManager: EscrowManager;
  let ratingManager: RatingManager;
  let taskHandler: TaskHandler;

  let founderId: string;
  let startupId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    blueprintRepo = new InMemoryStartupBlueprintRepository();
    okxRepo = new InMemoryOkxIntegrationRepository();

    walletManager = new WalletManager(okxRepo);
    identityManager = new IdentityManager(okxRepo);
    serviceRegistry = new ServiceRegistry();
    negotiationManager = new NegotiationManager(okxRepo);
    escrowManager = new EscrowManager(okxRepo);
    ratingManager = new RatingManager(okxRepo);

    const adapter = new A2aServiceAdapter(userRepo, startupRepo, blueprintRepo);
    taskHandler = new TaskHandler(okxRepo, userRepo, startupRepo, adapter);

    const createFounder = new CreateFounderProfile(userRepo);
    const createStartup = new CreateStartup(startupRepo, userRepo);

    const founder = await createFounder.execute({
      email: 'okx.agent@metiora.ai',
      fullName: 'OKX ASP Founder',
    });
    founderId = founder.id;

    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'OKX Agentic Protocol',
      industry: 'A2A Agent Infrastructure',
      mission: 'Provide persistent memory to OKX.AI agents.',
      problemStatement: 'Transient agent sessions lose state.',
      productDescription: 'Persistent Company Memory ASP Service.',
      websiteUrl: 'https://okx-metiora.ai',
    });
    startupId = startup.id;
  });

  it('should authenticate Agentic Wallet and manage sessions', async () => {
    const session = await walletManager.loginWallet('0x1234567890abcdef1234567890abcdef12345678');
    expect(session.sessionToken).toContain('okx_sess_');
    expect(session.status).toBe('ACTIVE');

    const validated = await walletManager.validateSession(session.sessionToken);
    expect(validated.walletAddress).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  it('should register and retrieve OKX Agent Identity', async () => {
    const identity = await identityManager.registerIdentity('agent-metiora-asp', '0x1234567890abcdef1234567890abcdef12345678');
    expect(identity.agentId).toBe('agent-metiora-asp');

    const fetched = await identityManager.getIdentity('agent-metiora-asp');
    expect(fetched.address).toBe('0x1234567890abcdef1234567890abcdef12345678');
  });

  it('should register and list all 6 Metiora services for Marketplace Discovery', async () => {
    const services = serviceRegistry.listServices();
    expect(services.length).toBe(6);

    const blueprintMeta = serviceRegistry.getServiceMetadata('startup_blueprint');
    expect(blueprintMeta?.basePriceUsd).toBe(7);
  });

  it('should manage A2A pricing and timeline negotiation', async () => {
    const taskId = crypto.randomUUID();
    await okxRepo.saveTask({
      taskId,
      requesterAgentId: 'buyer-agent-99',
      founderProfileId: founderId,
      startupProfileId: startupId,
      serviceType: 'startup_blueprint',
      status: 'RECEIVED',
      scope: {},
      pricing: { priceUsd: 50, currency: 'USD' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const neg = await negotiationManager.initiateNegotiation(taskId, 50, 5);
    expect(neg.status).toBe('OPEN');

    const accepted = await negotiationManager.acceptTerms(taskId);
    expect(accepted.status).toBe('ACCEPTED');
  });

  it('should manage OKX Escrow lifecycle events', async () => {
    const taskId = crypto.randomUUID();
    const initiated = await escrowManager.initiateEscrow(taskId, 50);
    expect(initiated.status).toBe('INITIATED');

    const confirmed = await escrowManager.confirmEscrow(taskId);
    expect(confirmed.status).toBe('CONFIRMED');

    const settled = await escrowManager.settleEscrow(taskId);
    expect(settled.status).toBe('SETTLED');
  });

  it('should execute the complete A2A Task Lifecycle from request to delivery', async () => {
    const taskId = crypto.randomUUID();
    const delivery = await taskHandler.processTask({
      taskId,
      requesterAgentId: 'buyer-agent-99',
      founderProfileId: founderId,
      startupProfileId: startupId,
      serviceType: 'startup_blueprint',
      priceUsd: 50,
    });

    expect(delivery.taskId).toBe(taskId);
    expect(delivery.contentMarkdown).toContain('Executive Summary');
    expect(delivery.confidenceScore).toBeGreaterThan(0.5);
  });

  it('should record ratings and calculate agent reputation scores', async () => {
    const taskId = crypto.randomUUID();
    await okxRepo.saveTask({
      taskId,
      requesterAgentId: 'buyer-agent-99',
      founderProfileId: founderId,
      startupProfileId: startupId,
      serviceType: 'startup_blueprint',
      status: 'DELIVERED',
      scope: {},
      pricing: { priceUsd: 50, currency: 'USD' },
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await ratingManager.recordRating(
      taskId,
      5.0,
      'buyer-agent-99',
      'Outstanding service delivery!',
      'metiora-ai-operating-partner'
    );

    // Reputation is for the ASP (provider), not the buyer who submitted the rating
    const reputation = await ratingManager.calculateReputationScore('metiora-ai-operating-partner');
    expect(reputation.averageScore).toBe(5.0);
    expect(reputation.totalRatings).toBe(1);
    expect(reputation.agentId).toBe('metiora-ai-operating-partner');
  });
});

