'use client';

import { useState, useCallback } from 'react';
import { WorkflowType, OpusWorkflowConfig, OpusDocument } from '@/lib/types/opus';

interface WorkflowBuilderProps {
  onWorkflowStart?: (workflowId: string) => void;
}

export default function WorkflowBuilder({ onWorkflowStart }: WorkflowBuilderProps) {
  const [workflowType, setWorkflowType] = useState<WorkflowType>('RISK_ANALYSIS');
  const [documents, setDocuments] = useState<OpusDocument[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [config, setConfig] = useState({
    newsCategories: [] as string[],
    riskThreshold: 0.7,
    timeRange: '30d',
    regions: [] as string[],
  });

  // File handling
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      processFiles(files);
    }
  }, []);

  const processFiles = async (files: File[]) => {
    setIsUploading(true);
    
    try {
      const newDocuments: OpusDocument[] = [];
      
      for (const file of files) {
        try {
          // Read file content immediately to avoid permission issues
          const content = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
            reader.readAsText(file);
          });
          
          newDocuments.push({
            id: crypto.randomUUID(),
            fileName: file.name,
            fileType: file.type || 'text/plain',
            size: file.size,
            uploadedAt: new Date(),
            content,
          });
        } catch (error) {
          console.error(`Error reading file ${file.name}:`, error);
          alert(`Failed to read file: ${file.name}`);
        }
      }
      
      if (newDocuments.length > 0) {
        setDocuments(prev => [...prev, ...newDocuments]);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // Configuration handlers
  const toggleCategory = (category: string) => {
    setConfig(prev => ({
      ...prev,
      newsCategories: prev.newsCategories.includes(category)
        ? prev.newsCategories.filter(c => c !== category)
        : [...prev.newsCategories, category],
    }));
  };

  const toggleRegion = (region: string) => {
    setConfig(prev => ({
      ...prev,
      regions: prev.regions.includes(region)
        ? prev.regions.filter(r => r !== region)
        : [...prev.regions, region],
    }));
  };

  // Submit workflow
  const handleStartWorkflow = async () => {
    if (documents.length === 0) {
      alert('Please upload at least one document');
      return;
    }

    setIsUploading(true);

    try {
      const workflowConfig: OpusWorkflowConfig = {
        id: crypto.randomUUID(),
        name: `${workflowType} - ${new Date().toLocaleDateString()}`,
        type: workflowType,
        description: `Analyzing ${documents.length} document(s)`,
        parameters: config,
      };

      const response = await fetch('/api/opus/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowType,
          documents,
          config: workflowConfig,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start workflow');
      }

      const result = await response.json();
      onWorkflowStart?.(result.workflowId);

      // Reset form
      setDocuments([]);
      alert(`Workflow started successfully! ID: ${result.workflowId}`);
    } catch (error) {
      console.error('Workflow error:', error);
      alert('Failed to start workflow. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const categoryOptions = [
    'Cybersecurity',
    'Regulatory',
    'Financial',
    'Operational',
    'Legal',
    'Market',
  ];

  const regionOptions = ['US', 'EU', 'APAC', 'LATAM', 'MEA'];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>OPUS Workflow Builder</h2>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>
          Upload documents and configure analysis parameters for advanced AI workflows
        </p>
      </div>

      {/* Workflow Type Selection */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>1. Select Workflow Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setWorkflowType('RISK_ANALYSIS')}
            className={`p-4 rounded-lg border-2 transition-all ${
              workflowType === 'RISK_ANALYSIS'
                ? 'bg-white shadow-md'
                : 'bg-white hover:shadow-sm'
            }`}
            style={{
              borderColor: workflowType === 'RISK_ANALYSIS' ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <div className="text-left">
              <div className="text-2xl mb-2">⚠️</div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Risk Analysis</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Analyze documents with news correlation to identify risks
              </div>
            </div>
          </button>

          <button
            onClick={() => setWorkflowType('ANOMALY_DETECTION')}
            className={`p-4 rounded-lg border-2 transition-all ${
              workflowType === 'ANOMALY_DETECTION'
                ? 'bg-white shadow-md'
                : 'bg-white hover:shadow-sm'
            }`}
            style={{
              borderColor: workflowType === 'ANOMALY_DETECTION' ? 'var(--accent)' : 'var(--border)',
            }}
          >
            <div className="text-left">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>Anomaly Detection</div>
              <div className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Detect unusual patterns in financial data
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Document Upload */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>2. Upload Documents</h3>
        
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          className="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
          style={{
            borderColor: isDragging ? 'var(--accent)' : 'var(--border)',
            backgroundColor: isDragging ? 'var(--accent-5)' : 'transparent',
          }}
        >
          <div className="text-4xl mb-4">📄</div>
          <div className="font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
            Drop files here or click to browse
          </div>
          <div className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Supports PDF, DOCX, TXT, CSV, and more
          </div>
          <input
            type="file"
            multiple
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          <label
            htmlFor="file-input"
            className="btn-primary cursor-pointer inline-block"
          >
            Choose Files
          </label>
        </div>

        {documents.length > 0 && (
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {documents.length} document(s) selected
            </div>
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{ backgroundColor: 'var(--bg-tertiary)' }}
              >
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">📄</div>
                  <div>
                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{doc.fileName}</div>
                    <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                      {(doc.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => removeDocument(index)}
                  className="px-3 py-1 text-sm hover:opacity-80"
                  style={{ color: 'var(--error)' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Configuration */}
      {workflowType === 'RISK_ANALYSIS' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>3. Configure Analysis</h3>
          
          {/* News Categories */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              News Categories
            </label>
            <div className="flex flex-wrap gap-2">
              {categoryOptions.map(category => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className="px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: config.newsCategories.includes(category) ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: config.newsCategories.includes(category) ? '#FFFFFF' : 'var(--text-primary)',
                    borderColor: config.newsCategories.includes(category) ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              News Time Range
            </label>
            <select
              value={config.timeRange}
              onChange={(e) => setConfig({ ...config, timeRange: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
              title="Select time range"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>

          {/* Regions */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Geographic Regions
            </label>
            <div className="flex flex-wrap gap-2">
              {regionOptions.map(region => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className="px-4 py-2 rounded-lg border transition-colors"
                  style={{
                    backgroundColor: config.regions.includes(region) ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: config.regions.includes(region) ? '#FFFFFF' : 'var(--text-primary)',
                    borderColor: config.regions.includes(region) ? 'var(--accent)' : 'var(--border)',
                  }}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Threshold */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
              Risk Threshold: {(config.riskThreshold * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config.riskThreshold}
              onChange={(e) => setConfig({ ...config, riskThreshold: parseFloat(e.target.value) })}
              className="w-full"
              title="Risk threshold slider"
            />
            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              <span>Low (0%)</span>
              <span>High (100%)</span>
            </div>
          </div>
        </div>
      )}

      {/* Start Button */}
      <div className="flex justify-end">
        <button
          onClick={handleStartWorkflow}
          disabled={documents.length === 0 || isUploading}
          className="px-8 py-3 rounded-lg font-semibold transition-colors"
          style={{
            backgroundColor: documents.length === 0 || isUploading ? 'var(--border)' : 'var(--accent)',
            color: documents.length === 0 || isUploading ? 'var(--text-tertiary)' : '#FFFFFF',
            cursor: documents.length === 0 || isUploading ? 'not-allowed' : 'pointer',
          }}
        >
          {isUploading ? '⏳ Starting Workflow...' : '🚀 Start Workflow'}
        </button>
      </div>
    </div>
  );
}
