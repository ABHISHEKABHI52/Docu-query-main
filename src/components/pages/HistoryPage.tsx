import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, FileText, Star, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { BaseCrudService } from '@/integrations';
import { QueryHistory } from '@/entities';
import { formatDistanceToNow } from 'date-fns';

export default function HistoryPage() {
  const [queries, setQueries] = useState<QueryHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    const { items } = await BaseCrudService.getAll<QueryHistory>('queryhistory');
    // Sort by most recent first
    const sorted = items.sort((a, b) => {
      const dateA = a.queryTimestamp ? new Date(a.queryTimestamp).getTime() : 0;
      const dateB = b.queryTimestamp ? new Date(b.queryTimestamp).getTime() : 0;
      return dateB - dateA;
    });
    setQueries(sorted);
    setIsLoading(false);
  };

  const handleDelete = async (id: string) => {
    await BaseCrudService.delete('queryhistory', id);
    setQueries(queries.filter(q => q._id !== id));
  };

  const handleRating = async (id: string, rating: number) => {
    await BaseCrudService.update('queryhistory', { _id: id, feedbackRating: rating });
    setQueries(queries.map(q => q._id === id ? { ...q, feedbackRating: rating } : q));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="w-full py-20">
        <div className="max-w-[100rem] mx-auto px-6">
          <div className="mb-12">
            <h1 className="font-heading text-5xl text-primary mb-4">
              Query History
            </h1>
            <p className="font-paragraph text-lg text-primary/70 max-w-3xl">
              Review your past questions and AI-generated answers. Track which documents were used as sources.
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
          ) : queries.length === 0 ? (
            <Card className="p-12 text-center bg-secondary/5 border-2 border-dashed border-primary/20 rounded-3xl">
              <Clock className="w-16 h-16 text-primary/30 mx-auto mb-4" />
              <h3 className="font-heading text-xl text-primary mb-2">No Query History</h3>
              <p className="font-paragraph text-base text-primary/60 mb-6">
                Start asking questions to build your query history
              </p>
              <Button
                asChild
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8"
              >
                <a href="/#query">Ask a Question</a>
              </Button>
            </Card>
          ) : (
            <div className="space-y-6">
              {queries.map((query, index) => (
                <motion.div
                  key={query._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="p-6 bg-background border border-primary/10 rounded-2xl hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-softyellowaccent/30 rounded-lg p-2">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-paragraph text-sm text-primary/60">
                            {query.queryTimestamp
                              ? formatDistanceToNow(new Date(query.queryTimestamp), { addSuffix: true })
                              : 'Unknown time'}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(query._id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-heading text-base text-primary mb-2">Question</h3>
                      <p className="font-paragraph text-base text-primary/90 bg-secondary/5 rounded-xl p-4">
                        {query.userQuery}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-heading text-base text-primary mb-2">Answer</h3>
                      <p className="font-paragraph text-base text-primary/80 leading-relaxed">
                        {query.aiAnswer}
                      </p>
                    </div>

                    {query.sourceDocuments && (
                      <div className="mb-4">
                        <h4 className="font-heading text-sm text-primary mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Sources
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {query.sourceDocuments.split(', ').map((source, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="bg-softyellowaccent/40 text-primary border-0 font-paragraph text-xs px-3 py-1 rounded-full"
                            >
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-primary/10">
                      <div className="flex items-center justify-between">
                        <p className="font-paragraph text-sm text-primary/60">Rate this answer:</p>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => handleRating(query._id, rating)}
                              className="transition-colors"
                              title={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                              aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
                            >
                              <Star
                                className={`w-5 h-5 ${
                                  query.feedbackRating && query.feedbackRating >= rating
                                    ? 'fill-softyellowaccent text-softyellowaccent'
                                    : 'text-primary/30'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
