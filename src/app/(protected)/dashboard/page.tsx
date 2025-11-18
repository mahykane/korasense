import { getCurrentUser, getUserTenants } from '@/lib/auth';
import { getAverageQualityScore, getAverageLatency, getFeedbackCounts } from '@/lib/metrics';
import { prisma } from '@/lib/db';
import Link from 'next/link';

export default async function DashboardPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const tenants = await getUserTenants(user.id);
  const currentTenant = tenants[0]; // For MVP, use first tenant

  if (!currentTenant) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <div className="card">
          <p>No tenant found. Please contact support.</p>
        </div>
      </div>
    );
  }

  // Get metrics
  const [avgQuality, avgLatency, feedback, todayQueries, totalDocs] = await Promise.all([
    getAverageQualityScore(currentTenant.id),
    getAverageLatency(currentTenant.id),
    getFeedbackCounts(currentTenant.id),
    prisma.qaSession.count({
      where: {
        tenantId: currentTenant.id,
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.document.count({
      where: { tenantId: currentTenant.id },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto" style={{ padding: 'var(--spacing-xl)' }}>
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          marginBottom: 'var(--spacing-sm)',
          color: 'var(--text-primary)'
        }}>
          Dashboard
        </h1>
        <p className="text-secondary">
          Welcome back, {user.name || user.email}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-6" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <div className="card">
          <div className="text-tertiary" style={{ fontSize: '0.8125rem', marginBottom: 'var(--spacing-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            Today&apos;s Queries
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {todayQueries}
          </div>
        </div>
        
        <div className="card accent-border">
          <div className="text-tertiary" style={{ fontSize: '0.8125rem', marginBottom: 'var(--spacing-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            Avg Quality Score
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.02em' }}>
            {avgQuality ? (avgQuality * 100).toFixed(0) : '—'}%
          </div>
        </div>
        
        <div className="card">
          <div className="text-tertiary" style={{ fontSize: '0.8125rem', marginBottom: 'var(--spacing-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            Avg Latency
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {avgLatency ? (avgLatency / 1000).toFixed(1) : '—'}s
          </div>
        </div>
        
        <div className="card">
          <div className="text-tertiary" style={{ fontSize: '0.8125rem', marginBottom: 'var(--spacing-xs)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
            Feedback
          </div>
          <div style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {feedback.helpful} 👍 / {feedback.unhelpful} 👎
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6" style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <Link href="/chat" className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>💬</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
            Ask Questions
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            Get AI-powered answers from your company knowledge
          </p>
        </Link>
        
        <Link href="/knowledge" className="card accent-border" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>📚</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
            Documents
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            Upload and manage your knowledge base ({totalDocs} documents)
          </p>
        </Link>
        
        <div className="card" style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--spacing-sm)' }}>📦</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
            Desktop App
          </h3>
          <p className="text-secondary" style={{ fontSize: '0.875rem' }}>
            Download the desktop app for automated folder watching
          </p>
        </div>
      </div>

      {/* Recent Questions */}
      {todayQueries > 0 && (
        <div className="card">
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 'var(--spacing-md)', color: 'var(--text-primary)' }}>
            Getting Started
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <p className="text-secondary">
              Your knowledge base is ready! Here&apos;s what you can do:
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)', fontSize: '0.875rem' }}>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-xs)' }}>
                <span className="accent-text" style={{ fontWeight: 600 }}>✓</span>
                <span>Upload documents from the Documents page</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-xs)' }}>
                <span className="accent-text" style={{ fontWeight: 600 }}>✓</span>
                <span>Ask questions in natural language to get instant answers</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-xs)' }}>
                <span className="accent-text" style={{ fontWeight: 600 }}>✓</span>
                <span>Use the desktop app for automatic folder synchronization</span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
