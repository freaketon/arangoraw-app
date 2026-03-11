import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export interface GenerationOptions {
  systemPrompt: string;
  taskPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function generate(options: GenerationOptions): Promise<string> {
  const anthropic = getClient();
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: options.maxTokens ?? 4096,
    temperature: options.temperature ?? 0.7,
    system: options.systemPrompt,
    messages: [{ role: 'user', content: options.taskPrompt }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.text ?? '';
}

export async function generateJSON<T>(options: GenerationOptions): Promise<T> {
  const raw = await generate({
    ...options,
    systemPrompt: options.systemPrompt + '\n\nYou MUST respond with valid JSON only. No markdown, no code fences, no explanation — just the JSON object.',
  });

  // Strip any markdown fences if present
  const cleaned = raw.replace(/^```(?:json)?\s*\n?/i, '').replace(/\n?```\s*$/i, '').trim();
  return JSON.parse(cleaned) as T;
}
