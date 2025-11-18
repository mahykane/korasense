import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function HomePage() {
  const { userId } = await auth();
  
  if (userId) {
    redirect('/dashboard');
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
          Opsense Risk Copilot
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Multimodal agentic knowledge and risk assessment platform powered by AI
        </p>
        
        <div className="flex gap-4 justify-center">
          <a
            href="/sign-in"
            className="btn-primary"
          >
            Sign In
          </a>
          <a
            href="/sign-up"
            className="btn-secondary"
          >
            Sign Up
          </a>
          <a
            href="/demo"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Demo
          </a>
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
          <div className="card">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-lg font-semibold mb-2">Knowledge Search</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Ask complex questions and get answers grounded in your documents with full traceability.
            </p>
          </div>
          
          <div className="card">
            <div className="text-3xl mb-3">⚠️</div>
            <h3 className="text-lg font-semibold mb-2">Risk Assessment</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate structured risk registers with evidence-based likelihood and impact analysis.
            </p>
          </div>
          
          <div className="card">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2">Quality Metrics</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track answer quality, latency, and user feedback with comprehensive evaluation dashboards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
