import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, Area, AreaChart 
} from 'recharts';
import { Activity, TrendingUp, Users, Clock, DollarSign } from 'lucide-react';
import { useAnalytics, type AnalyticsFilter, type DashboardSummary, type PhaseDistribution, type NegotiationTrend, type PerformerAnalytics } from '../hooks/useAnalytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {change && <p className="text-sm text-green-600">{change}</p>}
      </div>
      <div className="text-gray-400" style={{ color }}>
        {icon}
      </div>
    </div>
  </div>
);

interface FilterPanelProps {
  filter: AnalyticsFilter;
  onFilterChange: (filter: AnalyticsFilter) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filter, onFilterChange }) => {
  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    onFilterChange({ ...filter, [field]: value });
  };

  const handleGroupByChange = (groupBy: 'day' | 'week' | 'month') => {
    onFilterChange({ ...filter, groupBy });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <h3 className="text-lg font-semibold mb-4">Filters</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={filter.startDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={filter.endDate || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDateChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
          <select
            value={filter.groupBy || 'week'}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleGroupByChange(e.target.value as 'day' | 'week' | 'month')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={() => onFilterChange({})}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const AnalyticsDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [phaseDistribution, setPhaseDistribution] = useState<PhaseDistribution[]>([]);
  const [negotiationTrends, setNegotiationTrends] = useState<NegotiationTrend[]>([]);
  const [performerAnalytics, setPerformerAnalytics] = useState<PerformerAnalytics | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [filter, setFilter] = useState<AnalyticsFilter>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0], // today
    groupBy: 'week'
  });

  const { 
    loading, 
    error, 
    getDashboardSummary, 
    getPhaseDistribution, 
    getNegotiationTrends, 
    getPerformerAnalytics 
  } = useAnalytics();

  const loadDashboardData = async () => {
    try {
      const [summaryData, phaseData, trendsData, performerData] = await Promise.all([
        getDashboardSummary(filter),
        getPhaseDistribution(filter),
        getNegotiationTrends(filter),
        getPerformerAnalytics(filter)
      ]);

      setSummary(summaryData);
      setPhaseDistribution(phaseData);
      setNegotiationTrends(trendsData);
      setPerformerAnalytics(performerData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filter]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, filter]);

  const handleRefresh = () => {
    loadDashboardData();
  };

  if (loading && !summary) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading analytics</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
            <div className="mt-4">
              <button
                onClick={handleRefresh}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Negotiation Workflow Analysis</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Auto Refresh:</label>
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Activity size={16} />
              <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Filters */}
        <FilterPanel filter={filter} onFilterChange={setFilter} />

        {/* Metric Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
              title="Total Negotiations"
              value={summary.totalNegotiations}
              icon={<Users size={24} />}
              color="#3B82F6"
            />
            <MetricCard
              title="Active Negotiations"
              value={summary.activeNegotiations}
              change={`+${summary.todayStarted} today`}
              icon={<TrendingUp size={24} />}
              color="#10B981"
            />
            <MetricCard
              title="Avg. Duration"
              value={`${Math.ceil(summary.averageDuration)} days`}
              icon={<Clock size={24} />}
              color="#F59E0B"
            />
            <MetricCard
              title="Total Value"
              value={`$${summary.totalProposedValue.toLocaleString()}`}
              icon={<DollarSign size={24} />}
              color="#8B5CF6"
            />
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Phase Distribution Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Workflow State Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={phaseDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(props: any) => `${props.phaseName}: ${props.percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="negotiationCount"
                >
                  {phaseDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Negotiation Trends */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Negotiation Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={negotiationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value: any) => new Date(value).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(value: any) => new Date(value).toLocaleDateString()}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="startedNegotiations"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                  name="Started"
                />
                <Area
                  type="monotone"
                  dataKey="completedNegotiations"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  name="Completed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase Performance Table */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">Phase Performance Analysis</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Count
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {phaseDistribution.map((phase) => (
                  <tr key={`${phase.phaseId}-${phase.status}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {phase.phaseName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {phase.negotiationCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${Math.min(phase.percentage, 100)}%` }}
                          ></div>
                        </div>
                        {phase.percentage}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        phase.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        phase.status === 'InProgress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {phase.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Performer Analytics */}
        {performerAnalytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Top Performers by Success Rate</h3>
              <div className="space-y-3">
                {performerAnalytics.performerPerformance.slice(0, 5).map((performer) => (
                  <div key={performer.performerId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{performer.performerName}</p>
                      <p className="text-sm text-gray-600">{performer.genre}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{performer.successRate}%</p>
                      <p className="text-sm text-gray-600">{performer.totalNegotiations} negotiations</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Genre Performance */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Performance by Genre</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performerAnalytics.genreAnalytics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="genre" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="averageSuccessRate" fill="#8884d8" name="Success Rate %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;