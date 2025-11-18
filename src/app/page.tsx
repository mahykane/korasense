import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import HeroButtons from '@/components/landing/HeroButtons';

export default async function HomePage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'var(--bg-primary)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Hero Section */}
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Subtle accent glows */}
        <div style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--accent-20) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, var(--accent-10) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none'
        }} />
        
        <div className="max-w-5xl mx-auto px-6 py-12 text-center" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: '2rem' }}>
            <span style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--accent-10)',
              border: '1px solid var(--accent-20)',
              borderRadius: '9999px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--accent)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}>
              🚀 Powered by Gemini 2.0 Flash
            </span>
          </div>

          <h1 style={{ 
            fontSize: '4rem', 
            fontWeight: 800,
            color: 'var(--text-primary)',
            marginBottom: '1.5rem',
            letterSpacing: '-0.03em',
            lineHeight: 1.1
          }}>
            Your Company&apos;s Knowledge,
            <br />
            <span style={{ 
              background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-bright) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Unified & Intelligent
            </span>
          </h1>
          
          <p style={{ 
            fontSize: '1.375rem',
            color: 'var(--text-secondary)',
            marginBottom: '3rem',
            maxWidth: '48rem',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6
          }}>
            Multimodal, agentic knowledge management platform that ingests any data type 
            and delivers AI-powered insights through natural conversation.
          </p>
          
          <HeroButtons />

          {/* Key Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2rem',
            marginTop: '4rem',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                6
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                AI Agents
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                &lt;5s
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Response Time
              </div>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent)', marginBottom: '0.25rem' }}>
                100%
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Multimodal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Everything You Need for Enterprise Knowledge
          </h2>
          <p style={{ 
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            maxWidth: '42rem',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            A complete platform designed for modern organizations that need to make sense of their data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🖼️</div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-primary)'
            }}>
              Multimodal Input
            </h3>
            <p className="text-secondary" style={{ lineHeight: 1.6 }}>
              Upload and analyze images, videos, PDFs, documents, spreadsheets. 
              Extract insights from any media type with vision AI.
            </p>
          </div>
          
          <div className="card accent-border">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🤖</div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-primary)'
            }}>
              Agentic Pipeline
            </h3>
            <p className="text-secondary" style={{ lineHeight: 1.6 }}>
              6-agent system: Gatekeeper, Planner, Retriever, Analyst, Auditor, and Writer 
              work together for accurate answers.
            </p>
          </div>
          
          <div className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-primary)'
            }}>
              Vector Search
            </h3>
            <p className="text-secondary" style={{ lineHeight: 1.6 }}>
              Powered by Qdrant for semantic search. Find relevant information 
              across millions of documents instantly.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💬</div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-primary)'
            }}>
              Natural Conversation
            </h3>
            <p className="text-secondary" style={{ lineHeight: 1.6 }}>
              Chat interface with markdown rendering, syntax highlighting, 
              and real-time agent pipeline visualization.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-primary)'
            }}>
              Quality Metrics
            </h3>
            <p className="text-secondary" style={{ lineHeight: 1.6 }}>
              Confidence scores, evidence citations, quality auditing, 
              and full traceability for every answer.
            </p>
          </div>

          <div className="card">
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔐</div>
            <h3 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 600,
              marginBottom: '0.75rem',
              color: 'var(--text-primary)'
            }}>
              Enterprise Security
            </h3>
            <p className="text-secondary" style={{ lineHeight: 1.6 }}>
              Multi-tenant architecture with Clerk authentication, 
              API key management, and role-based access control.
            </p>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 1.5rem' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '1rem'
            }}>
              How It Works
            </h2>
            <p style={{ 
              fontSize: '1.125rem',
              color: 'var(--text-secondary)',
              maxWidth: '42rem',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}>
              Sophisticated multi-agent pipeline ensures accurate, reliable answers
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Step 1 */}
            <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '3rem',
                height: '3rem',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-10)',
                border: '2px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--accent)'
              }}>
                1
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  📥 Ingestion & Embedding
                </h3>
                <p className="text-secondary" style={{ lineHeight: 1.6 }}>
                  Upload documents through the UI or automated "Sense" apps. Content is intelligently 
                  chunked and embedded using Gemini or local models, then stored in Qdrant vector database.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '3rem',
                height: '3rem',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-10)',
                border: '2px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--accent)'
              }}>
                2
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  🔍 Retrieval & Gatekeeping
                </h3>
                <p className="text-secondary" style={{ lineHeight: 1.6 }}>
                  Your question is embedded and searched against the vector database. The Gatekeeper agent 
                  validates safety and clarity while relevant chunks are retrieved for analysis.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '3rem',
                height: '3rem',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-10)',
                border: '2px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--accent)'
              }}>
                3
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  🧠 Analysis & Synthesis
                </h3>
                <p className="text-secondary" style={{ lineHeight: 1.6 }}>
                  The Planner reviews evidence, the Analyst synthesizes insights, and the Auditor validates 
                  quality. Finally, the Writer crafts a polished, markdown-formatted answer with citations.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="card" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <div style={{
                minWidth: '3rem',
                height: '3rem',
                borderRadius: '50%',
                backgroundColor: 'var(--accent-10)',
                border: '2px solid var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--accent)'
              }}>
                4
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
                  ✨ Multimodal Enhancement
                </h3>
                <p className="text-secondary" style={{ lineHeight: 1.6 }}>
                  When images or videos are attached, Gemini Vision analyzes visual content and 
                  cross-references with your knowledge base for comprehensive, context-aware answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '1rem'
          }}>
            Built With Modern Technologies
          </h2>
          <p style={{ 
            fontSize: '1.125rem',
            color: 'var(--text-secondary)'
          }}>
            Enterprise-grade stack for performance, scalability, and reliability
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>⚛️</div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Next.js 14
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              App Router, Server Components, TypeScript
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🤖</div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Gemini AI
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              2.0 Flash, Vision, Embeddings
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🗄️</div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Qdrant
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Vector Database, Cloud Hosted
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🔐</div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Clerk
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Authentication & User Management
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>💾</div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              PostgreSQL
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Prisma ORM, Relational Data
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🎨</div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Tailwind CSS
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Modern UI, Custom Design System
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🦀</div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Rust
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Edge Sense Apps, File Watching
            </p>
          </div>

          <div className="card text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>☁️</div>
            <h4 style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Vercel
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
              Deployment, Edge Network
            </p>
          </div>
        </div>
      </div>

      {/* Use Cases Section */}
      <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '5rem 1.5rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '1rem'
            }}>
              Real-World Use Cases
            </h2>
            <p style={{ 
              fontSize: '1.125rem',
              color: 'var(--text-secondary)'
            }}>
              Designed for organizations that need intelligent access to their knowledge
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                📋 Compliance & Risk
              </h3>
              <p className="text-secondary" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                "What are our data retention policies for European customers?"
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                Instant answers from policy documents, regulations, and internal guidelines 
                with full citation trails for audit compliance.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🔧 Technical Documentation
              </h3>
              <p className="text-secondary" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                "How do I configure the authentication middleware?"
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                Search across API docs, internal wikis, and code repositories to find 
                implementation examples and best practices.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                🖼️ Visual Analysis
              </h3>
              <p className="text-secondary" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                "What safety violations are visible in this site photo?"
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                Upload images for AI-powered visual inspection cross-referenced 
                with safety protocols and regulations.
              </p>
            </div>

            <div className="card">
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
                📊 Business Intelligence
              </h3>
              <p className="text-secondary" style={{ marginBottom: '1rem', lineHeight: 1.6 }}>
                "Summarize Q3 performance across all departments"
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                Aggregate insights from reports, presentations, and financial documents 
                to generate comprehensive summaries.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 style={{ 
          fontSize: '3rem', 
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '1.5rem',
          lineHeight: 1.2
        }}>
          Ready to Transform Your
          <br />
          Company Knowledge?
        </h2>
        <p style={{ 
          fontSize: '1.25rem',
          color: 'var(--text-secondary)',
          marginBottom: '3rem',
          maxWidth: '36rem',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Get started in minutes. No credit card required.
        </p>
        
        <HeroButtons />
      </div>

      {/* Footer */}
      <div style={{ 
        borderTop: '1px solid var(--border)',
        padding: '2rem 1.5rem',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
          © 2025 Opsense Knowledge App. Built with ❤️ using Next.js, Gemini AI, and Qdrant.
        </p>
      </div>
    </div>
  );
}
