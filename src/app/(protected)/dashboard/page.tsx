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
  const [avgQuality, avgLatency, feedback, todayQueries, recentRisks] = await Promise.all([
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
    prisma.riskAssessment.findMany({
      where: { tenantId: currentTenant.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user.name || user.email}
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today&apos;s Queries</div>
          <div className="text-3xl font-bold">{todayQueries}</div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Quality Score</div>
          <div className="text-3xl font-bold">
            {avgQuality ? (avgQuality * 100).toFixed(0) : '—'}%
          </div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Latency</div>
          <div className="text-3xl font-bold">
            {avgLatency ? (avgLatency / 1000).toFixed(1) : '—'}s
          </div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Feedback</div>
          <div className="text-3xl font-bold">
            {feedback.helpful} 👍 / {feedback.unhelpful} 👎
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Link href="/risk" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-2xl mb-2">💬</div>
          <h3 className="text-lg font-semibold mb-2">Risk Copilot</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Ask questions and get AI-powered risk assessments
          </p>
        </Link>
        
        <Link href="/knowledge" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-2xl mb-2">📚</div>
          <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Manage documents and ingestion status
          </p>
        </Link>
        
        <Link href="/eval" className="card hover:shadow-lg transition-shadow cursor-pointer">
          <div className="text-2xl mb-2">📊</div>
          <h3 className="text-lg font-semibold mb-2">Evaluation</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            View quality metrics and performance analytics
          </p>
        </Link>
      </div>

      {/* Recent Risk Assessments */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Risk Assessments</h2>
        {recentRisks.length > 0 ? (
          <div className="space-y-3">
            {recentRisks.map((risk) => (
              <div key={risk.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="font-medium">{risk.domain}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {risk.objective.slice(0, 100)}...
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Level: <span className={`font-semibold ${
                    risk.overallLevel === 'HIGH' ? 'text-red-600' :
                    risk.overallLevel === 'MEDIUM' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>{risk.overallLevel}</span> • {new Date(risk.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No risk assessments yet</p>
        )}
      </div>
    </div>
  );
}
