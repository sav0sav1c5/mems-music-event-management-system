import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, Clock, CheckCircle, AlertCircle, XCircle, PlaySquare } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Card } from '../../shared/components/ui/card';
import { Badge } from '../../shared/components/ui/badge';
import { workTaskService } from '../services/workTaskService';
import type { WorkTask } from '../services/workTaskService';
import { performanceService } from '../services/performanceService';
import type { Performance } from '../services/performanceService';

const WorkTaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workTask, setWorkTask] = useState<WorkTask | null>(null);
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadWorkTask(parseInt(id));
    }
  }, [id]);

  const loadWorkTask = async (taskId: number) => {
    try {
      setLoading(true);
      const data = await workTaskService.getWorkTaskById(taskId);
      setWorkTask(data);
      
      // Load associated performance if exists
      if (data.performanceId) {
        try {
          const perfData = await performanceService.getPerformanceById(data.performanceId);
          setPerformance(perfData);
        } catch (error) {
          console.warn('Could not load associated performance:', error);
        }
      }
    } catch (error) {
      console.error('Error loading work task:', error);
      navigate('/event-organization/work-tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (workTask) {
      navigate(`/event-organization/work-tasks/${workTask.id}/edit`);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!workTask) return;

    try {
      await workTaskService.deleteWorkTask(workTask.id);
      navigate('/event-organization/work-tasks');
    } catch (error) {
      console.error('Error deleting work task:', error);
    }
  };

  const getStatusIcon = (status: string | undefined) => {
    const safeStatus = status ? String(status) : '';
    switch (safeStatus) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'IN PROGRESS':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'PENDING':
        return <AlertCircle className="w-5 h-5 text-orange-400" />;
      default:
        return <AlertCircle className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string | undefined) => {
    const safeStatus = status ? String(status) : '';
    switch (safeStatus) {
      case 'COMPLETED':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'IN PROGRESS':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'PENDING':
        return 'bg-orange-400/20 text-orange-400 border-orange-400/30';
      default:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
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
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/event-organization/work-tasks')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work Tasks
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
        </div>
      </div>
    );
  }

  if (!workTask) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/event-organization/work-tasks')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work Tasks
          </Button>
        </div>
        <Card className="bg-neutral-900/60 border-neutral-800 p-12 text-center">
          <h2 className="text-xl font-semibold text-white mb-2">Work Task not found</h2>
          <p className="text-neutral-400">The work task you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/event-organization/work-tasks')}
          className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Work Tasks
        </Button>
        
        <div className="flex gap-3">
          <Button
            onClick={handleEdit}
            className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Task
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Task Details */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-4">{workTask.name}</h1>
            <div className="flex items-center gap-3">
              {getStatusIcon(workTask.status)}
              <Badge className={`${getStatusColor(workTask.status)} border`}>
                {workTask.status ? String(workTask.status).replace('_', ' ') : 'Unknown'}
              </Badge>
            </div>
          </div>
        </div>

        {workTask.description && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
            <p className="text-neutral-300 leading-relaxed">{workTask.description}</p>
          </div>
        )}

        {/* Task Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Schedule</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-pink-400" />
                  <div>
                    <p className="text-neutral-400 text-sm">Start</p>
                    <p className="text-white">{formatDate(workTask.startDate)} at {workTask.startTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-pink-400" />
                  <div>
                    <p className="text-neutral-400 text-sm">End</p>
                    <p className="text-white">{formatDate(workTask.endDate)} at {workTask.endTime}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {performance && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Associated Performance</h3>
                <div className="p-4 bg-neutral-800/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <PlaySquare className="w-5 h-5 text-purple-400" />
                    <h4 className="font-medium text-white">{performance.name}</h4>
                  </div>
                  <p className="text-neutral-400 text-sm">{performance.stage}</p>
                  <Button
                    onClick={() => navigate(`/event-organization/performances/${performance.id}`)}
                    className="mt-3 w-full justify-start bg-purple-400/20 hover:bg-purple-400/30 text-purple-400 border border-purple-400/30"
                  >
                    View Performance Details
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-neutral-900 border-neutral-800 p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Delete Work Task</h3>
            <p className="text-neutral-400 mb-6">
              Are you sure you want to delete "{workTask.name}"? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                className="flex-1 bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default WorkTaskDetails;