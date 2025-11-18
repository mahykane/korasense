'use client';

import { useState } from 'react';
import AgentTimeline from '../risk/AgentTimeline';

export default function DemoConsole() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const presetQuestions = [
    'What are the data residency requirements?',
    'Summarize security incident response procedures',
    'What are the main compliance risks?',
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
          tenant_slug: process.env.NEXT_PUBLIC_DEMO_TENANT_SLUG || 'demo-tenant',
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

  return (
    <div className="space-y-6">
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

      {error && (
        <div className="card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <>
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Answer</h2>
            <div className="prose dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={{ __html: result.answer.replace(/\n/g, '<br/>') }} />
            </div>
          </div>

          <AgentTimeline trace={result.trace} />
        </>
      )}
    </div>
  );
}
