import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { savePDF, parsePDF } from '@/lib/pdf';
import { addDocument } from '@/lib/chroma';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, error: 'Only PDF files are supported' },
        { status: 400 }
      );
    }
    
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }
    
    const docId = uuidv4();
    const ext = file.name.split('.').pop();
    const filename = `${docId}.${ext}`;
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const { path: filepath, size } = await savePDF(buffer, filename);
    
    const { text, pages, metadata } = await parsePDF(filepath);
    
    if (!text || text.trim().length < 100) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'PDF appears to be empty or contains no extractable text' 
        },
        { status: 400 }
      );
    }
    
    await addDocument(docId, text, {
      source: file.name,
      documentId: docId,
      filename,
      filepath,
      pageCount: pages,
      uploadedAt: new Date().toISOString(),
      title: metadata.title || file.name,
      author: metadata.author,
    });
    
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    
    return NextResponse.json({
      success: true,
      document: {
        id: docId,
        name: file.name,
        size,
        uploadedAt: new Date().toISOString(),
        pageCount: pages,
        status: 'ready',
        chunks: Math.ceil(text.length / 1000),
        metadata: {
          wordCount,
          title: metadata.title,
          author: metadata.author,
        },
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Use POST to upload PDF files' });
}
