import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { CareerPreferences } from '@/lib/careerStage';
import { updateUserProfile } from '@/lib/storage';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession();
    
    // For now, use temp-user-id for guest mode
    // In production, you'd check session?.user?.email
    const userId = session?.user?.email || 'temp-user-id';
    
    const body = await req.json();
    const { careerPreferences } = body as { careerPreferences: CareerPreferences };
    
    if (!careerPreferences) {
      return NextResponse.json(
        { error: 'careerPreferences is required' },
        { status: 400 }
      );
    }
    
    // Validate careerPreferences structure
    if (!Array.isArray(careerPreferences.energizingWork) ||
        !Array.isArray(careerPreferences.avoidWork) ||
        !Array.isArray(careerPreferences.environments) ||
        !careerPreferences.peopleVsIC ||
        !careerPreferences.changeAppetite) {
      return NextResponse.json(
        { error: 'Invalid careerPreferences format - all fields required' },
        { status: 400 }
      );
    }
    
    // Update user's profile with career preferences using KV
    await updateUserProfile(userId, {
      careerPreferences,
      careerPreferencesCompleted: true,
      last_updated: new Date().toISOString(),
    });
    
    // Return the updated profile
    return NextResponse.json({
      success: true,
      profile: {
        userId,
        careerPreferences,
        careerPreferencesCompleted: true,
        last_updated: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Error saving career preferences:', error);
    return NextResponse.json(
      { error: 'Failed to save career preferences' },
      { status: 500 }
    );
  }
}
