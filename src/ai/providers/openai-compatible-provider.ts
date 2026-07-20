import {
  AIModelOptions,
  AIPromptPayload,
  AIResponsePayload,
  AIProviderId,
  IAIProvider,
} from './provider-interface.js';

export interface OpenAICompatibleConfig {
  providerId: AIProviderId;
  apiKey: string;
  baseUrl: string;
  defaultModel: string;
  /** Optional OpenRouter attribution headers */
  siteUrl?: string;
  siteName?: string;
}

/**
 * OpenAI Chat Completions-compatible client (OpenAI, OpenRouter, many proxies).
 */
export class OpenAICompatibleProvider implements IAIProvider {
  readonly providerId: AIProviderId;

  constructor(private readonly config: OpenAICompatibleConfig) {
    this.providerId = config.providerId;
  }

  async generateCompletion(
    prompt: AIPromptPayload,
    options?: AIModelOptions
  ): Promise<AIResponsePayload> {
    const model = options?.modelName || this.config.defaultModel;
    const messages: { role: string; content: string }[] = [
      { role: 'system', content: prompt.systemPrompt },
    ];
    if (prompt.contextBlocks?.length) {
      const ctx = prompt.contextBlocks
        .map((b) => `### ${b.label}\n${b.content}`)
        .join('\n\n');
      messages.push({ role: 'user', content: ctx });
    }
    messages.push({ role: 'user', content: prompt.userPrompt });

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
    };
    if (this.config.providerId === 'openrouter') {
      if (this.config.siteUrl) headers['HTTP-Referer'] = this.config.siteUrl;
      if (this.config.siteName) headers['X-Title'] = this.config.siteName;
    }

    const res = await fetch(`${this.config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        temperature: options?.temperature ?? 0.4,
        max_tokens: options?.maxTokens ?? 4096,
        top_p: options?.topP,
        stop: options?.stopSequences,
        messages,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        text: '',
        finishReason: 'error',
        rawProviderResponse: { status: res.status, body: errText.slice(0, 500) },
      };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string }; finish_reason?: string }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    const text = data.choices?.[0]?.message?.content ?? '';
    const fr = data.choices?.[0]?.finish_reason;
    return {
      text,
      finishReason: fr === 'length' ? 'length' : text ? 'stop' : 'error',
      usageTokens: data.usage
        ? {
            promptTokens: data.usage.prompt_tokens ?? 0,
            completionTokens: data.usage.completion_tokens ?? 0,
            totalTokens: data.usage.total_tokens ?? 0,
          }
        : undefined,
      rawProviderResponse: data,
    };
  }

  async generateStructuredOutput<T>(
    prompt: AIPromptPayload,
    _schemaName: string,
    options?: AIModelOptions
  ): Promise<T> {
    const enriched: AIPromptPayload = {
      ...prompt,
      systemPrompt: `${prompt.systemPrompt}\n\nRespond with a single valid JSON object only. No markdown fences.`,
    };
    const result = await this.generateCompletion(enriched, options);
    if (result.finishReason === 'error' || !result.text.trim()) {
      throw new Error('AI provider returned empty or error response');
    }
    const parsed = extractJsonObject(result.text);
    return parsed as T;
  }
}

export function extractJsonObject(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fence ? fence[1].trim() : trimmed;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start < 0 || end <= start) {
    throw new Error('No JSON object found in model response');
  }
  return JSON.parse(candidate.slice(start, end + 1)) as Record<string, unknown>;
}
