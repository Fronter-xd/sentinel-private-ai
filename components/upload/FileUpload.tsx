'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, File, X, CheckCircle, Loader2 } from 'lucide-react';
import { cn, formatFileSize } from '@/lib/utils';
import { Document } from '@/lib/types';

interface FileUploadProps {
  onUploadComplete: (document: Document) => void;
  onError: (error: string) => void;
}

export function FileUpload({ onUploadComplete, onError }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<Document | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      setUploading(true);
      setProgress(0);

      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90));
      }, 100);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(progressInterval);
        setProgress(100);

        const data = await response.json();

        if (data.success) {
          setUploadedFile(data.document);
          onUploadComplete(data.document);
        } else {
          onError(data.error || 'Upload failed');
        }
      } catch (error) {
        clearInterval(progressInterval);
        onError(error instanceof Error ? error.message : 'Upload failed');
      } finally {
        setUploading(false);
      }
    },
    [onUploadComplete, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: false,
    disabled: uploading,
  });

  const resetUpload = () => {
    setUploadedFile(null);
    setProgress(0);
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {uploadedFile ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass p-6 rounded-lg"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <CheckCircle className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <p className="font-semibold text-text-primary">{uploadedFile.name}</p>
                  <div className="flex items-center gap-3 text-sm text-text-muted">
                    <span>{formatFileSize(uploadedFile.size)}</span>
                    <span>•</span>
                    <span>{uploadedFile.pageCount} pages</span>
                    <span>•</span>
                    <span>{uploadedFile.chunks} chunks</span>
                  </div>
                </div>
              </div>
              <button
                onClick={resetUpload}
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
          </motion.div>
        ) : (
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer',
              isDragActive
                ? 'border-accent bg-accent/5'
                : 'border-border hover:border-accent/50',
              uploading && 'pointer-events-none opacity-75'
            )}
          >
            <input {...getInputProps()} />

            {uploading ? (
              <div className="space-y-4">
                <div className="flex justify-center">
                  <Loader2 className="w-12 h-12 text-accent animate-spin" />
                </div>
                <p className="text-text-primary font-medium">Processing document...</p>
                <div className="w-full max-w-xs mx-auto h-2 bg-surface rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-center mb-4">
                  {isDragActive ? (
                    <FileUp className="w-12 h-12 text-accent" />
                  ) : (
                    <File className="w-12 h-12 text-text-muted" />
                  )}
                </div>
                <p className="text-text-primary font-medium mb-2">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF file'}
                </p>
                <p className="text-sm text-text-muted">
                  or click to select a file
                </p>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-text-muted">
                  <span className="px-2 py-1 rounded border border-border">PDF only</span>
                  <span className="px-2 py-1 rounded border border-border">Max 50MB</span>
                </div>
              </>
            )}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
