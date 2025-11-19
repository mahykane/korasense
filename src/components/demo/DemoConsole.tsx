'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBolt, 
  faBrain, 
  faGlobe, 
  faTrash, 
  faPaperclip, 
  faPaperPlane,
  faComments,
  faRobot,
  faBook,
  faCertificate,
  faFlask,
  faTimes,
  faBriefcase,
  faChartLine,
  faBullseye,
  faChartSimple,
  faShield,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import AgentTimeline from '../risk/AgentTimeline';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  trace?: any;
  qualityScore?: number;
  timestamp: Date;
  files?: Array<{ name: string; type: string; size: number }>;
  mode?: 'standard' | 'deep' | 'web';
  usedWebSearch?: boolean;
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
  
  // Enhanced reasoning modes
  const [mode, setMode] = useState<'standard' | 'deep' | 'web'>('standard');
  const [useWebSearch, setUseWebSearch] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  
  // Clear conversation handler
  const handleClearConversation = () => {
    if (messages.length > 0 && confirm('Clear all messages? This cannot be undone.')) {
      setMessages([]);
      setSelectedMessageTrace(null);
      setCurrentTrace(null);
    }
  };
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

  const examplePrompts = [
    {
      icon: 'briefcase',
      title: 'Company Policies',
      prompt: 'What are our company policies on remote work and flexible schedules?'
    },
    {
      icon: 'chart-line',
      title: 'Financial Data',
      prompt: 'Summarize our Q3 financial performance and key metrics'
    },
    {
      icon: 'bullseye',
      title: 'Product Info',
      prompt: 'What products and services does our company offer to customers?'
    },
    {
      icon: 'chart-simple',
      title: 'Market Analysis',
      prompt: 'What are the current market trends affecting our industry?'
    },
    {
      icon: 'shield',
      title: 'Security Policies',
      prompt: 'What are our data security and privacy protection policies?'
    },
    {
      icon: 'users',
      title: 'Team Structure',
      prompt: 'Describe our organizational structure and reporting lines'
    },
  ];  useEffect(() => {
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
        formData.append('mode', mode);
        formData.append('useWebSearch', useWebSearch.toString());
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
            mode: mode,
            useWebSearch: useWebSearch,
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
        mode: data.mode || mode,
        usedWebSearch: data.used_web_search || useWebSearch,
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
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
              }}>
                <div style={{ 
                  fontSize: '3.5rem', 
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--accent)'
                }}>
                  <FontAwesomeIcon icon={faComments} />
                </div>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 700, 
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em'
                }}>
                  Ask Anything About Your Knowledge Base
                </h2>
                <p style={{ 
                  fontSize: '0.9375rem',
                  color: 'var(--text-secondary)',
                  maxWidth: '500px',
                  lineHeight: '1.6',
                  marginBottom: 'var(--spacing-lg)'
                }}>
                  Get AI-powered answers with citations from your documents. Upload files, ask complex questions, and explore your company knowledge with our advanced agent pipeline.
                </p>
                <div style={{
                  display: 'flex',
                  gap: 'var(--spacing-md)',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--accent-5)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    color: 'var(--accent)',
                    fontWeight: 500
                  }}>
                    <FontAwesomeIcon icon={faRobot} />
                    <span>Multi-Agent AI</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--accent-5)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    color: 'var(--accent)',
                    fontWeight: 500
                  }}>
                    <FontAwesomeIcon icon={faPaperclip} />
                    <span>Document Upload</span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-xs)',
                    padding: '0.5rem 1rem',
                    backgroundColor: 'var(--accent-5)',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.875rem',
                    color: 'var(--accent)',
                    fontWeight: 500
                  }}>
                    <FontAwesomeIcon icon={faBook} />
                    <span>Smart Citations</span>
                  </div>
                </div>
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
                  
                  {/* Mode and Web Search Indicators */}
                  {(message.mode || message.usedWebSearch) && (
                    <div style={{
                      marginTop: 'var(--spacing-sm)',
                      display: 'flex',
                      gap: 'var(--spacing-xs)',
                      flexWrap: 'wrap'
                    }}>
                      {message.mode === 'deep' && (
                        <div style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'var(--accent-10)',
                          color: 'var(--accent)',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          <FontAwesomeIcon icon={faBrain} style={{ fontSize: '0.75rem' }} />
                          <span>Deep Reasoning</span>
                        </div>
                      )}
                      {message.usedWebSearch && (
                        <div style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3B82F6',
                          fontSize: '0.6875rem',
                          fontWeight: 600,
                          borderRadius: 'var(--radius-md)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          <FontAwesomeIcon icon={faGlobe} style={{ fontSize: '0.75rem' }} />
                          <span>Web Enhanced</span>
                        </div>
                      )}
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
                      <FontAwesomeIcon icon={faFlask} />
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
            {/* Mode Selector & Web Search Toggle */}
            <div style={{ 
              marginBottom: 'var(--spacing-md)',
              display: 'flex',
              gap: 'var(--spacing-sm)',
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <div style={{ 
                display: 'flex',
                gap: 'var(--spacing-xs)',
                flex: 1
              }}>
                <button
                  type="button"
                  onClick={() => setMode('standard')}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 0.875rem',
                    backgroundColor: mode === 'standard' ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: mode === 'standard' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${mode === 'standard' ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem'
                  }}
                  onMouseEnter={(e) => {
                    if (mode !== 'standard') {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (mode !== 'standard') {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faBolt} />
                  <span>Standard</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setMode('deep')}
                  disabled={loading}
                  style={{
                    padding: '0.5rem 0.875rem',
                    backgroundColor: mode === 'deep' ? 'var(--accent)' : 'var(--bg-elevated)',
                    color: mode === 'deep' ? '#FFFFFF' : 'var(--text-secondary)',
                    border: `1px solid ${mode === 'deep' ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.375rem'
                  }}
                  onMouseEnter={(e) => {
                    if (mode !== 'deep') {
                      e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (mode !== 'deep') {
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                    }
                  }}
                >
                  <FontAwesomeIcon icon={faBrain} />
                  <span>Deep Reasoning</span>
                </button>
              </div>
              
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                padding: '0.5rem 0.875rem',
                backgroundColor: useWebSearch ? 'var(--accent-10)' : 'var(--bg-elevated)',
                border: `1px solid ${useWebSearch ? 'var(--accent-20)' : 'var(--border)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setUseWebSearch(!useWebSearch)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = useWebSearch ? 'var(--accent-20)' : 'var(--bg-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = useWebSearch ? 'var(--accent-10)' : 'var(--bg-elevated)';
              }}
              >
                <input
                  type="checkbox"
                  checked={useWebSearch}
                  onChange={(e) => setUseWebSearch(e.target.checked)}
                  disabled={loading}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer',
                    accentColor: 'var(--accent)'
                  }}
                />
                <FontAwesomeIcon 
                  icon={faGlobe} 
                  style={{ fontSize: '0.875rem' }}
                />
                <span style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: useWebSearch ? 'var(--accent)' : 'var(--text-secondary)'
                }}>
                  Web Search
                </span>
              </div>
            </div>
            
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

            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center' }}>
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
              
              {/* Clear conversation button */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearConversation}
                  className="btn-secondary"
                  disabled={loading}
                  title="Clear conversation"
                  style={{ padding: '0.625rem' }}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
              
              {/* File upload button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn-secondary"
                disabled={loading}
                title="Attach image, video, or document"
                style={{ padding: '0.625rem' }}
              >
                <FontAwesomeIcon icon={faPaperclip} />
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
                style={{ padding: '0.625rem 1.25rem' }}
              >
                {loading ? '...' : <FontAwesomeIcon icon={faPaperPlane} />}
              </button>
            </div>
            
            {messages.length === 0 && (
              <div style={{ marginTop: 'var(--spacing-md)' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 'var(--spacing-sm)'
                }}>
                  <div style={{ 
                    fontSize: '0.75rem', 
                    fontWeight: 600, 
                    color: 'var(--text-tertiary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    ✨ Try these examples
                  </div>
                </div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: 'var(--spacing-sm)'
                }}>
                  {examplePrompts.map((example, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setQuestion(example.prompt)}
                      disabled={loading}
                      style={{
                        padding: 'var(--spacing-md)',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'var(--spacing-xs)'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
                        e.currentTarget.style.borderColor = 'var(--accent-20)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-xs)'
                      }}>
                        <FontAwesomeIcon 
                          icon={
                            example.icon === 'briefcase' ? faBriefcase :
                            example.icon === 'chart-line' ? faChartLine :
                            example.icon === 'bullseye' ? faBullseye :
                            example.icon === 'chart-simple' ? faChartSimple :
                            example.icon === 'shield' ? faShield :
                            example.icon === 'users' ? faUsers :
                            faComments
                          }
                          style={{ fontSize: '1.25rem', color: 'var(--accent)' }}
                        />
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: 600,
                          color: 'var(--text-primary)'
                        }}>
                          {example.title}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '0.8125rem',
                        color: 'var(--text-secondary)',
                        lineHeight: '1.4'
                      }}>
                        {example.prompt}
                      </div>
                    </button>
                  ))}
                </div>
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
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
          </div>
          <AgentTimeline trace={selectedMessageTrace} />
        </div>
      )}
    </div>
  );
}
