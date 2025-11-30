import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { determineCareerStage, CareerStageUserSelected, ResumeSignals, createEmptyResumeSignals } from '@/lib/careerStage';
import { extractCareerSignalsFromResume } from '@/lib/resumeParser';
import { getUserProfile, saveUserProfile } from '@/lib/storage';
import { kv } from '@vercel/kv';

export const runtime = 'nodejs';

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to invalidate resume review cache when resume changes
async function invalidateResumeReviewCache(userId: string) {
  try {
    // Delete all resume-review cache keys for this user
    const pattern = 'resume-review:*';
    const keys = await kv.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => kv.del(key)));
      console.log(`Invalidated ${keys.length} resume review cache entries`);
    }
  } catch (error) {
    console.warn('Failed to invalidate resume review cache:', error);
    // Don't throw - cache invalidation failure shouldn't block the request
  }
}

function getInputHash(questions: any, resume?: string, linkedin?: string): string {
  // Create a comprehensive hash that includes all input sources
  const inputData = {
    // Questions data - handle new numeric format (15 questions) or old named format (5 questions)
    questions: questions,
    
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
    const { 
      userId = 'temp-user-id', 
      questions: requestQuestions, 
      linkedin: linkedinInput, 
      resume: resumeInput, 
      clearCache = false,
      careerStageUserSelected 
    } = await req.json();

    console.log('=== GENERATE PROFILE INPUT ===');
    console.log('Resume input length:', resumeInput?.length || 0);
    console.log('Resume input first 300 chars:', resumeInput?.substring(0, 300));
    console.log('LinkedIn input length:', linkedinInput?.length || 0);
    console.log('==============================');

    // Clear cache if requested
    if (clearCache) {
      console.log('Clearing profile cache for user:', userId);
      await saveUserProfile(userId, {});
      return NextResponse.json({ message: 'Cache cleared successfully' });
    }

    // Use questions from request
    let questions: any = requestQuestions || {};

    // Extract career signals from resume if available
    let resumeSignals: ResumeSignals = createEmptyResumeSignals();
    if (resumeInput && resumeInput.length > 0) {
      try {
        console.log('Parsing resume for career signals...');
        resumeSignals = await extractCareerSignalsFromResume(resumeInput);
        console.log('Resume signals extracted:', resumeSignals);
      } catch (error) {
        console.error('Error extracting career signals from resume:', error);
        // Continue with empty signals
      }
    }

    // Determine career stage
    const careerStage = determineCareerStage(
      careerStageUserSelected || 'prefer_not_to_say',
      resumeSignals
    );
    console.log('Career stage determined:', careerStage, 'from user selection:', careerStageUserSelected);

    // Compose user message with personality assessment scores
    let userMessage = '';
    
    // Check if this is the new 15-question format (numeric IDs 1-15)
    const hasNumericQuestions = Object.keys(questions).some(key => !isNaN(Number(key)));
    
    if (hasNumericQuestions) {
      // New format: 15 questions mapped to Big Five traits
      // Calculate average scores per trait (3 questions each)
      const extraversion = [questions[1], questions[2], questions[3]].filter(v => v !== undefined);
      const conscientiousness = [questions[4], questions[5], questions[6]].filter(v => v !== undefined);
      const emotionalStability = [questions[7], questions[8], questions[9]].filter(v => v !== undefined);
      const agreeableness = [questions[10], questions[11], questions[12]].filter(v => v !== undefined);
      const openness = [questions[13], questions[14], questions[15]].filter(v => v !== undefined);
      
      const avgScore = (arr: number[]) => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : 'Not answered';
      
      userMessage += `Big Five Personality Assessment Results (Mini-IPIP/BFI-2-S validated):\n`;
      userMessage += `Extraversion: ${avgScore(extraversion)}/5 (social energy, assertiveness)\n`;
      userMessage += `Conscientiousness: ${avgScore(conscientiousness)}/5 (organization, reliability)\n`;
      userMessage += `Emotional Stability: ${avgScore(emotionalStability)}/5 (stress resilience, composure)\n`;
      userMessage += `Agreeableness: ${avgScore(agreeableness)}/5 (empathy, cooperation)\n`;
      userMessage += `Openness: ${avgScore(openness)}/5 (curiosity, creativity)\n`;
    }
    // Check for old 5-question format with named properties
    else if (questions.sociability !== undefined || questions.conscientiousness !== undefined || 
        questions.emotional_stability !== undefined || questions.empathy !== undefined || 
        questions.leadership !== undefined) {
      userMessage += `Leadership Assessment Results:\n`;
      userMessage += `Sociability/Extraversion: ${questions.sociability || 'Not answered'}/5\n`;
      userMessage += `Conscientiousness: ${questions.conscientiousness || 'Not answered'}/5\n`;
      userMessage += `Emotional Stability: ${questions.emotional_stability || 'Not answered'}/5\n`;
      userMessage += `Empathy: ${questions.empathy || 'Not answered'}/5\n`;
      userMessage += `Leadership Assertiveness: ${questions.leadership || 'Not answered'}/5\n`;
    }
    // Fallback to very old format if available
    else if (questions.roleModel || questions.friendsSay || questions.challenges) {
      userMessage += `Role model: ${questions.roleModel || ''}\n`;
      userMessage += `Friends would say: ${questions.friendsSay || ''}\n`;
      userMessage += `Challenges: ${questions.challenges || ''}\n`;
    }
    
    // Process LinkedIn and Resume data if provided
    let resumeData = '';
    let linkedinData = '';
    
    // Check for Resume data from request body (sent from client localStorage)
    if (resumeInput) {
      resumeData = typeof resumeInput === 'string' ? resumeInput : JSON.stringify(resumeInput);
    }
    
    // Check for LinkedIn data from request body (sent from client localStorage)
    if (linkedinInput) {
      // Check if it's the full text (from PDF upload)
      if (typeof linkedinInput === 'string') {
        linkedinData = linkedinInput;
      } 
      // Or if it's structured data (old manual entry format)
      else if (typeof linkedinInput === 'object') {
        // Format LinkedIn sections into a readable text
        const sections = [];
        if (linkedinInput.about) sections.push(`ABOUT:\n${linkedinInput.about}`);
        if (linkedinInput.experience) sections.push(`EXPERIENCE:\n${linkedinInput.experience}`);
        if (linkedinInput.education) sections.push(`EDUCATION:\n${linkedinInput.education}`);
        if (linkedinInput.recommendations) sections.push(`RECOMMENDATIONS:\n${linkedinInput.recommendations}`);
        
        linkedinData = sections.join('\n\n');
      }
    }
    
    // Validate that at least one input source is provided
    if (!linkedinData && !resumeData && !userMessage) {
      return NextResponse.json({ 
        error: 'No onboarding data found. Please provide at least one of: LinkedIn profile, Resume, or complete the assessment questions.' 
      }, { status: 400 });
    }

    // Check cache with comprehensive input hash
    const cachedProfile = await getUserProfile(userId);
    // Add timestamp to force fresh generation when prompt changes
    const inputHash = getInputHash(questions, resumeData, linkedinData) + '_prompt_updated_' + Date.now().toString().slice(-6);
    
    if (cachedProfile && 
        cachedProfile.inputs === inputHash && 
        cachedProfile.timestamp &&
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
    const systemPrompt = "You are the world's most insightful executive coach AI.\nYou generate psychographic profiles in JSON format only. Be deterministic and consistent in style. Return only valid JSON with no additional text, markdown, or formatting.";

    // Read user prompt template with anchoring example
    const promptPath = join(process.cwd(), 'Prompt.txt');
    const userPromptTemplate = await readFile(promptPath, 'utf-8');
    
    // Add career stage context
    const careerStageContext = `
CAREER STAGE: ${careerStage}
${careerStageUserSelected && careerStageUserSelected !== 'prefer_not_to_say' 
  ? `(User self-identified as: ${careerStageUserSelected})` 
  : '(Inferred from resume data)'}
${resumeSignals.yearsExperience ? `Years of experience: ${resumeSignals.yearsExperience}` : ''}
${resumeSignals.roleCount ? `Number of roles held: ${resumeSignals.roleCount}` : ''}
${resumeSignals.titles.length > 0 ? `Job titles: ${resumeSignals.titles.join(', ')}` : ''}
`.trim();
    
    // Replace placeholders with actual data
    let finalUserPrompt = userPromptTemplate
      .replace('{{linkedin_text}}', linkedinData || 'Not provided')
      .replace('{{resume_text}}', resumeData || 'Not provided')
      .replace('{{questions_text}}', userMessage || 'Not provided');
    
    // Add career stage context to the beginning
    finalUserPrompt = `${careerStageContext}\n\n${finalUserPrompt}`;

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
            // Cache the complete profile - merge with existing data to preserve fields
            const existingProfile = await getUserProfile(userId) || {};
            
            // Check if resume text is changing
            const resumeTextChanged = resumeData && resumeData !== existingProfile.resumeText;
            
            const updatedProfile = {
              ...existingProfile, // Preserve existing data like careerPreferences
              profile: fullProfile,
              timestamp: Date.now(),
              inputs: inputHash,
              onboardingComplete: true,
              careerStageUserSelected: careerStageUserSelected || existingProfile.careerStageUserSelected,
              resumeSignals: resumeSignals || existingProfile.resumeSignals,
              careerStage: careerStage || existingProfile.careerStage,
              resumeText: resumeData || existingProfile.resumeText,
              linkedInSummary: linkedinData || existingProfile.linkedInSummary,
              questions: questions || existingProfile.questions,
              extractedName: resumeSignals?.name || existingProfile.extractedName
            };
            
            console.log('=== SAVING PROFILE ===');
            console.log('resumeData length:', resumeData?.length || 0);
            console.log('resumeData first 300:', resumeData?.substring(0, 300));
            console.log('Saving resumeText length:', updatedProfile.resumeText?.length || 0);
            console.log('=====================');
            
            await saveUserProfile(userId, updatedProfile);
            
            // Invalidate resume review cache if resume changed
            if (resumeTextChanged) {
              await invalidateResumeReviewCache(userId);
            }
            
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
      // Cache what we have - merge with existing data to preserve fields
      const existingProfile = await getUserProfile(userId) || {};
      
      // Check if resume text is changing
      const resumeTextChanged = resumeData && resumeData !== existingProfile.resumeText;
      
      const updatedProfile = {
        ...existingProfile, // Preserve existing data like careerPreferences
        profile: fullProfile,
        timestamp: Date.now(),
        inputs: inputHash,
        onboardingComplete: true,
        careerStageUserSelected: careerStageUserSelected || existingProfile.careerStageUserSelected,
        resumeSignals: resumeSignals || existingProfile.resumeSignals,
        careerStage: careerStage || existingProfile.careerStage,
        resumeText: resumeData || existingProfile.resumeText,
        linkedInSummary: linkedinData || existingProfile.linkedInSummary,
        questions: questions || existingProfile.questions,
        extractedName: resumeSignals?.name || existingProfile.extractedName
      };
      await saveUserProfile(userId, updatedProfile);
      
      // Invalidate resume review cache if resume changed
      if (resumeTextChanged) {
        await invalidateResumeReviewCache(userId);
      }
      
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