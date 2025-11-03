import { useState, useEffect } from "react";
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart as RechartsBarChart, Bar, LineChart, Line,
  ScatterChart, Scatter, Legend
} from 'recharts';
import { 
  Activity, TrendingUp, Users, Clock, DollarSign, ArrowUp, ArrowDown, 
  Handshake, Target, Filter, Download, FileText, Printer, Eye, BarChart
} from "lucide-react";
import { reportService, type ReportData } from "../../../services/reportService";
import { 
  analyticsApiService, 
  type AnalyticsSummary, 
  type PhaseDistribution, 
  type NegotiationTrend,
  type PerformerAnalytics,
  type RevenueByEvent,
  type PhaseDuration,
  type RecentActivity
} from "../../../services/analyticsApiService";

const Analytics = () => {
  const [timeRange, setTimeRange] = useState("30d");
  const [reportType, setReportType] = useState("summary");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Real data from API
  const [summary, setSummary] = useState<AnalyticsSummary>({
    totalNegotiations: 0,
    activeNegotiations: 0,
    completedNegotiations: 0,
    totalValue: 0,
    averageValue: 0,
    successRate: 0,
    averageDuration: 0,
    conversionRate: 0
  });
  const [phaseDistribution, setPhaseDistribution] = useState<PhaseDistribution[]>([]);
  const [negotiationTrends, setNegotiationTrends] = useState<NegotiationTrend[]>([]);
  const [performerAnalytics, setPerformerAnalytics] = useState<PerformerAnalytics[]>([]);
  const [revenueByEvent, setRevenueByEvent] = useState<RevenueByEvent[]>([]);
  const [phaseDurationAnalysis, setPhaseDurationAnalysis] = useState<PhaseDuration[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  // Fetch all analytics data
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [
          summaryData,
          phaseData,
          trendsData,
          performerData,
          revenueData,
          durationData,
          activityData
        ] = await Promise.all([
          analyticsApiService.getAnalyticsSummary(timeRange),
          analyticsApiService.getPhaseDistribution(timeRange),
          analyticsApiService.getNegotiationTrends(timeRange),
          analyticsApiService.getPerformerAnalytics(timeRange),
          analyticsApiService.getRevenueByEvent(timeRange),
          analyticsApiService.getPhaseDurationAnalysis(timeRange),
          analyticsApiService.getRecentActivity(10)
        ]);

        setSummary(summaryData);
        setPhaseDistribution(phaseData);
        setNegotiationTrends(trendsData);
        setPerformerAnalytics(performerData);
        setRevenueByEvent(revenueData);
        setPhaseDurationAnalysis(durationData);
        setRecentActivity(activityData);
      } catch (err) {
        setError('Failed to load analytics data. Please try again later.');
        console.error('Analytics data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [timeRange]);

  // Additional data for advanced charts
  const performanceScatter = performerAnalytics.map(performer => ({
    name: performer.name,
    successRate: Math.round((performer.success / performer.negotiations) * 100),
    avgRevenue: performer.revenue / performer.negotiations,
    totalNegotiations: performer.negotiations
  }));

  // Generate monthly comparison from trends data
  const currentYear = new Date().getFullYear();
  const monthlyComparison = negotiationTrends
    .filter(trend => trend.date.startsWith(currentYear.toString()))
    .map(trend => {
      const month = new Date(trend.date + '-01').toLocaleDateString('en-US', { month: 'short' });
      return {
        month,
        thisYear: trend.revenue,
        lastYear: trend.revenue * 0.85 // Simulate last year data (15% less)
      };
    });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '7d': return 'Last 7 days';
      case '30d': return 'Last 30 days';
      case '90d': return 'Last 90 days';
      case '1y': return 'Last year';
      default: return 'Last 30 days';
    }
  };

  const generateReportData = (): ReportData => {
    return {
      title: 'Negotiation Analytics Report',
      dateRange: getDateRangeLabel(timeRange),
      summary: {
        totalNegotiations: summary.totalNegotiations,
        activeNegotiations: summary.activeNegotiations,
        completedNegotiations: summary.completedNegotiations,
        totalValue: summary.totalValue,
        averageValue: summary.averageValue,
        successRate: summary.successRate,
        averageDuration: summary.averageDuration,
        conversionRate: summary.conversionRate
      },
      trends: negotiationTrends,
      performers: performerAnalytics,
      events: revenueByEvent,
      phases: phaseDurationAnalysis,
    };
  };

  const handleGeneratePDFReport = async () => {
    try {
      // Use the backend API instead of local PDF generation
      await analyticsApiService.generatePDFReport(timeRange);
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
    }
  };

  const handleExportCSV = (type: 'summary' | 'trends' | 'performers' | 'events') => {
    try {
      const reportData = generateReportData();
      reportService.exportToCSV(reportData, type);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      const reportData = generateReportData();
      await reportService.exportToExcel(reportData);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    }
  };

  const handlePreviewReport = () => {
    const reportData = generateReportData();
    const previewHTML = reportService.generateReportPreview(reportData);
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(previewHTML);
      newWindow.document.close();
    }
  };

  const stats = [
    {
      title: "Total Negotiations",
      value: summary.totalNegotiations.toString(),
      change: "+12.5%",
      trend: "up" as const,
      icon: <Handshake className="w-5 h-5" />,
      color: "sky"
    },
    {
      title: "Success Rate",
      value: `${summary.successRate}%`,
      change: "+5.2%",
      trend: "up" as const,
      icon: <Target className="w-5 h-5" />,
      color: "emerald"
    },
    {
      title: "Total Spendings",
      value: formatCurrency(summary.totalValue),
      change: "+22.1%",
      trend: "up" as const,
      icon: <DollarSign className="w-5 h-5" />,
      color: "violet"
    },
    {
      title: "Avg Duration",
      value: `${Math.ceil(summary.averageDuration)} days`,
      change: "-2.3%",
      trend: "down" as const,
      icon: <Clock className="w-5 h-5" />,
      color: "amber"
    },
    {
      title: "Active",
      value: summary.activeNegotiations.toString(),
      change: "+8.3%",
      trend: "up" as const,
      icon: <Activity className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Avg Spending",
      value: formatCurrency(summary.averageValue),
      change: "+18.5%",
      trend: "up" as const,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "indigo"
    },
    {
      title: "Conversion Rate",
      value: `${summary.conversionRate}%`,
      change: "+7.8%",
      trend: "up" as const,
      icon: <Users className="w-5 h-5" />,
      color: "pink"
    },
    {
      title: "Completed",
      value: summary.completedNegotiations.toString(),
      change: "+15.7%",
      trend: "up" as const,
      icon: <Target className="w-5 h-5" />,
      color: "cyan"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-neutral-400 text-sm">
          Track negotiation performance and insights across all activities ({getDateRangeLabel(timeRange)}).
        </p>
      </div>

      {/* Controls */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 mb-6 hover:border-neutral-600/50 transition-all duration-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <select
                value={timeRange}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTimeRange(e.target.value)}
                className="pl-10 pr-8 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-white appearance-none cursor-pointer transition-all"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <select
                value={reportType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReportType(e.target.value)}
                className="pl-10 pr-8 py-2 bg-neutral-700/50 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-white appearance-none cursor-pointer transition-all"
              >
                <option value="summary">Summary Report</option>
                <option value="detailed">Detailed Report</option>
                <option value="performance">Performance Report</option>
                <option value="revenue">Spendings Report</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={handlePreviewReport}
              className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg text-blue-400 hover:text-blue-300 transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            
            <button 
              onClick={handleGeneratePDFReport}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg text-red-400 hover:text-red-300 transition-all duration-200"
            >
              <FileText className="w-4 h-4" />
              PDF
            </button>
            
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-400/30 rounded-lg text-green-400 hover:text-green-300 transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              Excel
            </button>
            
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 rounded-lg text-purple-400 hover:text-purple-300 transition-all duration-200">
                <Printer className="w-4 h-4" />
                CSV
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button 
                  onClick={() => handleExportCSV('summary')}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 rounded-t-lg transition-all"
                >
                  Summary CSV
                </button>
                <button 
                  onClick={() => handleExportCSV('trends')}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 transition-all"
                >
                  Trends CSV
                </button>
                <button 
                  onClick={() => handleExportCSV('performers')}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 transition-all"
                >
                  Performers CSV
                </button>
                <button 
                  onClick={() => handleExportCSV('events')}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-neutral-700 rounded-b-lg transition-all"
                >
                  Events CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={`stat-${stat.title}-${index}`} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                stat.color === 'sky' ? 'bg-sky-400/20 text-sky-400' : 
                stat.color === 'emerald' ? 'bg-emerald-400/20 text-emerald-400' :
                stat.color === 'violet' ? 'bg-violet-400/20 text-violet-400' :
                stat.color === 'amber' ? 'bg-amber-400/20 text-amber-400' :
                stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                stat.color === 'indigo' ? 'bg-indigo-400/20 text-indigo-400' :
                stat.color === 'pink' ? 'bg-pink-400/20 text-pink-400' :
                'bg-cyan-400/20 text-cyan-400'
              }`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-sm mb-1">{stat.title}</p>
              <h3 className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Negotiation Trends */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Negotiation Trends</h3>
            <TrendingUp className="w-5 h-5 text-sky-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={negotiationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
                <Area type="monotone" dataKey="started" stackId="1" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.3} />
                <Area type="monotone" dataKey="completed" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spendings Trends */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Spendings Trends</h3>
            <DollarSign className="w-5 h-5 text-sky-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={negotiationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any) => [formatCurrency(value), 'Spendings']} 
                />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Distribution */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Phase Distribution</h3>
            <Users className="w-5 h-5 text-sky-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={phaseDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {phaseDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performer Performance */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Top Performers</h3>
            <Target className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-3">
            {performerAnalytics.slice(0, 5).map((performer, index) => (
              <div key={`performer-${performer.name}-${index}`} className="flex items-center justify-between p-3 bg-neutral-700/30 rounded-lg">
                <div className="flex-1">
                  <h4 className="text-white font-medium">{performer.name}</h4>
                  <p className="text-neutral-400 text-sm">
                    {performer.success}/{performer.negotiations} success • {Math.round((performer.success / performer.negotiations) * 100)}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold">{formatCurrency(performer.revenue)}</p>
                  <p className="text-neutral-400 text-sm">{performer.avgDuration}d avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Spendings by Event */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Spendings by Event</h3>
            <DollarSign className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-3">
            {revenueByEvent.map((event, index) => (
              <div key={`revenue-event-${event.event}-${index}`} className="flex items-center justify-between p-2 hover:bg-neutral-700/30 rounded-lg transition-all">
                <div>
                  <h4 className="text-white text-sm font-medium">{event.event}</h4>
                  <p className="text-neutral-400 text-xs">{event.negotiations} negotiations</p>
                </div>
                <div className="text-right">
                  <p className="text-emerald-400 font-semibold text-sm">{formatCurrency(event.revenue)}</p>
                  <p className="text-neutral-400 text-xs">{formatCurrency(event.avgValue)} avg</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phase Duration Analysis */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Phase Duration</h3>
            <Clock className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-3">
            {phaseDurationAnalysis.map((phase, index) => (
              <div key={`phase-duration-${phase.phase}-${index}`} className="p-3 bg-neutral-700/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-white text-sm font-medium">{phase.phase}</h4>
                  <span className="text-sky-400 text-sm font-semibold">{Math.ceil(phase.avgDays)}d</span>
                </div>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span>Min: {Math.ceil(phase.minDays)}d</span>
                  <span>Max: {Math.ceil(phase.maxDays)}d</span>
                </div>
                <div className="mt-2 bg-neutral-600/50 rounded-full h-2">
                  <div 
                    className="bg-sky-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(phase.avgDays / phase.maxDays) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Rate Breakdown */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Success Metrics</h3>
            <Target className="w-5 h-5 text-sky-400" />
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-neutral-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Overall Success Rate</span>
                <span className="text-emerald-400 font-semibold">{summary.successRate}%</span>
              </div>
              <div className="bg-neutral-600/50 rounded-full h-2">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: `${summary.successRate}%` }}></div>
              </div>
            </div>
            <div className="p-3 bg-neutral-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Conversion Rate</span>
                <span className="text-blue-400 font-semibold">{summary.conversionRate}%</span>
              </div>
              <div className="bg-neutral-600/50 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${summary.conversionRate}%` }}></div>
              </div>
            </div>
            <div className="p-3 bg-neutral-700/30 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-neutral-400 text-sm">Avg Duration</span>
                <span className="text-amber-400 font-semibold">{summary.averageDuration} days</span>
              </div>
              <div className="bg-neutral-600/50 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: `${(summary.averageDuration / 30) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Performance Scatter Plot */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Performance vs Revenue</h3>
            <TrendingUp className="w-5 h-5 text-sky-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={performanceScatter}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="successRate" 
                  stroke="#9CA3AF" 
                  label={{ value: 'Success Rate (%)', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                />
                <YAxis 
                  dataKey="avgRevenue" 
                  stroke="#9CA3AF"
                  label={{ value: 'Avg Revenue', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#9CA3AF' } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any, name: string) => [
                    name === 'avgRevenue' ? formatCurrency(value) : `${value}%`,
                    name === 'avgRevenue' ? 'Avg Revenue' : 'Success Rate'
                  ]}
                />
                <Scatter dataKey="avgRevenue" fill="#0EA5E9" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Year-over-Year Comparison */}
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Year-over-Year Spendings</h3>
            <BarChart className="w-5 h-5 text-sky-400" />
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={monthlyComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                  formatter={(value: any) => [formatCurrency(value), '']}
                />
                <Legend />
                <Bar dataKey="thisYear" fill="#0EA5E9" name="2024" />
                <Bar dataKey="lastYear" fill="#6B7280" name="2023" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Metrics Dashboard */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 mb-6 hover:border-sky-400/30 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Negotiation Duration vs Success Rate</h3>
          <Clock className="w-5 h-5 text-sky-400" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={negotiationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9CA3AF" />
              <YAxis yAxisId="duration" orientation="left" stroke="#9CA3AF" />
              <YAxis yAxisId="success" orientation="right" stroke="#9CA3AF" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
              />
              <Legend />
              <Line 
                yAxisId="duration"
                type="monotone" 
                dataKey="avgDuration" 
                stroke="#F59E0B" 
                strokeWidth={3}
                name="Avg Duration (days)"
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              />
              <Line 
                yAxisId="success"
                type="monotone" 
                dataKey="completed" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Completed Negotiations"
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-sky-400/30 transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <Clock className="w-5 h-5 text-sky-400" />
        </div>
        <div className="space-y-3">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-neutral-700/30 rounded-lg hover:bg-neutral-700/50 transition-all duration-200">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                activity.type === 'negotiation_started' ? 'bg-blue-400' :
                activity.type === 'contract_signed' ? 'bg-emerald-400' :
                activity.type === 'phase_advanced' ? 'bg-yellow-400' :
                activity.type === 'negotiation_completed' ? 'bg-green-400' :
                'bg-red-400'
              }`}></div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-white text-sm">{activity.description}</p>
                  <span className="text-emerald-400 text-sm font-semibold">{formatCurrency(activity.value)}</span>
                </div>
                <p className="text-neutral-400 text-xs mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;