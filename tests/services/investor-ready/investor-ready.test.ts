import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryInvestorReadyRepository } from './in-memory-investor-ready-repository.js';
import { CreateFounderProfile } from '../../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../../src/memory/startup-memory/use-cases/create-startup.js';
import { AssessInvestmentReadiness } from '../../../src/services/investor-ready/use-cases/assess-investment-readiness.js';
import { GenerateInvestorPackage } from '../../../src/services/investor-ready/use-cases/generate-investor-package.js';
import { ValidateInvestorPackage } from '../../../src/services/investor-ready/use-cases/validate-investor-package.js';
import { ApproveInvestorPackage } from '../../../src/services/investor-ready/use-cases/approve-investor-package.js';
import { RejectInvestorPackage } from '../../../src/services/investor-ready/use-cases/reject-investor-package.js';
import { GetInvestorPackage } from '../../../src/services/investor-ready/use-cases/get-investor-package.js';
import { ListInvestorPackages } from '../../../src/services/investor-ready/use-cases/list-investor-packages.js';

describe('Investor Ready Service Core Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let investorRepo: InMemoryInvestorReadyRepository;

  let createFounder: CreateFounderProfile;
  let createStartup: CreateStartup;
  let assessReadiness: AssessInvestmentReadiness;
  let generatePackage: GenerateInvestorPackage;
  let validatePackage: ValidateInvestorPackage;
  let approvePackage: ApproveInvestorPackage;
  let rejectPackage: RejectInvestorPackage;
  let getPackage: GetInvestorPackage;
  let listVersions: ListInvestorPackages;

  let founderId: string;
  let startupId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    investorRepo = new InMemoryInvestorReadyRepository();

    createFounder = new CreateFounderProfile(userRepo);
    createStartup = new CreateStartup(startupRepo, userRepo);
    assessReadiness = new AssessInvestmentReadiness(userRepo, startupRepo);
    generatePackage = new GenerateInvestorPackage(investorRepo, userRepo, startupRepo);
    validatePackage = new ValidateInvestorPackage();
    approvePackage = new ApproveInvestorPackage(investorRepo, startupRepo);
    rejectPackage = new RejectInvestorPackage(investorRepo);
    getPackage = new GetInvestorPackage(investorRepo);
    listVersions = new ListInvestorPackages(investorRepo);

    const founder = await createFounder.execute({
      email: 'investor@metiora.ai',
      fullName: 'Fundraising Founder',
    });
    founderId = founder.id;

    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'Fundable AI',
      industry: 'AI Developer Infrastructure',
      mission: 'Empower autonomous AI coding.',
      problemStatement: 'LLMs lack persistent operating memory.',
      productDescription: 'Autonomous workspace with persistent Company Memory.',
      businessModel: 'B2B SaaS Escrow Model',
    });
    startupId = startup.id;
  });

  it('should assess investment readiness score and produce strengths and risks', async () => {
    const assessment = await assessReadiness.execute(founderId, startupId);
    expect(assessment.overallScore).toBeGreaterThan(60);
    expect(assessment.strengths.length).toBeGreaterThan(0);
  });

  it('should generate an Investor Package with dual JSON and Markdown representations', async () => {
    const pkg = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    expect(pkg).toBeDefined();
    expect(pkg.status).toBe('PENDING');
    expect(pkg.readinessScore).toBeGreaterThan(60);
    expect(pkg.content.executiveSummary.companyName).toBe('Fundable AI');
    expect(pkg.contentMarkdown).toContain('# Fundable AI — Investment Memo & Investor Package');
  });

  it('should validate investor package consistency', async () => {
    const pkg = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const validation = validatePackage.execute(pkg.content);
    expect(validation.isValid).toBe(true);
    expect(validation.conflicts.length).toBe(0);
  });

  it('should approve investor package and persist funding info into Startup Memory and Deliverable Registry', async () => {
    const created = await generatePackage.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const approved = await approvePackage.execute(created.id);
    expect(approved.status).toBe('APPROVED');

    const startup = await startupRepo.findById(startupId);
    expect(startup?.version).toBe(2);
    expect(startup?.deliverables.length).toBe(1);
    expect(startup?.deliverables[0].serviceType).toBe('investor_ready');
  });

  it('should reject investor package draft without mutating Startup Memory', async () => {
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

  it('should maintain investor package version history', async () => {
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
