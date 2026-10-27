import { config } from '../config/env.js';

type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export class ModelProvider {
  public static isConfigured(): boolean {
    return Boolean(
      config.kaggleKernelUrl ||
      config.aiProvider === 'kaggle' ||
      (config.aiApiKey && config.aiModel)
    );
  }

  public static assertConfigured(): void {
    if (!this.isConfigured()) {
      const error = new Error('AI explanations need an API key and model or KAGGLE_KERNEL_URL in the server environment. GitHub issue browsing works without them.') as Error & { statusCode: number };
      error.statusCode = 503;
      throw error;
    }
  }

  public static async complete(messages: ChatMessage[], json = false): Promise<string> {
    this.assertConfigured();

    const isKaggle = Boolean(
      config.kaggleKernelUrl ||
      config.aiProvider === 'kaggle' ||
      config.aiBaseUrl.includes('trycloudflare') ||
      config.aiBaseUrl.includes('ngrok')
    );

    if (isKaggle) {
      const baseUrl = (config.kaggleKernelUrl || config.aiBaseUrl).replace(/\/$/, '');
      const systemMsg = messages.find((m) => m.role === 'system')?.content;
      const userMsgs = messages.filter((m) => m.role !== 'system').map((m) => m.content).join('\n\n');

      let response: Response;
      try {
        response = await fetch(`${baseUrl}/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: userMsgs,
            system: systemMsg,
            model: config.aiModel || 'gemma-3-4b-it',
            max_tokens: 2048,
            temperature: 0.2,
            json_mode: json,
          }),
          signal: AbortSignal.timeout(90_000),
        });
      } catch (err) {
        const error = new Error(`The Kaggle GPU endpoint could not be reached at ${baseUrl}. Check the tunnel and try again.`) as Error & { statusCode: number };
        error.statusCode = 502;
        throw error;
      }

      if (!response.ok) {
        const error = new Error(`The Kaggle GPU endpoint returned HTTP ${response.status}.`) as Error & { statusCode: number };
        error.statusCode = 502;
        throw error;
      }

      const payload = (await response.json()) as { generated_text?: string };
      if (!payload || typeof payload.generated_text !== 'string' || !payload.generated_text.trim()) {
        throw new Error('The Kaggle GPU endpoint returned an empty response.');
      }
      return payload.generated_text;
    }

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
