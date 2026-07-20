import { describe, it, expect, beforeEach } from 'vitest';
import { DetectIntent } from '../../src/business-intelligence/use-cases/detect-intent.js';
import { DetermineStartupStage } from '../../src/business-intelligence/use-cases/determine-startup-stage.js';
import { AnalyzeReadiness } from '../../src/business-intelligence/use-cases/analyze-readiness.js';
import { RunGapAnalysis } from '../../src/business-intelligence/use-cases/run-gap-analysis.js';
import { RunDependencyAnalysis } from '../../src/business-intelligence/use-cases/run-dependency-analysis.js';
import { RunConsistencyAnalysis } from '../../src/business-intelligence/use-cases/run-consistency-analysis.js';
import { GenerateRecommendations } from '../../src/business-intelligence/use-cases/generate-recommendations.js';
import { GenerateExecutionPlan } from '../../src/business-intelligence/use-cases/generate-execution-plan.js';
import { AnalyzeObjective } from '../../src/business-intelligence/use-cases/analyze-objective.js';
import { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import { UserMemorySnapshot } from '@core/domain/user-memory.js';

describe('Business Intelligence Engine Core Tests', () => {
  let detectIntent: DetectIntent;
  let determineStage: DetermineStartupStage;
  let analyzeReadiness: AnalyzeReadiness;
  let runGapAnalysis: RunGapAnalysis;
  let runDependencyAnalysis: RunDependencyAnalysis;
  let runConsistency: RunConsistencyAnalysis;
  let generateRecommendations: GenerateRecommendations;
  let generateExecutionPlan: GenerateExecutionPlan;
  let analyzeObjective: AnalyzeObjective;

  let mockStartupSnapshot: StartupMemorySnapshot;
  let mockUserSnapshot: UserMemorySnapshot;

  beforeEach(() => {
    detectIntent = new DetectIntent();
    determineStage = new DetermineStartupStage();
    analyzeReadiness = new AnalyzeReadiness();
    runGapAnalysis = new RunGapAnalysis();
    runDependencyAnalysis = new RunDependencyAnalysis();
    runConsistency = new RunConsistencyAnalysis();
    generateRecommendations = new GenerateRecommendations();
    generateExecutionPlan = new GenerateExecutionPlan();
    analyzeObjective = new AnalyzeObjective();

    mockStartupSnapshot = {
      startupId: 'startup-123',
      founderId: 'founder-456',
      version: 1,
      generatedAt: new Date().toISOString(),
      companyProfile: {
        name: 'Metiora AI',
        industry: 'Artificial Intelligence',
        stage: 'MVP',
        websiteUrl: 'https://metiora.ai',
      },
      foundation: {
        mission: 'Turn ideas into enduring companies.',
        vision: 'Become the startup operating partner.',
        coreValues: ['Memory First', 'Consistency'],
      },
      problemAndSolution: {
        problemStatement: 'AI tools generate isolated outputs without memory.',
        productDescription: 'Autonomous business workspace.',
        uniqueValueProp: 'Persistent Company Memory across all business assets.',
        coreFeatures: ['Company Memory', 'Strategic Intelligence'],
      },
      marketAndCustomers: {
        targetAudience: 'Startup Founders',
        businessModel: 'ASP Marketplace Model',
        revenueModel: 'Per-task escrow pricing',
        competitors: ['ChatGPT', 'Claude'],
      },
      fundingAndRoadmap: {
        fundingStage: 'SEED',
        milestones: [{ milestone: 'Phase 4 BI Engine', completed: true }],
      },
    };

    mockUserSnapshot = {
      founderId: 'founder-456',
      version: 1,
      generatedAt: new Date().toISOString(),
      founderSummary: {
        fullName: 'Alex Founder',
        title: 'CEO',
      },
      professionalProfile: {
        skills: ['AI', 'System Design'],
        industries: ['Artificial Intelligence'],
        expertise: ['Product Strategy'],
      },
      strategicVision: {
        personalMission: 'Empower founders through AI.',
      },
      communicationPreferences: {
        preferredLanguage: 'en',
      },
      publicProfiles: {},
      trackRecord: [],
    };
  });

  it('should classify natural language goals into correct Strategic Objectives', () => {
    expect(detectIntent.execute('I need funding from investors.').detectedObjective).toBe('RAISE_INVESTMENT');
    expect(detectIntent.execute('We are applying for an OKX grant.').detectedObjective).toBe('APPLY_FOR_GRANTS');
    expect(detectIntent.execute('We need strategic partners for integration.').detectedObjective).toBe('BUILD_PARTNERSHIPS');
    expect(detectIntent.execute('We are releasing our token next month.').detectedObjective).toBe('LAUNCH_TOKEN');
  });

  it('should determine startup stage accurately from memory snapshot', () => {
    const stage = determineStage.execute(mockStartupSnapshot);
    expect(stage).toBe('MVP');
  });

  it('should evaluate investment readiness score and missing components', () => {
    const readiness = analyzeReadiness.execute(mockStartupSnapshot, 'RAISE_INVESTMENT');
    expect(readiness.score).toBeGreaterThan(70);
    expect(readiness.missingComponents.length).toBe(0);
  });

  it('should detect gaps when core business facts are absent', () => {
    const incompleteSnapshot: StartupMemorySnapshot = {
      ...mockStartupSnapshot,
      marketAndCustomers: { competitors: [] },
      problemAndSolution: { coreFeatures: [] },
    };

    const gaps = runGapAnalysis.execute(incompleteSnapshot, 'RAISE_INVESTMENT');
    expect(gaps.missingFields).toContain('businessModel');
  });

  it('should check workflow dependencies and report missing prerequisites', () => {
    const result = runDependencyAnalysis.execute(mockStartupSnapshot, 'investor_ready');
    expect(result.dependenciesResolved).toBe(true);
    expect(result.canProceed).toBe(true);
  });

  it('should run consistency analysis between Startup Memory and User Memory', () => {
    const result = runConsistency.execute(mockStartupSnapshot, mockUserSnapshot);
    expect(result.hasContradictions).toBe(false);
  });

  it('should generate prioritized recommendations with reasoning', () => {
    const readiness = analyzeReadiness.execute(mockStartupSnapshot, 'RAISE_INVESTMENT');
    const gaps = runGapAnalysis.execute(mockStartupSnapshot, 'RAISE_INVESTMENT');
    const recommendations = generateRecommendations.execute('RAISE_INVESTMENT', 'MVP', readiness, gaps);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].recommendedService).toBe('investor_ready');
  });

  it('should generate structured ExecutionPlan without executing deliverables', () => {
    const output = analyzeObjective.execute('I need to raise investment.', mockStartupSnapshot, mockUserSnapshot);

    expect(output.executionPlan).toBeDefined();
    expect(output.executionPlan.objective).toBe('RAISE_INVESTMENT');
    expect(output.executionPlan.recommendedService).toBe('investor_ready');
    expect(output.executionPlan.actionSteps.length).toBeGreaterThan(0);
  });
});
