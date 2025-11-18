'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import AgentTimeline from '../risk/AgentTimeline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  trace?: any;
  qualityScore?: number;
  timestamp: Date;
  files?: Array<{ name: string; type: string; size: number }>;
}

interface DemoConsoleProps {
  tenantSlug: string;
  initialHistory?: Array<{
    question: string;
    answer: string;
    trace: any;
    qualityScore: number;
  }>;
}

export default function DemoConsole({ tenantSlug, initialHistory = [] }: DemoConsoleProps) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentTrace, setCurrentTrace] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    // Convert initial history to messages format
    return initialHistory.flatMap((item, idx) => [
      {
        id: `init-q-${idx}`,
        role: 'user' as const,
        content: item.question,
        timestamp: new Date(Date.now() - (initialHistory.length - idx) * 60000),
      },
      {
        id: `init-a-${idx}`,
        role: 'assistant' as const,
        content: item.answer,
        trace: item.trace,
        qualityScore: item.qualityScore,
        timestamp: new Date(Date.now() - (initialHistory.length - idx) * 60000 + 5000),
      },
    ]);
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Show agent visualization by default with an example trace
  const [selectedMessageTrace, setSelectedMessageTrace] = useState<any>(() => {
    // If there's initial history with trace, use the first one
    if (initialHistory.length > 0 && initialHistory[0].trace) {
      return initialHistory[0].trace;
    }
    // Otherwise show a demo trace
    return [
      {
        step: 'GATEKEEPER',
        summary: 'Safety & clarity check: Ready to process queries',
        durationMs: 0,
        documentsUsed: [],
        status: 'ready',
        details: 'The gatekeeper ensures queries are safe and clear before processing',
      },
      {
        step: 'PLANNER',
        summary: 'Query planning and strategy',
        durationMs: 0,
        documentsUsed: [],
        status: 'ready',
        details: 'Analyzes the question and determines the best search strategy',
      },
      {
        step: 'RETRIEVER',
        summary: 'Document retrieval from knowledge base',
        durationMs: 0,
        documentsUsed: [],
        status: 'ready',
        details: 'Searches and retrieves relevant documents using vector similarity',
      },
      {
        step: 'ANALYST',
        summary: 'Evidence analysis and synthesis',
        durationMs: 0,
        documentsUsed: [],
        status: 'ready',
        details: 'Analyzes retrieved documents and synthesizes insights',
      },
      {
        step: 'AUDITOR',
        summary: 'Quality assessment and validation',
        durationMs: 0,
        documentsUsed: [],
        status: 'ready',
        details: 'Reviews the answer for accuracy, completeness, and quality',
      },
      {
        step: 'WRITER',
        summary: 'Final response generation',
        durationMs: 0,
        documentsUsed: [],
        status: 'ready',
        details: 'Crafts the final response with proper formatting and citations',
      },
    ];
  });

  const presetQuestions = [
    'What are our company policies on remote work?',
    'Summarize the Q3 financial results',
    'What products does our company offer?',
  ];

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) return;

    const userMessageId = `user-${Date.now()}`;
    const assistantMessageId = `assistant-${Date.now()}`;
    
    // Add user message immediately with file info
    const userMessage: Message = {
      id: userMessageId,
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
      files: uploadedFiles.length > 0 ? uploadedFiles.map(f => ({
        name: f.name,
        type: f.type,
        size: f.size,
      })) : undefined,
    };
    
    setMessages(prev => [...prev, userMessage]);
    const currentQuestion = question.trim();
    const currentFiles = [...uploadedFiles];
    setQuestion('');
    setUploadedFiles([]);
    setLoading(true);
    setCurrentTrace(null);
    
    // Show processing trace immediately
    setSelectedMessageTrace([
      {
        step: 'GATEKEEPER',
        summary: 'Checking query safety and clarity...',
        durationMs: 0,
        documentsUsed: [],
        status: 'processing',
        details: 'Analyzing query',
      },
      {
        step: 'PLANNER',
        summary: 'Planning search strategy...',
        durationMs: 0,
        documentsUsed: [],
        status: 'pending',
        details: 'Waiting for gatekeeper',
      },
      {
        step: 'RETRIEVER',
        summary: 'Retrieving documents...',
        durationMs: 0,
        documentsUsed: [],
        status: 'pending',
        details: 'Waiting for planner',
      },
      {
        step: 'ANALYST',
        summary: 'Analyzing evidence...',
        durationMs: 0,
        documentsUsed: [],
        status: 'pending',
        details: 'Waiting for retrieval',
      },
      {
        step: 'AUDITOR',
        summary: 'Assessing quality...',
        durationMs: 0,
        documentsUsed: [],
        status: 'pending',
        details: 'Waiting for analysis',
      },
      {
        step: 'WRITER',
        summary: 'Generating response...',
        durationMs: 0,
        documentsUsed: [],
        status: 'pending',
        details: 'Waiting for auditor',
      },
    ]);

    try {
      let response: Response;

      // Use FormData if files are attached, otherwise JSON
      if (currentFiles.length > 0) {
        const formData = new FormData();
        formData.append('tenant_slug', tenantSlug);
        formData.append('question', currentQuestion);
        currentFiles.forEach((file, index) => {
          formData.append(`file${index}`, file);
        });

        response = await fetch('/api/knowledge/query', {
          method: 'POST',
          body: formData,
        });
      } else {
        response = await fetch('/api/knowledge/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tenant_slug: tenantSlug,
            question: currentQuestion,
          }),
        });
      }

      const data = await response.json();

      if (!response.ok) {
        // Add error message
        const errorMessage: Message = {
          id: assistantMessageId,
          role: 'assistant',
          content: data.error === 'REJECTED' 
            ? `❌ Query Rejected: ${data.message}`
            : data.error === 'CLARIFICATION_NEEDED'
            ? `❓ Clarification Needed: ${data.message}`
            : `⚠️ Error: ${data.error}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        return;
      }

      // Add assistant message with trace
      const assistantMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: data.answer,
        trace: data.trace,
        qualityScore: data.quality_score,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setCurrentTrace(data.trace);
      setSelectedMessageTrace(data.trace);
      
    } catch (err: any) {
      const errorMessage: Message = {
        id: assistantMessageId,
        role: 'assistant',
        content: `⚠️ Error: ${err.message || 'An error occurred'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: selectedMessageTrace ? '1fr 380px' : '1fr',
      gap: '1.5rem',
      height: 'calc(100vh - 250px)',
      maxHeight: '900px',
      transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      {/* Main Chat Area */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        minHeight: 0,
        minWidth: 0
      }}>
        {/* Messages Container */}
        <div 
          className="card"
          style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            marginBottom: 'var(--spacing-md)',
            overflow: 'hidden'
          }}
        >
          <div style={{ 
            flex: 1,
            overflowY: 'auto',
            padding: 'var(--spacing-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--spacing-lg)'
          }}>
            {messages.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: 'var(--spacing-2xl)',
                color: 'var(--text-tertiary)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>💬</div>
                <p style={{ fontSize: '1.125rem', fontWeight: 500, marginBottom: 'var(--spacing-xs)' }}>
                  Start a Conversation
                </p>
                <p style={{ fontSize: '0.875rem' }}>
                  Ask questions about your company knowledge
                </p>
              </div>
            )}
            
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                  gap: 'var(--spacing-xs)',
                  animation: 'fadeIn 0.3s ease'
                }}
              >
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  paddingLeft: message.role === 'user' ? 0 : 'var(--spacing-sm)',
                  paddingRight: message.role === 'user' ? 'var(--spacing-sm)' : 0
                }}>
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                
                <div
                  style={{
                    maxWidth: '85%',
                    padding: 'var(--spacing-md)',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: message.role === 'user' 
                      ? 'var(--accent-10)' 
                      : 'var(--bg-elevated)',
                    border: message.role === 'user'
                      ? '1px solid var(--accent-20)'
                      : '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.9375rem',
                    lineHeight: '1.6',
                    cursor: message.trace ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => message.trace && setSelectedMessageTrace(message.trace)}
                  onMouseEnter={(e) => {
                    if (message.trace) {
                      e.currentTarget.style.backgroundColor = message.role === 'user' 
                        ? 'var(--accent-20)' 
                        : 'var(--bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (message.trace) {
                      e.currentTarget.style.backgroundColor = message.role === 'user' 
                        ? 'var(--accent-10)' 
                        : 'var(--bg-elevated)';
                    }
                  }}
                >
                  <div className="markdown-content">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  
                  {/* Show attached files */}
                  {message.files && message.files.length > 0 && (
                    <div style={{
                      marginTop: 'var(--spacing-sm)',
                      paddingTop: 'var(--spacing-sm)',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 'var(--spacing-xs)',
                    }}>
                      {message.files.map((file, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'var(--spacing-xs)',
                            padding: '0.25rem 0.5rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.75rem',
                            color: 'var(--text-tertiary)',
                          }}
                        >
                          <span>
                            {file.type.startsWith('image/') ? '🖼️' : 
                             file.type.startsWith('video/') ? '🎥' : 
                             file.type.includes('pdf') ? '📄' : '📎'}
                          </span>
                          <span>{file.name}</span>
                          <span style={{ color: 'var(--text-quaternary)' }}>
                            ({(file.size / 1024).toFixed(1)}KB)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {message.trace && (
                    <div style={{
                      marginTop: 'var(--spacing-sm)',
                      paddingTop: 'var(--spacing-sm)',
                      borderTop: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      fontSize: '0.75rem',
                      color: 'var(--accent)'
                    }}>
                      <span>🔬</span>
                      <span>View Agent Pipeline</span>
                    </div>
                  )}
                  
                  {message.qualityScore !== undefined && (
                    <div style={{
                      marginTop: 'var(--spacing-xs)',
                      fontSize: '0.75rem',
                      color: 'var(--text-tertiary)'
                    }}>
                      Quality: {(message.qualityScore * 100).toFixed(0)}%
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'flex-start',
                gap: 'var(--spacing-xs)',
                animation: 'fadeIn 0.3s ease'
              }}>
                <div style={{ 
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 600,
                  paddingLeft: 'var(--spacing-sm)'
                }}>
                  AI Assistant
                </div>
                
                <div style={{
                  padding: 'var(--spacing-md)',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)'
                }}>
                  <div className="spinner" style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid var(--accent-20)',
                    borderTopColor: 'var(--accent)',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite'
                  }} />
                  <span className="text-secondary" style={{ fontSize: '0.875rem' }}>
                    Analyzing your question...
                  </span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="card">
          <form onSubmit={handleSubmit}>
            {/* File upload preview */}
            {uploadedFiles.length > 0 && (
              <div style={{ 
                marginBottom: 'var(--spacing-sm)',
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--spacing-xs)',
                padding: 'var(--spacing-sm)',
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-md)',
              }}>
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-xs)',
                      padding: '0.375rem 0.75rem',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <span>
                      {file.type.startsWith('image/') ? '🖼️' : 
                       file.type.startsWith('video/') ? '🎥' : 
                       file.type.includes('pdf') ? '📄' : '📎'}
                    </span>
                    <span>{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      style={{
                        marginLeft: 'var(--spacing-xs)',
                        padding: '0.125rem 0.375rem',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-tertiary)',
                        fontSize: '0.75rem',
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                multiple
                style={{ display: 'none' }}
                aria-label="Upload files"
              />
              
              {/* File upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
                disabled={loading}
                title="Attach image, video, or document"
              >
                📎
              </button>

              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="input"
                style={{
                  flex: 1,
                  fontSize: '0.9375rem'
                }}
                disabled={loading}
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="btn-primary"
              >
                {loading ? '⏳' : '→'}
              </button>
            </div>
            
            {messages.length === 0 && (
              <div style={{ 
                marginTop: 'var(--spacing-md)', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: 'var(--spacing-xs)' 
              }}>
                {presetQuestions.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setQuestion(preset)}
                    className="btn-secondary"
                    style={{
                      fontSize: '0.8125rem',
                      padding: '0.375rem 0.875rem',
                      borderRadius: '9999px',
                    }}
                    disabled={loading}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Agent Timeline Sidebar */}
      {selectedMessageTrace && (
        <div style={{ 
          height: '100%',
          overflowY: 'auto',
          animation: 'slideInRight 0.3s ease'
        }}>
          <div style={{ 
            position: 'sticky', 
            top: 0, 
            zIndex: 10,
            backgroundColor: 'var(--bg-primary)',
            paddingBottom: 'var(--spacing-sm)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: 'var(--spacing-md)'
            }}>
              <h3 style={{ 
                fontSize: '1rem', 
                fontWeight: 600,
                color: 'var(--text-primary)'
              }}>
                Agent Pipeline
              </h3>
              <button
                onClick={() => setSelectedMessageTrace(null)}
                className="btn-secondary"
                style={{ 
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                ✕
              </button>
            </div>
          </div>
          <AgentTimeline trace={selectedMessageTrace} />
        </div>
      )}
    </div>
  );
}
