import type { UserMemorySnapshot } from '@core/domain/user-memory.js';
import type { StartupMemorySnapshot } from '@core/domain/startup-memory.js';
import type { OkxServiceType } from '@core/domain/okx-integration.js';
import type { IAIProvider } from './providers/provider-interface.js';
import { extractJsonObject } from './providers/openai-compatible-provider.js';

export interface PackageComposerInput {
  serviceType: OkxServiceType;
  founder: UserMemorySnapshot;
  startup: StartupMemorySnapshot;
  templateContentJson: Record<string, unknown>;
  templateMarkdown: string;
}

export interface PackageComposerResult {
  contentJson: Record<string, unknown>;
  contentMarkdown: string;
  generation: {
    mode: 'llm' | 'template';
    providerId?: string;
    model?: string;
    reason?: string;
  };
}

const SERVICE_BRIEFS: Record<string, string> = {
  startup_blueprint:
    'Strategic startup blueprint: mission, problem, product, GTM, milestones. Dual structure for operators.',
  investor_ready:
    'Investor-facing package: readiness narrative, memo-style story, risks, ask framing. Not a live data room.',
  grant_builder:
    'Grant/program application package: impact narrative, activities, outcomes, budget framing.',
  partnership_studio:
    'Partnership outreach package: partner fit, mutual value, outreach narrative.',
  token_launch_kit:
    'Tokenomics STRATEGY only (utility, distribution, risks, appropriateness). NEVER claim contracts were deployed or tokens minted.',
  startup_health:
    'Multi-dimension startup health assessment. Preserve numeric scores from the template scaffold; rewrite narrative, priorities, and recommendations to match real company facts. Be honest about missing data.',
};

function summarizeMemory(founder: UserMemorySnapshot, startup: StartupMemorySnapshot): string {
  return JSON.stringify(
    {
      founder: founder.founderSummary,
      professional: founder.professionalProfile,
      vision: founder.strategicVision,
      company: startup.companyProfile,
      foundation: startup.foundation,
      problemAndSolution: startup.problemAndSolution,
      marketAndCustomers: startup.marketAndCustomers,
      fundingAndRoadmap: startup.fundingAndRoadmap,
      tokenomics: startup.tokenomics,
    },
    null,
    2
  );
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/**
 * Enriches a deterministic package with LLM narrative grounded in memory.
 * Always safe: returns template on any failure.
 */
export class PackageLlmComposer {
  constructor(
    private readonly provider: IAIProvider | null,
    private readonly model: string,
    private readonly timeoutMs: number,
    private readonly log?: { warn: (o: unknown, msg: string) => void; info?: (o: unknown, msg: string) => void }
  ) {}

  async compose(input: PackageComposerInput): Promise<PackageComposerResult> {
    const base: PackageComposerResult = {
      contentJson: {
        ...input.templateContentJson,
        generation: { mode: 'template' },
      },
      contentMarkdown: input.templateMarkdown,
      generation: { mode: 'template', reason: 'llm_disabled_or_unavailable' },
    };

    if (!this.provider || !this.model) {
      return base;
    }

    const brief = SERVICE_BRIEFS[input.serviceType] || input.serviceType;
    const systemPrompt = [
      'You are Metiora, an AI operating partner for founders on the OKX agent marketplace.',
      'Rewrite the package so it is specific to THIS company using only provided memory facts.',
      'Rules:',
      '- Do not invent traction, revenue, users, or partnerships not present in memory.',
      '- If a fact is missing, say it is undefined / needs input — do not fabricate.',
      '- Keep dual deliverable: structured contentJson + full contentMarkdown.',
      '- contentMarkdown must be valid GitHub-flavored Markdown, substantial (aim 800–2500 words when facts allow).',
      '- For startup_health: keep overallScore and categoryScores numbers from the template scaffold.',
      '- For token_launch_kit: strategy and readiness only — never deploy steps that claim on-chain execution completed.',
      '- Return ONLY a JSON object with keys contentJson (object) and contentMarkdown (string).',
    ].join('\n');

    const userPrompt = [
      `Service: ${input.serviceType}`,
      `Brief: ${brief}`,
      '',
      'Company memory (source of truth):',
      summarizeMemory(input.founder, input.startup),
      '',
      'Template scaffold contentJson (structure + scores to preserve where applicable):',
      JSON.stringify(input.templateContentJson).slice(0, 12_000),
      '',
      'Template markdown (improve; do not ignore structure):',
      input.templateMarkdown.slice(0, 8_000),
    ].join('\n');

    try {
      const response = await withTimeout(
        this.provider.generateCompletion(
          {
            systemPrompt,
            userPrompt,
          },
          {
            modelName: this.model,
            temperature: 0.35,
            maxTokens: 4500,
          }
        ),
        this.timeoutMs,
        'package_llm'
      );

      if (response.finishReason === 'error' || !response.text?.trim()) {
        this.log?.warn(
          { service: input.serviceType, raw: response.rawProviderResponse },
          'package LLM empty/error — using template'
        );
        return {
          ...base,
          generation: {
            mode: 'template',
            providerId: this.provider.providerId,
            model: this.model,
            reason: 'provider_error',
          },
        };
      }

      const parsed = extractJsonObject(response.text);
      const contentJson =
        parsed.contentJson && typeof parsed.contentJson === 'object' && !Array.isArray(parsed.contentJson)
          ? (parsed.contentJson as Record<string, unknown>)
          : null;
      const contentMarkdown =
        typeof parsed.contentMarkdown === 'string' ? parsed.contentMarkdown.trim() : '';

      if (!contentJson || contentMarkdown.length < 200) {
        this.log?.warn(
          { service: input.serviceType, mdLen: contentMarkdown.length },
          'package LLM invalid shape — using template'
        );
        return {
          ...base,
          generation: {
            mode: 'template',
            providerId: this.provider.providerId,
            model: this.model,
            reason: 'invalid_shape',
          },
        };
      }

      // Preserve health scores from template if model dropped them
      if (input.serviceType === 'startup_health') {
        const t = input.templateContentJson;
        if (t.overallScore != null && contentJson.overallScore == null) {
          contentJson.overallScore = t.overallScore;
        }
        if (t.categoryScores != null && contentJson.categoryScores == null) {
          contentJson.categoryScores = t.categoryScores;
        }
      }

      contentJson.generation = {
        mode: 'llm',
        providerId: this.provider.providerId,
        model: this.model,
      };

      this.log?.info?.(
        { service: input.serviceType, provider: this.provider.providerId, model: this.model },
        'package LLM enrichment applied'
      );

      return {
        contentJson,
        contentMarkdown,
        generation: {
          mode: 'llm',
          providerId: this.provider.providerId,
          model: this.model,
        },
      };
    } catch (err) {
      this.log?.warn(
        { service: input.serviceType, err: err instanceof Error ? err.message : String(err) },
        'package LLM failed — using template'
      );
      return {
        ...base,
        generation: {
          mode: 'template',
          providerId: this.provider.providerId,
          model: this.model,
          reason: err instanceof Error ? err.message : 'llm_exception',
        },
      };
    }
  }
}
