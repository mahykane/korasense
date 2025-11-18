import { getCurrentUser, getUserTenants } from '@/lib/auth';
import { getRecentSessions } from '@/lib/metrics';
import DemoConsole from '@/components/demo/DemoConsole';

export default async function ChatPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const tenants = await getUserTenants(user.id);
  const currentTenant = tenants[0];

  if (!currentTenant) {
    return <div>No tenant found</div>;
  }

  const recentSessions = await getRecentSessions(currentTenant.id, 10);

  return (
    <div style={{ maxWidth: '100%', width: '100%' }}>
      <div style={{ 
        marginBottom: '2rem',
        paddingBottom: '1.5rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <h1 style={{ 
          fontSize: '1.875rem', 
          fontWeight: 700, 
          marginBottom: '0.5rem',
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em'
        }}>
          💬 Ask Questions
        </h1>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9375rem',
          lineHeight: '1.6'
        }}>
          Ask questions about your company knowledge and get AI-powered answers with citations
        </p>
      </div>

      <DemoConsole 
        tenantSlug={currentTenant.slug}
        initialHistory={recentSessions.map(s => ({
          question: s.question,
          answer: s.finalAnswer,
          trace: s.agentTrace as any,
          qualityScore: s.qualityScore || 0,
        }))}
      />
    </div>
  );
}
