'use client';

import { useState } from 'react';

interface AgentTraceStep {
  step: string;
  summary: string;
  durationMs: number;
  documentsUsed: Array<{
    id: string;
    title: string;
  }>;
}

interface AgentTimelineProps {
  trace: AgentTraceStep[];
}

export default function AgentTimeline({ trace }: AgentTimelineProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const getStepIcon = (step: string) => {
    const icons: Record<string, string> = {
      GATEKEEPER: '🛡️',
      PLANNER: '📋',
      RETRIEVER: '🔍',
      ANALYST: '🤖',
      AUDITOR: '✅',
      WRITER: '✍️',
      RE_ANALYSIS: '🔄',
    };
    return icons[step] || '📌';
  };

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Agent Trace</h2>
      
      <div className="space-y-3">
        {trace.map((step, index) => (
          <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
            <button
              onClick={() => toggleStep(index)}
              className="w-full text-left hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{getStepIcon(step.step)}</span>
                  <div>
                    <div className="font-semibold">{step.step}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {step.summary}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">{step.durationMs}ms</span>
                  <span className="text-gray-400">
                    {expandedSteps.has(index) ? '▼' : '▶'}
                  </span>
                </div>
              </div>
            </button>

            {expandedSteps.has(index) && step.documentsUsed.length > 0 && (
              <div className="mt-3 ml-12 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="text-sm font-medium mb-2">Documents Used:</div>
                <div className="space-y-1">
                  {step.documentsUsed.map((doc) => (
                    <div key={doc.id} className="text-sm text-gray-600 dark:text-gray-400">
                      📄 {doc.title}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
