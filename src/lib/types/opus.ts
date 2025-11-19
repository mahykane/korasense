/**
 * OPUS Workflow Types
 * Defines interfaces for OPUS-powered document analysis workflows
 */

// Match Prisma enum values
export type WorkflowType = 'RISK_ANALYSIS' | 'ANOMALY_DETECTION' | 'COMPLIANCE_CHECK';

export type WorkflowStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface OpusWorkflowConfig {
  id: string;
  name: string;
  type: WorkflowType;
  description: string;
  parameters: {
    // Risk Analysis Parameters
    newsCategories?: string[]; // e.g., ['cybersecurity', 'regulatory', 'financial']
    riskThreshold?: number; // 0-1 scale
    timeRange?: string; // e.g., '7d', '30d', '90d'
    regions?: string[]; // e.g., ['EU', 'US', 'APAC']
    
    // Anomaly Detection Parameters
    anomalyThreshold?: number; // Standard deviations
    dataColumns?: string[]; // Which columns to analyze
    timeSeriesColumn?: string; // Date/time column
    
    // Compliance Parameters
    frameworks?: string[]; // e.g., ['GDPR', 'SOC2', 'HIPAA']
  };
}

export interface OpusDocument {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  uploadedAt: Date;
  content?: string;
  metadata?: Record<string, any>;
}

export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: Date;
  category: string;
  relevanceScore: number;
  summary: string;
}

export interface RiskFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  affectedDocuments: string[];
  relatedNews: NewsArticle[];
  recommendation: string;
  confidence: number;
}

export interface AnomalyFinding {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  dataPoint: {
    timestamp: string;
    value: number;
    expectedValue: number;
    deviation: number;
  };
  context: string;
  possibleCauses: string[];
  recommendation: string;
}

export interface WorkflowResult {
  workflowId: string;
  status: WorkflowStatus;
  startedAt: Date;
  completedAt?: Date;
  documentsAnalyzed: number;
  findings: RiskFinding[] | AnomalyFinding[];
  summary: string;
  nextSteps: string[];
  executionTime: number;
}

export interface OpusWorkflowRequest {
  tenantId: string;
  userId?: string;
  workflowType: WorkflowType;
  documents: OpusDocument[];
  config: OpusWorkflowConfig;
}
