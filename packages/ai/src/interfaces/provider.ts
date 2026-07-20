export type AIProviderId = 'openai' | 'anthropic' | 'gemini' | 'openrouter';

export interface AIModelOptions {
  modelName: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stopSequences?: string[];
}

export interface AIPromptPayload {
  systemPrompt: string;
  userPrompt: string;
  contextBlocks?: { label: string; content: string }[];
}

export interface AIResponsePayload {
  text: string;
  finishReason: 'stop' | 'length' | 'tool_call' | 'error';
  usageTokens?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  rawProviderResponse?: unknown;
}

export interface IAIProvider {
  readonly providerId: AIProviderId;
  generateCompletion(prompt: AIPromptPayload, options?: AIModelOptions): Promise<AIResponsePayload>;
  generateStructuredOutput<T>(prompt: AIPromptPayload, schemaName: string, options?: AIModelOptions): Promise<T>;
}
