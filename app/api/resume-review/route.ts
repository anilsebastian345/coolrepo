import { NextRequest, NextResponse } from 'next/server';
import { CareerStage, CareerPreferences } from '@/lib/careerStage';
import { CareerDirectionRecommendation } from '@/app/types/careerDirections';
import { ResumeReview } from '@/app/types/resumeReview';
import { kv } from '@vercel/kv';
import crypto from 'crypto';

type ResumeReviewRequest = {
  resumeText: string;
  careerStage?: CareerStage;
  careerPreferences?: CareerPreferences;
  careerDirections?: CareerDirectionRecommendation[];
  psychographicProfile?: any;
};

type ResumeReviewResponse = {
  review: ResumeReview;
};

export async function POST(req: NextRequest) {
  try {
    const body: ResumeReviewRequest = await req.json();
    const {
      resumeText,
      careerStage,
      careerPreferences,
      careerDirections,
      psychographicProfile
    } = body;

    console.log('=== RESUME REVIEW API ===');
    console.log('Received resumeText length:', resumeText?.length || 0);
    console.log('First 300 chars of resumeText:', resumeText?.substring(0, 300));
    console.log('========================');

    if (!resumeText) {
      return NextResponse.json(
        { error: 'resumeText is required' },
        { status: 400 }
      );
    }

    // Create cache key based on resume content and context
    const cacheKey = `resume-review:${crypto
      .createHash('sha256')
      .update(JSON.stringify({
        resumeText,
        careerStage,
        careerPreferences,
        careerDirections: careerDirections?.map(d => d.id).slice(0, 3),
      }))
      .digest('hex')}`;

    // Check cache first
    try {
      const cached = await kv.get<ResumeReview>(cacheKey);
      if (cached) {
        console.log('Returning cached resume review');
        return NextResponse.json({ review: cached });
      }
    } catch (cacheError) {
      console.warn('Cache read error:', cacheError);
      // Continue to generate if cache fails
    }

    // Get top 3 career directions for alignment analysis
    const topDirections = careerDirections?.slice(0, 3) || [];

    // Construct the comprehensive prompt
    const prompt = `You are an expert career coach for ALL industries:
healthcare, trades, creative, corporate, education, business, logistics, arts, tech, retail, public service.

### User data:
Career stage: ${JSON.stringify(careerStage, null, 2)}
Career preferences: ${JSON.stringify(careerPreferences, null, 2)}
Career directions: ${JSON.stringify(topDirections, null, 2)}
Psychographic profile: ${JSON.stringify(psychographicProfile, null, 2)}

### Resume:
${resumeText}

### Tasks:
1. Extract core strengths (3–6 bullets)
2. Extract weaknesses / risks (3–6 bullets)
3. Provide a 1–2 sentence "recruiter first impression"
4. Extract skills and categorize:
   - technical: software, tools, technical skills
   - interpersonal: communication, collaboration, people skills
   - leadership: management, mentoring, strategic thinking
   - domain: industry-specific expertise
   - transferable: skills that apply across fields
5. For each top 3 career directions, generate:
   - alignmentScore (0–100): how well the resume supports this direction
   - strongPoints: skills/experiences that support it
   - skillGaps: missing capabilities for this direction
   - recommendations: specific resume improvements aligned with that direction
6. Break resume into individual bullet points, for each:
   - identify issues (vague language, missing metrics, weak verbs, etc.)
   - rewrite as a stronger bullet (use STAR method, add metrics, stronger verbs)
7. Rewrite a personalized resume summary (2-3 sentences) aligned with:
   - psychographic profile
   - career stage
   - top career directions

Output JSON of this EXACT shape:
{
  "strengths": ["strength 1", "strength 2", ...],
  "weaknesses": ["weakness 1", "weakness 2", ...],
  "firstImpression": "1-2 sentence recruiter impression",
  "extractedSkills": {
    "technical": ["skill1", "skill2", ...],
    "interpersonal": ["skill1", "skill2", ...],
    "leadership": ["skill1", "skill2", ...],
    "domain": ["skill1", "skill2", ...],
    "transferable": ["skill1", "skill2", ...]
  },
  "directionAlignment": [
    {
      "directionId": "direction-id",
      "directionName": "Direction Name",
      "alignmentScore": 85,
      "strongPoints": ["point 1", "point 2", ...],
      "skillGaps": ["gap 1", "gap 2", ...],
      "recommendations": ["rec 1", "rec 2", ...]
    }
  ],
  "bulletAnalysis": [
    {
      "original": "original bullet text",
      "issues": ["issue 1", "issue 2", ...],
      "improved": "improved bullet text"
    }
  ],
  "improvedSummary": "2-3 sentence personalized summary"
}

Return ONLY valid JSON. No markdown, no explanation.`;

    // Call Azure OpenAI
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview';

    if (!endpoint || !apiKey || !deployment) {
      throw new Error('Azure OpenAI credentials not configured');
    }

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are an expert career coach and resume reviewer. You analyze resumes across ALL industries and career stages. Return responses as valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('=== Azure OpenAI Error ===');
      console.error('Status:', response.status);
      console.error('Error details:', errorText);
      console.error('Resume length:', resumeText.length, 'chars');
      console.error('=========================');
      throw new Error(`Azure OpenAI request failed (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    let parsedReview: ResumeReview;
    try {
      parsedReview = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate the structure
    if (!parsedReview.strengths || !parsedReview.weaknesses || !parsedReview.extractedSkills) {
      throw new Error('Invalid review structure from OpenAI');
    }

    // Cache the result for 7 days
    try {
      await kv.set(cacheKey, parsedReview, { ex: 60 * 60 * 24 * 7 });
      console.log('Cached resume review');
    } catch (cacheError) {
      console.warn('Cache write error:', cacheError);
      // Don't fail the request if caching fails
    }

    const result: ResumeReviewResponse = {
      review: parsedReview
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in resume-review API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate resume review',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
