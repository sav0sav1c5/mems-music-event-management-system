import React, { useState, useEffect } from 'react';
import { Activity, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { useAnalytics, type LiveAnalytics, type RecentActivity } from '../hooks/useAnalytics';

interface LiveAnalyticsWidgetProps {
  className?: string;
}

const LiveAnalyticsWidget: React.FC<LiveAnalyticsWidgetProps> = ({ className = '' }) => {
  const [liveData, setLiveData] = useState<LiveAnalytics | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  const { getLiveAnalytics, getRecentActivities, loading, error } = useAnalytics();

  const loadLiveData = async () => {
    try {
      setIsOnline(true);
      const [liveAnalytics, activities] = await Promise.all([
        getLiveAnalytics(),
        getRecentActivities(5)
      ]);
      setLiveData(liveAnalytics);
      setRecentActivities(activities);
    } catch (err) {
      console.error('Error loading live data:', err);
      setIsOnline(false);
    }
  };

  useEffect(() => {
    loadLiveData();

    // Refresh every 10 seconds
    const interval = setInterval(loadLiveData, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'NegotiationStarted':
        return <Activity size={16} className="text-blue-500" />;
      case 'PhaseCompleted':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'RequirementFulfilled':
        return <CheckCircle size={16} className="text-green-500" />;
      default:
        return <AlertCircle size={16} className="text-gray-500" />;
    }
  };

  if (loading && !liveData) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !liveData) {
    return (
      <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
        <div className="text-center text-gray-500">
          <AlertCircle className="mx-auto mb-2" size={24} />
          <p className="text-sm">Unable to load live data</p>
          <button
            onClick={loadLiveData}
            className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Live Analytics</h3>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-500">
              {isOnline ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Updated: {formatTime(liveData.timestamp)}
        </p>
      </div>

      {/* Live Metrics */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{liveData.activeNegotiations}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{liveData.todayCompleted}</div>
            <div className="text-xs text-gray-500">Completed Today</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{liveData.todayStarted}</div>
            <div className="text-xs text-gray-500">Started Today</div>
          </div>
        </div>
      </div>

      {/* Current Phase Distribution */}
      <div className="p-4 border-b border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Current Phase Distribution</h4>
        <div className="space-y-2">
          {liveData.currentPhaseDistribution.slice(0, 4).map((phase) => (
            <div key={`${phase.phaseId}-${phase.status}`} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700">{phase.phaseName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">{phase.negotiationCount}</span>
                <span className="text-xs text-gray-500">({phase.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activities</h4>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getActivityIcon(activity.activityType)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {activity.description}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">{activity.performerName}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500">{formatTime(activity.timestamp)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-4">
              <Clock size={24} className="mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No recent activities</p>
            </div>
          )}
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="px-4 py-2 bg-gray-50 text-center">
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-600">Auto-refreshing every 10 seconds</span>
        </div>
      </div>
    </div>
  );
};

export default LiveAnalyticsWidget;