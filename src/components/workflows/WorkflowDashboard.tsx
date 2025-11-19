'use client';

import { useState, useEffect } from 'react';
import { WorkflowStatus } from '@/lib/types/opus';

interface Workflow {
  id: string;
  type: string;
  status: WorkflowStatus;
  documentsCount: number;
  createdAt: string;
  completedAt?: string;
  result?: any;
}

export default function WorkflowDashboard() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);
  const [workflowDetails, setWorkflowDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - replace with actual API call
  useEffect(() => {
    // Simulating API call
    setTimeout(() => {
      setWorkflows([
        {
          id: 'wf-123',
          type: 'RISK_ANALYSIS',
          status: 'COMPLETED',
          documentsCount: 3,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          completedAt: new Date(Date.now() - 82800000).toISOString(),
        },
        {
          id: 'wf-124',
          type: 'RISK_ANALYSIS',
          status: 'PROCESSING',
          documentsCount: 5,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: WorkflowStatus) => {
    switch (status) {
      case 'COMPLETED':
        return { bg: 'var(--success-light)', text: 'var(--success)' };
      case 'PROCESSING':
        return { bg: 'var(--accent-10)', text: 'var(--accent)' };
      case 'FAILED':
        return { bg: 'var(--error-light)', text: 'var(--error)' };
      case 'PENDING':
        return { bg: 'var(--warning-light)', text: 'var(--warning)' };
      default:
        return { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'COMPLETED':
        return '✓';
      case 'PROCESSING':
        return '⏳';
      case 'FAILED':
        return '✗';
      case 'PENDING':
        return '⏸';
      default:
        return '?';
    }
  };

  const getWorkflowTypeLabel = (type: string) => {
    switch (type) {
      case 'RISK_ANALYSIS':
        return 'Risk Analysis';
      case 'ANOMALY_DETECTION':
        return 'Anomaly Detection';
      case 'COMPLIANCE_CHECK':
        return 'Compliance Check';
      default:
        return type;
    }
  };

  const fetchWorkflowDetails = async (workflowId: string) => {
    setSelectedWorkflow(workflowId);
    try {
      const response = await fetch(`/api/opus/workflow/${workflowId}`);
      const data = await response.json();
      setWorkflowDetails(data);
    } catch (error) {
      console.error('Failed to fetch workflow details:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <div className="text-lg" style={{ color: 'var(--text-secondary)' }}>Loading workflows...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Workflow Dashboard</h1>
        <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Monitor and manage your OPUS workflows</p>
      </div>

      {workflows.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <div className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>No workflows yet</div>
          <div className="mb-6" style={{ color: 'var(--text-secondary)' }}>
            Start your first workflow to see it here
          </div>
          <a
            href="/workflows"
            className="btn-primary inline-block"
          >
            Create Workflow
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Workflows List */}
          <div className="lg:col-span-2 space-y-4">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => fetchWorkflowDetails(workflow.id)}
                className="card p-6 cursor-pointer transition-all hover:shadow-lg"
                style={{
                  borderColor: selectedWorkflow === workflow.id ? 'var(--accent)' : 'var(--border)',
                  borderWidth: '2px',
                  boxShadow: selectedWorkflow === workflow.id ? 'var(--shadow-md)' : 'none',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="text-2xl">
                        {workflow.type === 'RISK_ANALYSIS' ? '⚠️' : '📊'}
                      </div>
                      <div>
                        <div className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {getWorkflowTypeLabel(workflow.type)}
                        </div>
                        <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                          {workflow.documentsCount} document{workflow.documentsCount !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                      <div>
                        <div style={{ color: 'var(--text-tertiary)' }}>Started</div>
                        <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {new Date(workflow.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {workflow.completedAt && (
                        <div>
                          <div style={{ color: 'var(--text-tertiary)' }}>Completed</div>
                          <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {new Date(workflow.completedAt).toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <span
                      className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
                      style={{
                        backgroundColor: getStatusColor(workflow.status).bg,
                        color: getStatusColor(workflow.status).text,
                      }}
                    >
                      <span>{getStatusIcon(workflow.status)}</span>
                      <span>{workflow.status}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                  <div className="text-xs font-mono" style={{ color: 'var(--text-tertiary)' }}>ID: {workflow.id}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Workflow Details Panel */}
          <div className="lg:col-span-1">
            {selectedWorkflow ? (
              <div className="card p-6 sticky top-6">
                <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Workflow Details
                </h3>

                {workflowDetails ? (
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>Status</div>
                      <span
                        className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: getStatusColor(workflowDetails.status).bg,
                          color: getStatusColor(workflowDetails.status).text,
                        }}
                      >
                        <span>{getStatusIcon(workflowDetails.status)}</span>
                        <span>{workflowDetails.status}</span>
                      </span>
                    </div>

                    {workflowDetails.result && (
                      <div>
                        <div className="text-sm mb-2" style={{ color: 'var(--text-tertiary)' }}>Results</div>
                        <div className="rounded p-4 text-sm" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                          <pre className="whitespace-pre-wrap text-xs" style={{ color: 'var(--text-secondary)' }}>
                            {JSON.stringify(workflowDetails.result, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-2xl mb-2">⏳</div>
                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading details...</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card p-6 text-center sticky top-6">
                <div className="text-4xl mb-3">👈</div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  Select a workflow to view details
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
