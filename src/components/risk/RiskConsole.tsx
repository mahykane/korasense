'use client';

import { useState } from 'react';
import AgentTimeline from './AgentTimeline';

interface RiskConsoleProps {
  tenantSlug: string;
}

export default function RiskConsole({ tenantSlug }: RiskConsoleProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const presetQuestions = [
    'What are our main data residency requirements?',
    'Summarize recent security incidents',
    'What compliance risks exist for EU customers?',
    'Assess risks in our cloud infrastructure',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_slug: tenantSlug,
          question: question.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (!result?.session_id) return;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: result.session_id,
          label: helpful ? 'HELPFUL' : 'UNHELPFUL',
        }),
      });
    } catch (err) {
      console.error('Failed to submit feedback:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Query Input */}
      <div className="card">
        <form onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about risks, policies, or compliance..."
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700"
            rows={4}
            disabled={loading}
          />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {presetQuestions.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuestion(preset)}
                  className="text-sm px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full transition-colors"
                  disabled={loading}
                >
                  {preset}
                </button>
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || !question.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Ask Question'}
            </button>
          </div>
        </form>
      </div>

      {/* Error */}
      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <div className="flex gap-3">
            <div className="text-xl">❌</div>
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-300">Error</h3>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <>
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Answer</h2>
              <div className="text-sm text-gray-500">
                Quality: {(result.quality_score * 100).toFixed(0)}% • 
                Time: {(result.totalLatencyMs / 1000).toFixed(1)}s
              </div>
            </div>
            
            <div className="prose dark:prose-invert max-w-none mb-6">
              <div dangerouslySetInnerHTML={{ __html: result.answer.replace(/\n/g, '<br/>') }} />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Was this helpful?</span>
              <button
                onClick={() => handleFeedback(true)}
                className="text-sm px-3 py-1 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-800 dark:text-green-300 rounded transition-colors"
              >
                👍 Helpful
              </button>
              <button
                onClick={() => handleFeedback(false)}
                className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-800 dark:text-red-300 rounded transition-colors"
              >
                👎 Not Helpful
              </button>
            </div>
          </div>

          <AgentTimeline trace={result.trace} />
        </>
      )}
    </div>
  );
}
