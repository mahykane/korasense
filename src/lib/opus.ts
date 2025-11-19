/**
 * OPUS API Client
 * Handles communication with OPUS workflow execution platform
 * Documentation: https://developer.opus.com/docs/get-started/introduction
 */

import { OpusWorkflowConfig, WorkflowResult, OpusDocument } from './types/opus';

const OPUS_API_URL = process.env.OPUS_API_URL || 'https://operator.opus.com';
const OPUS_API_KEY = process.env.OPUS_API_KEY;
const OPUS_WORKFLOW_ID = process.env.OPUS_WORKFLOW_ID; // Get from Opus workflow URL

interface OpusInitiateJobPayload {
  workflowId: string;
  title: string;
  description: string;
}

interface OpusExecuteJobPayload {
  jobExecutionId: string;
  jobPayloadSchemaInstance: Record<string, any>;
}

interface OpusJobStatus {
  status: 'IN PROGRESS' | 'COMPLETED' | 'FAILED';
}

interface OpusJobResults {
  jobExecutionId: string;
  status: string;
  results: Record<string, any>;
}

/**
 * Execute OPUS Workflow
 * Two-step process: Initiate → Execute
 * Documentation: https://developer.opus.com/docs/jobs/initiate-job
 */
export async function executeOpusWorkflow(
  workflowType: string,
  documents: OpusDocument[],
  config: OpusWorkflowConfig,
  tenantId: string,
  userId?: string
): Promise<{ workflowId: string; status: string }> {
  if (!OPUS_API_KEY) {
    throw new Error('OPUS_API_KEY not configured');
  }

  if (!OPUS_WORKFLOW_ID) {
    throw new Error('OPUS_WORKFLOW_ID not configured. Get your workflow ID from the Opus platform URL.');
  }

  // Check if we're in mock mode (for testing without real OPUS API)
  const useMock = process.env.OPUS_MOCK_MODE === 'true';
  
  if (useMock) {
    console.log('🧪 Using OPUS Mock Mode');
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      workflowId: `mock-opus-${Date.now()}`,
      status: 'PROCESSING',
    };
  }

  // Step 1: Initiate Job
  console.log('🚀 Step 1: Initiating OPUS job...');
  const initiatePayload: OpusInitiateJobPayload = {
    workflowId: OPUS_WORKFLOW_ID,
    title: `${workflowType} - ${new Date().toISOString()}`,
    description: `Automated ${workflowType} workflow execution for tenant ${tenantId}`,
  };

  const initiateResponse = await fetch(`${OPUS_API_URL}/job/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-service-key': OPUS_API_KEY,
    },
    body: JSON.stringify(initiatePayload),
  });

  if (!initiateResponse.ok) {
    const errorText = await initiateResponse.text();
    console.error('OPUS Initiate Error:', {
      status: initiateResponse.status,
      statusText: initiateResponse.statusText,
      body: errorText,
    });
    throw new Error(`Failed to initiate OPUS job: ${errorText || initiateResponse.statusText}`);
  }

  const { jobExecutionId } = await initiateResponse.json();
  console.log(`✓ Job initiated with ID: ${jobExecutionId}`);

  // Step 2: Execute Job
  console.log('🚀 Step 2: Executing OPUS job...');
  
  // Build job payload schema instance from documents and config
  const jobPayloadSchemaInstance: Record<string, any> = {
    // Map your documents and config to the workflow input schema
    // This will depend on your specific workflow schema
    ...config.parameters,
    documents: documents.map(doc => ({
      filename: doc.fileName,
      content: doc.content,
      mime_type: doc.fileType,
    })),
  };

  const executePayload: OpusExecuteJobPayload = {
    jobExecutionId,
    jobPayloadSchemaInstance,
  };

  const executeResponse = await fetch(`${OPUS_API_URL}/job/execute`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-service-key': OPUS_API_KEY,
    },
    body: JSON.stringify(executePayload),
  });

  if (!executeResponse.ok) {
    const errorText = await executeResponse.text();
    console.error('OPUS Execute Error:', {
      status: executeResponse.status,
      statusText: executeResponse.statusText,
      body: errorText,
    });
    throw new Error(`Failed to execute OPUS job: ${errorText || executeResponse.statusText}`);
  }

  console.log(`✓ Job execution started: ${jobExecutionId}`);

  return {
    workflowId: jobExecutionId,
    status: 'IN PROGRESS',
  };
}

/**
 * Get Workflow Status
 * Documentation: https://developer.opus.com/docs/jobs/get-job-execution-status
 */
export async function getWorkflowStatus(jobExecutionId: string): Promise<WorkflowResult> {
  if (!OPUS_API_KEY) {
    throw new Error('OPUS_API_KEY not configured');
  }

  // Mock mode for testing
  const useMock = process.env.OPUS_MOCK_MODE === 'true';
  
  if (useMock) {
    console.log('🧪 Using OPUS Mock Mode for status check');
    
    const isMockWorkflow = jobExecutionId.startsWith('mock-opus-');
    if (isMockWorkflow) {
      const timestamp = parseInt(jobExecutionId.split('-')[2] || '0');
      const elapsed = Date.now() - timestamp;
      const status = elapsed > 5000 ? 'COMPLETED' : 'PROCESSING';
      
      return {
        workflowId: jobExecutionId,
        status: status as any,
        startedAt: new Date(timestamp),
        completedAt: status === 'COMPLETED' ? new Date() : undefined,
        documentsAnalyzed: 1,
        findings: status === 'COMPLETED' ? [
          {
            id: `finding-${Date.now()}`,
            severity: 'high' as const,
            category: 'Financial Risk',
            title: 'Liquidity Concern Detected',
            description: 'Mock risk finding - potential liquidity concerns detected in test document',
            affectedDocuments: ['test-document.txt'],
            relatedNews: [
              {
                id: `news-${Date.now()}`,
                title: 'Mock News: Market Volatility Increases',
                url: 'https://example.com/news/1',
                source: 'Financial Times',
                publishedAt: new Date(),
                category: 'Financial',
                relevanceScore: 0.85,
                summary: 'Recent market conditions show increased volatility',
              },
            ],
            recommendation: 'Review cash flow projections and maintain adequate reserves',
            confidence: 0.82,
          },
        ] : [],
        summary: status === 'COMPLETED' 
          ? 'Analysis complete. Found 1 high-severity risk requiring attention.'
          : 'Workflow is currently processing...',
        nextSteps: status === 'COMPLETED' ? [
          'Schedule risk review meeting with finance team',
          'Update financial projections based on findings',
          'Monitor related news for further developments',
        ] : [],
        executionTime: elapsed,
      };
    }
  }

  // Step 1: Check status
  const statusResponse = await fetch(`${OPUS_API_URL}/job/${jobExecutionId}/status`, {
    headers: {
      'x-service-key': OPUS_API_KEY,
    },
  });

  if (!statusResponse.ok) {
    const errorText = await statusResponse.text();
    throw new Error(`Failed to get job status: ${errorText || statusResponse.statusText}`);
  }

  const { status }: OpusJobStatus = await statusResponse.json();

  // Step 2: If completed, get results
  if (status === 'COMPLETED') {
    const resultsResponse = await fetch(`${OPUS_API_URL}/job/${jobExecutionId}/results`, {
      headers: {
        'x-service-key': OPUS_API_KEY,
      },
    });

    if (!resultsResponse.ok) {
      const errorText = await resultsResponse.text();
      throw new Error(`Failed to get job results: ${errorText || resultsResponse.statusText}`);
    }

    const results: OpusJobResults = await resultsResponse.json();

    // Map OPUS results to our WorkflowResult format
    return {
      workflowId: jobExecutionId,
      status: 'COMPLETED',
      startedAt: new Date(), // You may want to store this from initiate
      completedAt: new Date(),
      documentsAnalyzed: 0, // Extract from results if available
      findings: [], // Map from results.results to your findings format
      summary: JSON.stringify(results.results), // Parse actual results
      nextSteps: [],
      executionTime: 0,
    };
  }

  // Return in-progress status
  return {
    workflowId: jobExecutionId,
    status: status === 'IN PROGRESS' ? 'PROCESSING' : 'FAILED',
    startedAt: new Date(),
    documentsAnalyzed: 0,
    findings: [],
    summary: `Job is ${status}`,
    nextSteps: [],
    executionTime: 0,
  };
}

export async function cancelWorkflow(workflowId: string): Promise<void> {
  if (!OPUS_API_KEY) {
    throw new Error('OPUS_API_KEY not configured');
  }

  const response = await fetch(`${OPUS_API_URL}/workflows/${workflowId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPUS_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to cancel workflow: ${response.statusText}`);
  }
}

export async function fetchRelevantNews(
  categories: string[],
  keywords: string[],
  timeRange: string = '7d',
  limit: number = 20
): Promise<any[]> {
  if (!OPUS_API_KEY) {
    throw new Error('OPUS_API_KEY not configured');
  }

  const params = new URLSearchParams({
    categories: categories.join(','),
    keywords: keywords.join(','),
    time_range: timeRange,
    limit: limit.toString(),
  });

  const response = await fetch(`${OPUS_API_URL}/news/search?${params}`, {
    headers: {
      'Authorization': `Bearer ${OPUS_API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch news: ${response.statusText}`);
  }

  return response.json();
}
