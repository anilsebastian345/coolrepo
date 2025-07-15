import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

    const prompt = 'Tell me a joke about coaching.';

    const response = await fetch(
      `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey || '',
        } as HeadersInit,
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 100,
          temperature: 0.7,
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: 500 });
    }
    const data = await response.json();
    const profile = data.choices?.[0]?.message?.content || '';
    return NextResponse.json({ profile });
  } catch (e) {
    return NextResponse.json({ error: e?.toString() || 'Unknown error' }, { status: 500 });
  }
} 