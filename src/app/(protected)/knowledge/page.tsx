import { getCurrentUser, getUserTenants } from '@/lib/auth';
import { prisma } from '@/lib/db';
import DocumentList from '@/components/knowledge/DocumentList';

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
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Knowledge Base</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your documents and monitor ingestion status
        </p>
      </div>

      <div className="mb-6 card">
        <h2 className="text-lg font-semibold mb-2">Ingestion Status</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Documents are ingested via Rust Senses or manual upload. 
          Configure your Senses to watch folders and auto-sync documents.
        </p>
        <div className="flex gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{documents.length}</div>
            <div className="text-xs text-gray-500">Total Docs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'EMBEDDED').length}
            </div>
            <div className="text-xs text-gray-500">Embedded</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {documents.filter(d => d.status === 'PARSED').length}
            </div>
            <div className="text-xs text-gray-500">Parsed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {documents.filter(d => d.status === 'UPLOADED').length}
            </div>
            <div className="text-xs text-gray-500">Uploaded</div>
          </div>
        </div>
      </div>

      <DocumentList documents={documents} />
    </div>
  );
}
