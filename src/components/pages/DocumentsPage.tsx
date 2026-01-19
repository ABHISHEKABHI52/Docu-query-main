/**
 * Documents Page - Full document management interface
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Trash2,
  Search,
  Database,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { DocumentUpload } from '@/components/ui/document-upload';
import { documentService, type Document } from '@/services/document-service';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);

  // Load documents
  useEffect(() => {
    setDocuments(documentService.getAllDocuments());
    
    const unsubscribe = documentService.onUpdate((docs) => {
      setDocuments(docs);
    });
    
    return unsubscribe;
  }, []);

  // Filter documents
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = documentService.getStats();

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'indexed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-yellow-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="w-full py-20">
        <div className="max-w-[100rem] mx-auto px-6">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
            <div>
              <h1 className="font-heading text-5xl text-primary mb-4">
                Document Manager
              </h1>
              <p className="text-lg text-primary/70 max-w-2xl">
                Upload, manage, and monitor your knowledge base documents. All changes are reflected in real-time.
              </p>
            </div>
            
            <Button
              onClick={() => setShowUpload(!showUpload)}
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 h-12"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Documents
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Documents', value: stats.totalDocuments, icon: FileText, color: 'bg-blue-100 text-blue-600' },
              { label: 'Indexed', value: stats.indexedDocuments, icon: CheckCircle2, color: 'bg-green-100 text-green-600' },
              { label: 'Total Size', value: `${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`, icon: Database, color: 'bg-purple-100 text-purple-600' },
              { label: 'File Types', value: Object.keys(stats.fileTypes).length, icon: Filter, color: 'bg-orange-100 text-orange-600' },
            ].map((stat, idx) => (
              <Card key={idx} className="p-6 rounded-2xl border border-primary/5">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm text-primary/60">{stat.label}</p>
                    <p className="text-2xl font-heading text-primary">{stat.value}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Upload Area */}
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-12"
              >
                <DocumentUpload
                  onUploadComplete={() => {}}
                  onError={(error) => console.error(error)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary/40" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-xl border-primary/10"
              />
            </div>
            
            <div className="flex gap-2">
              {['all', 'indexed', 'processing', 'pending', 'error'].map(status => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  onClick={() => setFilterStatus(status)}
                  className="rounded-lg capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Documents List */}
          {filteredDocuments.length === 0 ? (
            <Card className="p-12 text-center bg-secondary/5 border-2 border-dashed border-primary/20 rounded-3xl">
              <FileText className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <h3 className="font-heading text-xl text-primary mb-2">
                {searchQuery ? 'No Matching Documents' : 'No Documents Yet'}
              </h3>
              <p className="text-primary/60 mb-6">
                {searchQuery 
                  ? 'Try a different search term'
                  : 'Upload your first document to get started'
                }
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setShowUpload(true)}
                  className="bg-primary text-white hover:bg-primary/90 rounded-full px-8"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredDocuments.map((doc, idx) => (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="p-6 rounded-2xl border border-primary/5 hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-6">
                      {/* Icon */}
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        doc.status === 'indexed' ? 'bg-green-100' :
                        doc.status === 'processing' ? 'bg-yellow-100' :
                        doc.status === 'error' ? 'bg-red-100' :
                        'bg-primary/10'
                      }`}>
                        <FileText className={`w-7 h-7 ${
                          doc.status === 'indexed' ? 'text-green-600' :
                          doc.status === 'processing' ? 'text-yellow-600' :
                          doc.status === 'error' ? 'text-red-600' :
                          'text-primary'
                        }`} />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-heading text-lg text-primary truncate">
                            {doc.title}
                          </h3>
                          <Badge variant="outline" className="uppercase text-xs">
                            {doc.fileType}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-primary/60">
                          <span className="flex items-center gap-1">
                            {getStatusIcon(doc.status)}
                            {doc.status}
                          </span>
                          <span className="flex items-center gap-1">
                            <Database className="w-3 h-3" />
                            {(doc.fileSize / 1024).toFixed(1)} KB
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                          </span>
                        </div>
                        {doc.error && (
                          <p className="text-sm text-red-500 mt-2">{doc.error}</p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDoc(doc)}
                          className="rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => documentService.deleteDocument(doc.id)}
                          className="rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Document Preview Modal */}
          <AnimatePresence>
            {selectedDoc && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6"
                onClick={() => setSelectedDoc(null)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white rounded-3xl max-w-3xl w-full max-h-[80vh] overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6 border-b border-primary/10 flex items-center justify-between">
                    <h3 className="font-heading text-xl text-primary">{selectedDoc.title}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDoc(null)}
                    >
                      ✕
                    </Button>
                  </div>
                  <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <pre className="whitespace-pre-wrap font-mono text-sm text-primary/80 bg-primary/5 p-4 rounded-xl">
                      {selectedDoc.content || 'No content available'}
                    </pre>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Footer />
    </div>
  );
}
