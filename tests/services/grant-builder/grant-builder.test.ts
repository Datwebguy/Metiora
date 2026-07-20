import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryGrantBuilderRepository } from './in-memory-grant-builder-repository.js';
import { CreateFounderProfile } from '../../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../../src/memory/startup-memory/use-cases/create-startup.js';
import { AssessGrantReadiness } from '../../../src/services/grant-builder/use-cases/assess-grant-readiness.js';
import { GenerateGrantPackage } from '../../../src/services/grant-builder/use-cases/generate-grant-package.js';
import { ValidateGrantPackage } from '../../../src/services/grant-builder/use-cases/validate-grant-package.js';
import { ApproveGrantPackage } from '../../../src/services/grant-builder/use-cases/approve-grant-package.js';
import { RejectGrantPackage } from '../../../src/services/grant-builder/use-cases/reject-grant-package.js';
import { GetGrantPackage } from '../../../src/services/grant-builder/use-cases/get-grant-package.js';
import { ListGrantPackages } from '../../../src/services/grant-builder/use-cases/list-grant-packages.js';

describe('Grant Builder Service Core Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let grantRepo: InMemoryGrantBuilderRepository;

  let createFounder: CreateFounderProfile;
  let createStartup: CreateStartup;
  let assessReadiness: AssessGrantReadiness;
  let generatePackage: GenerateGrantPackage;
  let validatePackage: ValidateGrantPackage;
  let approvePackage: ApproveGrantPackage;
  let rejectPackage: RejectGrantPackage;
  let getPackage: GetGrantPackage;
  let listVersions: ListGrantPackages;

  let founderId: string;
  let startupId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    grantRepo = new InMemoryGrantBuilderRepository();

    createFounder = new CreateFounderProfile(userRepo);
    createStartup = new CreateStartup(startupRepo, userRepo);
    assessReadiness = new AssessGrantReadiness(userRepo, startupRepo);
    generatePackage = new GenerateGrantPackage(grantRepo, userRepo, startupRepo);
    validatePackage = new ValidateGrantPackage();
    approvePackage = new ApproveGrantPackage(grantRepo, startupRepo);
    rejectPackage = new RejectGrantPackage(grantRepo);
    getPackage = new GetGrantPackage(grantRepo);
    listVersions = new ListGrantPackages(grantRepo);

    const founder = await createFounder.execute({
      email: 'grant@metiora.ai',
      fullName: 'Grant Applicant Founder',
    });
    founderId = founder.id;

    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Ecosystem Tech',
      industry: 'Open Infrastructure',
      mission: 'Advance open Web3 ecosystem infrastructure.',
      problemStatement: 'Lack of open persistent memory protocols.',
      productDescription: 'Open autonomous workspace with persistent Company Memory.',
      websiteUrl: 'https://ecosystem.ai',
    });
    startupId = startup.id;
  });

  it('should assess grant readiness score and produce strengths and requirements', async () => {
    const assessment = await assessReadiness.execute(founderId, startupId);
    expect(assessment.overallScore).toBeGreaterThan(50);
    expect(assessment.strengths.length).toBeGreaterThan(0);
  });

  it('should generate a Grant Package with dual JSON and Markdown representations', async () => {
    const pkg = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    expect(pkg).toBeDefined();
    expect(pkg.status).toBe('PENDING');
    expect(pkg.readinessScore).toBeGreaterThan(50);
    expect(pkg.content.projectDescription.projectTitle).toContain('Ecosystem Tech');
    expect(pkg.contentMarkdown).toContain('# Ecosystem Tech — Ecosystem Innovation & Infrastructure Grant Proposal');
  });

  it('should validate grant package budget and structural elements', async () => {
    const pkg = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const validation = validatePackage.execute(pkg.content);
    expect(validation.isValid).toBe(true);
  });

  it('should approve grant package and persist grant title into Startup Memory and Deliverable Registry', async () => {
    const created = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const approved = await approvePackage.execute(created.id);
    expect(approved.status).toBe('APPROVED');

    const startup = await startupRepo.findById(startupId);
    expect(startup?.version).toBe(2);
    expect(startup?.deliverables.length).toBe(1);
    expect(startup?.deliverables[0].serviceType).toBe('grant_builder');
  });

  it('should reject grant package proposal without mutating Startup Memory', async () => {
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

  it('should maintain grant package version history', async () => {
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
