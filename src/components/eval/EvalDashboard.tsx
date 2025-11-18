'use client';

interface Session {
  id: string;
  question: string;
  qualityScore: number | null;
  totalLatencyMs: number;
  createdAt: Date;
  feedback: any[];
}

interface QualityDataPoint {
  qualityScore: number;
  createdAt: Date;
}

interface EvalDashboardProps {
  sessions: Session[];
  qualityDistribution: QualityDataPoint[];
}

export default function EvalDashboard({ sessions, qualityDistribution }: EvalDashboardProps) {
  const avgQuality = sessions
    .filter(s => s.qualityScore !== null)
    .reduce((sum, s) => sum + (s.qualityScore || 0), 0) / sessions.filter(s => s.qualityScore !== null).length || 0;

  const avgLatency = sessions.reduce((sum, s) => sum + s.totalLatencyMs, 0) / sessions.length || 0;

  const feedbackStats = sessions.reduce((acc, s) => {
    acc.helpful += s.feedback.filter(f => f.label === 'HELPFUL').length;
    acc.unhelpful += s.feedback.filter(f => f.label === 'UNHELPFUL').length;
    return acc;
  }, { helpful: 0, unhelpful: 0 });

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Quality Score</div>
          <div className="text-3xl font-bold">{(avgQuality * 100).toFixed(0)}%</div>
          <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg Latency</div>
          <div className="text-3xl font-bold">{(avgLatency / 1000).toFixed(1)}s</div>
          <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
        </div>
        
        <div className="card">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">User Feedback</div>
          <div className="text-3xl font-bold">
            {feedbackStats.helpful} / {feedbackStats.unhelpful}
          </div>
          <div className="text-xs text-gray-500 mt-1">👍 Helpful / 👎 Not Helpful</div>
        </div>
      </div>

      {/* Quality Over Time */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Quality Score Over Time</h2>
        <div className="h-64 flex items-end gap-2">
          {qualityDistribution.slice(-30).map((point, idx) => (
            <div
              key={idx}
              className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
              style={{ height: `${point.qualityScore * 100}%` }}
              title={`${new Date(point.createdAt).toLocaleDateString()}: ${(point.qualityScore * 100).toFixed(0)}%`}
            />
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2 text-center">
          Last 30 days
        </div>
      </div>

      {/* Recent Sessions Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Question
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feedback
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-4 max-w-md">
                    <div className="text-sm truncate">{session.question}</div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-sm font-semibold ${
                      (session.qualityScore || 0) >= 0.8 ? 'text-green-600' :
                      (session.qualityScore || 0) >= 0.6 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {session.qualityScore ? (session.qualityScore * 100).toFixed(0) : '—'}%
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {(session.totalLatencyMs / 1000).toFixed(1)}s
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {session.feedback.length > 0 ? (
                      <span>{session.feedback[0].label === 'HELPFUL' ? '👍' : '👎'}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {new Date(session.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
