import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import HeroButtons from '@/components/landing/HeroButtons';
import AgentPipeline from '@/components/landing/AgentPipeline';

export default async function HomePage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center">
        {/* Subtle accent glows - Desktop only */}
        <div className="hidden lg:block absolute -top-1/4 -right-1/10 w-[600px] h-[600px] pointer-events-none opacity-60" 
             style={{
               background: 'radial-gradient(circle, var(--accent-20) 0%, transparent 70%)',
               filter: 'blur(80px)'
             }} 
        />
        <div className="hidden lg:block absolute -bottom-1/10 -left-1/10 w-[500px] h-[500px] pointer-events-none opacity-40" 
             style={{
               background: 'radial-gradient(circle, var(--accent-10) 0%, transparent 70%)',
               filter: 'blur(80px)'
             }} 
        />
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          {/* Badge */}
          <div className="mb-6 sm:mb-8">
            <span className="inline-block px-4 py-2 text-xs sm:text-sm font-semibold uppercase tracking-wide rounded-full" 
                  style={{
                    backgroundColor: 'var(--accent-10)',
                    border: '1px solid var(--accent-20)',
                    color: 'var(--accent)',
                  }}>
              🚀 Powered by Gemini 2.0 Flash
            </span>
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold mb-6 sm:mb-8 leading-tight tracking-tight" 
              style={{ color: 'var(--text-primary)' }}>
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
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl mb-10 sm:mb-12 max-w-3xl mx-auto leading-relaxed" 
             style={{ color: 'var(--text-secondary)' }}>
            Multimodal, agentic knowledge management platform that ingests any data type 
            and delivers AI-powered insights through natural conversation.
          </p>
          
          <HeroButtons />

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mt-12 sm:mt-16 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
                6
              </div>
              <div className="text-xs sm:text-sm uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                AI Agents
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
                5-10s
              </div>
              <div className="text-xs sm:text-sm uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Response Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
                100%
              </div>
              <div className="text-xs sm:text-sm uppercase tracking-wider" style={{ color: 'var(--text-tertiary)' }}>
                Multimodal
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Agent Pipeline Section */}
      <div className="py-12 sm:py-16 md:py-20 lg:py-24" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <AgentPipeline />
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ 
            color: 'var(--text-primary)',
          }}>
            Everything You Need for Enterprise Knowledge
          </h2>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto" style={{ 
            color: 'var(--text-secondary)',
          }}>
            A complete platform designed for modern organizations that need to make sense of their data
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="card">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🖼️</div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3" style={{ color: 'var(--text-primary)' }}>
              Multimodal Input
            </h3>
            <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
      <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
              How It Works
            </h2>
            <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Sophisticated multi-agent pipeline ensures accurate, reliable answers
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Step 1 */}
            <div className="card flex gap-3 sm:gap-4 md:gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold" style={{
                backgroundColor: 'var(--accent-10)',
                border: '2px solid var(--accent)',
                color: 'var(--accent)'
              }}>
                1
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  📥 Ingestion & Embedding
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Upload documents through the UI or automated "Sense" apps. Content is intelligently 
                  chunked and embedded using Gemini or local models, then stored in Qdrant vector database.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="card flex gap-3 sm:gap-4 md:gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold" style={{
                backgroundColor: 'var(--accent-10)',
                border: '2px solid var(--accent)',
                color: 'var(--accent)'
              }}>
                2
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  🔍 Retrieval & Gatekeeping
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Your question is embedded and searched against the vector database. The Gatekeeper agent 
                  validates safety and clarity while relevant chunks are retrieved for analysis.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="card flex gap-3 sm:gap-4 md:gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold" style={{
                backgroundColor: 'var(--accent-10)',
                border: '2px solid var(--accent)',
                color: 'var(--accent)'
              }}>
                3
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  🧠 Analysis & Synthesis
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  The Planner reviews evidence, the Analyst synthesizes insights, and the Auditor validates 
                  quality. Finally, the Writer crafts a polished, markdown-formatted answer with citations.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="card flex gap-3 sm:gap-4 md:gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-base sm:text-lg font-bold" style={{
                backgroundColor: 'var(--accent-10)',
                border: '2px solid var(--accent)',
                color: 'var(--accent)'
              }}>
                4
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                  ✨ Multimodal Enhancement
                </h3>
                <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  When images or videos are attached, Gemini Vision analyzes visual content and 
                  cross-references with your knowledge base for comprehensive, context-aware answers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
            Built With Modern Technologies
          </h2>
          <p className="text-base sm:text-lg md:text-xl" style={{ color: 'var(--text-secondary)' }}>
            Enterprise-grade stack for performance, scalability, and reliability
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
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
      <div className="py-12 sm:py-16 md:py-20 px-4 sm:px-6" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4" style={{ color: 'var(--text-primary)' }}>
              Real-World Use Cases
            </h2>
            <p className="text-base sm:text-lg md:text-xl" style={{ color: 'var(--text-secondary)' }}>
              Designed for organizations that need intelligent access to their knowledge
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
          Ready to Transform Your
          <br className="hidden sm:block" />
          <span className="sm:hidden"> </span>
          Company Knowledge?
        </h2>
        <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
          Get started in minutes. No credit card required.
        </p>
        
        <HeroButtons />
      </div>

      {/* Footer */}
      <div className="border-t px-4 sm:px-6 py-6 sm:py-8 text-center" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
          © 2025 KORASENSE Knowledge App. Built with ❤️ using Next.js, Gemini AI, and Qdrant.
        </p>
      </div>
    </div>
  );
}
