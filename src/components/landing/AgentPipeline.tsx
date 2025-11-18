'use client';

import { useState, useEffect } from 'react';

const agents = [
  {
    id: 1,
    emoji: '🔍',
    name: 'RETRIEVER',
    title: 'Knowledge Search',
    description: 'Searches through millions of documents using vector similarity to find the most relevant information',
    color: '#1AA6A1',
    duration: '~300ms'
  },
  {
    id: 2,
    emoji: '✓',
    name: 'GATEKEEPER',
    title: 'Safety & Validation',
    description: 'Validates question safety, clarity, and appropriateness before processing',
    color: '#1AA6A1',
    duration: '~60ms'
  },
  {
    id: 3,
    emoji: '📋',
    name: 'PLANNER',
    title: 'Strategic Analysis',
    description: 'Analyzes question type and creates an optimal search and response strategy',
    color: '#1AA6A1',
    duration: '~40ms'
  },
  {
    id: 4,
    emoji: '🔬',
    name: 'ANALYST',
    title: 'Evidence Synthesis',
    description: 'Synthesizes insights from multiple sources, extracting key information and connecting ideas',
    color: '#1AA6A1',
    duration: '~3.5s'
  },
  {
    id: 5,
    emoji: '🔍',
    name: 'AUDITOR',
    title: 'Quality Assurance',
    description: 'Verifies correctness, checks evidence grounding, and scores quality (0-1 scale)',
    color: '#1AA6A1',
    duration: '~70ms'
  },
  {
    id: 6,
    emoji: '✍️',
    name: 'WRITER',
    title: 'Response Crafting',
    description: 'Polishes the final answer with proper formatting, citations, and clarity',
    color: '#1AA6A1',
    duration: '~1s'
  }
];

export default function AgentPipeline() {
  const [activeAgent, setActiveAgent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    if (!isAnimating) return;

    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % agents.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-8 md:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-3 md:mb-4">
          Human-Like Reasoning Process
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-[var(--text-secondary)] max-w-3xl mx-auto px-4">
          Unlike basic AI that gives random answers, KORASENSE uses 6 specialized agents that work together 
          like a team of experts to ensure accuracy, quality, and intelligence in every response
        </p>
      </div>

      {/* Animation Controls */}
      <div className="flex justify-center mb-6 md:mb-8">
        <button
          onClick={() => setIsAnimating(!isAnimating)}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            backgroundColor: isAnimating ? 'var(--accent-10)' : 'var(--bg-tertiary)',
            color: isAnimating ? 'var(--accent)' : 'var(--text-secondary)',
            border: `1px solid ${isAnimating ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          {isAnimating ? '⏸ Pause Animation' : '▶️ Play Animation'}
        </button>
      </div>

      {/* Agent Pipeline Visualization */}
      <div className="relative max-w-5xl mx-auto px-4">
        {/* Connection Lines - Desktop */}
        <div className="hidden lg:block absolute top-[60px] left-0 right-0 h-[2px]" 
             style={{ 
               background: 'linear-gradient(90deg, transparent 0%, var(--accent-20) 10%, var(--accent-20) 90%, transparent 100%)',
             }}>
          <div 
            className="h-full transition-all duration-1000 ease-in-out"
            style={{
              width: `${((activeAgent + 1) / agents.length) * 100}%`,
              background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-bright) 100%)',
              boxShadow: '0 0 20px var(--accent-40)'
            }}
          />
        </div>

        {/* Agents Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-6 relative z-10">
          {agents.map((agent, index) => {
            const isActive = activeAgent === index;
            const isPassed = activeAgent > index;
            
            return (
              <div
                key={agent.id}
                onClick={() => {
                  setActiveAgent(index);
                  setIsAnimating(false);
                }}
                className="cursor-pointer transition-all duration-500"
                style={{
                  transform: isActive ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                {/* Agent Card */}
                <div
                  className="rounded-xl p-4 md:p-5 h-full transition-all duration-500"
                  style={{
                    backgroundColor: isActive ? 'var(--accent-10)' : 'var(--bg-secondary)',
                    border: `2px solid ${isActive ? agent.color : isPassed ? 'var(--accent-20)' : 'var(--border)'}`,
                    boxShadow: isActive ? `0 8px 30px ${agent.color}40` : '0 2px 8px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Step Number & Emoji */}
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-xs md:text-sm font-bold transition-all duration-500"
                      style={{
                        backgroundColor: isActive || isPassed ? agent.color : 'var(--bg-tertiary)',
                        color: isActive || isPassed ? 'white' : 'var(--text-tertiary)',
                        border: `2px solid ${isActive ? agent.color : isPassed ? 'var(--accent-40)' : 'var(--border)'}`,
                      }}
                    >
                      {index + 1}
                    </div>
                    <div className="text-2xl md:text-3xl">{agent.emoji}</div>
                  </div>

                  {/* Agent Name */}
                  <div
                    className="text-xs font-bold mb-1 tracking-wider"
                    style={{
                      color: isActive ? agent.color : isPassed ? 'var(--accent)' : 'var(--text-tertiary)',
                    }}
                  >
                    {agent.name}
                  </div>

                  {/* Agent Title */}
                  <h3 className="text-sm md:text-base font-semibold mb-2 text-[var(--text-primary)] leading-tight">
                    {agent.title}
                  </h3>

                  {/* Description - Show on active or larger screens */}
                  <p 
                    className={`text-xs text-[var(--text-secondary)] leading-relaxed mb-2 transition-all duration-500 ${
                      isActive ? 'opacity-100 max-h-32' : 'opacity-60 max-h-0 lg:max-h-32 lg:opacity-100'
                    }`}
                    style={{
                      display: isActive ? 'block' : 'none',
                    }}
                  >
                    {agent.description}
                  </p>

                  {/* Duration Badge */}
                  <div
                    className="inline-block px-2 py-1 rounded text-xs font-mono"
                    style={{
                      backgroundColor: isActive ? `${agent.color}20` : 'var(--bg-tertiary)',
                      color: isActive ? agent.color : 'var(--text-tertiary)',
                    }}
                  >
                    {agent.duration}
                  </div>

                  {/* Active Indicator */}
                  {isActive && (
                    <div className="mt-3 pt-3 border-t border-[var(--border)]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[var(--text-tertiary)]">Processing...</span>
                        <div className="flex gap-1">
                          <div 
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: agent.color, animationDelay: '0ms' }}
                          />
                          <div 
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: agent.color, animationDelay: '150ms' }}
                          />
                          <div 
                            className="w-1.5 h-1.5 rounded-full animate-pulse"
                            style={{ backgroundColor: agent.color, animationDelay: '300ms' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 md:mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>
              5-10s
            </div>
            <div className="text-xs md:text-sm text-[var(--text-tertiary)] uppercase tracking-wide">
              Total Time
            </div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>
              30K
            </div>
            <div className="text-xs md:text-sm text-[var(--text-tertiary)] uppercase tracking-wide">
              Tokens Used
            </div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>
              85%+
            </div>
            <div className="text-xs md:text-sm text-[var(--text-tertiary)] uppercase tracking-wide">
              Avg Quality
            </div>
          </div>
          <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--bg-secondary)' }}>
            <div className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--accent)' }}>
              100%
            </div>
            <div className="text-xs md:text-sm text-[var(--text-tertiary)] uppercase tracking-wide">
              Traceable
            </div>
          </div>
        </div>

        {/* Bottom Explanation */}
        <div className="mt-8 md:mt-12 p-4 md:p-6 rounded-xl" style={{ backgroundColor: 'var(--accent-5)', border: '1px solid var(--accent-20)' }}>
          <div className="flex items-start gap-3 md:gap-4">
            <div className="text-2xl md:text-3xl flex-shrink-0">💡</div>
            <div>
              <h4 className="text-base md:text-lg font-semibold mb-2 text-[var(--text-primary)]">
                Why This Matters
              </h4>
              <p className="text-sm md:text-base text-[var(--text-secondary)] leading-relaxed">
                Traditional AI gives you <strong>one-shot answers</strong> that may be incomplete or inaccurate. 
                KORASENSE mimics how <strong>human experts think</strong>—gathering information, planning, analyzing, 
                verifying, and refining—resulting in answers that are <strong>60% faster</strong>, <strong>62% more 
                cost-efficient</strong>, and significantly more reliable than standard RAG systems.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
