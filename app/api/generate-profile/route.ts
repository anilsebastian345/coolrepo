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

function getInputHash(questions: any, resume?: string, linkedin?: string): string {
  // Create a comprehensive hash that includes all input sources
  const inputData = {
    // Questions data
    questions: questions.sociability !== undefined || questions.conscientiousness !== undefined || 
      questions.emotional_stability !== undefined || questions.empathy !== undefined || 
      questions.leadership !== undefined ? {
        sociability: questions.sociability || null,
        conscientiousness: questions.conscientiousness || null,
        emotional_stability: questions.emotional_stability || null,
        empathy: questions.empathy || null,
        leadership: questions.leadership || null
      } : {
        roleModel: questions.roleModel || '',
        friendsSay: questions.friendsSay || '',
        challenges: questions.challenges || ''
      },
    
    // Resume data (first 1000 chars to avoid huge hashes)
    resume: resume ? resume.substring(0, 1000) : null,
    
    // LinkedIn data (first 500 chars to avoid huge hashes)  
    linkedin: linkedin ? linkedin.substring(0, 500) : null
  };
  
  return JSON.stringify(inputData);
}

export async function POST(req: NextRequest) {
  try {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';
    const { userId = 'temp-user-id', questions: requestQuestions, linkedin: linkedinInput, clearCache = false } = await req.json();

    // Clear cache if requested
    if (clearCache) {
      console.log('Clearing profile cache...');
      await saveCache({});
      return NextResponse.json({ message: 'Cache cleared successfully' });
    }

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
    
    // Process LinkedIn data if provided
    let resumeData = '';
    let linkedinData = '';
    
    if (linkedinInput) {
      // Format LinkedIn sections into a readable text
      const sections = [];
      if (linkedinInput.about) sections.push(`ABOUT:\n${linkedinInput.about}`);
      if (linkedinInput.experience) sections.push(`EXPERIENCE:\n${linkedinInput.experience}`);
      if (linkedinInput.education) sections.push(`EDUCATION:\n${linkedinInput.education}`);
      if (linkedinInput.recommendations) sections.push(`RECOMMENDATIONS:\n${linkedinInput.recommendations}`);
      
      linkedinData = sections.join('\n\n');
    }
    
    // If we have LinkedIn data, use that for the profile generation
    let profileInput = '';
    if (linkedinData) {
      profileInput = linkedinData;
    } else if (userMessage) {
      profileInput = userMessage;
    } else {
      return NextResponse.json({ error: 'No onboarding data found. Please complete LinkedIn profile or answer questions.' }, { status: 400 });
    }

    // Check cache with comprehensive input hash
    const cache = await loadCache();
    // Add timestamp to force fresh generation when prompt changes
    const inputHash = getInputHash(questions, resumeData, linkedinData) + '_prompt_updated_' + Date.now().toString().slice(-6);
    const cachedProfile = cache[userId];
    
    if (cachedProfile && 
        cachedProfile.inputs === inputHash && 
        (Date.now() - cachedProfile.timestamp) < CACHE_DURATION) {
      console.log('Returning cached profile for user:', userId);
      
      return NextResponse.json({ 
        profile: cachedProfile.profile,
        cached: true,
        cacheTimestamp: cachedProfile.timestamp,
        debugInfo: {
          cacheHit: true,
          inputHash: inputHash.substring(0, 50) + '...',
          cacheAge: Math.round((Date.now() - cachedProfile.timestamp) / 1000 / 60) // minutes
        }
      });
    }

    // System prompt for executive coaching AI
    const systemPrompt = "You are the world's most insightful executive coach AI.\nYou generate psychographic profiles in a structured markdown report, using vivid metaphors, empathy, and sharp insights.\nBe deterministic and consistent in style. Anchor your response format to the provided reference example.";

    // Read user prompt template with anchoring example
    const promptPath = join(process.cwd(), 'Prompt.txt');
    const userPromptTemplate = await readFile(promptPath, 'utf-8');
    
    // Replace placeholder with actual LinkedIn data or user message
    const finalUserPrompt = userPromptTemplate.replace('{{linkedin_text}}', profileInput);

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
            { role: 'user', content: finalUserPrompt }
          ],
          temperature: 0.2,
          top_p: 1.0,
          max_tokens: 2500,
          presence_penalty: 0,
          frequency_penalty: 0,
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: 500 });
    }

    // Read the streaming response and return JSON for ProfileModal

    // For ProfileModal, return JSON directly instead of streaming
    let fullProfile = '';
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

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
            
            console.log('Generated new profile for user:', userId, 'Input hash:', inputHash.substring(0, 50) + '...');
            
            // Return JSON response for ProfileModal
            return NextResponse.json({ 
              profile: fullProfile,
              debugInfo: {
                cacheHit: false,
                inputHash: inputHash.substring(0, 50) + '...',
                generated: new Date().toISOString(),
                temperature: 0.2,
                seed: null
              }
            });
          }
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullProfile += content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    // If we get here, stream ended without [DONE] marker
    if (fullProfile) {
      // Cache what we have
      cache[userId] = {
        profile: fullProfile,
        timestamp: Date.now(),
        inputs: inputHash
      };
      await saveCache(cache);
      
      return NextResponse.json({ 
        profile: fullProfile,
        debugInfo: {
          cacheHit: false,
          inputHash: inputHash.substring(0, 50) + '...',
          generated: new Date().toISOString(),
          temperature: 0.2,
          seed: null,
          incomplete: true
        }
      });
    }
    
    return NextResponse.json({ error: 'No profile content received' }, { status: 500 });

  } catch (e) {
    return NextResponse.json({ error: e?.toString() || 'Unknown error' }, { status: 500 });
  }
} 