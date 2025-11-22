import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { saveUserProfile } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    const userId = session?.user?.email || 'temp-user-id';
    
    // Clear the user's profile cache in KV
    await saveUserProfile(userId, {});
    
    console.log('Profile cache cleared successfully for user:', userId);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Profile cache cleared successfully' 
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      { error: 'Failed to clear cache' },
      { status: 500 }
    );
  }
}
