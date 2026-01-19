export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-primary/10 mt-24">
      <div className="max-w-[120rem] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-heading text-lg text-primary mb-4">DocuHelper</h3>
            <p className="font-paragraph text-sm text-primary/70">
              Real-time AI documentation assistant powered by advanced RAG technology.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading text-base text-primary mb-4">Technology</h4>
            <ul className="space-y-2 font-paragraph text-sm text-primary/70">
              <li>Google Drive Integration</li>
              <li>OpenAI Embeddings</li>
              <li>ChromaDB Vector Store</li>
              <li>Real-time Updates</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading text-base text-primary mb-4">Supported Formats</h4>
            <ul className="space-y-2 font-paragraph text-sm text-primary/70">
              <li>PDF Documents</li>
              <li>Text Files (.txt)</li>
              <li>Google Docs</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-primary/10 text-center">
          <p className="font-paragraph text-sm text-primary/60">
            © {new Date().getFullYear()} DocuHelper. Real-time documentation intelligence.
          </p>
        </div>
      </div>
    </footer>
  );
}
