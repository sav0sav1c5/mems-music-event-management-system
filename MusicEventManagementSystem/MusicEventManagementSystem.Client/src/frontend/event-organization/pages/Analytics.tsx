import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, PlaySquare, ListChecks, Briefcase, BarChart3 } from 'lucide-react';
import { Card } from '../../shared/components/ui/card';
import { eventService } from '../services/eventService';
import type { Event } from '../services/eventService';
import { performanceService } from '../services/performanceService';
import type { Performance } from '../services/performanceService';
import { workTaskService } from '../services/workTaskService';
import type { WorkTask } from '../services/workTaskService';
import { resourceService } from '../services/resourceService';
import type { Resource } from '../services/resourceService';

const Analytics = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const [eventsData, performancesData, workTasksData, resourcesData] = await Promise.all([
        eventService.getAllEvents(),
        performanceService.getAllPerformances(),
        workTaskService.getAllWorkTasks(),
        resourceService.getAllResources()
      ]);
      
      setEvents(eventsData || []);
      setPerformances(performancesData || []);
      setWorkTasks(workTasksData || []);
      setResources(resourcesData || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      // Set empty arrays as fallback
      setEvents([]);
      setPerformances([]);
      setWorkTasks([]);
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalEvents = events.length;
    const activeEvents = events.filter(e => e.status === 'IN PROGRESS' || e.status === 'PLANNED').length;
    const completedEvents = events.filter(e => e.status === 'COMPLETED').length;
    const cancelledEvents = events.filter(e => e.status === 'CANCELLED').length;
    
    const totalPerformances = performances.length;
    const activePerformances = performances.filter(p => p.status === 'PLANNED' || p.status === 'IN PROGRESS').length;
    
    const totalTasks = workTasks.length;
    const completedTasks = workTasks.filter(t => t.status === 'COMPLETED').length;
    const pendingTasks = workTasks.filter(t => t.status === 'PENDING').length;
    const taskCompletionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : '0';
    
    const totalResources = resources.length;
    const availableResources = resources.filter(r => r.status === 'AVAILABLE').length;
    
    // Safe resource utilization calculation
    const totalResourceQuantity = resources.reduce((acc, r) => acc + (Number(r.quantity) || 0), 0);
    const usedResourceQuantity = resources.reduce((acc, r) => {
      const quantity = Number(r.quantity) || 0;
      const available = Number(r.available) || 0;
      return acc + Math.max(0, quantity - available);
    }, 0);
    
    const resourceUtilization = totalResourceQuantity > 0 
      ? ((usedResourceQuantity / totalResourceQuantity) * 100).toFixed(1)
      : '0';

    return {
      totalEvents,
      activeEvents,
      completedEvents,
      cancelledEvents,
      totalPerformances,
      activePerformances,
      totalTasks,
      completedTasks,
      pendingTasks,
      taskCompletionRate,
      totalResources,
      availableResources,
      resourceUtilization
    };
  };

  const getEventStatusBreakdown = () => {
    const statusCounts = events.reduce((acc, event) => {
      const status = event.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return statusCounts;
  };

  const getResourceTypeBreakdown = () => {
    const typeCounts = resources.reduce((acc, resource) => {
      const type = resource.type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return typeCounts;
  };

  const getTaskStatusBreakdown = () => {
    const statusCounts = workTasks.reduce((acc, task) => {
      const status = task.status || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return statusCounts;
  };

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Analytics</h1>
          <p className="text-neutral-400">
            Performance insights and statistics
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-neutral-700 rounded w-1/2 mb-4"></div>
              <div className="h-32 bg-neutral-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = calculateStats();
  const eventStatusBreakdown = getEventStatusBreakdown();
  const resourceTypeBreakdown = getResourceTypeBreakdown();
  const taskStatusBreakdown = getTaskStatusBreakdown();

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-neutral-400">
          Performance insights and statistics
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Total Events</p>
              <p className="text-2xl font-bold text-white">{stats.totalEvents}</p>
              <p className="text-pink-400 text-sm">{stats.activeEvents} active</p>
            </div>
            <div className="p-3 bg-pink-400/20 rounded-xl">
              <Calendar className="w-6 h-6 text-pink-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Performances</p>
              <p className="text-2xl font-bold text-white">{stats.totalPerformances}</p>
              <p className="text-purple-400 text-sm">{stats.activePerformances} active</p>
            </div>
            <div className="p-3 bg-purple-400/20 rounded-xl">
              <PlaySquare className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Task Completion</p>
              <p className="text-2xl font-bold text-white">{stats.taskCompletionRate}%</p>
              <p className="text-green-400 text-sm">{stats.completedTasks} completed</p>
            </div>
            <div className="p-3 bg-green-400/20 rounded-xl">
              <ListChecks className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Available Resources</p>
              <p className="text-2xl font-bold text-white">{stats.availableResources}</p>
              <p className="text-blue-400 text-sm">of {stats.totalResources} total</p>
            </div>
            <div className="p-3 bg-blue-400/20 rounded-xl">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Resource Usage</p>
              <p className="text-2xl font-bold text-white">{stats.resourceUtilization}%</p>
              <p className="text-orange-400 text-sm">utilization</p>
            </div>
            <div className="p-3 bg-orange-400/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Event Status Breakdown */}
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Event Status</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(eventStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'COMPLETED' ? 'bg-green-400' :
                    status === 'IN PROGRESS' ? 'bg-yellow-400' :
                    status === 'PLANNED' ? 'bg-blue-400' :
                    status === 'CANCELLED' ? 'bg-red-400' : 'bg-neutral-400'
                  }`}></div>
                  <span className="text-neutral-300 text-sm">{status}</span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Task Status Breakdown */}
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Task Status</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(taskStatusBreakdown).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    status === 'COMPLETED' ? 'bg-green-400' :
                    status === 'IN PROGRESS' ? 'bg-yellow-400' :
                    status === 'PENDING' ? 'bg-orange-400' : 'bg-neutral-400'
                  }`}></div>
                  <span className="text-neutral-300 text-sm">{status}</span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Resource Type Breakdown */}
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Resource Types</h3>
          </div>
          <div className="space-y-3">
            {Object.entries(resourceTypeBreakdown).map(([type, count]) => (
              <div key={type} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    type === 'Equipment' ? 'bg-blue-400' :
                    type === 'Staff' ? 'bg-green-400' :
                    type === 'Vehicle' ? 'bg-yellow-400' :
                    type === 'Infrastructure' ? 'bg-purple-400' :
                    type === 'Services' ? 'bg-orange-400' : 'bg-neutral-400'
                  }`}></div>
                  <span className="text-neutral-300 text-sm">{type}</span>
                </div>
                <span className="text-white font-medium">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Event Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
              <div className="text-2xl font-bold text-green-400">{stats.completedEvents}</div>
              <div className="text-sm text-neutral-400">Completed</div>
            </div>
            <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-400">{stats.activeEvents}</div>
              <div className="text-sm text-neutral-400">Active</div>
            </div>
            <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
              <div className="text-2xl font-bold text-red-400">{stats.cancelledEvents}</div>
              <div className="text-sm text-neutral-400">Cancelled</div>
            </div>
            <div className="text-center p-4 bg-neutral-800/50 rounded-lg">
              <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
              <div className="text-sm text-neutral-400">Total</div>
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Task Completion Rate</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-neutral-800 rounded-full">
                  <div 
                    className="h-2 bg-green-400 rounded-full transition-all duration-300"
                    style={{ width: `${stats.taskCompletionRate}%` }}
                  ></div>
                </div>
                <span className="text-green-400 font-medium">{stats.taskCompletionRate}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Resource Utilization</span>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-neutral-800 rounded-full">
                  <div 
                    className="h-2 bg-orange-400 rounded-full transition-all duration-300"
                    style={{ width: `${stats.resourceUtilization}%` }}
                  ></div>
                </div>
                <span className="text-orange-400 font-medium">{stats.resourceUtilization}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Active Performances</span>
              <span className="text-purple-400 font-medium">{stats.activePerformances} of {stats.totalPerformances}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-neutral-400">Pending Tasks</span>
              <span className="text-orange-400 font-medium">{stats.pendingTasks}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;