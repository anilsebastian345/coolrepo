import { NextRequest, NextResponse } from 'next/server';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Check if it's a PDF
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Create linkedin_profiles directory if it doesn't exist
    const linkedinDir = join(process.cwd(), 'uploads', 'linkedin_profiles');
    if (!existsSync(linkedinDir)) {
      mkdirSync(linkedinDir, { recursive: true });
    }

    // Save the PDF file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `linkedin_profile_${timestamp}.pdf`;
    const filepath = join(linkedinDir, filename);
    
    writeFileSync(filepath, buffer);

    // Parse the PDF to extract text
    let extractedText = '';
    try {
      // Dynamically import pdf-parse to avoid webpack issues
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } catch (parseError) {
      console.error('Error parsing PDF:', parseError);
      // Continue without text extraction if parsing fails
      extractedText = 'PDF parsing temporarily unavailable. File saved successfully.';
    }

    // Save the extracted text to a text file for easy access
    const textFilename = `linkedin_profile_${timestamp}.txt`;
    const textFilepath = join(linkedinDir, textFilename);
    
    const formattedText = `
LINKEDIN PROFILE DATA (Extracted from PDF)
==========================================

EXTRACTED TEXT:
${extractedText}

UPLOADED ON: ${new Date().toISOString()}
ORIGINAL FILE: ${filename}
`;

    writeFileSync(textFilepath, formattedText, 'utf8');

    // Parse basic information from the text (name, headline, etc.)
    const lines = extractedText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    
    // Try to extract key information
    let profileData: any = {
      rawText: extractedText,
      filename: filename,
      extractedDate: new Date().toISOString()
    };

    // Basic parsing - the first few lines usually contain name and headline
    if (lines.length > 0) {
      profileData.name = lines[0]; // Usually the first line is the name
    }
    if (lines.length > 1) {
      profileData.headline = lines[1]; // Second line is often the headline
    }

    return NextResponse.json({
      success: true,
      message: 'LinkedIn profile PDF uploaded and processed successfully',
      filename: filename,
      textFile: textFilename,
      extractedText: extractedText.substring(0, 500) + '...', // Preview
      profileData: profileData
    });

  } catch (error) {
    console.error('Error uploading LinkedIn PDF:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to upload LinkedIn profile PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
