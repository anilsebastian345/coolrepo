import { NextRequest, NextResponse } from 'next/server';
import { extractCareerSignalsFromResume } from '@/lib/resumeParser';

export async function POST(request: NextRequest) {
  try {
    const { resumeText } = await request.json();

    if (!resumeText || typeof resumeText !== 'string') {
      return NextResponse.json(
        { error: 'Resume text is required' },
        { status: 400 }
      );
    }

    const signals = await extractCareerSignalsFromResume(resumeText);

    return NextResponse.json({
      success: true,
      signals,
    });
  } catch (error) {
    console.error('Error in parse-resume API:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
}
