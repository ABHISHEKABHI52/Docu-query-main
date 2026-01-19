/**
 * Settings Page - Configure AI and application settings
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Key,
  Cpu,
  Zap,
  Database,
  Trash2,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  Shield,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { aiService } from '@/services/ai-service';
import { documentService } from '@/services/document-service';

interface SettingsData {
  openaiApiKey: string;
  modelName: string;
  maxTokens: number;
  temperature: number;
  useLocalEmbeddings: boolean;
  autoIndexDocuments: boolean;
  enableCaching: boolean;
  cacheExpiration: number;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>({
    openaiApiKey: '',
    modelName: 'gpt-4o-mini',
    maxTokens: 1000,
    temperature: 0.7,
    useLocalEmbeddings: false,
    autoIndexDocuments: true,
    enableCaching: true,
    cacheExpiration: 60,
  });
  const [isSaved, setIsSaved] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('docuquery_settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('docuquery_settings', JSON.stringify(settings));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const validateApiKey = async () => {
    if (!settings.openaiApiKey) {
      setApiKeyValid(false);
      return;
    }
    
    setIsValidating(true);
    try {
      // Simple validation by attempting a minimal API call
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${settings.openaiApiKey}`,
        },
      });
      setApiKeyValid(response.ok);
    } catch {
      setApiKeyValid(false);
    } finally {
      setIsValidating(false);
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('docuquery_documents');
      localStorage.removeItem('docuquery_vectors');
      localStorage.removeItem('docuquery_query_history');
      localStorage.removeItem('docuquery_settings');
      window.location.reload();
    }
  };

  const docStats = documentService.getStats();

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="w-full py-20">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-12">
            <h1 className="font-heading text-5xl text-primary mb-4">
              Settings
            </h1>
            <p className="text-lg text-primary/70">
              Configure your AI assistant and manage application preferences.
            </p>
          </div>

          {/* API Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 rounded-3xl border border-primary/10 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <Key className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-primary">API Configuration</h2>
                  <p className="text-sm text-primary/60">Connect to OpenAI for intelligent responses</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <Label className="text-sm text-primary/70 mb-2 block">OpenAI API Key</Label>
                  <div className="flex gap-3">
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={settings.openaiApiKey}
                      onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                      className="flex-1 h-12 rounded-xl border-primary/10"
                    />
                    <Button
                      onClick={validateApiKey}
                      disabled={isValidating}
                      variant="outline"
                      className="h-12 rounded-xl"
                    >
                      {isValidating ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        'Validate'
                      )}
                    </Button>
                  </div>
                  {apiKeyValid !== null && (
                    <p className={`text-sm mt-2 flex items-center gap-1 ${apiKeyValid ? 'text-green-600' : 'text-red-600'}`}>
                      {apiKeyValid ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          API key is valid
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Invalid API key
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-primary/70 mb-2 block">Model</Label>
                    <select
                      title="Select AI Model"
                      aria-label="Select AI Model"
                      value={settings.modelName}
                      onChange={(e) => setSettings({ ...settings, modelName: e.target.value })}
                      className="w-full h-12 rounded-xl border border-primary/10 px-4 bg-white"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                      <option value="gpt-4o">GPT-4o (Balanced)</option>
                      <option value="gpt-4-turbo">GPT-4 Turbo (Powerful)</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-sm text-primary/70 mb-2 block">Max Tokens</Label>
                    <Input
                      type="number"
                      value={settings.maxTokens}
                      onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) })}
                      className="h-12 rounded-xl border-primary/10"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-primary/70 mb-2 block">
                    Temperature: {settings.temperature}
                  </Label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    title="Temperature (0 = Precise, 1 = Creative)"
                    aria-label="Temperature setting"
                    value={settings.temperature}
                    onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                    className="w-full accent-primary"
                  />
                  <div className="flex justify-between text-xs text-primary/50 mt-1">
                    <span>Precise</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Processing Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 rounded-3xl border border-primary/10 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-primary">Processing Options</h2>
                  <p className="text-sm text-primary/60">Configure how documents are processed</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-primary">Use Local Embeddings</Label>
                    <p className="text-sm text-primary/60">Generate embeddings without API calls (less accurate)</p>
                  </div>
                  <Switch
                    checked={settings.useLocalEmbeddings}
                    onCheckedChange={(checked) => setSettings({ ...settings, useLocalEmbeddings: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-primary">Auto-Index Documents</Label>
                    <p className="text-sm text-primary/60">Automatically index documents after upload</p>
                  </div>
                  <Switch
                    checked={settings.autoIndexDocuments}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoIndexDocuments: checked })}
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Caching Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 rounded-3xl border border-primary/10 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-primary">Performance</h2>
                  <p className="text-sm text-primary/60">Cache and performance settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-primary">Enable Caching</Label>
                    <p className="text-sm text-primary/60">Cache responses for faster repeated queries</p>
                  </div>
                  <Switch
                    checked={settings.enableCaching}
                    onCheckedChange={(checked) => setSettings({ ...settings, enableCaching: checked })}
                  />
                </div>

                {settings.enableCaching && (
                  <div>
                    <Label className="text-sm text-primary/70 mb-2 block">Cache Expiration (minutes)</Label>
                    <Input
                      type="number"
                      value={settings.cacheExpiration}
                      onChange={(e) => setSettings({ ...settings, cacheExpiration: parseInt(e.target.value) })}
                      className="h-12 rounded-xl border-primary/10 max-w-xs"
                    />
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-8 rounded-3xl border border-red-100 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                  <Database className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="font-heading text-xl text-primary">Data Management</h2>
                  <p className="text-sm text-primary/60">Manage stored data and cache</p>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-heading text-primary">{docStats.totalDocuments}</p>
                    <p className="text-sm text-primary/60">Documents</p>
                  </div>
                  <div>
                    <p className="text-2xl font-heading text-primary">{docStats.indexedDocuments}</p>
                    <p className="text-sm text-primary/60">Indexed</p>
                  </div>
                  <div>
                    <p className="text-2xl font-heading text-primary">
                      {(docStats.totalSize / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <p className="text-sm text-primary/60">Total Size</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">
                    Clearing data will remove all documents, embeddings, and query history. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  onClick={clearAllData}
                  className="rounded-xl"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-end gap-4"
          >
            <Button
              onClick={handleSave}
              disabled={isSaved}
              className="bg-primary text-white hover:bg-primary/90 rounded-full px-8 h-12"
            >
              {isSaved ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Saved!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </motion.div>

          {/* Info Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="p-6 rounded-2xl bg-softyellowaccent/30 border-0">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-primary/70 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-heading text-lg text-primary mb-2">Privacy Notice</h3>
                  <p className="text-sm text-primary/70">
                    All data is stored locally in your browser. Your API key and documents never leave your device 
                    except when making direct API calls to OpenAI. We don't store or have access to any of your data.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
