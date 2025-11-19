'use client';

import { useState } from 'react';

export default function TestOpusPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testWorkflow = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const testConfig = {
        id: crypto.randomUUID(),
        name: 'Test Risk Analysis',
        type: 'RISK_ANALYSIS',
        description: 'Testing OPUS API integration',
        parameters: {
          newsCategories: ['Financial', 'Cybersecurity'],
          riskThreshold: 0.7,
          timeRange: '30d',
          regions: ['US', 'EU'],
        },
      };

      const testDocuments = [
        {
          id: 'test-doc-1',
          fileName: 'test-document.txt',
          fileType: 'text/plain',
          size: 1024,
          uploadedAt: new Date(),
          content: 'This is a test document for OPUS workflow integration. It contains sample financial data and security protocols.',
        },
      ];

      const response = await fetch('/api/opus/workflow/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowType: 'RISK_ANALYSIS',
          documents: testDocuments,
          config: testConfig,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to start workflow');
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--text-primary)' }}>
          🧪 OPUS Workflow Test
        </h1>

              {/* Configuration Info */}
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.3)',
        borderLeft: '4px solid #3b82f6',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.25rem' }}>ℹ️</span>
          <h3 style={{ margin: 0, color: '#3b82f6', fontSize: '1rem', fontWeight: 600 }}>
            OPUS API Configuration
          </h3>
        </div>
        
        {process.env.NEXT_PUBLIC_OPUS_MOCK_MODE !== 'false' ? (
          <div>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              <strong>Mock Mode Active</strong> - Testing with simulated responses.
            </p>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              To use real OPUS API, configure in <code>.env.local</code>:
            </p>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li><code>OPUS_API_KEY</code> - Get from Opus Organization → API Keys</li>
              <li><code>OPUS_WORKFLOW_ID</code> - Get from workflow URL in Opus platform</li>
              <li><code>OPUS_MOCK_MODE=false</code> - Disable mock mode</li>
            </ul>
            <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.875rem' }}>
              <a href="https://developer.opus.com/docs" target="_blank" rel="noopener noreferrer" style={{ color: '#3b82f6' }}>
                📚 View OPUS API Documentation
              </a>
            </p>
          </div>
        ) : (
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Using <strong>Real OPUS API</strong> at operator.opus.com
          </p>
        )}
      </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            Test Configuration
          </h2>
          <div className="space-y-2 text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            <p><strong>Workflow Type:</strong> Risk Analysis</p>
            <p><strong>Categories:</strong> Financial, Cybersecurity</p>
            <p><strong>Time Range:</strong> 30 days</p>
            <p><strong>Regions:</strong> US, EU</p>
            <p><strong>Risk Threshold:</strong> 70%</p>
          </div>

          <button
            onClick={testWorkflow}
            disabled={loading}
            className="px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{
              backgroundColor: loading ? 'var(--bg-tertiary)' : 'var(--accent)',
              color: loading ? 'var(--text-tertiary)' : 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Testing...' : '🚀 Test OPUS Workflow'}
          </button>
        </div>

        {error && (
          <div className="card mb-6" style={{ 
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#ef4444' }}>
              ❌ Error
            </h3>
            <p style={{ color: '#ef4444' }}>{error}</p>
          </div>
        )}

        {result && (
          <div className="card">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              ✅ Workflow Started Successfully
            </h3>
            <div className="space-y-3" style={{ color: 'var(--text-secondary)' }}>
              <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                  Workflow ID
                </p>
                <p className="font-mono text-sm">{result.workflowId}</p>
              </div>
              
              <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                  OPUS Workflow ID
                </p>
                <p className="font-mono text-sm">{result.opusWorkflowId}</p>
              </div>
              
              <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                  Status
                </p>
                <p className="font-semibold">{result.status}</p>
              </div>
              
              {result.message && (
                <div className="p-4 rounded" style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--accent)' }}>
                    Message
                  </p>
                  <p>{result.message}</p>
                </div>
              )}
            </div>

            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
                Raw Response:
              </p>
              <pre className="p-4 rounded text-xs overflow-auto" style={{ 
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}>
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-8 p-6 rounded-lg" style={{ 
          backgroundColor: 'var(--bg-secondary)',
          borderLeft: '4px solid var(--accent)'
        }}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>
            📋 Test Instructions
          </h3>
          <ul className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <li>1. Click the "Test OPUS Workflow" button above</li>
            <li>2. The system will send a test document to the OPUS API</li>
            <li>3. If successful, you'll see the workflow ID and status</li>
            <li>4. Check the console for detailed API responses</li>
            <li>5. Navigate to <a href="/workflows/monitor" className="underline" style={{ color: 'var(--accent)' }}>/workflows/monitor</a> to see the workflow</li>
          </ul>
        </div>

        <div className="mt-6 flex gap-4">
          <a 
            href="/workflows" 
            className="px-4 py-2 rounded font-medium"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            ← Back to Workflow Builder
          </a>
          <a 
            href="/workflows/monitor" 
            className="px-4 py-2 rounded font-medium"
            style={{ 
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)'
            }}
          >
            View Monitor →
          </a>
        </div>
      </div>
    </div>
  );
}
