import fs from 'fs';
import path from 'path';
import pdfParse from 'pdf-parse';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './public/uploads';

export interface ParsedPDF {
  text: string;
  pages: number;
  metadata: {
    title?: string;
    author?: string;
    creator?: string;
    producer?: string;
  };
}

export async function ensureUploadDir(): Promise<string> {
  const dir = path.resolve(UPLOAD_DIR);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export async function savePDF(
  file: Buffer,
  filename: string
): Promise<{ path: string; size: number }> {
  const dir = await ensureUploadDir();
  const filepath = path.join(dir, filename);
  
  fs.writeFileSync(filepath, file);
  
  return {
    path: filepath,
    size: file.length,
  };
}

export async function parsePDF(filepath: string): Promise<ParsedPDF> {
  const dataBuffer = fs.readFileSync(filepath);
  
  const data = await pdfParse(dataBuffer);
  
  return {
    text: data.text,
    pages: data.numpages,
    metadata: {
      title: data.info?.Title,
      author: data.info?.Author,
      creator: data.info?.Creator,
      producer: data.info?.Producer,
    },
  };
}

export async function deletePDF(filename: string): Promise<void> {
  const dir = await ensureUploadDir();
  const filepath = path.join(dir, filename);
  
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
}

export function getUploadPath(filename: string): string {
  return path.join(UPLOAD_DIR, filename);
}
