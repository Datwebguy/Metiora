import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryStartupBlueprintRepository } from './in-memory-startup-blueprint-repository.js';
import { CreateFounderProfile } from '../../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../../src/memory/startup-memory/use-cases/create-startup.js';
import { CreateStartupBlueprint } from '../../../src/services/startup-blueprint/use-cases/create-startup-blueprint.js';
import { ValidateBlueprint } from '../../../src/services/startup-blueprint/use-cases/validate-blueprint.js';
import { ApproveBlueprint } from '../../../src/services/startup-blueprint/use-cases/approve-blueprint.js';
import { RejectBlueprint } from '../../../src/services/startup-blueprint/use-cases/reject-blueprint.js';
import { GetBlueprint } from '../../../src/services/startup-blueprint/use-cases/get-blueprint.js';
import { ListBlueprintVersions } from '../../../src/services/startup-blueprint/use-cases/list-blueprint-versions.js';
import { CompareBlueprintVersions } from '../../../src/services/startup-blueprint/use-cases/compare-blueprint-versions.js';

describe('Startup Blueprint Service Core Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let blueprintRepo: InMemoryStartupBlueprintRepository;

  let createFounder: CreateFounderProfile;
  let createStartup: CreateStartup;
  let createBlueprint: CreateStartupBlueprint;
  let validateBlueprint: ValidateBlueprint;
  let approveBlueprint: ApproveBlueprint;
  let rejectBlueprint: RejectBlueprint;
  let getBlueprint: GetBlueprint;
  let listVersions: ListBlueprintVersions;
  let compareVersions: CompareBlueprintVersions;

  let founderId: string;
  let startupId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    blueprintRepo = new InMemoryStartupBlueprintRepository();

    createFounder = new CreateFounderProfile(userRepo);
    createStartup = new CreateStartup(startupRepo, userRepo);
    createBlueprint = new CreateStartupBlueprint(blueprintRepo, userRepo, startupRepo);
    validateBlueprint = new ValidateBlueprint();
    approveBlueprint = new ApproveBlueprint(blueprintRepo, startupRepo);
    rejectBlueprint = new RejectBlueprint(blueprintRepo);
    getBlueprint = new GetBlueprint(blueprintRepo);
    listVersions = new ListBlueprintVersions(blueprintRepo);
    compareVersions = new CompareBlueprintVersions(blueprintRepo);

    const founder = await createFounder.execute({
      email: 'founder@blueprint.ai',
      fullName: 'Blueprint Founder',
    });
    founderId = founder.id;

    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Blueprint Corp',
      industry: 'Enterprise SaaS',
      mission: 'Transform enterprise workflow.',
      problemStatement: 'Manual business planning is fragmented.',
      productDescription: 'Canonical AI Startup Blueprint Workspace.',
      businessModel: 'B2B SaaS Model',
    });
    startupId = startup.id;
  });

  it('should create a canonical Startup Blueprint with dual JSON and Markdown representations', async () => {
    const blueprint = await createBlueprint.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    expect(blueprint).toBeDefined();
    expect(blueprint.status).toBe('PENDING');
    expect(blueprint.content.executiveSummary.startupName).toBe('Blueprint Corp');
    expect(blueprint.contentMarkdown).toContain('# Blueprint Corp — Canonical Startup Blueprint');
  });

  it('should validate blueprint structure and report consistency results', () => {
    const blueprintContent = {
      executiveSummary: { startupName: 'Test Corp', industry: 'AI', stage: 'MVP', executiveOverview: 'Overview' },
      problem: { problemStatement: 'Problem', marketPainPoints: [], existingAlternatives: [] },
      solution: { productDescription: 'Solution', uniqueValueProp: 'UVP', competitiveAdvantage: 'Advantage', coreFeatures: [] },
      businessModel: { businessModel: 'B2B SaaS' },
      roadmap: { currentStage: 'MVP', keyMilestones: [], upcomingReleases: [] },
      riskAssessment: { identifiedRisks: [], mitigationStrategies: [] },
      growthStrategy: { targetCustomers: 'Founders', marketOpportunity: 'Opportunity', goToMarketStrategy: 'Strategy', successMetrics: [] },
    };

    const result = validateBlueprint.execute(blueprintContent);
    expect(result.isValid).toBe(true);
  });

  it('should approve blueprint and persist approved facts into Startup Memory and Deliverable Registry', async () => {
    const created = await createBlueprint.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const approved = await approveBlueprint.execute(created.id);
    expect(approved.status).toBe('APPROVED');

    // Verify Startup Memory persistence
    const startup = await startupRepo.findById(startupId);
    expect(startup?.version).toBe(2);
    expect(startup?.deliverables.length).toBe(1);
    expect(startup?.deliverables[0].serviceType).toBe('startup_blueprint');
  });

  it('should reject blueprint proposal without mutating Startup Memory', async () => {
    const created = await createBlueprint.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const rejected = await rejectBlueprint.execute(created.id);
    expect(rejected.status).toBe('REJECTED');

    const startup = await startupRepo.findById(startupId);
    expect(startup?.version).toBe(1);
    expect(startup?.deliverables.length).toBe(0);
  });

  it('should maintain blueprint version history across updates', async () => {
    const created = await createBlueprint.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    await approveBlueprint.execute(created.id);
    const versions = await listVersions.execute(created.id);

    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0].blueprintId).toBe(created.id);
  });

  it('should retrieve a blueprint by ID', async () => {
    const created = await createBlueprint.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const retrieved = await getBlueprint.execute(created.id);
    expect(retrieved.id).toBe(created.id);
  });
});
