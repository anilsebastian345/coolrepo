import { NextRequest, NextResponse } from 'next/server';
import { JobMatchAnalysis } from '@/app/types/jobMatch';
import { CareerStage, CareerPreferences } from '@/lib/careerStage';
import { CareerDirectionRecommendation } from '@/app/types/careerDirections';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY || '';
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || '';

type JobMatchRequest = {
  jobTitle?: string;
  jobDescription: string;
  userProfile: {
    careerStage?: CareerStage;
    careerPreferences?: CareerPreferences;
    careerDirections?: CareerDirectionRecommendation[];
    resumeText: string;
    linkedInSummary?: string;
    psychographicProfile?: any;
  };
};

type JobMatchResponse = {
  analysis: JobMatchAnalysis;
};

export async function POST(req: NextRequest) {
  try {
    const body: JobMatchRequest = await req.json();
    const { jobTitle, jobDescription, userProfile } = body;

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    if (!userProfile?.resumeText) {
      return NextResponse.json(
        { error: 'Resume text is required in user profile' },
        { status: 400 }
      );
    }

    // Build the comprehensive prompt
    const prompt = buildJobMatchPrompt({
      jobTitle,
      jobDescription,
      careerStage: userProfile.careerStage,
      careerPreferences: userProfile.careerPreferences,
      careerDirections: userProfile.careerDirections || [],
      resumeText: userProfile.resumeText,
      linkedInSummary: userProfile.linkedInSummary,
      psychographicProfile: userProfile.psychographicProfile,
    });

    // Call Azure OpenAI
    const response = await fetch(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
          response_format: { type: 'json_object' },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI error:', errorText);
      return NextResponse.json(
        { error: 'Failed to generate job match analysis', details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content received from AI' },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsedResponse: JobMatchResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Raw content:', content);
      return NextResponse.json(
        { error: 'Failed to parse AI response', details: String(parseError) },
        { status: 500 }
      );
    }

    // Validate the response structure
    if (!parsedResponse.analysis) {
      return NextResponse.json(
        { error: 'Invalid response structure: missing analysis' },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedResponse);
  } catch (error) {
    console.error('Job match error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

function buildJobMatchPrompt(params: {
  jobTitle?: string;
  jobDescription: string;
  careerStage?: CareerStage;
  careerPreferences?: CareerPreferences;
  careerDirections: CareerDirectionRecommendation[];
  resumeText: string;
  linkedInSummary?: string;
  psychographicProfile?: any;
}): string {
  const {
    jobTitle,
    jobDescription,
    careerStage,
    careerPreferences,
    careerDirections,
    resumeText,
    linkedInSummary,
    psychographicProfile,
  } = params;

  return `You are an expert, inclusive career coach and hiring advisor.
You help candidates from ALL backgrounds:
- trades and hands-on work (electricians, mechanics, carpenters, chefs, skilled labor)
- healthcare (nurses, doctors, technicians, caregivers)
- education and social impact (teachers, trainers, NGO workers, government)
- creative fields (designers, artists, content creators, media, performers)
- business and corporate roles (operations, product, finance, marketing, management)
- technical and digital (software, hardware, data, IT)

You will compare ONE candidate against ONE specific job description.
You must NOT assume every candidate is trying to be a tech worker. Respect the field of the job description.

----
CANDIDATE DATA (JSON):

Career stage:
${careerStage ? JSON.stringify(careerStage, null, 2) : 'Not provided'}

Career preferences:
${careerPreferences ? JSON.stringify(careerPreferences, null, 2) : 'Not provided'}

Top career directions from previous analysis:
${careerDirections.length > 0 ? JSON.stringify(careerDirections.slice(0, 3), null, 2) : 'Not provided'}

Psychographic profile (if present):
${psychographicProfile ? JSON.stringify(psychographicProfile, null, 2) : 'Not provided'}

Resume text:
${resumeText}

LinkedIn summary (if present):
${linkedInSummary || 'Not provided'}

----
JOB DESCRIPTION:
${jobTitle ? `Job Title: ${jobTitle}\n` : ''}${jobDescription}

----
YOUR TASK:

1. Understand this job:
   - key responsibilities
   - required and preferred skills
   - level / seniority
   - environment (pace, type of organization, culture signals)

2. Compare the candidate to this specific job and produce:

   A) overallMatchScore (0–100):
      - Be honest and conservative. This should reflect realistic fit for THIS job.
      - Consider: Does the candidate have the core skills? Appropriate experience level? Relevant domain knowledge?
      - 90–100: Exceptional candidate, exceeds requirements
      - 80–89: Strong candidate, clearly qualified
      - 70–79: Good candidate, meets most requirements
      - 60–69: Moderate candidate, could work but has gaps
      - 50–59: Stretch candidate, significant development needed
      - Below 50: Not a strong match for this specific role

   B) dimensionScores (array) with 3–4 dimensions:
      - "skills" (always include)
      - "experience" (always include)
      - "responsibilities" (always include)
      - "culture_environment" (ONLY include if BOTH the job description AND candidate profile contain meaningful culture/environment signals)
      
      For each dimension:
        - score: 0–100
        - comment: 1–2 sentences explaining the score in plain, honest language.
      
      **CRITICAL**: Be honest and conservative with scores:
        - 90–100: Exceptional match, candidate exceeds requirements
        - 80–89: Strong match, candidate clearly meets requirements
        - 70–79: Good match, candidate mostly meets requirements with minor gaps
        - 60–69: Moderate match, candidate meets some requirements but has notable gaps
        - 50–59: Partial match, candidate has relevant background but significant gaps
        - Below 50: Weak match, candidate lacks most key requirements
      
      Do NOT inflate scores. If a candidate is missing key skills or experience, reflect that honestly.
      For culture_environment: Only score if you have concrete signals (e.g., job mentions "startup pace" and resume shows startup experience, 
      or job says "large enterprise" and candidate worked at Fortune 500s). If signals are vague or missing, OMIT this dimension entirely.

   C) strengths:
      - 3–6 bullet points that describe where this candidate is genuinely strong for THIS job,
        grounded in their actual resume and profile.
      - Be specific and honest. Don't manufacture strengths that aren't there.
      - If the candidate has limited relevant experience, say so and focus on transferable skills.

   D) gaps:
      - 3–6 bullet points that describe important gaps or missing pieces for THIS job.
      - Include both skill gaps and experience gaps.
      - Be direct and helpful, not harsh. Frame gaps as development areas.
      - If there are no significant gaps, you can have fewer items here.

   E) recommendedSkills:
      - 5–10 specific skills or capabilities the candidate could build to be a stronger match,
        tailored to the domain of this job (e.g., clinical skills for a nurse role,
        safety procedures for a trades role, design tools for creative, etc.).

   F) tailoringSuggestions:
      - summary: a rewritten resume summary paragraph tailored to THIS job,
        aligned with the candidate's strengths, career stage, and directions.
      - keyBullets: an array where each item is:
        {
          "original": string | null, // original bullet from resume if clearly mappable, otherwise null
          "improved": string,        // a stronger version tailored to THIS job
          "note": string             // 1 sentence explaining why this bullet helps for THIS job
        }
      - Make the bullets appropriate for the candidate's field and level.
        For example, do not force corporate jargon on a trades or nursing candidate.

   G) riskFlags:
      - 0–5 short bullets for any meaningful concerns a recruiter might have for THIS job
        (e.g., "No direct experience in clinical settings", "Limited leadership experience for a manager role").

3. Very important:
   - Use simple, clear language.
   - Respect the job's domain (healthcare vs trades vs corporate vs creative, etc.).
   - Do NOT suggest changing to a different field; focus ONLY on fit for THIS job description.
   - **BE HONEST**. Do not inflate scores or manufacture strengths. If there are gaps, acknowledge them clearly.
   - If the candidate is underqualified, reflect that in the scores and feedback.
   - If the candidate is overqualified, that's fine to note too.
   - For culture_environment dimension: ONLY include if you have concrete evidence from both the job description and candidate profile.

4. Output STRICT JSON with this exact shape:

{
  "analysis": {
    "jobTitle": "${jobTitle || 'Job Opportunity'}",
    "overallMatchScore": number,
    "dimensionScores": [
      {
        "dimension": "skills",
        "score": number,
        "comment": string
      },
      {
        "dimension": "experience",
        "score": number,
        "comment": string
      },
      {
        "dimension": "responsibilities",
        "score": number,
        "comment": string
      }
      // Optionally include this 4th dimension ONLY if you have concrete culture/environment signals:
      // {
      //   "dimension": "culture_environment",
      //   "score": number,
      //   "comment": string
      // }
    ],
    "strengths": [string],  // 3-6 items, honest assessment
    "gaps": [string],       // 3-6 items, honest assessment
    "recommendedSkills": [string],
    "tailoringSuggestions": {
      "summary": string,
      "keyBullets": [
        {
          "original": string | null,
          "improved": string,
          "note": string
        }
      ]
    },
    "riskFlags": [string]  // 0-5 items
  }
}`;
}
