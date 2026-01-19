/**
 * Document Service - Handle document upload, processing, and management
 */

import { aiService } from './ai-service';

// Types
export interface Document {
  id: string;
  title: string;
  content: string;
  fileType: string;
  fileSize: number;
  uploadedAt: Date;
  lastUpdated: Date;
  status: 'pending' | 'processing' | 'indexed' | 'error';
  chunkCount?: number;
  error?: string;
}

export interface UploadProgress {
  documentId: string;
  progress: number;
  status: string;
}

// Storage key
const DOCUMENTS_STORAGE_KEY = 'docu-query-documents';

/**
 * Document Service Class
 */
export class DocumentService {
  private documents: Map<string, Document> = new Map();
  private onUpdateCallbacks: Set<(docs: Document[]) => void> = new Set();

  constructor() {
    this.loadDocuments();
  }

  /**
   * Load documents from localStorage
   */
  private loadDocuments(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(DOCUMENTS_STORAGE_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          this.documents = new Map(
            data.map((doc: Document) => [doc.id, {
              ...doc,
              uploadedAt: new Date(doc.uploadedAt),
              lastUpdated: new Date(doc.lastUpdated),
            }])
          );
        }
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
  }

  /**
   * Save documents to localStorage
   */
  private saveDocuments(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = Array.from(this.documents.values());
        localStorage.setItem(DOCUMENTS_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error('Error saving documents:', error);
      }
    }
  }

  /**
   * Notify subscribers of document updates
   */
  private notifyUpdate(): void {
    const docs = this.getAllDocuments();
    this.onUpdateCallbacks.forEach(callback => callback(docs));
  }

  /**
   * Subscribe to document updates
   */
  onUpdate(callback: (docs: Document[]) => void): () => void {
    this.onUpdateCallbacks.add(callback);
    return () => this.onUpdateCallbacks.delete(callback);
  }

  /**
   * Upload and process a file
   */
  async uploadFile(file: File): Promise<Document> {
    const id = crypto.randomUUID();
    
    // Create initial document record
    const document: Document = {
      id,
      title: file.name,
      content: '',
      fileType: this.getFileType(file),
      fileSize: file.size,
      uploadedAt: new Date(),
      lastUpdated: new Date(),
      status: 'pending',
    };

    this.documents.set(id, document);
    this.saveDocuments();
    this.notifyUpdate();

    try {
      // Update status to processing
      document.status = 'processing';
      this.saveDocuments();
      this.notifyUpdate();

      // Extract text content from file
      const content = await this.extractContent(file);
      document.content = content;

      // Index the document
      await aiService.indexDocument({
        id: document.id,
        title: document.title,
        content: document.content,
        fileType: document.fileType,
      });

      // Update status to indexed
      document.status = 'indexed';
      document.lastUpdated = new Date();
      this.saveDocuments();
      this.notifyUpdate();

      return document;
    } catch (error) {
      document.status = 'error';
      document.error = error instanceof Error ? error.message : 'Unknown error';
      this.saveDocuments();
      this.notifyUpdate();
      throw error;
    }
  }

  /**
   * Extract text content from file
   */
  private async extractContent(file: File): Promise<string> {
    const fileType = this.getFileType(file);

    switch (fileType) {
      case 'txt':
      case 'md':
      case 'json':
      case 'csv':
        return await file.text();

      case 'pdf':
        return await this.extractPdfContent(file);

      case 'docx':
        return await this.extractDocxContent(file);

      default:
        // Try to read as text
        try {
          return await file.text();
        } catch {
          throw new Error(`Unsupported file type: ${fileType}`);
        }
    }
  }

  /**
   * Extract content from PDF (simplified - would need pdf.js for real implementation)
   */
  private async extractPdfContent(file: File): Promise<string> {
    // For demo purposes, return a placeholder
    // In production, use pdf.js or similar library
    return `[PDF Content from ${file.name}]

This is a placeholder for PDF content extraction.
To enable full PDF support, integrate pdf.js library.

File size: ${(file.size / 1024).toFixed(2)} KB
Uploaded: ${new Date().toISOString()}

For now, please upload .txt or .md files for best results.`;
  }

  /**
   * Extract content from DOCX (simplified)
   */
  private async extractDocxContent(file: File): Promise<string> {
    // For demo purposes, return a placeholder
    // In production, use mammoth.js or similar library
    return `[DOCX Content from ${file.name}]

This is a placeholder for DOCX content extraction.
To enable full DOCX support, integrate mammoth.js library.

File size: ${(file.size / 1024).toFixed(2)} KB
Uploaded: ${new Date().toISOString()}

For now, please upload .txt or .md files for best results.`;
  }

  /**
   * Get file type from file
   */
  private getFileType(file: File): string {
    const extension = file.name.split('.').pop()?.toLowerCase();
    return extension || 'unknown';
  }

  /**
   * Get all documents
   */
  getAllDocuments(): Document[] {
    return Array.from(this.documents.values()).sort(
      (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
    );
  }

  /**
   * Get document by ID
   */
  getDocument(id: string): Document | undefined {
    return this.documents.get(id);
  }

  /**
   * Update document content
   */
  async updateDocument(id: string, content: string): Promise<Document> {
    const document = this.documents.get(id);
    if (!document) {
      throw new Error('Document not found');
    }

    document.content = content;
    document.lastUpdated = new Date();
    document.status = 'processing';
    this.saveDocuments();
    this.notifyUpdate();

    try {
      // Re-index the document
      aiService.removeDocument(id);
      await aiService.indexDocument({
        id: document.id,
        title: document.title,
        content: document.content,
        fileType: document.fileType,
      });

      document.status = 'indexed';
      this.saveDocuments();
      this.notifyUpdate();

      return document;
    } catch (error) {
      document.status = 'error';
      document.error = error instanceof Error ? error.message : 'Unknown error';
      this.saveDocuments();
      this.notifyUpdate();
      throw error;
    }
  }

  /**
   * Delete document
   */
  deleteDocument(id: string): void {
    aiService.removeDocument(id);
    this.documents.delete(id);
    this.saveDocuments();
    this.notifyUpdate();
  }

  /**
   * Clear all documents
   */
  clearAll(): void {
    aiService.clearIndex();
    this.documents.clear();
    this.saveDocuments();
    this.notifyUpdate();
  }

  /**
   * Get document statistics
   */
  getStats(): {
    totalDocuments: number;
    indexedDocuments: number;
    totalSize: number;
    fileTypes: Record<string, number>;
  } {
    const docs = this.getAllDocuments();
    const fileTypes: Record<string, number> = {};

    docs.forEach(doc => {
      fileTypes[doc.fileType] = (fileTypes[doc.fileType] || 0) + 1;
    });

    return {
      totalDocuments: docs.length,
      indexedDocuments: docs.filter(d => d.status === 'indexed').length,
      totalSize: docs.reduce((sum, doc) => sum + doc.fileSize, 0),
      fileTypes,
    };
  }

  /**
   * Search documents by title
   */
  searchByTitle(query: string): Document[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllDocuments().filter(doc =>
      doc.title.toLowerCase().includes(lowerQuery)
    );
  }
}

// Export singleton instance
export const documentService = new DocumentService();
