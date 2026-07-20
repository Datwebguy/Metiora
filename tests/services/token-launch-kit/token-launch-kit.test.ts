import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryTokenLaunchKitRepository } from './in-memory-token-launch-kit-repository.js';
import { CreateFounderProfile } from '../../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../../src/memory/startup-memory/use-cases/create-startup.js';
import { AssessTokenReadiness } from '../../../src/services/token-launch-kit/use-cases/assess-token-readiness.js';
import { GenerateTokenLaunchKit } from '../../../src/services/token-launch-kit/use-cases/generate-token-launch-kit.js';
import { ValidateTokenLaunchKit } from '../../../src/services/token-launch-kit/use-cases/validate-token-launch-kit.js';
import { ApproveTokenLaunchKit } from '../../../src/services/token-launch-kit/use-cases/approve-token-launch-kit.js';
import { RejectTokenLaunchKit } from '../../../src/services/token-launch-kit/use-cases/reject-token-launch-kit.js';
import { GetTokenLaunchKit } from '../../../src/services/token-launch-kit/use-cases/get-token-launch-kit.js';
import { ListTokenLaunchKits } from '../../../src/services/token-launch-kit/use-cases/list-token-launch-kits.js';

describe('Token Launch Kit Service Core Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let tokenRepo: InMemoryTokenLaunchKitRepository;

  let createFounder: CreateFounderProfile;
  let createStartup: CreateStartup;
  let assessReadiness: AssessTokenReadiness;
  let generateKit: GenerateTokenLaunchKit;
  let validateKit: ValidateTokenLaunchKit;
  let approveKit: ApproveTokenLaunchKit;
  let rejectKit: RejectTokenLaunchKit;
  let getKit: GetTokenLaunchKit;
  let listVersions: ListTokenLaunchKits;

  let founderId: string;
  let web3StartupId: string;
  let web2StartupId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    tokenRepo = new InMemoryTokenLaunchKitRepository();

    createFounder = new CreateFounderProfile(userRepo);
    createStartup = new CreateStartup(startupRepo, userRepo);
    assessReadiness = new AssessTokenReadiness(userRepo, startupRepo);
    generateKit = new GenerateTokenLaunchKit(tokenRepo, userRepo, startupRepo);
    validateKit = new ValidateTokenLaunchKit();
    approveKit = new ApproveTokenLaunchKit(tokenRepo, startupRepo);
    rejectKit = new RejectTokenLaunchKit(tokenRepo);
    getKit = new GetTokenLaunchKit(tokenRepo);
    listVersions = new ListTokenLaunchKits(tokenRepo);

    const founder = await createFounder.execute({
      email: 'token@metiora.ai',
      fullName: 'Token Architect Founder',
    });
    founderId = founder.id;

    const web3Startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'DeFi Memory Protocol',
      industry: 'Web3 & Blockchain',
      mission: 'Decentralize AI memory context onchain.',
      problemStatement: 'Siloed Web2 AI agents.',
      productDescription: 'Onchain ASP Escrow protocol.',
    });
    web3StartupId = web3Startup.id;

    const web2Startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Local Bakery SaaS',
      industry: 'Food & Beverage SaaS',
      mission: 'Software for local bakeries.',
    });
    web2StartupId = web2Startup.id;
  });

  it('should assess token readiness and recommend against tokenization for inappropriate business models', async () => {
    const web2Assessment = await assessReadiness.execute(founderId, web2StartupId);
    expect(web2Assessment.isAppropriate).toBe(false);
    expect(web2Assessment.recommendationReasoning).toContain('NOT recommended');

    const web3Assessment = await assessReadiness.execute(founderId, web3StartupId);
    expect(web3Assessment.isAppropriate).toBe(true);
  });

  it('should generate a Token Launch Kit with dual JSON and Markdown representations', async () => {
    const kit = await generateKit.execute({
      founderProfileId: founderId,
      startupProfileId: web3StartupId,
    });

    expect(kit).toBeDefined();
    expect(kit.status).toBe('PENDING');
    expect(kit.content.isAppropriate).toBe(true);
    expect(kit.content.strategy.tokenSymbol).toBeDefined();
    expect(kit.contentMarkdown).toContain('Token Launch Kit');
  });

  it('should validate token kit allocations and utility models', async () => {
    const kit = await generateKit.execute({
      founderProfileId: founderId,
      startupProfileId: web3StartupId,
    });

    const validation = validateKit.execute(kit.content);
    expect(validation.isValid).toBe(true);
    expect(validation.conflicts.length).toBe(0);
  });

  it('should approve token kit and persist tokenomics into Startup Memory and Deliverable Registry', async () => {
    const created = await generateKit.execute({
      founderProfileId: founderId,
      startupProfileId: web3StartupId,
    });

    const approved = await approveKit.execute(created.id);
    expect(approved.status).toBe('APPROVED');

    const startup = await startupRepo.findById(web3StartupId);
    expect(startup?.version).toBe(2);
    expect(startup?.deliverables.length).toBe(1);
    expect(startup?.deliverables[0].serviceType).toBe('token_launch_kit');
  });

  it('should reject token kit draft without mutating Startup Memory', async () => {
    const created = await generateKit.execute({
      founderProfileId: founderId,
      startupProfileId: web3StartupId,
    });

    const rejected = await rejectKit.execute(created.id);
    expect(rejected.status).toBe('REJECTED');

    const startup = await startupRepo.findById(web3StartupId);
    expect(startup?.version).toBe(1);
    expect(startup?.deliverables.length).toBe(0);
  });

  it('should maintain token launch kit version history', async () => {
    const created = await generateKit.execute({
      founderProfileId: founderId,
      startupProfileId: web3StartupId,
    });

    await approveKit.execute(created.id);
    const versions = await listVersions.execute(created.id);

    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0].kitId).toBe(created.id);
  });
});
