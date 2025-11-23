import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { saveRoleFitAnalysis } from '@/lib/roleFitHistory';
import { JobMatchAnalysis } from '@/app/types/jobMatch';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { jobTitle, jobDescription, analysis } = body as {
      jobTitle: string | null;
      jobDescription: string;
      analysis: JobMatchAnalysis;
    };
    
    if (!jobDescription || !analysis) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const userId = session.user.email;
    const savedRecord = await saveRoleFitAnalysis(
      userId,
      jobTitle,
      jobDescription,
      analysis
    );
    
    return NextResponse.json({ success: true, record: savedRecord });
  } catch (error) {
    console.error('Error saving role fit analysis:', error);
    return NextResponse.json(
      { error: 'Failed to save analysis' },
      { status: 500 }
    );
  }
}
