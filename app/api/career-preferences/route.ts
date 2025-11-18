import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import { CareerPreferences, OptionTag } from '@/lib/careerStage';

export const runtime = 'nodejs';

const CACHE_FILE = join(process.cwd(), 'profile_cache.json');

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
    
    // Read existing cache
    let cache: any = {};
    if (existsSync(CACHE_FILE)) {
      const cacheData = await readFile(CACHE_FILE, 'utf-8');
      cache = JSON.parse(cacheData);
    }
    
    // Update user's profile with career preferences
    if (!cache[userId]) {
      cache[userId] = {};
    }
    
    cache[userId].careerPreferences = careerPreferences;
    cache[userId].careerPreferencesCompleted = true;
    cache[userId].last_updated = new Date().toISOString();
    
    // Write back to cache
    await writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    
    // Return the updated profile
    return NextResponse.json({
      success: true,
      profile: {
        userId,
        careerPreferences,
        careerPreferencesCompleted: true,
        last_updated: cache[userId].last_updated,
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
