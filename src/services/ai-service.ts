/**
 * AI Service - OpenAI Integration for RAG
 * Handles embeddings, completions, and document retrieval
 */

// Types
export interface AIQueryResponse {
  answer: string;
  sources: DocumentSource[];
  confidence: number;
  processingTime: number;
}

export interface DocumentSource {
  id: string;
  title: string;
  content: string;
  relevanceScore: number;
  lastUpdated: Date;
}

export interface EmbeddingResult {
  embedding: number[];
  tokenCount: number;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata: {
    title: string;
    fileType: string;
    chunkIndex: number;
    totalChunks: number;
  };
}

// Configuration
const AI_CONFIG = {
  openaiApiKey: import.meta.env.PUBLIC_OPENAI_API_KEY || '',
  embeddingModel: 'text-embedding-3-small',
  completionModel: 'gpt-4o-mini',
  maxTokens: 2000,
  temperature: 0.7,
  topK: 5, // Number of relevant documents to retrieve
};

/**
 * Get API key from environment or localStorage
 */
function getApiKey(): string {
  // First try environment variable
  if (AI_CONFIG.openaiApiKey) {
    return AI_CONFIG.openaiApiKey;
  }
  // Then try localStorage
  if (typeof window !== 'undefined') {
    return localStorage.getItem('docu-query-openai-key') || '';
  }
  return '';
}

/**
 * AI Service Class
 */
export class AIService {
  private apiKey: string;
  private vectorStore: Map<string, DocumentChunk> = new Map();

  constructor(apiKey?: string) {
    this.apiKey = apiKey || getApiKey();
    this.loadVectorStore();
  }

  /**
   * Update API key dynamically
   */
  setApiKey(key: string): void {
    this.apiKey = key;
  }

  /**
   * Load vector store from localStorage
   */
  private loadVectorStore(): void {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('docu-query-vectors');
        if (stored) {
          const data = JSON.parse(stored);
          this.vectorStore = new Map(Object.entries(data));
        }
      } catch (error) {
        console.error('Error loading vector store:', error);
      }
    }
  }

  /**
   * Save vector store to localStorage
   */
  private saveVectorStore(): void {
    if (typeof window !== 'undefined') {
      try {
        const data = Object.fromEntries(this.vectorStore);
        localStorage.setItem('docu-query-vectors', JSON.stringify(data));
      } catch (error) {
        console.error('Error saving vector store:', error);
      }
    }
  }

  /**
   * Generate embeddings for text using OpenAI
   */
  async generateEmbedding(text: string): Promise<EmbeddingResult> {
    if (!this.apiKey) {
      // Return mock embedding if no API key
      return {
        embedding: this.generateMockEmbedding(text),
        tokenCount: Math.ceil(text.length / 4),
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.embeddingModel,
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        embedding: data.data[0].embedding,
        tokenCount: data.usage.total_tokens,
      };
    } catch (error) {
      console.error('Error generating embedding:', error);
      return {
        embedding: this.generateMockEmbedding(text),
        tokenCount: Math.ceil(text.length / 4),
      };
    }
  }

  /**
   * Generate mock embedding for demo purposes
   */
  private generateMockEmbedding(text: string): number[] {
    const seed = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const embedding: number[] = [];
    for (let i = 0; i < 1536; i++) {
      embedding.push(Math.sin(seed * (i + 1)) * 0.5 + 0.5);
    }
    return embedding;
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Index a document by splitting into chunks and generating embeddings
   */
  async indexDocument(document: {
    id: string;
    title: string;
    content: string;
    fileType: string;
  }): Promise<void> {
    const chunks = this.splitIntoChunks(document.content, 500);
    
    for (let i = 0; i < chunks.length; i++) {
      const { embedding } = await this.generateEmbedding(chunks[i]);
      const chunkId = `${document.id}-chunk-${i}`;
      
      this.vectorStore.set(chunkId, {
        id: chunkId,
        documentId: document.id,
        content: chunks[i],
        embedding,
        metadata: {
          title: document.title,
          fileType: document.fileType,
          chunkIndex: i,
          totalChunks: chunks.length,
        },
      });
    }
    
    this.saveVectorStore();
  }

  /**
   * Split text into overlapping chunks
   */
  private splitIntoChunks(text: string, chunkSize: number, overlap: number = 50): string[] {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    let currentChunk = '';
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length > chunkSize && currentChunk) {
        chunks.push(currentChunk.trim());
        // Keep overlap
        const words = currentChunk.split(' ');
        currentChunk = words.slice(-overlap / 10).join(' ') + ' ';
      }
      currentChunk += sentence + '. ';
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks.length > 0 ? chunks : [text];
  }

  /**
   * Search for relevant documents based on query
   */
  async searchDocuments(query: string, topK: number = AI_CONFIG.topK): Promise<DocumentSource[]> {
    const { embedding: queryEmbedding } = await this.generateEmbedding(query);
    
    const results: { chunk: DocumentChunk; score: number }[] = [];
    
    this.vectorStore.forEach((chunk) => {
      const score = this.cosineSimilarity(queryEmbedding, chunk.embedding);
      results.push({ chunk, score });
    });
    
    // Sort by similarity and get top K
    results.sort((a, b) => b.score - a.score);
    const topResults = results.slice(0, topK);
    
    // Group by document and return
    const documentMap = new Map<string, DocumentSource>();
    
    for (const { chunk, score } of topResults) {
      if (!documentMap.has(chunk.documentId)) {
        documentMap.set(chunk.documentId, {
          id: chunk.documentId,
          title: chunk.metadata.title,
          content: chunk.content,
          relevanceScore: score,
          lastUpdated: new Date(),
        });
      } else {
        const existing = documentMap.get(chunk.documentId)!;
        existing.content += '\n\n' + chunk.content;
        existing.relevanceScore = Math.max(existing.relevanceScore, score);
      }
    }
    
    return Array.from(documentMap.values());
  }

  /**
   * Query the AI with RAG context
   */
  async query(userQuery: string): Promise<AIQueryResponse> {
    const startTime = Date.now();
    
    // Retrieve relevant documents
    const sources = await this.searchDocuments(userQuery);
    
    // Build context from sources
    const context = sources
      .map((s) => `[${s.title}]:\n${s.content}`)
      .join('\n\n---\n\n');

    // Generate response
    const answer = await this.generateCompletion(userQuery, context, sources);
    
    return {
      answer,
      sources,
      confidence: sources.length > 0 ? sources[0].relevanceScore : 0,
      processingTime: Date.now() - startTime,
    };
  }

  /**
   * Generate completion using OpenAI
   */
  private async generateCompletion(
    query: string,
    context: string,
    sources: DocumentSource[]
  ): Promise<string> {
    const systemPrompt = `You are Dynamic Documentation Helper, a real-time AI documentation assistant.

RULES:
- Answer ONLY based on the provided documentation context
- If information is not in the context, say "This information is not available in the current documentation."
- Be precise, clear, and developer-friendly
- Use structured formatting with headings when helpful
- Never hallucinate or make assumptions
- Always cite which document the information comes from

CONTEXT FROM DOCUMENTATION:
${context || 'No relevant documentation found.'}`;

    if (!this.apiKey) {
      // Return mock response if no API key
      return this.generateMockResponse(query, sources);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: AI_CONFIG.completionModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
          ],
          max_tokens: AI_CONFIG.maxTokens,
          temperature: AI_CONFIG.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error generating completion:', error);
      return this.generateMockResponse(query, sources);
    }
  }

  /**
   * Generate mock response for demo
   */
  private generateMockResponse(query: string, sources: DocumentSource[]): string {
    if (sources.length === 0) {
      return `Based on my analysis of the current documentation, I could not find specific information about "${query}". 

This could mean:
1. The relevant documentation hasn't been uploaded yet
2. The topic might be covered under different terminology
3. This information is not available in the current documentation

**Suggestion:** Try uploading relevant documents or rephrase your question.`;
    }

    const sourceNames = sources.map(s => s.title).join(', ');
    return `Based on the latest documentation analysis from **${sourceNames}**:

${sources[0].content.substring(0, 500)}...

**Key Points:**
- The system utilizes real-time document processing
- Updates are reflected immediately upon document changes
- Your query "${query}" has been matched against ${sources.length} relevant document(s)

**Sources Referenced:**
${sources.map((s, i) => `${i + 1}. ${s.title} (Relevance: ${(s.relevanceScore * 100).toFixed(1)}%)`).join('\n')}

*This response is grounded in your live documentation.*`;
  }

  /**
   * Remove a document from the index
   */
  removeDocument(documentId: string): void {
    const keysToDelete: string[] = [];
    
    this.vectorStore.forEach((chunk, key) => {
      if (chunk.documentId === documentId) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.vectorStore.delete(key));
    this.saveVectorStore();
  }

  /**
   * Clear all indexed documents
   */
  clearIndex(): void {
    this.vectorStore.clear();
    this.saveVectorStore();
  }

  /**
   * Get indexed document count
   */
  getIndexedCount(): number {
    const documentIds = new Set<string>();
    this.vectorStore.forEach(chunk => documentIds.add(chunk.documentId));
    return documentIds.size;
  }
}

// Export singleton instance
export const aiService = new AIService();
