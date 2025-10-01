// const EventOrgDashboard = () => {
//   return (
//     <div className="text-white h-full flex flex-col">
//       {/* Header */}
//       <div className="mb-4">
//         <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
//         <p className="text-neutral-400 text-sm">
//           Welcome back! Here's what's happening with your events.
//         </p>
//       </div>

//       {/* Stats Grid */}
      
//     </div>
//   );
// };

// export default EventOrgDashboard;
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, PlaySquare, ListChecks, Briefcase, PieChart, Plus, TrendingUp, Users, Clock, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Card } from '../../shared/components/ui/card';
import { Button } from '../../shared/components/ui/button';
import { eventService } from '../services/eventService';
import type { Event } from '../services/eventService';
import { performanceService } from '../services/performanceService';
import type { Performance } from '../services/performanceService';
import { workTaskService } from '../services/workTaskService';
import type { WorkTask } from '../services/workTaskService';
import { resourceService } from '../services/resourceService';
import type { Resource } from '../services/resourceService';
import type { EventStatus } from '../../shared/types/enums';
import type { PerformanceStatus } from '../../shared/types/enums';
import type { WorkTaskStatus } from '../../shared/types/enums';

const EventOrgDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalPerformances: 0,
    completedTasks: 0,
    pendingTasks: 0,
    availableResources: 0
  });
  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [upcomingPerformances, setUpcomingPerformances] = useState<Performance[]>([]);
  const [pendingTasks, setPendingTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data
      const [events, performances, workTasks, resources] = await Promise.all([
        eventService.getAllEvents(),
        performanceService.getAllPerformances(),
        workTaskService.getAllWorkTasks(),
        resourceService.getAllResources()
      ]);

      // Calculate stats
      const activeEvents = events.filter(e => e.status === EventStatus.InProgress || e.status === EventStatus.Planned).length;
      const completedTasks = workTasks.filter(t => t.status === WorkTaskStatus.Completed).length;
      const pendingTasksCount = workTasks.filter(t => t.status === WorkTaskStatus.Pending).length;
      const availableResources = resources.filter(r => r.isAvailable).length;

      setStats({
        totalEvents: events.length,
        activeEvents,
        totalPerformances: performances.length,
        completedTasks,
        pendingTasks: pendingTasksCount,
        availableResources
      });

      // Set recent/upcoming data
      setRecentEvents(events.slice(0, 5));
      setUpcomingPerformances(performances.filter(p => p.status === PerformanceStatus.Planned).slice(0, 5));
      setPendingTasks(workTasks.filter(t => t.status === WorkTaskStatus.Pending).slice(0, 5));

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Add Event',
      description: 'Create a new event',
      icon: <Calendar className="w-6 h-6" />,
      color: 'from-pink-500/20 to-pink-600/20 border-pink-400/30',
      textColor: 'text-pink-400',
      onClick: () => navigate('/event-organization/events/add')
    },
    {
      title: 'Add Performance',
      description: 'Schedule a performance',
      icon: <PlaySquare className="w-6 h-6" />,
      color: 'from-purple-500/20 to-purple-600/20 border-purple-400/30',
      textColor: 'text-purple-400',
      onClick: () => navigate('/event-organization/performances/add')
    },
    {
      title: 'Add Work Task',
      description: 'Create a new task',
      icon: <ListChecks className="w-6 h-6" />,
      color: 'from-blue-500/20 to-blue-600/20 border-blue-400/30',
      textColor: 'text-blue-400',
      onClick: () => navigate('/event-organization/work-tasks/add')
    },
    {
      title: 'Manage Resources',
      description: 'View and manage resources',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-green-500/20 to-green-600/20 border-green-400/30',
      textColor: 'text-green-400',
      onClick: () => navigate('/event-organization/resources')
    }
  ];

  const getStatusIcon = (status: EventStatus | PerformanceStatus | WorkTaskStatus) => {
    switch (status) {
      case EventStatus.Completed:
      case PerformanceStatus.Completed:
      case WorkTaskStatus.Completed:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case EventStatus.InProgress:
      case PerformanceStatus.InProgress:
      case WorkTaskStatus.InProcess:
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case WorkTaskStatus.Pending:
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      case EventStatus.Cancelled:
      case PerformanceStatus.Cancelled:
        return <XCircle className="w-4 h-4 text-red-400" />;
      case EventStatus.Planned:
      case PerformanceStatus.Planned:
        return <Calendar className="w-4 h-4 text-blue-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-neutral-400 text-sm">
            Welcome back! Here's what's happening with your events.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-neutral-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
        <p className="text-neutral-400 text-sm">
          Welcome back! Here's what's happening with your events.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
              <p className="text-purple-400 text-sm">scheduled</p>
            </div>
            <div className="p-3 bg-purple-400/20 rounded-xl">
              <PlaySquare className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Work Tasks</p>
              <p className="text-2xl font-bold text-white">{stats.completedTasks}</p>
              <p className="text-green-400 text-sm">completed</p>
            </div>
            <div className="p-3 bg-green-400/20 rounded-xl">
              <ListChecks className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Pending Tasks</p>
              <p className="text-2xl font-bold text-white">{stats.pendingTasks}</p>
              <p className="text-orange-400 text-sm">need attention</p>
            </div>
            <div className="p-3 bg-orange-400/20 rounded-xl">
              <Clock className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Available Resources</p>
              <p className="text-2xl font-bold text-white">{stats.availableResources}</p>
              <p className="text-blue-400 text-sm">ready to use</p>
            </div>
            <div className="p-3 bg-blue-400/20 rounded-xl">
              <Briefcase className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-400 text-sm">Monthly Growth</p>
              <p className="text-2xl font-bold text-white">+12%</p>
              <p className="text-pink-400 text-sm">vs last month</p>
            </div>
            <div className="p-3 bg-pink-400/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-pink-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`p-6 rounded-xl border transition-all duration-200 hover:scale-105 bg-gradient-to-br ${action.color} text-left group`}
            >
              <div className={`${action.textColor} mb-3 group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <h3 className={`font-semibold mb-1 ${action.textColor}`}>{action.title}</h3>
              <p className="text-neutral-400 text-sm">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Events */}
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Events</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/event-organization/events')}
              className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {recentEvents.map((event) => (
              <div 
                key={event.id} 
                className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800/70 transition-colors cursor-pointer"
                onClick={() => navigate(`/event-organization/events/${event.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(event.status)}
                    <h4 className="font-medium text-white text-sm">{event.name}</h4>
                  </div>
                  <p className="text-neutral-400 text-xs">{event.location?.name || `Location ID: ${event.locationId}`}</p>
                </div>
                <div className="text-neutral-400 text-xs">
                  {formatDate(event.interval)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Performances */}
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Upcoming Performances</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/event-organization/performances')}
              className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingPerformances.map((performance) => (
              <div 
                key={performance.id} 
                className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800/70 transition-colors cursor-pointer"
                onClick={() => navigate(`/event-organization/performances/${performance.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <PlaySquare className="w-4 h-4 text-purple-400" />
                    <h4 className="font-medium text-white text-sm">
                      {performance.performer?.name && performance.event?.name 
                        ? `${performance.performer.name} - ${performance.event.name}`
                        : `Performance ${performance.id}`}
                    </h4>
                  </div>
                  <p className="text-neutral-400 text-xs">{performance.venue?.name || `Venue ID: ${performance.venueId}`}</p>
                </div>
                <div className="text-neutral-400 text-xs">
                  {formatDate(performance.startTime)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Tasks */}
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Pending Tasks</h3>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/event-organization/work-tasks')}
              className="text-pink-400 hover:text-pink-300 hover:bg-pink-400/10"
            >
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {pendingTasks.map((task) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg hover:bg-neutral-800/70 transition-colors cursor-pointer"
                onClick={() => navigate(`/event-organization/work-tasks/${task.id}`)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <h4 className="font-medium text-white text-sm">{task.name}</h4>
                  </div>
                  <p className="text-neutral-400 text-xs">{task.description}</p>
                </div>
                <div className="text-neutral-400 text-xs">
                  {formatDate(task.start)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default EventOrgDashboard;