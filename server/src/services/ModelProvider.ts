import { config } from '../config/env.js';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export class ModelProvider {
  public static isConfigured(): boolean {
    return Boolean(config.aiApiKey && config.aiModel);
  }

  public static assertConfigured(): void {
    if (!this.isConfigured()) {
      const error = new Error('AI explanations need an API key and model in the server environment. GitHub issue browsing works without them.') as Error & { statusCode: number };
      error.statusCode = 503;
      throw error;
    }
  }

  public static async complete(messages: ChatMessage[], json = false): Promise<string> {
    this.assertConfigured();

    let response: Response;
    try {
      response = await fetch(`${config.aiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.aiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: config.aiModel,
          messages,
          temperature: 0.2,
          max_tokens: 1400,
          ...(json ? { response_format: { type: 'json_object' } } : {}),
        }),
        signal: AbortSignal.timeout(45_000),
      });
    } catch {
      const error = new Error('The configured AI provider could not be reached. Check the provider URL and try again.') as Error & { statusCode: number };
      error.statusCode = 502;
      throw error;
    }

    if (!response.ok) {
      const error = new Error(`The configured AI provider returned HTTP ${response.status}. Check the API key, model, and provider access.`) as Error & { statusCode: number };
      error.statusCode = 502;
      throw error;
    }

    const payload: unknown = await response.json();
    if (!payload || typeof payload !== 'object') {
      throw new Error('The configured AI provider returned an invalid response.');
    }
    const choices = (payload as { choices?: Array<{ message?: { content?: unknown } }> }).choices;
    const content = choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      throw new Error('The configured AI provider returned an empty response.');
    }
    return content;
  }
}
