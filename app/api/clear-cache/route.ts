import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    // Clear the profile cache
    const cachePath = join(process.cwd(), 'profile_cache.json');
    await writeFile(cachePath, '{}');
    
    console.log('Profile cache cleared successfully');
    
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
