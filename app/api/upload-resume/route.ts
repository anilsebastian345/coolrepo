import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join, normalize } from 'path';
import { existsSync } from 'fs';
// Remove pdf-parse and mammoth imports and name extraction logic

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

    // Delete previous resume for this user
    const userId = 'temp-user-id';
    const previous = metadata.find((m: any) => m.userId === userId);
    if (previous && previous.filePath) {
      const prevPath = normalize(previous.filePath);
      console.log('Attempting to delete previous resume:', prevPath);
      if (existsSync(prevPath)) {
        try {
          await unlink(prevPath);
          console.log('Deleted previous resume:', prevPath);
        } catch (err) {
          console.error('Failed to delete previous resume:', prevPath, err);
        }
      } else {
        console.log('Previous resume file does not exist:', prevPath);
      }
    }
    // Remove previous metadata for this user
    metadata = metadata.filter((m: any) => m.userId !== userId);
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

export async function DELETE(request: NextRequest) {
  try {
    // In a real app, get userId from auth/session. For now, use temp-user-id
    let userId = 'temp-user-id';
    try {
      const body = await request.json();
      if (body.userId) userId = body.userId;
    } catch {}

    const uploadsDir = join(process.cwd(), 'uploads', 'resumes');
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

    const previous = metadata.find((m: any) => m.userId === userId);
    if (previous && previous.filePath) {
      const prevPath = normalize(previous.filePath);
      console.log('Attempting to delete resume (DELETE):', prevPath);
      if (existsSync(prevPath)) {
        try {
          await unlink(prevPath);
          console.log('Deleted resume (DELETE):', prevPath);
        } catch (err) {
          console.error('Failed to delete resume (DELETE):', prevPath, err);
        }
      } else {
        console.log('Resume file does not exist (DELETE):', prevPath);
      }
    }
    // Remove metadata for this user
    metadata = metadata.filter((m: any) => m.userId !== userId);
    await writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Failed to delete resume' }, { status: 500 });
  }
} 