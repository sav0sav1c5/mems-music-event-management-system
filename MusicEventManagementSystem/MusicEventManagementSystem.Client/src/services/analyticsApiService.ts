// Service for fetching real analytics data from the API
const API_BASE_URL = 'http://localhost:5255/api';

export interface AnalyticsSummary {
  totalNegotiations: number;
  activeNegotiations: number;
  completedNegotiations: number;
  totalValue: number;
  averageValue: number;
  successRate: number;
  averageDuration: number;
  conversionRate: number;
}

export interface PhaseDistribution {
  name: string;
  value: number;
  color: string;
}

export interface NegotiationTrend {
  date: string;
  started: number;
  completed: number;
  revenue: number;
  avgDuration: number;
}

export interface PerformerAnalytics {
  name: string;
  negotiations: number;
  success: number;
  revenue: number;
  avgDuration: number;
}

export interface RevenueByEvent {
  event: string;
  revenue: number;
  negotiations: number;
  avgValue: number;
}

export interface PhaseDuration {
  phase: string;
  avgDays: number;
  minDays: number;
  maxDays: number;
}

export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  time: string;
  value: number;
}

class AnalyticsApiService {
  private async fetchWithErrorHandling<T>(url: string): Promise<T> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      throw error;
    }
  }

  async getAnalyticsSummary(timeRange: string = '30d'): Promise<AnalyticsSummary> {
    return this.fetchWithErrorHandling<AnalyticsSummary>(
      `${API_BASE_URL}/negotiation/analytics/summary?timeRange=${timeRange}`
    );
  }

  async getPhaseDistribution(timeRange: string = '30d'): Promise<PhaseDistribution[]> {
    return this.fetchWithErrorHandling<PhaseDistribution[]>(
      `${API_BASE_URL}/negotiation/analytics/phase-distribution?timeRange=${timeRange}`
    );
  }

  async getNegotiationTrends(timeRange: string = '30d'): Promise<NegotiationTrend[]> {
    return this.fetchWithErrorHandling<NegotiationTrend[]>(
      `${API_BASE_URL}/negotiation/analytics/trends?timeRange=${timeRange}`
    );
  }

  async getPerformerAnalytics(timeRange: string = '30d'): Promise<PerformerAnalytics[]> {
    return this.fetchWithErrorHandling<PerformerAnalytics[]>(
      `${API_BASE_URL}/negotiation/analytics/performer-analytics?timeRange=${timeRange}`
    );
  }

  async getRevenueByEvent(timeRange: string = '30d'): Promise<RevenueByEvent[]> {
    return this.fetchWithErrorHandling<RevenueByEvent[]>(
      `${API_BASE_URL}/negotiation/analytics/revenue-by-event?timeRange=${timeRange}`
    );
  }

  async getPhaseDurationAnalysis(timeRange: string = '30d'): Promise<PhaseDuration[]> {
    return this.fetchWithErrorHandling<PhaseDuration[]>(
      `${API_BASE_URL}/negotiation/analytics/phase-duration?timeRange=${timeRange}`
    );
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    return this.fetchWithErrorHandling<RecentActivity[]>(
      `${API_BASE_URL}/negotiation/analytics/recent-activity?limit=${limit}`
    );
  }

  async generatePDFReport(timeRange: string = '30d'): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/analytics/pdf?timeRange=${timeRange}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error generating PDF report:', error);
      throw error;
    }
  }
}

export const analyticsApiService = new AnalyticsApiService();