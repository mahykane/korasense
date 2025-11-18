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
  status?: string;
  details?: string;
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

  const getStepDescription = (step: string) => {
    const descriptions: Record<string, string> = {
      GATEKEEPER: 'Validates query safety and relevance',
      PLANNER: 'Determines search strategy and document types',
      RETRIEVER: 'Searches knowledge base for relevant information',
      ANALYST: 'Synthesizes evidence into structured insights',
      AUDITOR: 'Verifies answer quality and completeness',
      WRITER: 'Crafts final polished response',
      RE_ANALYSIS: 'Re-analyzes with additional context',
    };
    return descriptions[step] || 'Processing step';
  };

  return (
    <div className="card">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: 'var(--spacing-xl)' 
      }}>
        <h2 style={{ 
          fontSize: '1.25rem', 
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)'
        }}>
          🔬 Agent Pipeline Trace
        </h2>
        <div className="text-tertiary" style={{ fontSize: '0.875rem' }}>
          {trace.length} steps completed
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {trace.map((step, index) => (
          <div 
            key={index} 
            style={{ 
              borderLeft: '3px solid var(--accent)',
              paddingLeft: 'var(--spacing-md)',
              paddingTop: 'var(--spacing-xs)',
              paddingBottom: 'var(--spacing-xs)'
            }}
          >
            <button
              onClick={() => toggleStep(index)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 'var(--spacing-sm)',
                borderRadius: 'var(--radius-md)',
                transition: 'background-color 0.2s ease',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-secondary)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: 1 }}>
                  <span style={{ fontSize: '2rem' }}>{getStepIcon(step.step)}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: '1.125rem',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.01em'
                      }}>
                        {step.step}
                      </div>
                      {step.status && (
                        <span style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em',
                          fontWeight: 600,
                          backgroundColor: 
                            step.status === 'success' || step.status === 'approved' 
                              ? 'var(--accent-10)' 
                              : step.status === 'processing'
                              ? 'rgba(255, 193, 7, 0.1)'
                              : step.status === 'pending' || step.status === 'ready'
                              ? 'var(--secondary-10)'
                              : 'var(--secondary-10)',
                          color: 
                            step.status === 'success' || step.status === 'approved' 
                              ? 'var(--accent)' 
                              : step.status === 'processing'
                              ? '#FFC107'
                              : step.status === 'pending' || step.status === 'ready'
                              ? 'var(--text-tertiary)'
                              : 'var(--secondary)'
                        }}>
                          {step.status === 'processing' ? '⏳ ' : ''}{step.status}
                        </span>
                      )}
                    </div>
                    <div className="text-tertiary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {getStepDescription(step.step)}
                    </div>
                    <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      {step.summary}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div className="text-tertiary" style={{ 
                      fontSize: '0.75rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.125rem'
                    }}>
                      Duration
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {step.durationMs}ms
                    </div>
                  </div>
                  <span className="text-tertiary" style={{ fontSize: '1.25rem' }}>
                    {expandedSteps.has(index) ? '▼' : '▶'}
                  </span>
                </div>
              </div>
            </button>

            {expandedSteps.has(index) && (
              <div style={{ 
                marginTop: 'var(--spacing-sm)', 
                marginLeft: '3.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)'
              }}>
                {step.details && (
                  <div style={{
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'var(--accent-5)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--accent-20)'
                  }}>
                    <div className="accent-text" style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 'var(--spacing-xs)'
                    }}>
                      DETAILS
                    </div>
                    <div className="text-secondary" style={{
                      fontSize: '0.875rem',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.6'
                    }}>
                      {step.details}
                    </div>
                  </div>
                )}
                
                {step.documentsUsed.length > 0 && (
                  <div style={{
                    padding: 'var(--spacing-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div className="text-tertiary" style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 'var(--spacing-xs)'
                    }}>
                      DOCUMENTS USED ({step.documentsUsed.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      {step.documentsUsed.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="text-secondary"
                          style={{ 
                            fontSize: '0.875rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)'
                          }}
                        >
                          <span>📄</span>
                          <span>{doc.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
