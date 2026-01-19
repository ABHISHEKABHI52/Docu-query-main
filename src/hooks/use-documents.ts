/**
 * useDocuments Hook - React hook for document management
 */
import { useState, useEffect, useCallback } from 'react';
import { documentService, type Document } from '@/services/document-service';

export interface UseDocumentsReturn {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  uploadFile: (file: File) => Promise<Document>;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, content: string) => Promise<Document>;
  clearAll: () => void;
  refresh: () => void;
  stats: {
    totalDocuments: number;
    indexedDocuments: number;
    totalSize: number;
    fileTypes: Record<string, number>;
  };
}

export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial documents
  useEffect(() => {
    setDocuments(documentService.getAllDocuments());
  }, []);

  // Subscribe to updates
  useEffect(() => {
    const unsubscribe = documentService.onUpdate((docs) => {
      setDocuments(docs);
    });
    return unsubscribe;
  }, []);

  const uploadFile = useCallback(async (file: File): Promise<Document> => {
    setIsLoading(true);
    setError(null);
    try {
      const doc = await documentService.uploadFile(file);
      return doc;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDocument = useCallback((id: string) => {
    documentService.deleteDocument(id);
  }, []);

  const updateDocument = useCallback(async (id: string, content: string): Promise<Document> => {
    setIsLoading(true);
    setError(null);
    try {
      const doc = await documentService.updateDocument(id, content);
      return doc;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Update failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearAll = useCallback(() => {
    documentService.clearAll();
  }, []);

  const refresh = useCallback(() => {
    setDocuments(documentService.getAllDocuments());
  }, []);

  return {
    documents,
    isLoading,
    error,
    uploadFile,
    deleteDocument,
    updateDocument,
    clearAll,
    refresh,
    stats: documentService.getStats(),
  };
}

export default useDocuments;
