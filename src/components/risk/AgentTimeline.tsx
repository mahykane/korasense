'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShield, 
  faListCheck, 
  faMagnifyingGlass, 
  faBrain, 
  faCircleCheck, 
  faPenNib, 
  faArrowsRotate,
  faFlask,
  faFile,
  faChevronRight,
  faChevronDown
} from '@fortawesome/free-solid-svg-icons';

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
    const icons: Record<string, any> = {
      GATEKEEPER: faShield,
      PLANNER: faListCheck,
      RETRIEVER: faMagnifyingGlass,
      ANALYST: faBrain,
      AUDITOR: faCircleCheck,
      WRITER: faPenNib,
      RE_ANALYSIS: faArrowsRotate,
    };
    return icons[step] || faFlask;
  };

  const getStepColor = (step: string) => {
    const colors: Record<string, string> = {
      GATEKEEPER: '#3B82F6',
      PLANNER: '#8B5CF6',
      RETRIEVER: '#EF4444',
      ANALYST: '#10B981',
      AUDITOR: '#F59E0B',
      WRITER: '#EC4899',
      RE_ANALYSIS: '#6366F1',
    };
    return colors[step] || 'var(--accent)';
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
        marginBottom: 'var(--spacing-lg)',
        paddingBottom: 'var(--spacing-md)',
        borderBottom: '1px solid var(--border)'
      }}>
        <h2 style={{ 
          fontSize: '1.125rem', 
          fontWeight: 600,
          color: 'var(--text-primary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-sm)'
        }}>
          <FontAwesomeIcon icon={faFlask} style={{ color: 'var(--accent)', fontSize: '1rem' }} />
          Agent Pipeline
        </h2>
        <div style={{ 
          fontSize: '0.8125rem',
          color: 'var(--text-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-xs)',
          padding: '0.375rem 0.75rem',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-full)'
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)'
          }} />
          {trace.length} steps
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', position: 'relative' }}>
        {trace.map((step, index) => (
          <div 
            key={index} 
            style={{ 
              position: 'relative',
              paddingLeft: '3rem'
            }}
          >
            {/* Timeline connector line */}
            {index < trace.length - 1 && (
              <div style={{
                position: 'absolute',
                left: '1.1875rem',
                top: '3rem',
                bottom: '-0.5rem',
                width: '2px',
                backgroundColor: 'var(--border)',
                opacity: 0.4
              }} />
            )}
            
            {/* Step icon circle */}
            <div style={{
              position: 'absolute',
              left: '0',
              top: '1rem',
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-elevated)',
              border: '2px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
              zIndex: 1
            }}>
              <FontAwesomeIcon 
                icon={getStepIcon(step.step)} 
                style={{ 
                  fontSize: '1rem',
                  color: getStepColor(step.step)
                }} 
              />
            </div>
            <button
              onClick={() => toggleStep(index)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: 'var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.15s ease',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg-elevated)',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                e.currentTarget.style.borderColor = 'var(--accent-20)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)', flex: 1 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                      <div style={{ 
                        fontWeight: 600, 
                        fontSize: '0.9375rem',
                        color: 'var(--text-primary)',
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase'
                      }}>
                        {step.step}
                      </div>
                      {step.status && (
                        <span style={{
                          fontSize: '0.6875rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: 'var(--radius-full)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontWeight: 600,
                          backgroundColor: 
                            step.status === 'success' || step.status === 'approved' 
                              ? 'var(--accent-10)' 
                              : step.status === 'processing'
                              ? 'rgba(255, 193, 7, 0.1)'
                              : 'rgba(107, 114, 128, 0.1)',
                          color: 
                            step.status === 'success' || step.status === 'approved' 
                              ? 'var(--accent)' 
                              : step.status === 'processing'
                              ? '#F59E0B'
                              : 'var(--text-tertiary)'
                        }}>
                          {step.status}
                        </span>
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '0.8125rem', 
                      marginTop: '0.375rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5'
                    }}>
                      {step.summary}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem', 
                      marginTop: '0.25rem',
                      color: 'var(--text-tertiary)',
                      fontStyle: 'italic'
                    }}>
                      {getStepDescription(step.step)}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                  <div style={{ 
                    textAlign: 'right',
                    padding: '0.375rem 0.75rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ 
                      fontSize: '0.6875rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '0.125rem',
                      color: 'var(--text-tertiary)'
                    }}>
                      Duration
                    </div>
                    <div style={{ 
                      fontSize: '0.8125rem', 
                      fontFamily: 'monospace',
                      fontWeight: 600,
                      color: 'var(--text-primary)'
                    }}>
                      {step.durationMs}ms
                    </div>
                  </div>
                  <FontAwesomeIcon 
                    icon={expandedSteps.has(index) ? faChevronDown : faChevronRight}
                    style={{ 
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)',
                      transition: 'transform 0.15s ease'
                    }}
                  />
                </div>
              </div>
            </button>

            {expandedSteps.has(index) && (
              <div style={{ 
                marginTop: 'var(--spacing-md)', 
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-sm)',
                animation: 'fadeIn 0.2s ease'
              }}>
                {step.details && (
                  <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 'var(--spacing-sm)',
                      color: 'var(--accent)'
                    }}>
                      Details
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)'
                    }}>
                      {step.details}
                    </div>
                  </div>
                )}
                
                {step.documentsUsed.length > 0 && (
                  <div style={{
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--bg-elevated)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)'
                  }}>
                    <div style={{
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: 'var(--spacing-sm)',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)'
                    }}>
                      <span>Documents Used</span>
                      <span style={{
                        padding: '0.125rem 0.5rem',
                        backgroundColor: 'var(--accent-10)',
                        color: 'var(--accent)',
                        borderRadius: 'var(--radius-full)',
                        fontWeight: 700
                      }}>
                        {step.documentsUsed.length}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {step.documentsUsed.map((doc) => (
                        <div 
                          key={doc.id}
                          style={{ 
                            fontSize: '0.8125rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-sm)',
                            padding: '0.5rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          <FontAwesomeIcon icon={faFile} style={{ color: 'var(--accent)', fontSize: '0.75rem' }} />
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
