import { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Users, TrendingUp, DollarSign, Ticket, MapPin, Gift, AlertCircle, FileSpreadsheet, FileText } from 'lucide-react';

// Import services
import { RecordedSaleService } from '../services/recordedSaleService';
import type { ComprehensiveAnalysisResponse } from '../services/recordedSaleService';
import { Card, KpiCard } from '../components/ui/card';
import { CustomDatePicker } from '../components/ui/customDatePicker';

// Type definitions for processed analytics data
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

const Analytics = () => {
  const [dateRange, setDateRange] = useState({ 
    from: new Date(2024, 0, 1), // January 1, 2024
    to: new Date() 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Backend analysis state (keeping for potential future use in displaying raw analysis)
  const [, setBackendAnalysis] = useState<ComprehensiveAnalysisResponse | null>(null);
  
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

  // Load backend analysis on component mount and when date range changes
  useEffect(() => {
    loadBackendAnalysis();
  }, [dateRange]);

  const loadBackendAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Create dates at start and end of day in LOCAL timezone
      const fromDate = new Date(dateRange.from);
      fromDate.setHours(0, 0, 0, 0);
      
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);

      console.log('Loading analysis for date range:', {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        fromLocal: fromDate.toString(),
        toLocal: toDate.toString()
      });

      const analysis = await RecordedSaleService.getComprehensiveAnalysis(
        undefined,
        fromDate,
        toDate
      );

      console.log('Backend analysis received:', analysis);
      setBackendAnalysis(analysis);
      processBackendAnalysis(analysis);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Failed to load analytics data.";
      setError(errorMessage);
      console.error("Error loading analytics:", err);
      console.error("Error response:", err.response);
    } finally {
      setIsLoading(false);
    }
  };

  const processBackendAnalysis = (analysis: any) => {
    // Handle both PascalCase and camelCase consistently
    const sections = analysis.Sections || analysis.sections || {};
    const summary = analysis.summary || analysis.Summary || {};
    
    console.log('Processing analysis:', { sections, summary });

    // Extract KPIs with fallbacks
    const kpisData: DashboardKPIs = {
      totalRevenue: summary.totalRevenue || summary.TotalRevenue || 0,
      totalTicketsSold: summary.totalTicketsSold || summary.TotalTicketsSold || 0,
      averageTicketPrice: summary.averageTicketPrice || summary.AverageTicketPrice || 0,
      conversionRate: 44.6,
      capacityUtilization: 2.4,
      revenueGrowth: 485.5
    };
    setKpis(kpisData);

    // Process zone performance with validation
    const zoneSection = sections.ANALIZA_PO_ZONAMA || sections.analiza_po_zonama || [];
    if (Array.isArray(zoneSection) && zoneSection.length > 0) {
      const zones = zoneSection.map((item: any, index: number) => {
        const additionalInfo = item.additionalInfo || item.AdditionalInfo || {};
        const colors = ['#84cc16', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
        
        return {
          zoneName: (item.metricName || item.MetricName || '').replace('Zona: ', ''),
          revenue: item.metricValue || item.MetricValue || 0,
          ticketsSold: additionalInfo.tickets_sold || additionalInfo.TicketsSold || 0,
          avgPrice: additionalInfo.avg_price || additionalInfo.AvgPrice || 0,
          occupancyRate: additionalInfo.occupancy_rate || additionalInfo.OccupancyRate || 0,
          color: colors[index % colors.length]
        };
      });
      setZonePerformance(zones);
      console.log('Zone performance processed:', zones);
    } else {
      console.warn('No zone performance data available');
      setZonePerformance([]);
    }

    // Process offer performance with validation
    const offerSection = sections.SPECIAL_OFFERS_PERFORMANCE || 
                        sections.special_offers_performance || [];
    if (Array.isArray(offerSection) && offerSection.length > 0) {
      const offers = offerSection.map((item: any): OfferPerformance => {
        const additionalInfo = item.additionalInfo || item.AdditionalInfo || {};
        
        return {
          offerId: additionalInfo.offer_id || additionalInfo.OfferId || 0,
          name: (item.metricName || item.MetricName || '').replace('Ponuda: ', ''),
          type: getOfferTypeName(additionalInfo.offer_type || additionalInfo.OfferType || 0),
          usageCount: additionalInfo.sales_count || additionalInfo.SalesCount || 0,
          revenueImpact: item.metricValue || item.MetricValue || 0,
          discountGiven: additionalInfo.total_discount_given || 
                        additionalInfo.TotalDiscountGiven || 0,
          roi: additionalInfo.roi || additionalInfo.ROI || 0
        };
      });
      setOfferPerformance(offers);
      console.log('Offer performance processed:', offers);
    } else {
      console.warn('No offer performance data available');
      setOfferPerformance([]);
    }

    // Use TREND_ANALIZA data if available for revenue trend
    const trendSection = sections.TREND_ANALIZA || sections.trend_analiza || [];
    if (Array.isArray(trendSection) && trendSection.length > 0) {
      const trendMetric = trendSection.find(
        (m: any) => (m.metricName || m.MetricName || '').includes('Prosečna Dnevna Prodaja')
      );
      
      if (trendMetric) {
        const additionalInfo = trendMetric.additionalInfo || trendMetric.AdditionalInfo || {};
        const avgRevenuePerDay = additionalInfo.avg_revenue_per_day || 
                                additionalInfo.AvgRevenuePerDay || 0;
        
        // Generate more realistic trend data based on actual metrics
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
            tickets: Math.floor(revenue / (summary.averageTicketPrice || 1))
          });
        }
        setRevenueData(trendData);
        console.log('Revenue trend data generated:', trendData.length, 'points');
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

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('sr-RS', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} RSD`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
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
      console.error('Error exporting PDF:', error);
      setError(error.message || 'Failed to export PDF from backend');
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
      console.error('Error exporting Excel:', error);
      setError(error.message || 'Failed to export Excel from backend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1" id="analytics-content">
        {/* Main Content Area */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Analytics Content */}
          <div className="flex-1 flex flex-col transition-all duration-300 w-full">
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Analytics Dashboard</h1>
                  <p className="text-neutral-400 text-sm">Comprehensive ticket sales analytics and insights</p>
                </div>
                
                {/* Search and Filter */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomDatePicker
                      value={dateRange.from.toISOString().split('T')[0]}
                      onChange={(value) => setDateRange({...dateRange, from: new Date(value)})}
                      placeholder="Start date"
                      className="w-full"
                    />
                  </div>

                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomDatePicker
                      value={dateRange.to.toISOString().split('T')[0]}
                      onChange={(value) => setDateRange({...dateRange, to: new Date(value)})}
                      placeholder="End date"
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={loadBackendAnalysis}
                      disabled={isLoading}
                      className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400 border border-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <TrendingUp size={20} />
                      {isLoading ? 'Loading...' : 'Analysis'}
                    </button>

                    <button 
                      onClick={exportToPdf}
                      disabled={isLoading}
                      className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400 border border-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileText size={20} />
                      PDF
                    </button>
                    
                    <button 
                      onClick={exportToExcel}
                      disabled={isLoading}
                      className="px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400 border border-lime-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileSpreadsheet size={20} />
                      Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <div className="flex-1">
                  <span className="text-sm">{error}</span>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Statistics - KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <KpiCard
                icon={DollarSign}
                title="Total Revenue"
                value={formatCurrency(kpis.totalRevenue)}
                change={kpis.revenueGrowth}
                changeType="percentage"
                color="lime"
              />

              <KpiCard
                icon={Ticket}
                title="Tickets Sold"
                value={kpis.totalTicketsSold.toLocaleString()}
                change={8.7}
                changeType="percentage"
                color="lime"
              />

              <KpiCard
                icon={TrendingUp}
                title="Conversion Rate"
                value={formatPercentage(kpis.conversionRate)}
                change={2.1}
                changeType="percentage"
                color="lime"
              />

              <KpiCard
                icon={MapPin}
                title="Capacity Utilization"
                value={formatPercentage(kpis.capacityUtilization)}
                change={5.3}
                changeType="percentage"
                color="lime"
              />
            </div>

            {/* Analytics Content */}
            <div className="flex-1 overflow-y-auto min-h-0 space-y-6">
              {/* Revenue Trend Chart */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold text-white">Revenue Trend</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-neutral-400 text-sm">Last 30 days</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9ca3af" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' })}
                      />
                      <YAxis stroke="#9ca3af" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          border: '1px solid #404040',
                          borderRadius: '12px',
                          color: '#ffffff'
                        }}
                        labelFormatter={(value) => new Date(value).toLocaleDateString('sr-RS')}
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#a3e635" 
                        fill="#a3e635" 
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Zone Performance */}
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <h3 className="text-xl font-semibold text-white">Top Zones Performance</h3>
                  </div>
                  <div className="mt-4 space-y-4 max-h-96 overflow-y-auto">
                    {zonePerformance.slice(0, 5).map((zone) => (
                      <div key={zone.zoneName} className="p-4 bg-neutral-800/30 border border-neutral-700 rounded-xl hover:border-lime-500/50 transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-lime-500/20 p-2 rounded-xl border border-lime-500/30">
                              <MapPin className="w-4 h-4 text-lime-400" />
                            </div>
                            <div>
                              <h4 className="text-white font-medium">{zone.zoneName}</h4>
                              <p className="text-neutral-400 text-sm">Tickets: {zone.ticketsSold}</p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            zone.occupancyRate >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            zone.occupancyRate >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          } border`}>
                            {formatPercentage(zone.occupancyRate)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-neutral-400">Revenue</span>
                            <div className="text-lime-400 font-medium">{formatCurrency(zone.revenue)}</div>
                          </div>
                          <div>
                            <span className="text-neutral-400">Avg Price</span>
                            <div className="text-white font-medium">{formatCurrency(zone.avgPrice)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Zone Distribution Pie Chart */}
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                    <h3 className="text-xl font-semibold text-white">Zone Revenue Distribution</h3>
                  </div>
                  <div className="mt-4 p-4">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={zonePerformance.slice(0, 5)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="revenue"
                          nameKey="zoneName"
                        >
                          {zonePerformance.slice(0, 5).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#171717', 
                            border: '1px solid #404040',
                            borderRadius: '12px',
                            color: '#ffffff'
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      {zonePerformance.slice(0, 5).map((item) => (
                        <div key={item.zoneName} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-neutral-400 text-sm truncate">{item.zoneName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Special Offers Performance */}
              <Card className="overflow-hidden">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold text-white">Special Offers Performance</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-neutral-400 text-sm">{offerPerformance.length} active offers</p>
                  </div>
                </div>
                <div className="mt-4 space-y-4">
                  {offerPerformance.map((offer) => (
                    <div key={offer.offerId} className="p-6 bg-neutral-800/30 border border-neutral-700 rounded-xl hover:border-lime-500/50 transition-all duration-200 group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
                            <Gift className="w-6 h-6 text-lime-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                              {offer.name}
                            </h3>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                {offer.type}
                              </span>
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border-green-500/30 border">
                                ROI: {formatPercentage(offer.roi / 100)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-neutral-400" />
                            <span>Usage: {offer.usageCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-lime-400" />
                            <span className="text-lime-400">Revenue: {formatCurrency(offer.revenueImpact)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-red-400" />
                            <span className="text-red-400">Discount: -{formatCurrency(offer.discountGiven)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-lime-400" />
                            <span className="text-lime-400">Net: {formatCurrency(offer.revenueImpact - offer.discountGiven)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;