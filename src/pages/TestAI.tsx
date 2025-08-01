import { useState } from 'react';
import { createTestSubmission, testAIComponents } from '../utils/testSubmission';
import { 
  Beaker, 
  Rocket, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Database,
  Brain,
  Shield,
  FileSearch
} from 'lucide-react';

export default function TestAI() {
  const [testing, setTesting] = useState(false);
  const [componentTest, setComponentTest] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()} - ${message}`]);
  };

  const runFullTest = async () => {
    setTesting(true);
    setLogs([]);
    addLog('Starting full AI pipeline test...');

    try {
      const submission = await createTestSubmission();
      addLog(`Submission created: ${submission.id}`);
      addLog('AI processing started in background...');
      addLog('Check dashboard for real-time updates');
      
      setResults({
        success: true,
        submissionId: submission.id,
        dashboardUrl: `https://3cubedai-seo.netlify.app/seo-review/${submission.id}`
      });
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
      setResults({ success: false, error: error.message });
    } finally {
      setTesting(false);
    }
  };

  const runComponentTest = async () => {
    setComponentTest(true);
    setLogs([]);
    addLog('Testing individual AI components...');

    // Capture console logs
    const originalLog = console.log;
    console.log = (message: string) => {
      addLog(message);
      originalLog(message);
    };

    try {
      await testAIComponents();
      addLog('Component tests complete');
    } catch (error: any) {
      addLog(`Component test error: ${error.message}`);
    } finally {
      console.log = originalLog;
      setComponentTest(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Beaker className="h-8 w-8 text-primary-600" />
          AI Pipeline Test Suite
        </h1>
        <p className="mt-2 text-gray-600">
          Test the complete FDA → Perplexity → Claude AI processing pipeline
        </p>
      </div>

      {/* Environment Status */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Environment Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Railway PostgreSQL
            </span>
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Connected
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileSearch className="h-4 w-4" />
              FDA Database API
            </span>
            <span className="text-green-600 flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Active
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Perplexity AI
            </span>
            <span className="text-yellow-600 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              API Key Required
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Claude QA
            </span>
            <span className="text-yellow-600 flex items-center gap-1">
              <XCircle className="h-4 w-4" />
              API Key Required
            </span>
          </div>
        </div>
      </div>

      {/* Test Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <button
          onClick={runComponentTest}
          disabled={componentTest || testing}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow disabled:opacity-50"
        >
          <div className="flex flex-col items-center text-center">
            <Beaker className="h-12 w-12 text-blue-600 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Test Components</h3>
            <p className="text-sm text-gray-600">
              Test FDA, Perplexity, and Claude individually
            </p>
            {componentTest && (
              <Loader2 className="h-5 w-5 animate-spin mt-3 text-blue-600" />
            )}
          </div>
        </button>

        <button
          onClick={runFullTest}
          disabled={testing || componentTest}
          className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow disabled:opacity-50"
        >
          <div className="flex flex-col items-center text-center">
            <Rocket className="h-12 w-12 text-primary-600 mb-3" />
            <h3 className="font-semibold text-lg mb-1">Full Pipeline Test</h3>
            <p className="text-sm text-gray-600">
              Create submission and process through AI
            </p>
            {testing && (
              <Loader2 className="h-5 w-5 animate-spin mt-3 text-primary-600" />
            )}
          </div>
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className={`rounded-lg p-6 mb-6 ${
          results.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            {results.success ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                Test Successful
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                Test Failed
              </>
            )}
          </h3>
          {results.success && results.dashboardUrl && (
            <div className="mt-3">
              <a 
                href={results.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                View submission in dashboard →
              </a>
            </div>
          )}
          {results.error && (
            <p className="text-red-700 mt-2">{results.error}</p>
          )}
        </div>
      )}

      {/* Logs */}
      <div className="bg-gray-900 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-3">Test Logs</h3>
        <div className="bg-black rounded p-3 h-64 overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Run a test to see output.</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-green-400 mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Setup Instructions</h3>
        <p className="text-blue-800 mb-3">
          To enable Perplexity and Claude AI processing:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Go to Netlify Dashboard → Site Settings → Environment Variables</li>
          <li>Add: <code className="bg-blue-100 px-2 py-1 rounded">PERPLEXITY_API_KEY</code></li>
          <li>Add: <code className="bg-blue-100 px-2 py-1 rounded">CLAUDE_API_KEY</code></li>
          <li>Redeploy site for changes to take effect</li>
        </ol>
      </div>
    </div>
  );
}