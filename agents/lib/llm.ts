import Anthropic from '@anthropic-ai/sdk';

// Provider-agnostic seam. Today it wraps Anthropic Claude; swapping providers
// only requires changing this file.
export function llmAvailable(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function llmModel(): string {
  return process.env.LLM_MODEL ?? 'claude-3-5-sonnet-latest';
}

export async function complete(system: string, user: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set');

  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: llmModel(),
    max_tokens: 2500,
    system,
    messages: [{ role: 'user', content: user }],
  });

  return message.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .join('\n')
    .trim();
}

// Best-effort extraction of a JSON object from a model response that may be
// wrapped in prose or code fences.
export function extractJson<T>(text: string): T | null {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(candidate.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}
