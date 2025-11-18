import DemoConsole from '@/components/demo/DemoConsole';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Opsense Risk Copilot - Demo</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Try out the risk copilot with pre-loaded demo data. Read-only mode.
                </p>
              </div>
              <a href="/" className="btn-secondary">
                Back to Home
              </a>
            </div>
          </div>

          <div className="mb-6 card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex gap-3">
              <div className="text-2xl">ℹ️</div>
              <div>
                <h3 className="font-semibold mb-1">Demo Mode</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  This is a read-only demo with fake data. Try asking questions like:
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 list-disc list-inside mt-2">
                  <li>&quot;What are our data residency requirements?&quot;</li>
                  <li>&quot;Summarize recent security incidents&quot;</li>
                  <li>&quot;What are the main compliance risks for EU customers?&quot;</li>
                </ul>
              </div>
            </div>
          </div>

          <DemoConsole />
        </div>
      </div>
    </div>
  );
}
