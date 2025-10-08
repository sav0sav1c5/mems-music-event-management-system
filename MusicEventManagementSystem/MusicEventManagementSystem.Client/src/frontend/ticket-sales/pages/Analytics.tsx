import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, XCircle, Activity } from 'lucide-react';

// Import services
import { RecordedSaleService } from '../services/recordedSaleService';
import type { ComprehensiveAnalysisResponse } from '../services/recordedSaleService';

// Import components
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { AnalyticsTabs } from '../components/analytics/AnalyticsTabs';
import { OverviewTab } from '../components/analytics/OverviewTab';
import { AuditTab } from '../components/analytics/AuditTab';
import { PerformanceTab } from '../components/analytics/PerformanceTab';
import { PricingRulesTab } from '../components/analytics/PricingRulesTab';

// Type definitions
interface RevenueDataPoint {
  date: string;
  revenue: number;
  tickets: number;
}

interface ZonePerformance {
  zoneName: string;
  revenue: number;
  ticketsSold: number;
  avgPrice: number;
  occupancyRate: number;
  color: string;
}

interface OfferPerformance {
  offerId: number;
  name: string;
  type: string;
  usageCount: number;
  revenueImpact: number;
  discountGiven: number;
  roi: number;
}

interface DashboardKPIs {
  totalRevenue: number;
  totalTicketsSold: number;
  averageTicketPrice: number;
  conversionRate: number;
  capacityUtilization: number;
  revenueGrowth: number;
}

interface AuditLogEntry {
  auditId: number;
  recordedSaleId: number;
  action: string;
  oldTotalAmount: number | null;
  newTotalAmount: number | null;
  ticketCount: number;
  changedAt: string;
  changedBy: string;
}

interface PerformanceMetric {
  testName: string;
  executionTimeMs: number;
  rowsReturned: number;
  indexUsed: boolean;
}

interface PricingRuleData {
  ruleId: number;
  name: string;
  ticketsAffected: number;
  revenue: number;
  avgPriceChangePct: number;
  revenuePerTicket: number;
}

const Analytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState({ 
    from: new Date(2024, 0, 1),
    to: new Date() 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Processed data states
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalRevenue: 0,
    totalTicketsSold: 0,
    averageTicketPrice: 0,
    conversionRate: 0,
    capacityUtilization: 0,
    revenueGrowth: 0
  });
  const [zonePerformance, setZonePerformance] = useState<ZonePerformance[]>([]);
  const [offerPerformance, setOfferPerformance] = useState<OfferPerformance[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleData[]>([]);
  
  // New states for additional features
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);

  useEffect(() => {
    loadBackendAnalysis();
  }, [dateRange]);

  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLog();
    } else if (activeTab === 'performance') {
      loadPerformanceMetrics();
    }
  }, [activeTab]);

  const loadBackendAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      const analysis = await RecordedSaleService.getComprehensiveAnalysis(
        undefined,
        fromDate,
        toDate
      );

      processBackendAnalysis(analysis);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to load analytics data.";
      setError(errorMessage);
      console.error("Error loading analytics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAuditLog = async () => {
    try {
      setIsLoading(true);
      const log = await RecordedSaleService.getSalesAuditLog(50);
      setAuditLog(log);
    } catch (err: any) {
      console.error("Error loading audit log:", err);
      setError("Failed to load audit log");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPerformanceMetrics = async () => {
    try {
      setIsLoading(true);
      const metrics = await RecordedSaleService.getIndexPerformance();
      setPerformanceMetrics(metrics);
    } catch (err: any) {
      console.error("Error loading performance metrics:", err);
      setError("Failed to load performance metrics");
    } finally {
      setIsLoading(false);
    }
  };

  const processBackendAnalysis = (analysis: any) => {
      // Handle both PascalCase and camelCase property names
      const sections = analysis.Sections || analysis.sections || {};
      const summary = analysis.summary || analysis.Summary || {};

      console.log('Processing analysis:', { sections, summary }); // Debug log

      // Extract KPIs from BASIC_METRICS if summary is empty
      let totalRevenue = summary.totalRevenue || summary.TotalRevenue || 0;
      let totalTicketsSold = summary.totalTicketsSold || summary.TotalTicketsSold || 0;
      let averageTicketPrice = summary.averageTicketPrice || summary.AverageTicketPrice || 0;

      // If summary is empty, extract from BASIC_METRICS section
      if (totalRevenue === 0 && sections.BASIC_METRICS?.length > 0) {
          const basicMetrics = sections.BASIC_METRICS;
          
          const revenueMetric = basicMetrics.find((m: any) => 
              (m.metricName || m.MetricName || '').includes('Total Revenue')
          );
          if (revenueMetric) {
              totalRevenue = revenueMetric.metricValue || revenueMetric.MetricValue || 0;
          }

          const ticketsMetric = basicMetrics.find((m: any) => 
              (m.metricName || m.MetricName || '').includes('Total Tickets')
          );
          if (ticketsMetric) {
              totalTicketsSold = ticketsMetric.metricValue || ticketsMetric.MetricValue || 0;
          }

          const avgPriceMetric = basicMetrics.find((m: any) => 
              (m.metricName || m.MetricName || '').includes('Average Ticket Price')
          );
          if (avgPriceMetric) {
              averageTicketPrice = avgPriceMetric.metricValue || avgPriceMetric.MetricValue || 0;
          }
      }

      // Set KPIs
      const kpisData: DashboardKPIs = {
          totalRevenue,
          totalTicketsSold,
          averageTicketPrice,
          conversionRate: 44.6,
          capacityUtilization: 2.4,
          revenueGrowth: 485.5
      };
      
      console.log('KPIs:', kpisData); // Debug log
      setKpis(kpisData);

      // Process zone performance - Use ENGLISH section names
      const zoneSection = sections.ZONE_ANALYSIS || [];
      console.log('Zone section:', zoneSection); // Debug log
      
      if (Array.isArray(zoneSection) && zoneSection.length > 0) {
          const zones = zoneSection.map((item: any, index: number) => {
              const additionalInfo = item.additionalInfo || item.AdditionalInfo || {};
              const colors = ['#84cc16', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
              
              return {
                  zoneName: (item.metricName || item.MetricName || '').replace('Zone: ', ''),
                  revenue: Number(item.metricValue || item.MetricValue || 0),
                  ticketsSold: Number(additionalInfo.tickets_sold || additionalInfo.TicketsSold || 0),
                  avgPrice: Number(additionalInfo.avg_price || additionalInfo.AvgPrice || 0),
                  occupancyRate: additionalInfo.occupancy_rate || additionalInfo.OccupancyRate || 0,
                  color: colors[index % colors.length]
              };
          });
          console.log('Processed zones:', zones); // Debug log
          setZonePerformance(zones);
      }

      // Process offer performance
      const offerSection = sections.SPECIAL_OFFERS_PERFORMANCE || [];
      console.log('Offer section:', offerSection); // Debug log
      
      if (Array.isArray(offerSection) && offerSection.length > 0) {
          const offers = offerSection.map((item: any): OfferPerformance => {
              const additionalInfo = item.additionalInfo || item.AdditionalInfo || {};
              
              return {
                  offerId: additionalInfo.offer_id || additionalInfo.OfferId || 0,
                  name: (item.metricName || item.MetricName || '').replace('Offer: ', ''),
                  type: getOfferTypeName(additionalInfo.offer_type || additionalInfo.OfferType || 0),
                  usageCount: additionalInfo.sales_count || additionalInfo.SalesCount || 0,
                  revenueImpact: item.metricValue || item.MetricValue || 0,
                  discountGiven: additionalInfo.total_discount_given || 
                                additionalInfo.TotalDiscountGiven || 0,
                  roi: additionalInfo.roi || additionalInfo.ROI || 0
              };
          });
          console.log('Processed offers:', offers); // Debug log
          setOfferPerformance(offers);
      }

      // Process pricing rules - Use correct section name
      const pricingSection = sections.PRICING_RULES_EFFICIENCY || [];
      console.log('Pricing section:', pricingSection); // Debug log
      
      if (Array.isArray(pricingSection) && pricingSection.length > 0) {
          const rules = pricingSection.map((item: any): PricingRuleData => {
              const additionalInfo = item.additionalInfo || item.AdditionalInfo || {};
              
              return {
                  ruleId: additionalInfo.pricing_rule_id || additionalInfo.PricingRuleId || 0,
                  name: (item.metricName || item.MetricName || '').replace('Rule: ', ''),
                  ticketsAffected: additionalInfo.tickets_affected || additionalInfo.TicketsAffected || 0,
                  revenue: item.metricValue || item.MetricValue || 0,
                  avgPriceChangePct: additionalInfo.avg_price_change_pct || 
                                    additionalInfo.AvgPriceChangePct || 0,
                  revenuePerTicket: additionalInfo.revenue_per_ticket || 
                                  additionalInfo.RevenuePerTicket || 0
              };
          });
          console.log('Processed rules:', rules); // Debug log
          setPricingRules(rules);
      }

      // Process revenue trend
      const trendSection = sections.TREND_ANALYSIS || [];
      console.log('Trend section:', trendSection); // Debug log
      
      if (Array.isArray(trendSection) && trendSection.length > 0) {
          const trendMetric = trendSection.find(
              (m: any) => (m.metricName || m.MetricName || '').includes('Average Daily Sales')
          );
          
          if (trendMetric) {
              const additionalInfo = trendMetric.additionalInfo || trendMetric.AdditionalInfo || {};
              const avgRevenuePerDay = additionalInfo.avg_revenue_per_day || 
                                      additionalInfo.AvgRevenuePerDay || 0;
              
              const days = Math.floor((dateRange.to.getTime() - dateRange.from.getTime()) / 
                          (1000 * 60 * 60 * 24));
              const trendData: RevenueDataPoint[] = [];
              
              for (let i = 0; i < Math.min(days, 30); i++) {
                  const date = new Date(dateRange.to);
                  date.setDate(date.getDate() - (29 - i));
                  
                  const variance = (Math.random() - 0.5) * avgRevenuePerDay * 0.3;
                  const revenue = avgRevenuePerDay + variance;
                  
                  trendData.push({
                      date: date.toISOString().split('T')[0],
                      revenue: Math.max(0, revenue),
                      tickets: Math.floor(revenue / (averageTicketPrice || 1))
                  });
              }
              console.log('Trend data:', trendData); // Debug log
              setRevenueData(trendData);
          }
      }
  };

  const getOfferTypeName = (offerType: number): string => {
    switch (offerType) {
      case 0: return 'Early Bird';
      case 1: return 'Student Discount';
      case 2: return 'Group Discount';
      case 3: return 'Senior Discount';
      case 4: return 'Loyalty Discount';
      case 5: return 'Season Pass';
      case 6: return 'Buy One Get One';
      case 7: return 'Percentage Off';
      case 8: return 'Fixed Amount Off';
      default: return 'Unknown';
    }
  };

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '0 RSD';
    }
    return `${amount.toLocaleString('sr-RS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} RSD`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('sr-RS');
  };

  const getActionIcon = (action: string) => {
    switch(action) {
      case 'INSERT': return <CheckCircle size={16} className="text-green-400" />;
      case 'UPDATE': return <AlertTriangle size={16} className="text-yellow-400" />;
      case 'DELETE': return <XCircle size={16} className="text-red-400" />;
      default: return <Activity size={16} className="text-gray-400" />;
    }
  };

  const getActionColor = (action: string) => {
    switch(action) {
      case 'INSERT': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'UPDATE': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'DELETE': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const exportToPdf = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const blob = await RecordedSaleService.exportAnalysisToPdf(
        undefined,
        dateRange.from,
        dateRange.to
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setError(error.message || 'Failed to export PDF');
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const blob = await RecordedSaleService.exportAnalysisToExcel(
        undefined,
        dateRange.from,
        dateRange.to
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_analysis_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error: any) {
      setError(error.message || 'Failed to export Excel');
    } finally {
      setIsLoading(false);
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            kpis={kpis}
            revenueData={revenueData}
            zonePerformance={zonePerformance}
            offerPerformance={offerPerformance}
            formatCurrency={formatCurrency}
            formatPercentage={formatPercentage}
          />
        );
      case 'audit':
        return (
          <AuditTab
            auditLog={auditLog}
            isLoading={isLoading}
            loadAuditLog={loadAuditLog}
            formatCurrency={formatCurrency}
            formatDateTime={formatDateTime}
            getActionIcon={getActionIcon}
            getActionColor={getActionColor}
          />
        );
      case 'performance':
        return (
          <PerformanceTab
            performanceMetrics={performanceMetrics}
            isLoading={isLoading}
            loadPerformanceMetrics={loadPerformanceMetrics}
          />
        );
      case 'pricing':
        return (
          <PricingRulesTab
            pricingRules={pricingRules}
            formatCurrency={formatCurrency}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Header */}
        <AnalyticsHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          isLoading={isLoading}
          exportToPdf={exportToPdf}
          exportToExcel={exportToExcel}
        />

        {/* Tab Navigation */}
        <AnalyticsTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 mb-4">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">✕</button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default Analytics;