/**
 * Document Upload Component
 * Handles file upload with drag & drop support
 */
import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { documentService, type Document } from '@/services/document-service';

interface DocumentUploadProps {
  onUploadComplete?: (document: Document) => void;
  onError?: (error: string) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  onUploadComplete,
  onError,
  maxFileSize = 10,
  acceptedTypes = ['.txt', '.md', '.pdf', '.docx', '.json', '.csv'],
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<{
    file: File;
    status: 'pending' | 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
  }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): string | null => {
    const maxBytes = maxFileSize * 1024 * 1024;
    if (file.size > maxBytes) {
      return `File size exceeds ${maxFileSize}MB limit`;
    }

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(extension)) {
      return `File type ${extension} is not supported`;
    }

    return null;
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    const newQueue = fileArray.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }));

    setUploadQueue(prev => [...prev, ...newQueue]);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      const queueIndex = uploadQueue.length + i;

      // Validate file
      const error = validateFile(file);
      if (error) {
        setUploadQueue(prev => 
          prev.map((item, idx) => 
            idx === queueIndex ? { ...item, status: 'error', error } : item
          )
        );
        onError?.(error);
        continue;
      }

      // Update status to uploading
      setUploadQueue(prev =>
        prev.map((item, idx) =>
          idx === queueIndex ? { ...item, status: 'uploading', progress: 10 } : item
        )
      );

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadQueue(prev =>
            prev.map((item, idx) =>
              idx === queueIndex && item.progress < 90
                ? { ...item, progress: item.progress + 10 }
                : item
            )
          );
        }, 200);

        // Upload the file
        const document = await documentService.uploadFile(file);

        clearInterval(progressInterval);

        // Update status to success
        setUploadQueue(prev =>
          prev.map((item, idx) =>
            idx === queueIndex ? { ...item, status: 'success', progress: 100 } : item
          )
        );

        onUploadComplete?.(document);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Upload failed';
        setUploadQueue(prev =>
          prev.map((item, idx) =>
            idx === queueIndex ? { ...item, status: 'error', error: errorMsg } : item
          )
        );
        onError?.(errorMsg);
      }
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFromQueue = (index: number) => {
    setUploadQueue(prev => prev.filter((_, idx) => idx !== index));
  };

  const clearCompleted = () => {
    setUploadQueue(prev => prev.filter(item => item.status !== 'success'));
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center
          transition-all duration-300 cursor-pointer
          ${isDragging 
            ? 'border-primary bg-primary/5 scale-[1.02]' 
            : 'border-primary/20 hover:border-primary/40 hover:bg-primary/5'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          title="Choose files to upload"
          aria-label="Choose files to upload"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`
            w-16 h-16 rounded-full flex items-center justify-center
            transition-colors duration-300
            ${isDragging ? 'bg-primary text-white' : 'bg-primary/10 text-primary'}
          `}>
            <Upload className="w-8 h-8" />
          </div>

          <div>
            <h3 className="font-heading text-lg text-primary mb-1">
              {isDragging ? 'Drop files here' : 'Upload Documents'}
            </h3>
            <p className="text-sm text-primary/60">
              Drag & drop or click to browse
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {acceptedTypes.map(type => (
              <span
                key={type}
                className="px-2 py-1 bg-secondary/10 rounded text-xs font-medium text-primary/70"
              >
                {type}
              </span>
            ))}
          </div>

          <p className="text-xs text-primary/50">
            Max file size: {maxFileSize}MB
          </p>
        </div>
      </Card>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <Card className="p-4 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-heading text-sm text-primary">Upload Queue</h4>
            {uploadQueue.some(item => item.status === 'success') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCompleted}
                className="text-xs"
              >
                Clear completed
              </Button>
            )}
          </div>

          <div className="space-y-3">
            {uploadQueue.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-background rounded-xl"
              >
                <div className={`
                  w-10 h-10 rounded-lg flex items-center justify-center
                  ${item.status === 'success' ? 'bg-green-100 text-green-600' :
                    item.status === 'error' ? 'bg-red-100 text-red-600' :
                    'bg-primary/10 text-primary'}
                `}>
                  {item.status === 'uploading' ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : item.status === 'success' ? (
                    <Check className="w-5 h-5" />
                  ) : item.status === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-primary truncate">
                    {item.file.name}
                  </p>
                  {item.status === 'error' ? (
                    <p className="text-xs text-red-600">{item.error}</p>
                  ) : item.status === 'uploading' ? (
                    <div className="mt-1">
                      <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-primary/60">
                      {(item.file.size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFromQueue(index)}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default DocumentUpload;
