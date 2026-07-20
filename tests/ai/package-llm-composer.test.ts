import { describe, expect, it, vi } from 'vitest';
import { PackageLlmComposer } from '../../src/ai/package-llm-composer.js';
import type { IAIProvider } from '../../src/ai/providers/provider-interface.js';
import type { UserMemorySnapshot } from '../../src/core/domain/user-memory.js';
import type { StartupMemorySnapshot } from '../../src/core/domain/startup-memory.js';

const founder = {
  founderId: 'f1',
  version: 1,
  generatedAt: new Date().toISOString(),
  founderSummary: { fullName: 'Ada Founder' },
  professionalProfile: { skills: ['product'], industries: ['fintech'], expertise: [] },
  strategicVision: {},
  communicationPreferences: { preferredLanguage: 'en' },
  publicProfiles: {},
  trackRecord: [],
} as unknown as UserMemorySnapshot;

const startup = {
  startupId: 's1',
  founderId: 'f1',
  version: 1,
  generatedAt: new Date().toISOString(),
  companyProfile: {
    name: 'Northstar Labs',
    industry: 'Fintech',
    stage: 'seed',
    oneSentenceDescription: 'Credit tools for SMBs',
  },
  foundation: { mission: 'Faster underwriting', coreValues: [] },
  problemAndSolution: {
    problemStatement: 'SMBs cannot underwrite quickly',
    productDescription: 'Embedded lending OS',
    coreFeatures: [],
  },
  marketAndCustomers: { competitors: [] },
  fundingAndRoadmap: {},
} as unknown as StartupMemorySnapshot;

describe('PackageLlmComposer', () => {
  it('returns template when provider is null', async () => {
    const c = new PackageLlmComposer(null, '', 5000);
    const out = await c.compose({
      serviceType: 'startup_health',
      founder,
      startup,
      templateContentJson: { overallScore: 64 },
      templateMarkdown: '# Template health report\n\nScore 64.'.repeat(20),
    });
    expect(out.generation.mode).toBe('template');
    expect(out.contentJson.overallScore).toBe(64);
  });

  it('applies LLM when provider returns valid JSON', async () => {
    const provider: IAIProvider = {
      providerId: 'openai',
      generateCompletion: vi.fn(async () => ({
        text: JSON.stringify({
          contentJson: { overallScore: 64, narrative: 'Northstar-specific' },
          contentMarkdown: '# Northstar Labs Health\n\n' + 'Detailed analysis. '.repeat(40),
        }),
        finishReason: 'stop' as const,
      })),
      generateStructuredOutput: vi.fn(),
    };
    const c = new PackageLlmComposer(provider, 'gpt-4o-mini', 5000);
    const out = await c.compose({
      serviceType: 'startup_health',
      founder,
      startup,
      templateContentJson: { overallScore: 64, categoryScores: { a: 1 } },
      templateMarkdown: '# Template\n\n' + 'x'.repeat(300),
    });
    expect(out.generation.mode).toBe('llm');
    expect(out.contentMarkdown).toContain('Northstar');
    expect((out.contentJson.generation as { mode: string }).mode).toBe('llm');
  });

  it('falls back on invalid LLM shape', async () => {
    const provider: IAIProvider = {
      providerId: 'openai',
      generateCompletion: vi.fn(async () => ({
        text: 'not json at all',
        finishReason: 'stop' as const,
      })),
      generateStructuredOutput: vi.fn(),
    };
    const c = new PackageLlmComposer(provider, 'gpt-4o-mini', 5000);
    const out = await c.compose({
      serviceType: 'token_launch_kit',
      founder,
      startup,
      templateContentJson: { strategy: { tokenName: 'X' } },
      templateMarkdown: '# Token kit template\n\n' + 'y'.repeat(300),
    });
    expect(out.generation.mode).toBe('template');
  });
});
