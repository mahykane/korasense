/**
 * Metrics Logging Utilities
 * Tracks performance and quality metrics for Q&A and risk assessments
 */

import { prisma } from './db';

export interface MetricsData {
  qaSessionId: string;
  tenantId: string;
  retrievalK: number;
  retrievalUsed: number;
  retrievalLatencyMs: number;
  geminiLatencyMs: number;
}

/**
 * Log Q&A metrics
 */
export async function logQaMetrics(data: MetricsData) {
  return prisma.qaMetrics.create({
    data,
  });
}

/**
 * Get average quality score for tenant
 */
export async function getAverageQualityScore(tenantId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await prisma.qaSession.aggregate({
    where: {
      tenantId,
      createdAt: {
        gte: since,
      },
      qualityScore: {
        not: null,
      },
    },
    _avg: {
      qualityScore: true,
    },
  });

  return result._avg.qualityScore || 0;
}

/**
 * Get average latency for tenant
 */
export async function getAverageLatency(tenantId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const result = await prisma.qaSession.aggregate({
    where: {
      tenantId,
      createdAt: {
        gte: since,
      },
    },
    _avg: {
      totalLatencyMs: true,
    },
  });

  return result._avg.totalLatencyMs || 0;
}

/**
 * Get feedback counts
 */
export async function getFeedbackCounts(tenantId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const helpful = await prisma.qaFeedback.count({
    where: {
      tenantId,
      label: 'HELPFUL',
      createdAt: {
        gte: since,
      },
    },
  });

  const unhelpful = await prisma.qaFeedback.count({
    where: {
      tenantId,
      label: 'UNHELPFUL',
      createdAt: {
        gte: since,
      },
    },
  });

  return { helpful, unhelpful };
}

/**
 * Get recent Q&A sessions with metrics
 */
export async function getRecentSessions(tenantId: string, limit: number = 20) {
  return prisma.qaSession.findMany({
    where: { tenantId },
    include: {
      metrics: true,
      feedback: true,
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });
}

/**
 * Get quality score distribution
 */
export async function getQualityScoreDistribution(tenantId: string, days: number = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const sessions = await prisma.qaSession.findMany({
    where: {
      tenantId,
      createdAt: {
        gte: since,
      },
      qualityScore: {
        not: null,
      },
    },
    select: {
      qualityScore: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  return sessions;
}

/**
 * Timer utility for tracking step durations
 */
export class StepTimer {
  private startTime: number;
  private steps: Array<{ step: string; durationMs: number }> = [];

  constructor() {
    this.startTime = Date.now();
  }

  markStep(stepName: string) {
    const now = Date.now();
    const duration = now - this.startTime;
    this.steps.push({
      step: stepName,
      durationMs: duration,
    });
    this.startTime = now;
  }

  getSteps() {
    return this.steps;
  }

  getTotalDuration() {
    return this.steps.reduce((sum, step) => sum + step.durationMs, 0);
  }
}
