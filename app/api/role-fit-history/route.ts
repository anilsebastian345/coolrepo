import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getRecentRoleFitAnalyses } from '@/lib/roleFitHistory';

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
    const analyses = await getRecentRoleFitAnalyses(userId, 20);
    
    return NextResponse.json({ analyses });
  } catch (error) {
    console.error('Error fetching role fit history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
