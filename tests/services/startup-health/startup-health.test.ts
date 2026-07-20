import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryUserMemoryRepository } from '../../user-memory/in-memory-user-memory-repository.js';
import { InMemoryStartupMemoryRepository } from '../../startup-memory/in-memory-startup-memory-repository.js';
import { InMemoryStartupHealthRepository } from './in-memory-startup-health-repository.js';
import { CreateFounderProfile } from '../../../src/memory/user-memory/use-cases/create-founder-profile.js';
import { CreateStartup } from '../../../src/memory/startup-memory/use-cases/create-startup.js';
import { AssessStartupHealth } from '../../../src/services/startup-health/use-cases/assess-startup-health.js';
import { GenerateHealthReport } from '../../../src/services/startup-health/use-cases/generate-health-report.js';
import { ApproveHealthAssessment } from '../../../src/services/startup-health/use-cases/approve-health-assessment.js';
import { RejectHealthAssessment } from '../../../src/services/startup-health/use-cases/reject-health-assessment.js';
import { GetHealthReport } from '../../../src/services/startup-health/use-cases/get-health-report.js';
import { ListHealthReports } from '../../../src/services/startup-health/use-cases/list-health-reports.js';
import { CompareHealthReports } from '../../../src/services/startup-health/use-cases/compare-health-reports.js';

describe('Startup Health Service Core Tests', () => {
  let userRepo: InMemoryUserMemoryRepository;
  let startupRepo: InMemoryStartupMemoryRepository;
  let healthRepo: InMemoryStartupHealthRepository;

  let createFounder: CreateFounderProfile;
  let createStartup: CreateStartup;
  let assessHealth: AssessStartupHealth;
  let generateReport: GenerateHealthReport;
  let approveAssessment: ApproveHealthAssessment;
  let rejectAssessment: RejectHealthAssessment;
  let getReport: GetHealthReport;
  let listHistory: ListHealthReports;
  let compareReports: CompareHealthReports;

  let founderId: string;
  let startupId: string;

  beforeEach(async () => {
    userRepo = new InMemoryUserMemoryRepository();
    startupRepo = new InMemoryStartupMemoryRepository();
    healthRepo = new InMemoryStartupHealthRepository();

    createFounder = new CreateFounderProfile(userRepo);
    createStartup = new CreateStartup(startupRepo, userRepo);
    assessHealth = new AssessStartupHealth(userRepo, startupRepo);
    generateReport = new GenerateHealthReport(healthRepo, userRepo, startupRepo);
    approveAssessment = new ApproveHealthAssessment(healthRepo, startupRepo);
    rejectAssessment = new RejectHealthAssessment(healthRepo);
    getReport = new GetHealthReport(healthRepo);
    listHistory = new ListHealthReports(healthRepo);
    compareReports = new CompareHealthReports(healthRepo);

    const founder = await createFounder.execute({
      email: 'health@metiora.ai',
      fullName: 'Dr. Health Founder',
    });
    founderId = founder.id;

    const startup = await createStartup.execute({
      founderProfileId: founderId,
      name: 'OmniHealth AI',
      industry: 'AI Healthcare Operating Partner',
      mission: 'Democratize clinical intelligence.',
      problemStatement: 'Siloed health datasets cause medical errors.',
      productDescription: 'Autonomous HIPAA-compliant clinical reasoning engine.',
      websiteUrl: 'https://omnihealth.ai',
    });
    startupId = startup.id;
  });

  it('should evaluate 15-dimension startup health scores and observations', async () => {
    const assessment = await assessHealth.execute(founderId, startupId);

    expect(assessment.overallScore).toBeGreaterThan(60);
    expect(assessment.categoryScores.length).toBe(15);
    expect(assessment.strengths.length).toBeGreaterThan(0);
    expect(assessment.recommendedPriorities.length).toBeGreaterThan(0);
  });

  it('should generate a Startup Health Report with dual JSON and Markdown representations', async () => {
    const report = await generateReport.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    expect(report).toBeDefined();
    expect(report.status).toBe('PENDING');
    expect(report.overallScore).toBeGreaterThan(60);
    expect(report.content.startupName).toBe('OmniHealth AI');
    expect(report.contentMarkdown).toContain('Continuous Startup Health Assessment Report');
  });

  it('should approve health assessment and persist deliverable into Startup Memory Registry', async () => {
    const created = await generateReport.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const approved = await approveAssessment.execute(created.id);
    expect(approved.status).toBe('APPROVED');

    const startup = await startupRepo.findById(startupId);
    expect(startup?.version).toBe(2);
    expect(startup?.deliverables.length).toBe(1);
    expect(startup?.deliverables[0].serviceType).toBe('startup_health');
  });

  it('should reject health assessment proposal without mutating Startup Memory deliverables', async () => {
    const created = await generateReport.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });

    const rejected = await rejectAssessment.execute(created.id);
    expect(rejected.status).toBe('REJECTED');

    const startup = await startupRepo.findById(startupId);
    expect(startup?.version).toBe(1);
    expect(startup?.deliverables.length).toBe(0);
  });

  it('should track historical assessments and compare health report progress over time', async () => {
    const initialReport = await generateReport.execute({
      founderProfileId: founderId,
      startupProfileId: startupId,
    });
    await approveAssessment.execute(initialReport.id);

    // Update report to version 2 with updated scores
    initialReport.version = 2;
    initialReport.overallScore = 88;
    await healthRepo.updateReport(initialReport.id, initialReport, 'Version 2 assessment');

    const history = await listHistory.execute(initialReport.id);
    expect(history.length).toBeGreaterThanOrEqual(2);

    const comparison = await compareReports.execute(initialReport.id, 1, 2);
    expect(comparison.overallScoreDelta).toBeDefined();
    expect(comparison.categoryDeltas.length).toBe(15);
  });
});
