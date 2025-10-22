import { NextRequest, NextResponse } from 'next/server';

// Dynamic import for pdf-parse to avoid webpack issues
const pdfParse = require('pdf-parse');

export async function POST(request: NextRequest) {
  console.log('=== UPLOAD RESUME API CALLED ===');
  try {
    console.log('Parsing form data...');
    const formData = await request.formData();
    console.log('Form data keys:', Array.from(formData.keys()));
    
    const file = formData.get('resume') as File;
    console.log('File received:', file ? file.name : 'No file');
    
    if (!file) {
      console.log('ERROR: No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      console.log('ERROR: Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.log('ERROR: File too large:', file.size);
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    console.log('File validation passed');
    
    // Read file content for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log('File read successfully, size:', bytes.byteLength);
    
    // Extract text from PDF
    let extractedText = '';
    if (file.type === 'application/pdf') {
      try {
        const pdfData = await pdfParse(buffer);
        extractedText = pdfData.text;
        console.log('PDF text extracted, length:', extractedText.length);
      } catch (error) {
        console.error('Error extracting PDF text:', error);
        return NextResponse.json(
          { error: 'Failed to extract text from PDF. Please ensure the file is not corrupted.' },
          { status: 400 }
        );
      }
    } else {
      // For DOC/DOCX files, we'll need a different library or just skip text extraction for now
      console.log('Non-PDF file uploaded - text extraction not implemented for DOC/DOCX yet');
      extractedText = 'Text extraction not available for DOC/DOCX files. Please upload a PDF for full text extraction.';
    }
    
    // For Vercel deployment, we'll just simulate file storage
    // In a real production app, you'd upload to cloud storage (AWS S3, etc.)
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `resume_${timestamp}.${fileExtension}`;
    
    // Simulate successful file storage
    console.log('Upload completed successfully!');
    return NextResponse.json({
      success: true,
      fileId: timestamp,
      fileName: file.name,
      fullText: extractedText,
      message: 'Resume uploaded successfully'
    });

  } catch (error) {
    console.error('=== UPLOAD ERROR ===');
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('=== DELETE RESUME API CALLED ===');
    // For Vercel deployment, we'll just simulate file deletion
    return NextResponse.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
} 