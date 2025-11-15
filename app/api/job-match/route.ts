import { NextRequest, NextResponse } from 'next/server';
import { JobMatchResult } from '@/app/types/features';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { userId, jobDescription, profile, resume, linkedin } = await req.json();

    if (!jobDescription || jobDescription.trim().length === 0) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      );
    }

    // TODO: Replace with actual Azure OpenAI call
    // For now, return mock data
    const mockResponse: JobMatchResult = {
      matchPercentage: 78,
      overallAssessment: `Strong match overall. Your cross-functional leadership experience, technical depth in AI/data, and proven track record of building empowered teams align well with this role's requirements. The main gaps are in specific domain expertise and some advanced technical certifications, but your learning agility and systems thinking approach position you well to close these quickly.`,
      strengths: [
        {
          skill: 'Cross-Functional Leadership',
          evidence: 'Led teams spanning supply chain, product, data, and AI functions with proven results in team empowerment and retention',
          impact: 'Directly addresses the requirement for managing diverse stakeholder groups and building collaborative cultures'
        },
        {
          skill: 'AI/ML Implementation',
          evidence: 'Hands-on experience architecting and deploying AI solutions, including demand forecasting and analytics platforms',
          impact: 'Matches the need for practical AI experience beyond theoretical knowledge'
        },
        {
          skill: 'Data-Driven Decision Making',
          evidence: 'Track record of using analytics to drive operational improvements and strategic decisions',
          impact: 'Aligns with emphasis on metrics, KPIs, and evidence-based leadership'
        },
        {
          skill: 'Change Management',
          evidence: 'Successfully led transformation initiatives across supply chain and technology infrastructure',
          impact: 'Demonstrates ability to drive organizational change, a key requirement for this role'
        },
        {
          skill: 'Team Development',
          evidence: 'Built teams from 3 to 15+ members with 90% retention and multiple promotions to senior roles',
          impact: 'Exceeds expectations for talent development and succession planning'
        }
      ],
      gaps: [
        {
          skill: 'Industry-Specific Domain Expertise',
          importance: 'important',
          suggestion: 'Research this industry\'s unique challenges and regulatory landscape. Consider informational interviews with industry leaders and read 3-5 key industry publications to build contextual knowledge quickly.'
        },
        {
          skill: 'Advanced Cloud Architecture Certifications',
          importance: 'nice-to-have',
          suggestion: 'While you have hands-on AWS experience, obtaining AWS Solutions Architect Professional or equivalent certification would strengthen your candidacy and signal commitment to cloud-native approaches.'
        },
        {
          skill: 'P&L Management Experience',
          importance: 'critical',
          suggestion: 'Highlight any budget ownership or financial impact from past roles. If limited, emphasize cost optimization results and financial modeling experience. Consider taking a finance for non-finance managers course.'
        },
        {
          skill: 'Executive Stakeholder Management',
          importance: 'important',
          suggestion: 'Prepare specific examples of presenting to C-suite or board members. If experience is limited, focus on your communication style and ability to translate technical concepts to business outcomes.'
        }
      ],
      recommendations: [
        'Emphasize your full-stack operational experience and ability to connect AI/technology initiatives to business outcomes',
        'Prepare 2-3 detailed case studies showcasing your team empowerment approach and measurable results',
        'Research the company\'s specific challenges in this industry and prepare insights on how your experience applies',
        'Highlight your learning agility and examples of quickly mastering new domains',
        'Address P&L management in your cover letter by quantifying financial impact of your initiatives',
        'Connect your systems thinking and calm, methodical approach to their need for strategic leadership',
        'Prepare questions that demonstrate understanding of their business model and growth challenges'
      ]
    };

    return NextResponse.json(mockResponse);
  } catch (error) {
    console.error('Job match error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze job match' },
      { status: 500 }
    );
  }
}
