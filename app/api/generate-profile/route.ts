import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const runtime = 'nodejs';

// Cache structure
interface ProfileCache {
  [userId: string]: {
    profile: string;
    timestamp: number;
    inputs: string;
  };
}

const CACHE_FILE = 'profile_cache.json';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

async function loadCache(): Promise<ProfileCache> {
  try {
    const cachePath = join(process.cwd(), CACHE_FILE);
    if (existsSync(cachePath)) {
      const cacheData = await readFile(cachePath, 'utf-8');
      return JSON.parse(cacheData);
    }
  } catch (error) {
    console.error('Error loading cache:', error);
  }
  return {};
}

async function saveCache(cache: ProfileCache): Promise<void> {
  try {
    const cachePath = join(process.cwd(), CACHE_FILE);
    await writeFile(cachePath, JSON.stringify(cache, null, 2));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

function getInputHash(questions: any): string {
  // Handle new Likert scale format
  if (questions.sociability !== undefined || questions.conscientiousness !== undefined || 
      questions.emotional_stability !== undefined || questions.empathy !== undefined || 
      questions.leadership !== undefined) {
    return JSON.stringify({
      sociability: questions.sociability || null,
      conscientiousness: questions.conscientiousness || null,
      emotional_stability: questions.emotional_stability || null,
      empathy: questions.empathy || null,
      leadership: questions.leadership || null
    });
  }
  
  // Fallback to old format
  return JSON.stringify({
    roleModel: questions.roleModel || '',
    friendsSay: questions.friendsSay || '',
    challenges: questions.challenges || ''
  });
}

export async function POST(req: NextRequest) {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
    const { userId = 'temp-user-id', questions: requestQuestions } = await req.json();

    // Use questions from request, fallback to file if not provided
    let questions: any = requestQuestions || {};
    
    // If no questions in request, try to read from file (for backwards compatibility)
    if (!questions || Object.keys(questions).length === 0) {
      try {
        const questionsPath = join(process.cwd(), 'onboarding_questions.json');
        questions = JSON.parse(await readFile(questionsPath, 'utf-8'));
      } catch (e) {
        console.log('No questions file found, using empty questions object');
      }
    }

    // Compose user message with leadership assessment scores
    let userMessage = '';
    if (questions.sociability !== undefined || questions.conscientiousness !== undefined || 
        questions.emotional_stability !== undefined || questions.empathy !== undefined || 
        questions.leadership !== undefined) {
      userMessage += `Leadership Assessment Results:\n`;
      userMessage += `Sociability/Extraversion: ${questions.sociability || 'Not answered'}/5\n`;
      userMessage += `Conscientiousness: ${questions.conscientiousness || 'Not answered'}/5\n`;
      userMessage += `Emotional Stability: ${questions.emotional_stability || 'Not answered'}/5\n`;
      userMessage += `Empathy: ${questions.empathy || 'Not answered'}/5\n`;
      userMessage += `Leadership Assertiveness: ${questions.leadership || 'Not answered'}/5\n`;
    }
    
    // Fallback to old format if new format is not available
    if (!userMessage && (questions.roleModel || questions.friendsSay || questions.challenges)) {
      userMessage += `Role model: ${questions.roleModel || ''}\n`;
      userMessage += `Friends would say: ${questions.friendsSay || ''}\n`;
      userMessage += `Challenges: ${questions.challenges || ''}\n`;
    }
    
    if (!userMessage) {
      return NextResponse.json({ error: 'No onboarding question answers found.' }, { status: 400 });
    }

    // Check cache
    const cache = await loadCache();
    const inputHash = getInputHash(questions);
    const cachedProfile = cache[userId];
    
    if (cachedProfile && 
        cachedProfile.inputs === inputHash && 
        (Date.now() - cachedProfile.timestamp) < CACHE_DURATION) {
      return NextResponse.json({ 
        profile: cachedProfile.profile,
        cached: true 
      });
    }

    // Read system prompt
    const promptPath = join(process.cwd(), 'Prompt.txt');
    const systemPrompt = await readFile(promptPath, 'utf-8');

    // Call Azure OpenAI with streaming
    const response = await fetch(
      `${endpoint}openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey || '',
        } as HeadersInit,
        body: JSON.stringify({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ],
          max_tokens: 800,
          temperature: 0.7,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = response.body?.getReader();
          if (!reader) {
            controller.error(new Error('No response body'));
            return;
          }

          let fullProfile = '';
          
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  // Cache the complete profile
                  cache[userId] = {
                    profile: fullProfile,
                    timestamp: Date.now(),
                    inputs: inputHash
                  };
                  await saveCache(cache);
                  
                  // Send the final complete profile
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ profile: fullProfile, complete: true })}\n\n`));
                  controller.close();
                  return;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    fullProfile += content;
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content, partial: true })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (e) {
    return NextResponse.json({ error: e?.toString() || 'Unknown error' }, { status: 500 });
  }
} 