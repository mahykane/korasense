import { getCurrentUser, getUserTenants } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DocumentList from '@/components/knowledge/DocumentList';
import DocumentUpload from '@/components/knowledge/DocumentUpload';

export default async function KnowledgePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const tenants = await getUserTenants(user.id);
  const currentTenant = tenants[0];

  if (!currentTenant) {
    return <div>No tenant found</div>;
  }

  const documents = await prisma.document.findMany({
    where: { tenantId: currentTenant.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { chunks: true },
      },
    },
  });

  return (
    <div className="max-w-7xl mx-auto" style={{ padding: 'var(--spacing-xl)' }}>
      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: 700, 
          marginBottom: 'var(--spacing-sm)',
          color: 'var(--text-primary)'
        }}>
          Knowledge Base
        </h1>
        <p className="text-secondary">
          Upload documents directly or use the desktop app for automated folder watching
        </p>
      </div>

      <div style={{ marginBottom: 'var(--spacing-2xl)' }}>
        <DocumentUpload tenantId={currentTenant.id} />
      </div>

      <div className="card" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: 'var(--spacing-xs)', color: 'var(--text-primary)' }}>
          Ingestion Status
        </h2>
        <p className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-md)' }}>
          Documents are ingested via Rust Senses or manual upload. 
          Configure your Senses to watch folders and auto-sync documents.
        </p>
        <div style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              {documents.length}
            </div>
            <div className="text-tertiary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 'var(--spacing-xs)' }}>
              Total Docs
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="accent-text" style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {documents.filter((d: any) => d.status === 'EMBEDDED').length}
            </div>
            <div className="text-tertiary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 'var(--spacing-xs)' }}>
              Embedded
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '-0.02em' }}>
              {documents.filter((d: any) => d.status === 'PARSED').length}
            </div>
            <div className="text-tertiary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 'var(--spacing-xs)' }}>
              Parsed
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div className="text-tertiary" style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {documents.filter((d: any) => d.status === 'UPLOADED').length}
            </div>
            <div className="text-tertiary" style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 'var(--spacing-xs)' }}>
              Uploaded
            </div>
          </div>
        </div>
      </div>

      <DocumentList documents={documents} />
    </div>
  );
}
