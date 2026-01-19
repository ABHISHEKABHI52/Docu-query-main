/**
 * API Route: Query the RAG system
 * POST /api/query
 */
export const prerender = false;

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { query, apiKey } = body;

    if (!query) {
      return new Response(JSON.stringify({ error: 'Query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate response
    const response = await generateRAGResponse(query, apiKey);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Query error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process query' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

async function generateRAGResponse(query: string, apiKey?: string) {
  const startTime = Date.now();
  
  // Search for relevant documents (mock for demo)
  const sources = searchDocuments(query);
  
  // Build context
  const context = sources.map(s => `[${s.title}]:\n${s.content}`).join('\n\n---\n\n');
  
  // Generate AI response
  let answer: string;
  
  if (apiKey) {
    try {
      answer = await callOpenAI(query, context, apiKey);
    } catch {
      answer = generateMockResponse(query, sources);
    }
  } else {
    answer = generateMockResponse(query, sources);
  }
  
  return {
    answer,
    sources: sources.map(s => ({
      id: s.id,
      title: s.title,
      relevanceScore: s.score,
    })),
    processingTime: Date.now() - startTime,
  };
}

function searchDocuments(query: string) {
  // Mock document search
  const mockDocs = [
    {
      id: '1',
      title: 'System Architecture Guide',
      content: 'The system uses a microservices architecture with real-time data synchronization.',
      score: 0.92,
    },
    {
      id: '2', 
      title: 'API Documentation',
      content: 'REST API endpoints support CRUD operations for documents.',
      score: 0.85,
    },
    {
      id: '3',
      title: 'Deployment Guide',
      content: 'Deploy using Docker containers. Required environment variables: OPENAI_API_KEY.',
      score: 0.78,
    },
  ];
  
  return mockDocs.slice(0, 3);
}

async function callOpenAI(query: string, context: string, apiKey: string) {
  const systemPrompt = `You are a documentation assistant. Answer based on context only.

CONTEXT:
${context || 'No documentation found.'}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function generateMockResponse(query: string, sources: { id: string; title: string; content: string; score: number }[]) {
  if (sources.length === 0) {
    return 'No documentation found for this query.';
  }

  return `Based on ${sources.length} documents:

**${sources[0].title}:** ${sources[0].content}

*Sources: ${sources.map(s => s.title).join(', ')}*`;
}
