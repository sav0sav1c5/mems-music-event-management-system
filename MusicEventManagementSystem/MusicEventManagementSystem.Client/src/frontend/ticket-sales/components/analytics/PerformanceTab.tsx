import { Card } from '../../components/ui/card';
import { RefreshCw, Activity } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface PerformanceMetric {
  testName: string;
  executionTimeMs: number;
  rowsReturned: number;
  indexUsed: boolean;
}

interface PerformanceTabProps {
  performanceMetrics: PerformanceMetric[];
  isLoading: boolean;
  loadPerformanceMetrics: () => void;
}

export const PerformanceTab = ({
  performanceMetrics,
  isLoading,
  loadPerformanceMetrics
}: PerformanceTabProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-white">Database Performance Metrics</h3>
            <p className="text-neutral-400 text-sm mt-1">Index usage and query execution times</p>
          </div>
          <button 
            onClick={loadPerformanceMetrics}
            disabled={isLoading}
            className="px-4 py-2 bg-lime-500 text-black rounded-lg hover:bg-lime-400 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        {performanceMetrics.length === 0 && !isLoading && (
          <div className="text-center py-12 text-neutral-400">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p>No performance metrics available</p>
          </div>
        )}

        <div className="space-y-4">
          {performanceMetrics.map((metric, index) => (
            <div key={index} className="p-6 bg-neutral-800/30 border border-neutral-700 rounded-xl">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl border ${
                    metric.executionTimeMs < 5 
                      ? 'bg-green-500/20 border-green-500/30' 
                      : metric.executionTimeMs < 10 
                        ? 'bg-yellow-500/20 border-yellow-500/30'
                        : 'bg-red-500/20 border-red-500/30'
                  }`}>
                    <Activity className={`w-6 h-6 ${
                      metric.executionTimeMs < 5 
                        ? 'text-green-400' 
                        : metric.executionTimeMs < 10 
                          ? 'text-yellow-400'
                          : 'text-red-400'
                    }`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{metric.testName}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                        metric.indexUsed 
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : 'bg-red-500/20 text-red-400 border-red-500/30'
                      }`}>
                        {metric.indexUsed ? 'Index Used ✓' : 'No Index ✗'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <span className="text-neutral-400 text-sm">Execution Time</span>
                  <div className={`text-2xl font-bold mt-1 ${
                    metric.executionTimeMs < 5 
                      ? 'text-green-400' 
                      : metric.executionTimeMs < 10 
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}>
                    {metric.executionTimeMs.toFixed(2)}ms
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 text-sm">Rows Returned</span>
                  <div className="text-2xl font-bold text-white mt-1">
                    {metric.rowsReturned.toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-neutral-400 text-sm">Performance</span>
                  <div className="text-2xl font-bold text-lime-400 mt-1">
                    {metric.executionTimeMs < 5 ? 'Excellent' : metric.executionTimeMs < 10 ? 'Good' : 'Fair'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Performance Chart */}
      {performanceMetrics.length > 0 && (
        <Card>
          <h3 className="text-xl font-semibold text-white mb-4">Execution Time Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={performanceMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis 
                dataKey="testName" 
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis stroke="#9ca3af" label={{ value: 'ms', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #404040',
                  borderRadius: '12px'
                }}
                formatter={(value: number) => [`${value.toFixed(2)}ms`, 'Execution Time']}
              />
              <Bar dataKey="executionTimeMs" fill="#a3e635" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
};