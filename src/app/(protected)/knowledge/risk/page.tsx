import { getCurrentUser, getUserTenants } from '@/lib/auth';
import RiskConsole from '@/components/risk/RiskConsole';

export default async function RiskPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const tenants = await getUserTenants(user.id);
  const currentTenant = tenants[0];

  if (!currentTenant) {
    return <div>No tenant found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Risk Copilot</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ask questions about risks, policies, and compliance. Get AI-powered answers with full traceability.
        </p>
      </div>

      <RiskConsole tenantSlug={currentTenant.slug} />
    </div>
  );
}
