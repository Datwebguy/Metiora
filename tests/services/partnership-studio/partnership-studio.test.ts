import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryPartnershipStudioRepository } from './in-memory-partnership-studio-repository.js';
import { CreateFounderProfile } from '../../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../../src/memory/startup-memory/use-cases/create-startup.js';
import { AssessPartnershipReadiness } from '../../../src/services/partnership-studio/use-cases/assess-partnership-readiness.js';
import { GeneratePartnershipPackage } from '../../../src/services/partnership-studio/use-cases/generate-partnership-package.js';
import { ValidatePartnershipPackage } from '../../../src/services/partnership-studio/use-cases/validate-partnership-package.js';
import { ApprovePartnershipPackage } from '../../../src/services/partnership-studio/use-cases/approve-partnership-package.js';
import { RejectPartnershipPackage } from '../../../src/services/partnership-studio/use-cases/reject-partnership-package.js';
import { GetPartnershipPackage } from '../../../src/services/partnership-studio/use-cases/get-partnership-package.js';
import { ListPartnershipPackages } from '../../../src/services/partnership-studio/use-cases/list-partnership-packages.js';

describe('Partnership Studio Service Core Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let partnershipRepo: InMemoryPartnershipStudioRepository;

  let createFounder: CreateFounderProfile;
  let createStartup: CreateStartup;
  let assessReadiness: AssessPartnershipReadiness;
  let generatePackage: GeneratePartnershipPackage;
  let validatePackage: ValidatePartnershipPackage;
  let approvePackage: ApprovePartnershipPackage;
  let rejectPackage: RejectPartnershipPackage;
  let getPackage: GetPartnershipPackage;
  let listVersions: ListPartnershipPackages;

  let founderId: string;
  let startupId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    partnershipRepo = new InMemoryPartnershipStudioRepository();

    createFounder = new CreateFounderProfile(userRepo);
    createStartup = new CreateStartup(startupRepo, userRepo);
    assessReadiness = new AssessPartnershipReadiness(userRepo, startupRepo);
    generatePackage = new GeneratePartnershipPackage(partnershipRepo, userRepo, startupRepo);
    validatePackage = new ValidatePartnershipPackage();
    approvePackage = new ApprovePartnershipPackage(partnershipRepo, startupRepo);
    rejectPackage = new RejectPartnershipPackage(partnershipRepo);
    getPackage = new GetPartnershipPackage(partnershipRepo);
    listVersions = new ListPartnershipPackages(partnershipRepo);

    const founder = await createFounder.execute({
      email: 'partner@metiora.ai',
      fullName: 'Alliance Partner Founder',
    });
    founderId = founder.id;

    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Alliance Tech',
      industry: 'Developer Ecosystem',
      mission: 'Connect developer tools through persistent memory.',
      problemStatement: 'Siloed developer tools cause data friction.',
      productDescription: 'Unified developer API with persistent Company Memory.',
      businessModel: 'API Licensing & Revenue Share',
    });
    startupId = startup.id;
  });

  it('should assess partnership readiness score and identify strengths and risks', async () => {
    const assessment = await assessReadiness.execute(founderId, startupId);
    expect(assessment.overallScore).toBeGreaterThan(50);
    expect(assessment.strengths.length).toBeGreaterThan(0);
  });

  it('should generate a Partnership Package across various partnership categories', async () => {
    const pkg = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
      category: 'INTEGRATION',
    });

    expect(pkg).toBeDefined();
    expect(pkg.status).toBe('PENDING');
    expect(pkg.readinessScore).toBeGreaterThan(50);
    expect(pkg.content.category).toBe('INTEGRATION');
    expect(pkg.content.proposal.title).toContain('Alliance Tech');
    expect(pkg.contentMarkdown).toContain('# Alliance Tech & Partner Strategic INTEGRATION Proposal');
  });

  it('should validate partnership package elements', async () => {
    const pkg = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const validation = validatePackage.execute(pkg.content);
    expect(validation.isValid).toBe(true);
  });

  it('should approve partnership package and persist proposal title into Startup Memory and Deliverable Registry', async () => {
    const created = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const approved = await approvePackage.execute(created.id);
    expect(approved.status).toBe('APPROVED');

    const startup = await startupRepo.findById(startupId);
    expect(startup?.version).toBe(2);
    expect(startup?.deliverables.length).toBe(1);
    expect(startup?.deliverables[0].serviceType).toBe('partnership_studio');
  });

  it('should reject partnership package draft without mutating Startup Memory', async () => {
    const created = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const rejected = await rejectPackage.execute(created.id);
    expect(rejected.status).toBe('REJECTED');

    const startup = await startupRepo.findById(startupId);
    expect(startup?.version).toBe(1);
    expect(startup?.deliverables.length).toBe(0);
  });

  it('should maintain partnership package version history', async () => {
    const created = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    await approvePackage.execute(created.id);
    const versions = await listVersions.execute(created.id);

    expect(versions.length).toBeGreaterThan(0);
    expect(versions[0].packageId).toBe(created.id);
  });
});
