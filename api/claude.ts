// api/claude.ts — Claude API client
// ⚠️  Replace with your key. In production, proxy through your backend.
const ANTHROPIC_API_KEY = 'YOUR_ANTHROPIC_API_KEY_HERE';
const MODEL = 'claude-sonnet-4-20250514';

export interface Msg { role: 'user' | 'assistant'; content: string; }

export async function callClaude(system: string, messages: Msg[], maxTokens = 1500): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-calls': 'true',
    },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages }),
  });
  if (!res.ok) throw new Error(`Claude error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
}

export function parseJSON<T>(raw: string): T {
  const clean = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  return JSON.parse(clean) as T;
}
