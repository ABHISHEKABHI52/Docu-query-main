/**
 * API Route: Document operations
 * POST /api/documents - Upload document
 * GET /api/documents - List documents
 * DELETE /api/documents - Delete document
 */
export const prerender = false;

import type { APIRoute } from 'astro';

// In-memory document store (in production, use a database)
const documents: Map<string, any> = new Map();

export const POST: APIRoute = async ({ request }) => {
  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle file upload
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file provided' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      
      const content = await file.text();
      const id = crypto.randomUUID();
      
      const document = {
        id,
        title: file.name,
        content,
        fileType: file.name.split('.').pop() || 'txt',
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'indexed',
      };
      
      documents.set(id, document);
      
      return new Response(JSON.stringify(document), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      // Handle JSON document
      const body = await request.json();
      const id = body.id || crypto.randomUUID();
      
      const document = {
        id,
        title: body.title,
        content: body.content,
        fileType: body.fileType || 'txt',
        fileSize: body.content?.length || 0,
        uploadedAt: new Date().toISOString(),
        status: 'indexed',
      };
      
      documents.set(id, document);
      
      return new Response(JSON.stringify(document), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Document upload error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to upload document' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

export const GET: APIRoute = async () => {
  const docs = Array.from(documents.values());
  
  return new Response(JSON.stringify({ documents: docs }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return new Response(JSON.stringify({ error: 'Document ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    documents.delete(id);
    
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to delete document' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
