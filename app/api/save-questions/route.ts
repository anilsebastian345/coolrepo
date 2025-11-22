import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { updateUserProfile } from '@/lib/storage';

// This endpoint is deprecated - questions are now saved directly via /api/generate-profile
// Keeping for backwards compatibility but it now saves to KV
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.email || 'temp-user-id';
    const data = await req.json();
    
    // Save questions to user profile in KV
    await updateUserProfile(userId, { questions: data });
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e?.toString() || 'Unknown error' }, { status: 500 });
  }
} 