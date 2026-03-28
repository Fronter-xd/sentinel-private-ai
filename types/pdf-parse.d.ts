declare module 'pdf-parse' {
  interface PDFInfo {
    Title?: string;
    Author?: string;
    Creator?: string;
    Producer?: string;
    CreationDate?: string;
    ModDate?: string;
  }

  interface PDFMeta {
    info?: PDFInfo;
    metadata?: Record<string, unknown>;
  }

  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: Record<string, unknown> | null;
    text: string;
    version: string;
  }

  interface PdfParseOptions {
    pagerender?: (pageData: { getTextContent: () => Promise<{ items: unknown[] }> }) => Promise<string>;
    max?: number;
    version?: string;
  }

  function pdfParse(
    dataBuffer: Buffer | ArrayBuffer,
    options?: PdfParseOptions
  ): Promise<PDFData>;

  export = pdfParse;
}
