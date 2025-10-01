import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, User, Clock, FileText, PlaySquare, CheckSquare, Package, Plus } from 'lucide-react';
import { Button } from './../../shared/components/ui/button';
import { Card } from './../../shared/components/ui/card';
import { Badge } from './../../shared/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './../../../../components/ui/alert-dialog';
import { performanceService } from '../services/performanceService';
import type { Performance } from '../services/performanceService';
import { eventService } from '../services/eventService';
import type { Event } from '../services/eventService';
import { workTaskService } from '../services/workTaskService';
import type { WorkTask } from '../services/workTaskService';
import { performanceResourceService } from '../services/performanceResourceService';
import type { PerformanceResource } from '../services/performanceResourceService';
import { getWorkTaskStatusName, getResourceTypeName, WorkTaskStatus, PerformanceResourceStatus, ResourceType } from '../../shared/types/enums';

const PerformanceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [relatedEvent, setRelatedEvent] = useState<Event | null>(null);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [performanceResources, setPerformanceResources] = useState<PerformanceResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadPerformance(parseInt(id));
    }
  }, [id]);

  const loadPerformance = async (performanceId: number) => {
    try {
      setLoading(true);
      const performanceData = await performanceService.getPerformanceById(performanceId);
      
      if (!performanceData) {
        navigate('/event-organization/performances');
        return;
      }
      
      setPerformance(performanceData);

      // Load related event if exists (using parallel loading)
      const loadPromises: Promise<void>[] = [];

      if (performanceData.eventId) {
        loadPromises.push(
          eventService.getEventById(performanceData.eventId)
            .then(eventData => {
              if (eventData) {
                setRelatedEvent(eventData);
              }
            })
            .catch(() => {
              // Silent fail - event not found is acceptable
              setRelatedEvent(null);
            })
        );
      }

      // Load work tasks for this performance
      loadPromises.push(
        workTaskService.getWorkTasksByPerformanceId(performanceId)
          .then(workTasksData => setWorkTasks(workTasksData || []))
          .catch(() => setWorkTasks([]))
      );

      // Load performance resources
      loadPromises.push(
        performanceResourceService.getPerformanceResourcesByPerformanceId(performanceId)
          .then(resourcesData => setPerformanceResources(resourcesData || []))
          .catch(() => setPerformanceResources([]))
      );

      // Wait for all data to load
      await Promise.allSettled(loadPromises);
    } catch (error) {
      console.warn('Performance not found or backend unavailable:', error);
      navigate('/event-organization/performances');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!performance) return;
    
    try {
      setDeleting(true);
      await performanceService.deletePerformance(performance.id);
      navigate('/event-organization/performances');
    } catch (error) {
      console.error('Error deleting performance:', error);
      alert('Failed to delete performance. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string | undefined) => {
    const safeStatus = status ? String(status) : '';
    switch (safeStatus) {
      case 'COMPLETED':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'IN PROGRESS':
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case 'PLANNED':
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case 'CANCELLED':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      default:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
    }
  };

  const getWorkTaskStatusColor = (status: WorkTaskStatus | undefined) => {
    switch (status) {
      case WorkTaskStatus.Pending:
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case WorkTaskStatus.InProcess:
        return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30';
      case WorkTaskStatus.Completed:
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      default:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
    }
  };

  const getResourceStatusColor = (status: PerformanceResourceStatus | undefined) => {
    switch (status) {
      case PerformanceResourceStatus.Requested:
        return 'bg-blue-400/20 text-blue-400 border-blue-400/30';
      case PerformanceResourceStatus.Assigned:
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case PerformanceResourceStatus.InUse:
        return 'bg-purple-400/20 text-purple-400 border-purple-400/30';
      case PerformanceResourceStatus.Returned:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
      case PerformanceResourceStatus.Cancelled:
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      default:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
    }
  };

  const getResourceStatusName = (status: PerformanceResourceStatus | undefined): string => {
    switch (status) {
      case PerformanceResourceStatus.Requested:
        return 'Requested';
      case PerformanceResourceStatus.Assigned:
        return 'Assigned';
      case PerformanceResourceStatus.InUse:
        return 'In Use';
      case PerformanceResourceStatus.Returned:
        return 'Returned';
      case PerformanceResourceStatus.Cancelled:
        return 'Cancelled';
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
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
            onClick={() => navigate('/event-organization/performances')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Performances
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
        </div>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/event-organization/performances')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Performances
          </Button>
        </div>
        <Card className="bg-neutral-900/60 border-neutral-800 p-12 text-center">
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">Performance not found</h3>
          <p className="text-neutral-500">The performance you're looking for doesn't exist.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/event-organization/performances')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Performances
          </Button>
          
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/event-organization/performances/${performance.id}/edit`)}
              className="bg-purple-400/20 hover:bg-purple-400/30 text-purple-400 border border-purple-400/30 hover:border-purple-400/50"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30 hover:border-red-400/50"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Performance</AlertDialogTitle>
                  <AlertDialogDescription className="text-neutral-400">
                    Are you sure you want to delete this performance? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30 hover:border-red-400/50"
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <h1>Performance Details</h1>
      </div>

      {/* Performance Info */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <PlaySquare className="w-8 h-8 text-purple-400" />
            <div>
              <h2>{performance.name}</h2>
              <Badge className={`${getStatusColor(performance.status)} border mt-2`}>
                {performance.status}
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
            
            {performance.performer && (
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-neutral-400 text-sm">Performer</p>
                  <p className="text-white font-medium">{performance.performer.name}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-neutral-400 text-sm">Venue</p>
                <p className="text-white font-medium">{performance.venue?.name || 'No venue specified'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-neutral-400 text-sm">Setup Time</p>
                <p className="text-white font-medium">{performance.setupTime} minutes</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-neutral-400 text-sm">Soundcheck Time</p>
                <p className="text-white font-medium">{performance.soundcheckTime} minutes</p>
              </div>
            </div>
          </div>

          {/* Schedule Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Schedule</h3>
            
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-neutral-400 text-sm">Start Time</p>
                <p className="text-white font-medium">{formatDate(performance.startTime)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-neutral-400 text-sm">End Time</p>
                <p className="text-white font-medium">{formatDate(performance.endTime)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performer Details */}
        {performance.performer && (
          <div className="mt-8 pt-8 border-t border-neutral-800">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-semibold text-white">Performer Details</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-neutral-400 text-sm">Genre</p>
                <p className="text-white">{performance.performer.genre}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Contact</p>
                <p className="text-white">{performance.performer.email}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Technical Requirements</p>
                <p className="text-white">{performance.performer.technicalRequirements}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Price Range</p>
                <p className="text-white">${performance.performer.minPrice} - ${performance.performer.maxPrice}</p>
              </div>
            </div>
          </div>
        )}

        {/* Related Event */}
        {relatedEvent && (
          <div className="mt-8 pt-8 border-t border-neutral-800">
            <h3 className="text-xl font-semibold text-white mb-4">Related Event</h3>
            <Card className="bg-neutral-800/50 border-neutral-700 p-4 hover:border-pink-400/30 transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/event-organization/events/${relatedEvent.id}`)}>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{relatedEvent.name}</h4>
                  <p className="text-neutral-400 text-sm">
                    {relatedEvent.location?.name} • {new Date(relatedEvent.interval).toLocaleDateString()}
                  </p>
                </div>
                <Button size="sm" className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30">
                  View Event
                </Button>
              </div>
            </Card>
          </div>
        )}
      </Card>

      {/* Work Tasks */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <CheckSquare className="w-6 h-6 text-lime-400" />
            <h3 className="text-xl font-semibold text-white">Work Tasks</h3>
          </div>
          <Button
            onClick={() => navigate('/event-organization/work-tasks/add', { 
              state: { preselectedPerformanceId: performance?.id } 
            })}
            className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </div>

        {workTasks.length > 0 ? (
          <div className="space-y-4">
            {workTasks.map((task) => (
              <Card 
                key={task.id} 
                className="bg-neutral-800/50 border-neutral-700 p-4 hover:border-lime-400/30 transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/event-organization/work-tasks/${task.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">{task.name}</h4>
                      <Badge className={`${getWorkTaskStatusColor(task.status)} border`}>
                        {getWorkTaskStatusName(task.status)}
                      </Badge>
                    </div>
                    <p className="text-neutral-400 text-sm mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>Start: {new Date(task.start).toLocaleString()}</span>
                      <span>End: {new Date(task.end).toLocaleString()}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/event-organization/work-tasks/${task.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <CheckSquare className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-neutral-400 mb-2">No Work Tasks</h4>
            <p className="text-neutral-500 mb-4">No work tasks have been assigned to this performance yet.</p>
            <Button
              onClick={() => navigate('/event-organization/work-tasks/add', { 
                state: { preselectedPerformanceId: performance?.id } 
              })}
              className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add First Task
            </Button>
          </div>
        )}
      </Card>

      {/* Performance Resources */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Package className="w-6 h-6 text-orange-400" />
            <h3 className="text-xl font-semibold text-white">Resources</h3>
          </div>
          <Button
            onClick={() => navigate('/event-organization/resources', { 
              state: { assignToPerformance: performance?.id } 
            })}
            className="bg-orange-400/20 hover:bg-orange-400/30 text-orange-400 border border-orange-400/30"
          >
            <Plus className="w-4 h-4 mr-2" />
            Assign Resource
          </Button>
        </div>

        {performanceResources.length > 0 ? (
          <div className="space-y-4">
            {performanceResources.map((perfResource) => (
              <Card 
                key={perfResource.id} 
                className="bg-neutral-800/50 border-neutral-700 p-4 hover:border-orange-400/30 transition-all duration-200 cursor-pointer"
                onClick={() => perfResource.resource && navigate(`/event-organization/resources/${perfResource.resource.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-white">
                        {perfResource.resource?.name || 'Unknown Resource'}
                      </h4>
                      <Badge className={`${getResourceStatusColor(perfResource.status)} border`}>
                        {getResourceStatusName(perfResource.status)}
                      </Badge>
                    </div>
                    <p className="text-neutral-400 text-sm mb-2">
                      {perfResource.resource?.description || 'No description available'}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      <span>Quantity Needed: {perfResource.quantityNeeded}</span>
                      <span>Type: {perfResource.resource?.resourceType ? 
                        getResourceTypeName(perfResource.resource.resourceType) : 
                        'Unknown'}</span>
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-orange-400/20 hover:bg-orange-400/30 text-orange-400 border border-orange-400/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (perfResource.resource) {
                        navigate(`/event-organization/resources/${perfResource.resource.id}`);
                      }
                    }}
                  >
                    View Resource
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-neutral-400 mb-2">No Resources Assigned</h4>
            <p className="text-neutral-500 mb-4">No resources have been assigned to this performance yet.</p>
            <Button
              onClick={() => navigate('/event-organization/resources', { 
                state: { assignToPerformance: performance?.id } 
              })}
              className="bg-orange-400/20 hover:bg-orange-400/30 text-orange-400 border border-orange-400/30"
            >
              <Plus className="w-4 h-4 mr-2" />
              Assign First Resource
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PerformanceDetails;