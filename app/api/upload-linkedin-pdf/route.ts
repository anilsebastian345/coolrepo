import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('=== UPLOAD LINKEDIN PDF API CALLED ===');
  try {
    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    console.log('File received:', file ? file.name : 'No file');

    if (!file) {
      console.log('ERROR: No file provided');
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type - must be PDF
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      console.log('ERROR: Invalid file type:', file.type);
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log('ERROR: File too large:', file.size);
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log('File validation passed');

    // Read file content for PDF parsing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('File read successfully, size:', bytes.byteLength);
    
    const timestamp = Date.now();
    const filename = `linkedin_profile_${timestamp}.pdf`;

    // Parse the PDF to extract text
    let extractedText = '';
    try {
      console.log('Attempting to parse PDF...');
      // Dynamically import pdf-parse to avoid webpack issues
      const pdfParse = require('pdf-parse/lib/pdf-parse.js');
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
      console.log('PDF parsed successfully, text length:', extractedText.length);
    } catch (parseError) {
      console.error('Error parsing PDF:', parseError);
      // Return error if parsing fails
      return NextResponse.json(
        { success: false, error: 'Failed to extract text from PDF. Please try again.' },
        { status: 500 }
      );
    }

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

    console.log('Upload completed successfully!');
    return NextResponse.json({
      success: true,
      message: 'LinkedIn profile PDF processed successfully',
      filename: filename,
      fileId: timestamp,
      extractedText: extractedText.substring(0, 500) + (extractedText.length > 500 ? '...' : ''), // Preview
      fullText: extractedText, // Include full text for client-side storage
      profileData: profileData
    });

  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
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
