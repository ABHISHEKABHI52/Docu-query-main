/**
 * useAI Hook - React hook for AI queries
 */
import { useState, useCallback } from 'react';
import { aiService, type AIQueryResponse, type DocumentSource } from '@/services/ai-service';

export interface UseAIReturn {
  query: (userQuery: string) => Promise<AIQueryResponse>;
  isLoading: boolean;
  error: string | null;
  lastResponse: AIQueryResponse | null;
  indexDocument: (doc: { id: string; title: string; content: string; fileType: string }) => Promise<void>;
  removeDocument: (documentId: string) => void;
  clearIndex: () => void;
  indexedCount: number;
}

export function useAI(): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<AIQueryResponse | null>(null);
  const [indexedCount, setIndexedCount] = useState(aiService.getIndexedCount());

  const query = useCallback(async (userQuery: string): Promise<AIQueryResponse> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await aiService.query(userQuery);
      setLastResponse(response);
      return response;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Query failed';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const indexDocument = useCallback(async (doc: {
    id: string;
    title: string;
    content: string;
    fileType: string;
  }): Promise<void> => {
    await aiService.indexDocument(doc);
    setIndexedCount(aiService.getIndexedCount());
  }, []);

  const removeDocument = useCallback((documentId: string) => {
    aiService.removeDocument(documentId);
    setIndexedCount(aiService.getIndexedCount());
  }, []);

  const clearIndex = useCallback(() => {
    aiService.clearIndex();
    setIndexedCount(0);
  }, []);

  return {
    query,
    isLoading,
    error,
    lastResponse,
    indexDocument,
    removeDocument,
    clearIndex,
    indexedCount,
  };
}

export default useAI;
