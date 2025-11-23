import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAllRoleFitAnalyses } from '@/lib/roleFitHistory';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT || '';
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY || '';
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT || '';

interface RoleFitInsights {
  recurringStrengths: string[];
  recurringGaps: string[];
  bestFitPatterns: string[];
  weakerFitPatterns: string[];
  recommendations: string[];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.email;
    const analyses = await getAllRoleFitAnalyses(userId);
    
    // Need at least 3 analyses to generate patterns
    if (analyses.length < 3) {
      return NextResponse.json({
        recurringStrengths: [],
        recurringGaps: [],
        bestFitPatterns: [],
        weakerFitPatterns: [],
        recommendations: [],
        message: 'Not enough data to generate patterns. Analyze at least 3 roles.'
      });
    }
    
    // Prepare data for LLM
    const historyData = analyses.map(a => ({
      company: a.company,
      jobTitle: a.jobTitle,
      fitScore: a.fitScore,
      fitLabel: a.fitLabel,
      strengths: a.strengths,
      gaps: a.gaps,
      themesToLeanInto: a.themesToLeanInto,
    }));
    
    const prompt = `Here is the user's role fit history (${analyses.length} roles analyzed):

${JSON.stringify(historyData, null, 2)}

Please analyze this history and provide insights:

1) Summarize recurring strengths across roles (3-5 items).
2) Summarize recurring gaps / weaknesses (3-5 items).
3) Identify which types of roles and environments they tend to fit best (2-4 patterns).
4) Identify which roles or environments they tend to fit less well (2-3 patterns).
5) Provide 3-5 specific recommendations for how they should focus their search and how to improve their profile or resume.

Return ONLY valid JSON in this exact format:
{
  "recurringStrengths": ["string", ...],
  "recurringGaps": ["string", ...],
  "bestFitPatterns": ["string", ...],
  "weakerFitPatterns": ["string", ...],
  "recommendations": ["string", ...]
}`;

    // Call Azure OpenAI
    const response = await fetch(
      `${AZURE_OPENAI_ENDPOINT}/openai/deployments/${AZURE_OPENAI_DEPLOYMENT}/chat/completions?api-version=2024-02-15-preview`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_OPENAI_KEY,
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are an analytical career coach. You analyze role fit histories to identify patterns, strengths, and gaps. You provide concise, actionable insights. Do not repeat raw data. Summarize it. Return only valid JSON.'
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Azure OpenAI error:', errorText);
      throw new Error(`Azure OpenAI request failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in Azure OpenAI response');
    }

    // Parse JSON response
    let insights: RoleFitInsights;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      insights = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse insights JSON:', content);
      throw new Error('Failed to parse insights response');
    }

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error generating role fit insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
