import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('resume') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a PDF, DOC, or DOCX file.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'uploads', 'resumes');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `resume_${timestamp}.${fileExtension}`;
    const filePath = join(uploadsDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // For now, we'll store file info in a simple JSON file
    // In a real app, you'd store this in a database with user ID
    const fileInfo = {
      id: timestamp,
      originalName: file.name,
      fileName: fileName,
      filePath: filePath,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      // TODO: Add user ID when authentication is implemented
      userId: 'temp-user-id'
    };

    // Store file metadata (in a real app, this would go to a database)
    const metadataPath = join(uploadsDir, 'metadata.json');
    let metadata = [];
    try {
      const existingMetadata = await import('fs').then(fs => 
        fs.promises.readFile(metadataPath, 'utf-8')
      ).then(data => JSON.parse(data)).catch(() => []);
      metadata = existingMetadata;
    } catch (error) {
      // File doesn't exist, start with empty array
    }
    
    metadata.push(fileInfo);
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      fileId: timestamp,
      fileName: file.name,
      message: 'Resume uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 