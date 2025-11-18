import { getCurrentUser, getUserTenants } from '@/lib/auth';
import { getRecentSessions, getQualityScoreDistribution } from '@/lib/metrics';
import EvalDashboard from '@/components/eval/EvalDashboard';

export default async function EvalPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return null;
  }

  const tenants = await getUserTenants(user.id);
  const currentTenant = tenants[0];

  if (!currentTenant) {
    return <div>No tenant found</div>;
  }

  const [recentSessions, qualityDistribution] = await Promise.all([
    getRecentSessions(currentTenant.id, 50),
    getQualityScoreDistribution(currentTenant.id, 30),
  ]);

  const filteredQualityDistribution = qualityDistribution.filter((point): point is { qualityScore: number; createdAt: Date } => 
    point.qualityScore !== null
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Evaluation Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Track answer quality, latency, and user feedback over time
        </p>
      </div>

      <EvalDashboard 
        sessions={recentSessions}
        qualityDistribution={filteredQualityDistribution}
      />
    </div>
  );
}
