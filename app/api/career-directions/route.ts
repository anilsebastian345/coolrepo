import { NextRequest, NextResponse } from 'next/server';
import { CareerStage, CareerPreferences } from '@/lib/careerStage';
import { CareerDirectionRecommendation } from '@/app/types/careerDirections';
import { careerDirectionsConfig } from '@/lib/careerDirectionsConfig';
import { getCareerDirectionRecommendations as getFallbackRecommendations } from '@/lib/careerDirections';

type CareerDirectionsRequest = {
  userProfile: {
    careerStage?: CareerStage;
    careerPreferences?: CareerPreferences;
    psychographicProfile?: any;
    resumeText?: string;
    linkedInSummary?: string;
  };
};

type CareerDirectionsResponse = {
  directions: CareerDirectionRecommendation[];
};

export async function POST(req: NextRequest) {
  try {
    const body: CareerDirectionsRequest = await req.json();
    const { userProfile } = body;

    if (!userProfile) {
      return NextResponse.json(
        { error: 'userProfile is required' },
        { status: 400 }
      );
    }

    // Construct the comprehensive prompt
    const prompt = `You are an expert, inclusive career coach. You help people from ALL backgrounds:
- corporate, tech, business
- trades, hands-on work, crafts
- healthcare, nursing, medicine
- arts, creative, content, media
- education, social impact, non-profits
- entrepreneurship, self-employed, freelance

You do NOT only suggest tech or corporate jobs. You consider people's strengths, preferences, and stage of life.

Here is the candidate's information as JSON:

Career stage:
${JSON.stringify(userProfile.careerStage, null, 2)}

Career preferences:
${JSON.stringify(userProfile.careerPreferences, null, 2)}

${userProfile.psychographicProfile ? `Psychographic profile:
${JSON.stringify(userProfile.psychographicProfile, null, 2)}` : ''}

${userProfile.resumeText ? `Resume text:
${userProfile.resumeText.substring(0, 2000)}` : ''}

${userProfile.linkedInSummary ? `LinkedIn summary:
${userProfile.linkedInSummary}` : ''}

Here is the set of available BIG CAREER DIRECTIONS and their clusters, as JSON:
${JSON.stringify(careerDirectionsConfig, null, 2)}

Your task:

1. Read the candidate's information and understand:
   - what energizes them
   - what they want to avoid
   - what environments they like
   - whether they prefer individual work vs leading others
   - how open they are to staying close vs pivot vs big shift
   - their past experience and strengths from resume/LinkedIn
   - their career stage (college, recent_grad, early_career, mid_career, senior)

2. Score each BIG DIRECTION from 0–100 for overall fit.

3. Choose the TOP 3–4 directions with the highest fit.

4. For each chosen direction, construct:
   - id: direction id from the config
   - name: direction name from the config
   - fitScore: 0–100
   - summary: 1–2 sentences describing why this direction is promising for this person
   - whyItFits: 3–5 bullet points, grounded in their profile and preferences
   - clusters: choose 2–3 clusters from the config that fit this person best. For each cluster, reuse the cluster id/name/summary and its examplePaths from the config.
   - stageNote: a short note (1–2 sentences) that speaks to the person's career stage:
       * For college: focus on exploration, student projects, early exposure.
       * For recent grads: focus on first roles and foundational skills.
       * For early career: focus on refining direction and adjacent pivots.
       * For mid/senior: focus on next chapter, leadership vs IC, and meaningful pivots.

5. Return ONLY valid JSON in this format:

{
  "directions": [
    {
      "id": "...",
      "name": "...",
      "fitScore": 0,
      "summary": "...",
      "whyItFits": ["...", "..."],
      "clusters": [
        {
          "id": "...",
          "name": "...",
          "summary": "...",
          "examplePaths": [
            {
              "id": "...",
              "name": "...",
              "stageHint": "college" | "recent_grad" | "early_career" | "mid_career" | "senior" | "any",
              "description": "..."
            }
          ]
        }
      ],
      "stageNote": "..."
    }
  ]
}

NEVER suggest only corporate or tech careers. Always consider trades, healthcare, education, creative work, small business, and other real-world paths when they fit the person.`;

    // Get Azure OpenAI configuration
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const apiKey = process.env.AZURE_OPENAI_KEY;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT;
    const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-02-15-preview';

    if (!endpoint || !apiKey || !deployment) {
      throw new Error('Azure OpenAI configuration missing');
    }

    // Call Azure OpenAI
    const response = await fetch(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': apiKey,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an expert career coach who provides inclusive, thoughtful career guidance. You always return valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI error:', errorText);
      throw new Error(`Azure OpenAI returned ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content;

    if (!responseText) {
      throw new Error('No response from Azure OpenAI');
    }

    // Parse the JSON response
    let parsedResponse: CareerDirectionsResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse Azure OpenAI response:', parseError);
      console.error('Response text:', responseText);
      throw new Error('Invalid JSON response from Azure OpenAI');
    }

    // Validate that directions is an array
    if (!parsedResponse.directions || !Array.isArray(parsedResponse.directions)) {
      console.error('Invalid directions format:', parsedResponse);
      throw new Error('Invalid directions format in response');
    }

    // Validate each direction has required fields
    const validDirections = parsedResponse.directions.filter((dir) => {
      return (
        dir.id &&
        dir.name &&
        typeof dir.fitScore === 'number' &&
        dir.summary &&
        Array.isArray(dir.whyItFits) &&
        Array.isArray(dir.clusters) &&
        dir.stageNote
      );
    });

    if (validDirections.length === 0) {
      throw new Error('No valid directions in response');
    }

    return NextResponse.json({
      directions: validDirections,
    });
  } catch (error) {
    console.error('Error in career-directions API:', error);

    // Fall back to heuristic approach
    try {
      const { userProfile } = await req.json();
      const fallbackDirections = await getFallbackRecommendations(userProfile);
      
      return NextResponse.json({
        directions: fallbackDirections,
        fallback: true,
      });
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return NextResponse.json(
        { error: 'Failed to generate career directions' },
        { status: 500 }
      );
    }
  }
}
