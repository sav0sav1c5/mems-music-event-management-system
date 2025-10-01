import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListChecks, Search, Calendar, Clock, CheckCircle, AlertCircle, PlaySquare, Wifi, WifiOff } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Card } from '../../shared/components/ui/card';
import { Badge } from '../../shared/components/ui/badge';
import { workTaskService } from '../services/workTaskService';
import type { WorkTask } from '../services/workTaskService';
import { WorkTaskStatus } from '../../shared/types/enums';

const WorkTasks = () => {
  const navigate = useNavigate();
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<WorkTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkTasks();
  }, []);

  useEffect(() => {
    filterTasks();
  }, [workTasks, searchTerm, statusFilter]);

  const loadWorkTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await workTaskService.getAllWorkTasks();
      setWorkTasks(data);
      
    } catch (error: any) {
      console.error('Error loading work tasks:', error);
      const errorMessage = error?.response?.status === 404 
        ? 'Work tasks API endpoint not found. Please check if the backend server is running.'
        : error?.message || 'Failed to load work tasks';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = workTasks;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(task =>
        task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      const statusValue = parseInt(statusFilter);
      filtered = filtered.filter(task => task.status === statusValue);
    }

    setFilteredTasks(filtered);
  };

  const getStatusIcon = (status: number) => {
    switch (status) {
      case WorkTaskStatus.Completed:
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case WorkTaskStatus.InProcess:
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case WorkTaskStatus.Pending:
        return <AlertCircle className="w-4 h-4 text-orange-400" />;
      default:
        return <AlertCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case WorkTaskStatus.Completed:
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case WorkTaskStatus.InProcess:
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case WorkTaskStatus.Pending:
        return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      default:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
    }
  };

  const getStatusName = (status: number) => {
    switch (status) {
      case WorkTaskStatus.Completed:
        return 'Completed';
      case WorkTaskStatus.InProcess:
        return 'In Progress';
      case WorkTaskStatus.Pending:
        return 'Pending';
      default:
        return 'Unknown';
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
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid time';
      }
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting time:', dateString, error);
      return 'Invalid time';
    }
  };

  const getTaskStats = () => {
    return {
      total: workTasks.length,
      pending: workTasks.filter(t => t.status === WorkTaskStatus.Pending).length,
      inProgress: workTasks.filter(t => t.status === WorkTaskStatus.InProcess).length,
      completed: workTasks.filter(t => t.status === WorkTaskStatus.Completed).length
    };
  };

  const stats = getTaskStats();

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Work Tasks</h1>
            <p className="text-neutral-400">
              Manage work tasks and assignments
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-neutral-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Work Tasks</h1>
          <p className="text-neutral-400">
            Manage work tasks and assignments
          </p>
        </div>
        <Button 
          onClick={() => navigate('/event-organization/work-tasks/add')}
          className="bg-pink-400/20 hover:bg-pink-400/30 px-6 py-3 rounded-xl text-pink-400 font-medium border border-pink-400/30 hover:border-pink-400/50 transition-all duration-200"
        >
          <ListChecks className="w-4 h-4 mr-2" />
          Add Work Task
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-neutral-900/60 border-neutral-800 p-4 text-center">
          <p className="text-neutral-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800 p-4 text-center">
          <p className="text-neutral-400 text-sm">Pending</p>
          <p className="text-2xl font-bold text-orange-400">{stats.pending}</p>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800 p-4 text-center">
          <p className="text-neutral-400 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800 p-4 text-center">
          <p className="text-neutral-400 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-pink-400/50 focus:ring-pink-400/20"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('ALL')}
              className={`${statusFilter === 'ALL' ? 'bg-pink-400/20 text-pink-400 border-pink-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              All
            </Button>
            <Button
              variant={statusFilter === WorkTaskStatus.Pending.toString() ? 'default' : 'outline'}
              onClick={() => setStatusFilter(WorkTaskStatus.Pending.toString())}
              className={`${statusFilter === WorkTaskStatus.Pending.toString() ? 'bg-orange-400/20 text-orange-400 border-orange-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === WorkTaskStatus.InProcess.toString() ? 'default' : 'outline'}
              onClick={() => setStatusFilter(WorkTaskStatus.InProcess.toString())}
              className={`${statusFilter === WorkTaskStatus.InProcess.toString() ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === WorkTaskStatus.Completed.toString() ? 'default' : 'outline'}
              onClick={() => setStatusFilter(WorkTaskStatus.Completed.toString())}
              className={`${statusFilter === WorkTaskStatus.Completed.toString() ? 'bg-green-400/20 text-green-400 border-green-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              Completed
            </Button>
          </div>
        </div>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <Card 
            key={task.id} 
            className="bg-neutral-900/60 border-neutral-800 hover:border-pink-400/30 transition-all duration-200 cursor-pointer p-6 group"
            onClick={() => navigate(`/event-organization/work-tasks/${task.id}`)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(task.status)}
                    <h3 className="font-semibold text-white group-hover:text-pink-400 transition-colors">
                      {task.name}
                    </h3>
                  </div>
                  <Badge className={`${getStatusColor(task.status)} border text-xs`}>
                    {getStatusName(task.status)}
                  </Badge>
                </div>

                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                  {task.description}
                </p>

                <div className="flex items-center gap-6 text-sm text-neutral-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Start: {formatDate(task.start)} at {formatTime(task.start)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>End: {formatDate(task.end)} at {formatTime(task.end)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 ml-4">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-neutral-700 text-neutral-400 hover:text-white hover:border-pink-400/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/event-organization/work-tasks/${task.id}/edit`);
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/event-organization/work-tasks/${task.id}`);
                  }}
                >
                  View Details
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Error State */}
      {error && (
        <Card className="bg-red-900/20 border-red-500/30 p-8 text-center">
          <WifiOff className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h3>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="flex justify-center gap-4">
            <Button 
              onClick={loadWorkTasks}
              className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30 hover:border-red-400/50"
            >
              <Wifi className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
            <Button 
              onClick={() => navigate('/event-organization/work-tasks/add')}
              variant="outline"
              className="border-neutral-700 text-neutral-400 hover:text-white"
            >
              <ListChecks className="w-4 h-4 mr-2" />
              Add Task Anyway
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!error && filteredTasks.length === 0 && !loading && (
        <Card className="bg-neutral-900/60 border-neutral-800 p-12 text-center">
          <ListChecks className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">No work tasks found</h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by creating your first work task.'
            }
          </p>
          <Button 
            onClick={() => navigate('/event-organization/work-tasks/add')}
            className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
          >
            <ListChecks className="w-4 h-4 mr-2" />
            Add Work Task
          </Button>
        </Card>
      )}
    </div>
  );
};

export default WorkTasks;