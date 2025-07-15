import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const filePath = join(process.cwd(), 'onboarding_questions.json');
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e?.toString() || 'Unknown error' }, { status: 500 });
  }
} 