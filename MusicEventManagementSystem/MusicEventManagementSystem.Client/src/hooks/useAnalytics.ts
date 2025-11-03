import { useState, useCallback } from 'react';

const API_BASE_URL = 'http://localhost:5255/api';

export interface AnalyticsOverview {
  totalNegotiations: number;
  activeNegotiations: number;
  completedNegotiations: number;
  averageNegotiationDuration: number;
  averageCompletionRate: number;
  totalProposedValue: number;
}

export interface PhaseDistribution {
  phaseId: number;
  phaseName: string;
  status: string;
  negotiationCount: number;
  percentage: number;
}

export interface WorkflowStateAnalytics {
  phaseDistribution: PhaseDistribution[];
  phasePerformance: PhasePerformance[];
  workflowTransitions: WorkflowTransition[];
}

export interface PhasePerformance {
  phaseId: number;
  phaseName: string;
  averageDuration: number;
  completionRate: number;
  totalRequirements: number;
  completedRequirements: number;
  requirementCompletionRate: number;
}

export interface WorkflowTransition {
  date: string;
  fromPhaseId: number;
  toPhaseId: number;
  fromPhaseName: string;
  toPhaseName: string;
  transitionCount: number;
}

export interface NegotiationTrend {
  date: string;
  startedNegotiations: number;
  completedNegotiations: number;
  activeNegotiations: number;
  averageProposedFee: number;
}

export interface PerformerPerformance {
  performerId: number;
  performerName: string;
  genre: string;
  totalNegotiations: number;
  completedNegotiations: number;
  successRate: number;
  averageDuration: number;
  averageProposedFee: number;
  averageResponseTime: number;
}

export interface GenreAnalytics {
  genre: string;
  negotiationCount: number;
  averageSuccessRate: number;
  averageDuration: number;
  averageProposedFee: number;
}

export interface PerformerAnalytics {
  performerPerformance: PerformerPerformance[];
  genreAnalytics: GenreAnalytics[];
}

export interface LiveAnalytics {
  timestamp: string;
  activeNegotiations: number;
  todayStarted: number;
  todayCompleted: number;
  recentActivities: RecentActivity[];
  currentPhaseDistribution: PhaseDistribution[];
}

export interface RecentActivity {
  timestamp: string;
  negotiationId: number;
  performerName: string;
  eventName: string;
  activityType: string;
  description: string;
  fromPhase: string;
  toPhase: string;
}

export interface AnalyticsFilter {
  startDate?: string;
  endDate?: string;
  performerIds?: number[];
  eventIds?: number[];
  statuses?: string[];
  genres?: string[];
  groupBy?: 'day' | 'week' | 'month';
}

export interface DashboardSummary {
  totalNegotiations: number;
  activeNegotiations: number;
  completedNegotiations: number;
  todayStarted: number;
  todayCompleted: number;
  averageCompletionRate: number;
  averageDuration: number;
  totalProposedValue: number;
  currentPhaseDistribution: PhaseDistribution[];
  lastUpdated: string;
}

export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const makeRequest = useCallback(async <T>(endpoint: string, filter?: AnalyticsFilter): Promise<T> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = new URL(`${API_BASE_URL}/analytics/${endpoint}`);
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => url.searchParams.append(key, v.toString()));
            } else {
              url.searchParams.append(key, value.toString());
            }
          }
        });
      }

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const getAnalyticsOverview = useCallback(async (filter?: AnalyticsFilter): Promise<AnalyticsOverview> => {
    return makeRequest<AnalyticsOverview>('overview', filter);
  }, [makeRequest]);

  const getWorkflowStateAnalytics = useCallback(async (filter?: AnalyticsFilter): Promise<WorkflowStateAnalytics> => {
    return makeRequest<WorkflowStateAnalytics>('workflow-states', filter);
  }, [makeRequest]);

  const getPhaseDistribution = useCallback(async (filter?: AnalyticsFilter): Promise<PhaseDistribution[]> => {
    return makeRequest<PhaseDistribution[]>('phase-distribution', filter);
  }, [makeRequest]);

  const getPhasePerformance = useCallback(async (filter?: AnalyticsFilter): Promise<PhasePerformance[]> => {
    return makeRequest<PhasePerformance[]>('phase-performance', filter);
  }, [makeRequest]);

  const getNegotiationTrends = useCallback(async (filter: AnalyticsFilter): Promise<NegotiationTrend[]> => {
    return makeRequest<NegotiationTrend[]>('trends', filter);
  }, [makeRequest]);

  const getPerformerAnalytics = useCallback(async (filter?: AnalyticsFilter): Promise<PerformerAnalytics> => {
    return makeRequest<PerformerAnalytics>('performers', filter);
  }, [makeRequest]);

  const getLiveAnalytics = useCallback(async (): Promise<LiveAnalytics> => {
    return makeRequest<LiveAnalytics>('live');
  }, [makeRequest]);

  const getRecentActivities = useCallback(async (limit: number = 10): Promise<RecentActivity[]> => {
    return makeRequest<RecentActivity[]>(`recent-activities?limit=${limit}`);
  }, [makeRequest]);

  const getDashboardSummary = useCallback(async (filter?: AnalyticsFilter): Promise<DashboardSummary> => {
    return makeRequest<DashboardSummary>('dashboard-summary', filter);
  }, [makeRequest]);

  const getPerformerSpecificAnalytics = useCallback(async (performerId: number, filter?: AnalyticsFilter): Promise<PerformerAnalytics> => {
    return makeRequest<PerformerAnalytics>(`performer/${performerId}`, filter);
  }, [makeRequest]);

  const getEventSpecificAnalytics = useCallback(async (eventId: number, filter?: AnalyticsFilter): Promise<AnalyticsOverview> => {
    return makeRequest<AnalyticsOverview>(`event/${eventId}`, filter);
  }, [makeRequest]);

  return {
    loading,
    error,
    getAnalyticsOverview,
    getWorkflowStateAnalytics,
    getPhaseDistribution,
    getPhasePerformance,
    getNegotiationTrends,
    getPerformerAnalytics,
    getLiveAnalytics,
    getRecentActivities,
    getDashboardSummary,
    getPerformerSpecificAnalytics,
    getEventSpecificAnalytics,
  };
};