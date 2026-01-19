// HPI 1.6-V
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { 
  Search, 
  FileText, 
  Zap, 
  Database, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  RefreshCw,
  LayoutGrid,
  List,
  ChevronRight,
  Bot,
  Upload,
  Settings,
  Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Image } from '@/components/ui/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { KnowledgeBaseDocuments } from '@/entities';
import { formatDistanceToNow } from 'date-fns';
import { aiService, documentService, type Document } from '@/services';
import { DocumentUpload } from '@/components/ui/document-upload';

// --- Types ---
type AnimatedElementProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
};

// --- Utility Components ---

const AnimatedElement: React.FC<AnimatedElementProps> = ({ children, className, delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // Add a small delay via setTimeout if needed, or just let CSS handle it
        setTimeout(() => {
            element.classList.add('is-visible');
        }, delay);
        observer.unobserve(element);
      }
    }, { threshold: 0.1 });

    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref} className={`opacity-0 translate-y-8 transition-all duration-1000 ease-out ${className || ''}`}>{children}</div>;
};

const SectionDivider = () => (
  <div className="w-full flex justify-center items-center py-12 opacity-20">
    <div className="h-px w-full max-w-[200px] bg-gradient-to-r from-transparent via-primary to-transparent" />
  </div>
);

// --- Main Component ---

export default function HomePage() {
  // --- Canonical Data Sources ---
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<{ title: string; relevanceScore?: number }[]>([]);
  const [documents, setDocuments] = useState<KnowledgeBaseDocuments[]>([]);
  const [localDocs, setLocalDocs] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [processingTime, setProcessingTime] = useState<number>(0);
  const [indexedCount, setIndexedCount] = useState(0);

  // Load OpenAI key from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('docu-query-openai-key');
      if (savedKey) setOpenaiKey(savedKey);
    }
  }, []);

  // Save OpenAI key to localStorage
  const saveApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('docu-query-openai-key', openaiKey);
      setShowSettings(false);
    }
  };

  // --- Logic Preservation ---
  const handleSubmitQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setAnswer(''); // Clear previous answer for animation effect
    setSources([]);
    
    try {
      // Use the AI service for real RAG query
      const response = await aiService.query(query);
      
      setAnswer(response.answer);
      setSources(response.sources.map(s => ({ 
        title: s.title, 
        relevanceScore: s.relevanceScore 
      })));
      setProcessingTime(response.processingTime);
      
      // Save to query history
      await BaseCrudService.create('queryhistory', {
        _id: crypto.randomUUID(),
        userQuery: query,
        aiAnswer: response.answer,
        queryTimestamp: new Date(),
        sourceDocuments: response.sources.map(s => s.title).join(', '),
        feedbackRating: 0
      });
    } catch (error) {
      console.error('Query error:', error);
      setAnswer('An error occurred while processing your query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    setLoadingDocs(true);
    try {
      // Load from CMS
      const { items } = await BaseCrudService.getAll<KnowledgeBaseDocuments>('knowledgebasedocuments');
      setDocuments(items);
      
      // Load local documents
      const docs = documentService.getAllDocuments();
      setLocalDocs(docs);
      
      // Update indexed count
      setIndexedCount(aiService.getIndexedCount());
    } catch (error) {
      console.error("Failed to load documents", error);
    } finally {
      setLoadingDocs(false);
    }
  };

  // Subscribe to document updates
  useEffect(() => {
    const unsubscribe = documentService.onUpdate((docs) => {
      setLocalDocs(docs);
      setIndexedCount(aiService.getIndexedCount());
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    loadDocuments();
  }, []);

  // --- Scroll Effects ---
  const { scrollYProgress } = useScroll();
  const heroParallax = useTransform(scrollYProgress, [0, 0.5], [0, 100]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div className="min-h-screen bg-background font-paragraph text-primary overflow-clip selection:bg-secondary/30">
      <style>{`
        .is-visible {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(30, 37, 78, 0.05);
        }
        .gradient-text {
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
          background-image: linear-gradient(135deg, #1E254E 0%, #A59FE6 100%);
        }
      `}</style>

      <Header />

      {/* --- HERO SECTION --- */}
      <section className="relative w-full min-h-[90vh] flex items-center pt-20 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 z-0">
            <div className="absolute top-0 right-0 w-[60vw] h-[80vh] bg-gradient-to-bl from-secondary/10 via-softyellowaccent/10 to-transparent rounded-bl-[100px] opacity-60" />
            <div className="absolute bottom-0 left-0 w-[40vw] h-[60vh] bg-gradient-to-tr from-secondary/5 to-transparent rounded-tr-[100px]" />
        </div>

        <div className="max-w-[120rem] w-full mx-auto px-6 z-10 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-6 flex flex-col gap-8">
              <AnimatedElement>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-primary/10 shadow-sm w-fit">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-heading tracking-wider uppercase text-primary/70">System Online & Syncing</span>
                </div>
              </AnimatedElement>

              <AnimatedElement delay={100}>
                <h1 className="font-heading text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-primary">
                  Living <br />
                  <span className="text-secondary">Knowledge.</span>
                </h1>
              </AnimatedElement>

              <AnimatedElement delay={200}>
                <p className="text-xl md:text-2xl text-primary/70 max-w-xl leading-relaxed">
                  The documentation assistant that evolves instantly. Connect your Google Drive and get AI-powered answers based on the absolute latest file versions.
                </p>
              </AnimatedElement>

              <AnimatedElement delay={300}>
                <div className="flex flex-wrap gap-4 items-center">
                  <Button 
                    onClick={() => document.getElementById('query-interface')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-14 px-8 rounded-full bg-primary text-white hover:bg-primary/90 text-lg font-heading transition-all hover:scale-105 shadow-lg shadow-primary/20"
                  >
                    Start Querying <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <div className="flex items-center gap-4 px-6">
                    <div className="flex -space-x-3">
                       {[1,2,3].map(i => (
                         <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-secondary/20 flex items-center justify-center text-xs font-bold text-primary">
                           <Bot className="w-5 h-5" />
                         </div>
                       ))}
                    </div>
                    <span className="text-sm font-medium text-primary/60">AI Ready</span>
                  </div>
                </div>
              </AnimatedElement>

              {/* Feature Pills - Inspired by Image */}
              <AnimatedElement delay={400}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    {[
                        { icon: Search, label: "Semantic Search", sub: "Context aware" },
                        { icon: RefreshCw, label: "Real-Time Sync", sub: "Instant updates" },
                        { icon: ShieldCheck, label: "Secure Pipeline", sub: "Enterprise grade" }
                    ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-primary/5 backdrop-blur-sm hover:bg-white transition-colors">
                            <div className="p-2 rounded-lg bg-softyellowaccent/50 text-primary">
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="font-heading text-sm text-primary">{item.label}</div>
                                <div className="text-xs text-primary/60">{item.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>
              </AnimatedElement>
            </div>

            {/* Right Visual - Parallax & Floating */}
            <div className="lg:col-span-6 relative h-[600px] lg:h-[800px] flex items-center justify-center">
                <motion.div style={{ y: heroParallax }} className="relative w-full h-full">
                    {/* Main Image Container */}
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white">
                        <Image 
                            src="https://static.wixstatic.com/media/12d367_71ebdd7141d041e4be3d91d80d4578dd~mv2.png?id=hero-main-visual"
                            alt="AI Dashboard Interface"
                            className="w-full h-full object-cover"
                            width={1200}
                        />
                        {/* Overlay Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent mix-blend-multiply" />
                    </div>

                    {/* Floating Elements */}
                    <motion.div 
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -left-8 top-1/4 p-6 bg-white rounded-2xl shadow-xl border border-primary/5 max-w-xs"
                    >
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-softyellowaccent flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-primary">New Document</div>
                                <div className="text-xs text-primary/60">Just added</div>
                            </div>
                        </div>
                        <div className="h-2 w-full bg-secondary/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                                className="h-full bg-secondary"
                            />
                        </div>
                        <div className="mt-2 text-xs text-right text-primary/50">Indexing...</div>
                    </motion.div>

                    <motion.div 
                        animate={{ y: [0, 20, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute -right-4 bottom-1/3 p-6 bg-primary text-white rounded-2xl shadow-xl max-w-xs"
                    >
                        <div className="flex items-center gap-3">
                            <Zap className="w-6 h-6 text-softyellowaccent" />
                            <div>
                                <div className="text-sm font-bold">Pipeline Active</div>
                                <div className="text-xs text-white/70">Latency: 45ms</div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
          </div>
        </div>
      </section>

      <SectionDivider />

      {/* --- QUERY INTERFACE SECTION --- */}
      <section id="query-interface" className="relative w-full py-24 bg-background">
        <div className="max-w-[100rem] mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                
                {/* Sticky Sidebar / Context */}
                <div className="lg:col-span-4 relative">
                    <div className="sticky top-32">
                        <AnimatedElement>
                            <h2 className="font-heading text-4xl md:text-5xl text-primary mb-6">
                                Ask Your <br/>
                                <span className="text-secondary">Knowledge Base</span>
                            </h2>
                            <p className="text-lg text-primary/70 mb-8">
                                No more searching through folders. Just ask a question and let the AI synthesize an answer from your most recent documents.
                            </p>
                            
                            <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                                    <h3 className="font-heading text-sm text-primary mb-2 flex items-center gap-2">
                                        <Database className="w-4 h-4" /> Connected Source
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-primary/80">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        Google Drive / Engineering Docs
                                    </div>
                                </div>
                                
                                <div className="p-4 rounded-xl bg-softyellowaccent/30 border border-softyellowaccent/50">
                                    <h3 className="font-heading text-sm text-primary mb-2 flex items-center gap-2">
                                        <Cpu className="w-4 h-4" /> Model Status
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-primary/80">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        OpenAI Embeddings Active
                                    </div>
                                </div>
                            </div>
                        </AnimatedElement>
                    </div>
                </div>

                {/* Interactive Query Area */}
                <div className="lg:col-span-8">
                    <AnimatedElement delay={200}>
                        <Card className="overflow-hidden border-0 shadow-2xl bg-white rounded-[2rem]">
                            <div className="p-1 bg-gradient-to-r from-secondary via-primary to-secondary opacity-20" />
                            
                            <div className="p-8 md:p-12">
                                <form onSubmit={handleSubmitQuery} className="relative">
                                    <label htmlFor="query-input" className="sr-only">Your Question</label>
                                    <div className="relative group">
                                        <Textarea
                                            id="query-input"
                                            value={query}
                                            onChange={(e) => setQuery(e.target.value)}
                                            placeholder="e.g., What are the deployment prerequisites for the new API?"
                                            className="min-h-[160px] w-full resize-none bg-background border-2 border-primary/5 rounded-2xl p-6 text-lg md:text-xl focus:border-primary/20 focus:ring-0 transition-all placeholder:text-primary/30"
                                            disabled={isLoading}
                                        />
                                        <div className="absolute bottom-4 right-4">
                                            <Button
                                                type="submit"
                                                disabled={isLoading || !query.trim()}
                                                className={`rounded-full h-12 px-6 transition-all duration-300 ${isLoading ? 'w-40 bg-secondary' : 'w-auto bg-primary hover:bg-primary/90'}`}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center gap-2">
                                                        <RefreshCw className="w-4 h-4 animate-spin" /> Processing
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-2">
                                                        Ask AI <ArrowRight className="w-4 h-4" />
                                                    </span>
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </form>

                                {/* Answer Area - Animate Presence */}
                                <AnimatePresence mode="wait">
                                    {answer && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.5, ease: "circOut" }}
                                            className="mt-8 overflow-hidden"
                                        >
                                            <div className="pt-8 border-t border-primary/5">
                                                <div className="flex items-start gap-4 mb-6">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0 shadow-lg">
                                                        <Bot className="w-6 h-6 text-white" />
                                                    </div>
                                                    <div className="space-y-4">
                                                        <h3 className="font-heading text-lg text-primary">AI Analysis</h3>
                                                        <div className="prose prose-lg text-primary/80 leading-relaxed max-w-none">
                                                            {answer}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sources */}
                                                {sources.length > 0 && (
                                                    <div className="ml-14 bg-secondary/5 rounded-xl p-6 border border-secondary/10">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-xs font-bold uppercase tracking-wider text-primary/50 flex items-center gap-2">
                                                                <FileText className="w-3 h-3" /> Referenced Sources
                                                            </h4>
                                                            {processingTime > 0 && (
                                                                <span className="text-xs text-primary/40">
                                                                    Processed in {processingTime}ms
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-wrap gap-3">
                                                            {sources.map((source, idx) => (
                                                                <motion.div
                                                                    key={idx}
                                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    transition={{ delay: idx * 0.1 }}
                                                                >
                                                                    <Badge variant="outline" className="bg-white hover:bg-white border-primary/10 py-2 px-4 rounded-lg text-primary/70 flex items-center gap-2 cursor-pointer hover:border-primary/30 transition-colors">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                                                                        {source.title}
                                                                        {source.relevanceScore && (
                                                                            <span className="text-xs text-primary/40">
                                                                                {(source.relevanceScore * 100).toFixed(0)}%
                                                                            </span>
                                                                        )}
                                                                    </Badge>
                                                                </motion.div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </Card>
                    </AnimatedElement>
                </div>
            </div>
        </div>
      </section>

      {/* --- TECH STACK / HOW IT WORKS --- */}
      <section className="w-full py-32 bg-primary text-white overflow-hidden">
        <div className="max-w-[120rem] mx-auto px-6">
            <AnimatedElement>
                <div className="text-center mb-20">
                    <h2 className="font-heading text-4xl md:text-6xl mb-6">The Intelligence Pipeline</h2>
                    <p className="text-xl text-white/60 max-w-2xl mx-auto">
                        A sophisticated architecture designed for speed, accuracy, and security.
                    </p>
                </div>
            </AnimatedElement>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent z-0" />

                {[
                    { 
                        icon: Database, 
                        title: "Ingestion", 
                        desc: "Watches Google Drive folders for any changes, additions, or deletions.",
                        color: "bg-blue-500"
                    },
                    { 
                        icon: Zap, 
                        title: "Processing", 
                        desc: "Pathway extracts text, chunks content, and prepares data for embedding.",
                        color: "bg-yellow-500"
                    },
                    { 
                        icon: Cpu, 
                        title: "Embedding", 
                        desc: "OpenAI transforms text chunks into high-dimensional vector representations.",
                        color: "bg-purple-500"
                    },
                    { 
                        icon: LayoutGrid, 
                        title: "Indexing", 
                        desc: "ChromaDB stores vectors for millisecond-latency similarity search.",
                        color: "bg-green-500"
                    }
                ].map((step, idx) => (
                    <AnimatedElement key={idx} delay={idx * 150} className="relative z-10">
                        <div className="group h-full p-8 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500 hover:-translate-y-2">
                            <div className={`w-16 h-16 rounded-2xl ${step.color} bg-opacity-20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                <step.icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-2">Step 0{idx + 1}</div>
                            <h3 className="font-heading text-2xl mb-4">{step.title}</h3>
                            <p className="text-white/60 leading-relaxed">{step.desc}</p>
                        </div>
                    </AnimatedElement>
                ))}
            </div>
        </div>
      </section>

      {/* --- DOCUMENTS SECTION --- */}
      <section id="documents" className="w-full py-32 bg-background relative">
        <div className="max-w-[120rem] mx-auto px-6">
            
            {/* Section Header with Actions */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                <AnimatedElement>
                    <h2 className="font-heading text-4xl md:text-5xl text-primary mb-4">
                        Knowledge Base
                    </h2>
                    <p className="text-lg text-primary/60 max-w-xl">
                        Live view of all indexed documents. Changes here are reflected in query results instantly.
                    </p>
                </AnimatedElement>
                
                <AnimatedElement delay={100}>
                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 text-sm text-primary/50 mr-4">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            {indexedCount} Documents Indexed
                        </div>
                        <Button
                            onClick={() => setShowSettings(!showSettings)}
                            variant="outline"
                            className="rounded-full border-primary/20 hover:bg-primary hover:text-white transition-all"
                        >
                            <Key className="w-4 h-4 mr-2" />
                            API Key
                        </Button>
                        <Button
                            onClick={() => setShowUpload(!showUpload)}
                            variant="outline"
                            className="rounded-full border-primary/20 hover:bg-primary hover:text-white transition-all"
                        >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload
                        </Button>
                        <Button
                            onClick={loadDocuments}
                            disabled={loadingDocs}
                            variant="outline"
                            className="rounded-full border-primary/20 hover:bg-primary hover:text-white transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${loadingDocs ? 'animate-spin' : ''}`} />
                            {loadingDocs ? 'Syncing...' : 'Refresh'}
                        </Button>
                    </div>
                </AnimatedElement>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
                {showSettings && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <Card className="p-6 rounded-2xl bg-white border border-primary/10">
                            <h3 className="font-heading text-lg text-primary mb-4 flex items-center gap-2">
                                <Settings className="w-5 h-5" /> API Configuration
                            </h3>
                            <div className="flex gap-4">
                                <Input
                                    type="password"
                                    placeholder="Enter your OpenAI API Key (sk-...)"
                                    value={openaiKey}
                                    onChange={(e) => setOpenaiKey(e.target.value)}
                                    className="flex-1 rounded-xl"
                                />
                                <Button onClick={saveApiKey} className="rounded-xl">
                                    Save Key
                                </Button>
                            </div>
                            <p className="text-xs text-primary/50 mt-2">
                                Your API key is stored locally in your browser and never sent to our servers.
                            </p>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Panel */}
            <AnimatePresence>
                {showUpload && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-8"
                    >
                        <DocumentUpload
                            onUploadComplete={(doc) => {
                                loadDocuments();
                            }}
                            onError={(error) => {
                                console.error('Upload error:', error);
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Local Documents Grid */}
            {localDocs.length > 0 && (
                <div className="mb-12">
                    <h3 className="font-heading text-xl text-primary mb-6 flex items-center gap-2">
                        <Upload className="w-5 h-5" /> Uploaded Documents
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {localDocs.map((doc, idx) => (
                            <AnimatedElement key={doc.id} delay={idx * 50}>
                                <div className="group relative bg-white rounded-2xl p-6 border border-primary/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-primary group-hover:text-white transition-colors ${
                                            doc.status === 'indexed' ? 'bg-green-100 group-hover:bg-green-500' :
                                            doc.status === 'processing' ? 'bg-yellow-100 group-hover:bg-yellow-500' :
                                            doc.status === 'error' ? 'bg-red-100 group-hover:bg-red-500' :
                                            'bg-primary/10 group-hover:bg-primary'
                                        }`}>
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="secondary" className={`border-0 ${
                                                doc.status === 'indexed' ? 'bg-green-100 text-green-700' :
                                                doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                                                doc.status === 'error' ? 'bg-red-100 text-red-700' :
                                                'bg-primary/10 text-primary'
                                            }`}>
                                                {doc.status}
                                            </Badge>
                                            <Badge variant="secondary" className="bg-secondary/10 text-primary hover:bg-secondary/20 border-0">
                                                {doc.fileType?.toUpperCase() || 'DOC'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <h3 className="font-heading text-lg text-primary mb-3 line-clamp-2 group-hover:text-secondary transition-colors">
                                        {doc.title || 'Untitled Document'}
                                    </h3>

                                    <div className="mt-auto space-y-3 pt-4 border-t border-primary/5">
                                        <div className="flex items-center justify-between text-xs text-primary/50">
                                            <span className="flex items-center gap-1">
                                                <Database className="w-3 h-3" />
                                                {(doc.fileSize / 1024).toFixed(1)} KB
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => documentService.deleteDocument(doc.id)}
                                            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </AnimatedElement>
                        ))}
                    </div>
                </div>
            )}

            {/* CMS Documents Grid */}
            {documents.length === 0 ? (
                <AnimatedElement>
                    <div className="w-full py-24 rounded-[2rem] border-2 border-dashed border-primary/10 flex flex-col items-center justify-center text-center bg-secondary/5">
                        <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                            <FileText className="w-8 h-8 text-primary/30" />
                        </div>
                        <h3 className="font-heading text-xl text-primary mb-2">No Documents Indexed</h3>
                        <p className="text-primary/50 max-w-md">
                            Your knowledge base is empty. Add files to the connected Google Drive folder to start the ingestion pipeline.
                        </p>
                    </div>
                </AnimatedElement>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {documents.map((doc, idx) => (
                        <AnimatedElement key={doc._id} delay={idx * 50}>
                            <div className="group relative bg-white rounded-2xl p-6 border border-primary/5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="w-12 h-12 rounded-xl bg-softyellowaccent/30 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <Badge variant="secondary" className="bg-secondary/10 text-primary hover:bg-secondary/20 border-0">
                                        {doc.fileType?.toUpperCase() || 'DOC'}
                                    </Badge>
                                </div>

                                <h3 className="font-heading text-lg text-primary mb-3 line-clamp-2 group-hover:text-secondary transition-colors">
                                    {doc.documentTitle || 'Untitled Document'}
                                </h3>

                                <div className="mt-auto space-y-3 pt-4 border-t border-primary/5">
                                    <div className="flex items-center justify-between text-xs text-primary/50">
                                        <span className="flex items-center gap-1">
                                            <Database className="w-3 h-3" />
                                            {(doc.fileSize ? (doc.fileSize / 1024).toFixed(1) : '0')} KB
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {doc.lastUpdated ? formatDistanceToNow(new Date(doc.lastUpdated), { addSuffix: true }) : 'Unknown'}
                                        </span>
                                    </div>
                                    
                                    {doc.documentUrl && (
                                        <a 
                                            href={doc.documentUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-between w-full py-2 px-3 rounded-lg bg-primary/5 text-xs font-medium text-primary hover:bg-primary hover:text-white transition-all group/link"
                                        >
                                            View Source
                                            <ChevronRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </AnimatedElement>
                    ))}
                </div>
            )}
        </div>
      </section>

      {/* --- CTA SECTION --- */}
      <section className="w-full py-24 bg-gradient-to-br from-secondary/20 to-softyellowaccent/20">
        <div className="max-w-5xl mx-auto px-6 text-center">
            <AnimatedElement>
                <h2 className="font-heading text-4xl md:text-5xl text-primary mb-8">
                    Ready to empower your team?
                </h2>
                <p className="text-xl text-primary/70 mb-10 max-w-2xl mx-auto">
                    Stop wasting time searching for information. Let the AI handle the retrieval so you can focus on the work that matters.
                </p>
                <Button 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="h-14 px-10 rounded-full bg-primary text-white hover:bg-primary/90 text-lg font-heading shadow-xl"
                >
                    Get Started Now
                </Button>
            </AnimatedElement>
        </div>
      </section>

      <Footer />
    </div>
  );
}