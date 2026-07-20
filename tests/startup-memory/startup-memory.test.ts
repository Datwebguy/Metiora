import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from './in-memory-startup-memory-repository.js';
import { CreateFounderProfile } from '../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../src/memory/startup-memory/use-cases/create-startup.js';
import { GetStartup } from '../../src/memory/startup-memory/use-cases/get-startup.js';
import { UpdateStartup } from '../../src/memory/startup-memory/use-cases/update-startup.js';
import { ApproveStartupUpdate } from '../../src/memory/startup-memory/use-cases/approve-startup-update.js';
import { RejectStartupUpdate } from '../../src/memory/startup-memory/use-cases/reject-startup-update.js';
import { GenerateStartupSnapshot } from '../../src/memory/startup-memory/use-cases/generate-startup-snapshot.js';
import { GetStartupHistory } from '../../src/memory/startup-memory/use-cases/get-startup-history.js';
import { ListFounderStartups } from '../../src/memory/startup-memory/use-cases/list-founder-startups.js';
import { StartupConflictDetector } from '../../src/memory/startup-memory/domain/startup-conflict-detector.js';

describe('Startup Memory Engine Core Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let createFounder: CreateFounderProfile;
  let createStartup: CreateStartup;
  let getStartup: GetStartup;
  let updateStartup: UpdateStartup;
  let approveUpdate: ApproveStartupUpdate;
  let rejectUpdate: RejectStartupUpdate;
  let generateSnapshot: GenerateStartupSnapshot;
  let getHistory: GetStartupHistory;
  let listFounderStartups: ListFounderStartups;

  let founderId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();

    createFounder = new CreateFounderProfile(userRepo);
    createStartup = new CreateStartup(startupRepo, userRepo);
    getStartup = new GetStartup(startupRepo);
    updateStartup = new UpdateStartup(startupRepo);
    approveUpdate = new ApproveStartupUpdate(startupRepo);
    rejectUpdate = new RejectStartupUpdate(startupRepo);
    generateSnapshot = new GenerateStartupSnapshot(startupRepo);
    getHistory = new GetStartupHistory(startupRepo);
    listFounderStartups = new ListFounderStartups(startupRepo, userRepo);

    const founder = await createFounder.execute({
      email: 'founder@metiora.ai',
      fullName: 'Serial Founder',
    });
    founderId = founder.id;
  });

  it('should create a new startup linked to a founder', async () => {
    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Metiora AI',
      industry: 'Artificial Intelligence',
      mission: 'Turn ideas into enduring companies.',
      problemStatement: 'AI models generate isolated outputs without company memory.',
    });

    expect(startup).toBeDefined();
    expect(startup.founderProfileId).toBe(founderId);
    expect(startup.version).toBe(1);
    expect(startup.identity.name.value).toBe('Metiora AI');
    expect(startup.vision.mission?.value).toBe('Turn ideas into enduring companies.');
  });

  it('should support multiple independent startups per founder', async () => {
    await createStartup.execute({
      founderProfileId: founderId,
      name: 'Startup One',
      industry: 'FinTech',
    });

    await createStartup.execute({
      founderProfileId: founderId,
      name: 'Startup Two',
      industry: 'HealthTech',
    });

    const startups = await listFounderStartups.execute(founderId);
    expect(startups.length).toBe(2);
    expect(startups.map((s) => s.name)).toContain('Startup One');
    expect(startups.map((s) => s.name)).toContain('Startup Two');
  });

  it('should retrieve an existing startup profile by ID', async () => {
    const created = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Retrievable Startup',
      industry: 'Web3',
    });

    const retrieved = await getStartup.execute(created.id);
    expect(retrieved.name).toBe('Retrievable Startup');
  });

  it('should update startup knowledge directly when no conflicts exist', async () => {
    const created = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Evolving Startup',
      industry: 'SaaS',
    });

    const result = await updateStartup.execute({
      startupId: created.id,
      incomingData: {
        solution: {
          productDescription: { value: 'Autonomous business workspace.', confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
          coreFeatures: { value: ['Company Memory', 'Strategic Intelligence'], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
        },
      },
    });

    expect(result.type).toBe('UPDATED');
    if (result.type === 'UPDATED') {
      expect(result.startup.version).toBe(2);
      expect(result.startup.solution.productDescription?.value).toBe('Autonomous business workspace.');
    }
  });

  it('should detect conflicts and create pending proposal when core fields differ', async () => {
    const created = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Conflicting Startup',
      industry: 'Logistics',
      mission: 'Faster delivery.',
    });

    const result = await updateStartup.execute({
      startupId: created.id,
      incomingData: {
        vision: {
          mission: { value: 'Autonomous delivery infrastructure.', confidence: 'MEDIUM', source: 'ai_inferred', updatedAt: new Date() },
          coreValues: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
          longTermGoals: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
        },
      },
    });

    expect(result.type).toBe('PROPOSAL_CREATED');
    if (result.type === 'PROPOSAL_CREATED') {
      expect(result.proposal.status).toBe('PENDING');
      expect(result.proposal.conflicts.length).toBeGreaterThan(0);
      expect(result.proposal.conflicts[0].fieldPath).toBe('vision.mission');
    }
  });

  it('should approve pending update proposal and increment startup version', async () => {
    const created = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Approved Startup',
      industry: 'DeFi',
      mission: 'Old mission.',
    });

    const updateRes = await updateStartup.execute({
      startupId: created.id,
      incomingData: {
        vision: {
          mission: { value: 'New approved mission.', confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
          coreValues: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
          longTermGoals: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
        },
      },
    });

    if (updateRes.type === 'PROPOSAL_CREATED') {
      const approved = await approveUpdate.execute(updateRes.proposal.id);
      expect(approved.vision.mission?.value).toBe('New approved mission.');
      expect(approved.version).toBe(2);
    }
  });

  it('should reject pending update proposal without mutating startup memory', async () => {
    const created = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Rejected Startup',
      industry: 'EdTech',
      mission: 'Keep original.',
    });

    const updateRes = await updateStartup.execute({
      startupId: created.id,
      incomingData: {
        vision: {
          mission: { value: 'Proposed rejected mission.', confidence: 'LOW', source: 'ai_inferred', updatedAt: new Date() },
          coreValues: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
          longTermGoals: { value: [], confidence: 'HIGH', source: 'user_explicit', updatedAt: new Date() },
        },
      },
    });

    if (updateRes.type === 'PROPOSAL_CREATED') {
      const rejectedProp = await rejectUpdate.execute(updateRes.proposal.id);
      expect(rejectedProp.status).toBe('REJECTED');

      const startup = await getStartup.execute(created.id);
      expect(startup.vision.mission?.value).toBe('Keep original.');
      expect(startup.version).toBe(1);
    }
  });

  it('should generate standardized Startup Memory Snapshot for downstream AI modules', async () => {
    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Snapshot Startup',
      industry: 'Developer Tools',
      mission: 'Empower developers.',
      problemStatement: 'Fragmented tools.',
      productDescription: 'Unified CLI workspace.',
    });

    const snapshot = await generateSnapshot.execute(startup.id);
    expect(snapshot.startupId).toBe(startup.id);
    expect(snapshot.founderId).toBe(founderId);
    expect(snapshot.companyProfile.name).toBe('Snapshot Startup');
    expect(snapshot.foundation.mission).toBe('Empower developers.');
    expect(snapshot.problemAndSolution.productDescription).toBe('Unified CLI workspace.');
  });

  it('should record deliverable in registry and link to startup memory', async () => {
    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Registry Startup',
      industry: 'AI',
    });

    const deliverable = await startupRepo.recordDeliverable(startup.id, {
      serviceType: 'startup_blueprint',
      title: 'Initial Startup Blueprint',
      contentMarkdown: '# Metiora Blueprint\n...',
      versionNumber: 1,
      metadata: { generatedBy: 'MetioraBlueprintEngine' },
    });

    expect(deliverable).toBeDefined();
    expect(deliverable.id).toBeDefined();

    const updatedStartup = await getStartup.execute(startup.id);
    expect(updatedStartup.deliverables.length).toBe(1);
    expect(updatedStartup.deliverables[0].serviceType).toBe('startup_blueprint');
  });

  it('should maintain immutable version history across approved changes', async () => {
    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Versioned Startup',
      industry: 'AI',
    });

    const history = await getHistory.execute(startup.id);
    expect(history.length).toBe(1);
    expect(history[0].versionNumber).toBe(1);
  });
});
