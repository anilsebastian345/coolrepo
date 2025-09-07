import { NextRequest, NextResponse } from 'next/server';

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
    
    // For Vercel deployment, we'll just simulate file storage
    // In a real production app, you'd upload to cloud storage (AWS S3, etc.)
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `resume_${timestamp}.${fileExtension}`;
    
    // Read file content for processing (optional)
    const bytes = await file.arrayBuffer();
    console.log('File read successfully, size:', bytes.byteLength);
    
    // Simulate successful file storage
    console.log('Upload completed successfully!');
    return NextResponse.json({
      success: true,
      fileId: timestamp,
      fileName: file.name,
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