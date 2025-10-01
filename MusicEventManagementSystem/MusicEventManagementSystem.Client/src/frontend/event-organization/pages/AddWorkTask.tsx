import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, CheckSquare, Calendar, Clock, FileText } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Card } from '../../shared/components/ui/card';
import { workTaskService } from '../services/workTaskService';
import type { WorkTask } from '../services/workTaskService';
import type { CreateWorkTaskDto } from '../services/workTaskService';
// import type { Performance } from '../../shared/types/models';
import type { WorkTaskStatus } from '../../shared/types/enums';
// import { getWorkTaskStatusName } from '../../shared/types/enums';

const AddWorkTask = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    performanceId: '',
    status: WorkTaskStatus.Pending,
    startDate: '',
    endDate: ''
  });

  const statusOptions = [
    { value: WorkTaskStatus.Pending, label: 'Pending' },
    { value: WorkTaskStatus.InProcess, label: 'In Process' },
    { value: WorkTaskStatus.Completed, label: 'Completed' }
  ];

  useEffect(() => {
    loadPerformances();
    if (isEditing && id) {
      loadWorkTask(parseInt(id));
    }
    
    // Check if there's a preselected performance from navigation state
    const state = location.state as { preselectedPerformanceId?: number } | null;
    if (state?.preselectedPerformanceId) {
      setFormData(prev => ({ 
        ...prev, 
        performanceId: state.preselectedPerformanceId.toString() 
      }));
    }
  }, [isEditing, id, location.state]);

  const loadPerformances = async () => {
    try {
      const performancesData = await workTaskService.getAllPerformances();
      setPerformances(performancesData);
    } catch (error) {
      console.error('Error loading performances:', error);
    }
  };

  const loadWorkTask = async (taskId: number) => {
    try {
      setLoading(true);
      const task = await workTaskService.getWorkTaskById(taskId);
      
      // Format date for input field
      const formatDateForInput = (dateString: string) => {
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';
          return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm format
        } catch {
          return '';
        }
      };

      setFormData({
        name: task.name,
        description: task.description || '',
        performanceId: task.performanceId?.toString() || '',
        status: task.status,
        startDate: formatDateForInput(task.start),
        endDate: formatDateForInput(task.end)
      });
    } catch (error) {
      console.error('Error loading work task:', error);
      navigate('/event-organization/work-tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | WorkTaskStatus) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.startDate || !formData.endDate || !formData.performanceId) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const taskData: CreateWorkTaskDto = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        performanceId: parseInt(formData.performanceId),
        status: formData.status,
        start: new Date(formData.startDate).toISOString(),
        end: new Date(formData.endDate).toISOString()
      };

      if (isEditing && id) {
        await workTaskService.updateWorkTask(parseInt(id), { ...taskData, id: parseInt(id) });
      } else {
        await workTaskService.createWorkTask(taskData);
      }

      navigate('/event-organization/work-tasks');
    } catch (error) {
      console.error('Error saving work task:', error);
      alert('Failed to save work task. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/event-organization/work-tasks');
  };

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleCancel}
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

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleCancel}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Work Tasks
          </Button>
        </div>
        <h1>{isEditing ? 'Edit Work Task' : 'Add New Work Task'}</h1>
      </div>

      {/* Form */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <CheckSquare className="w-4 h-4 inline mr-2" />
                Task Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter task name"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Related Performance *
              </label>
              <select
                value={formData.performanceId}
                onChange={(e) => handleInputChange('performanceId', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
                required
              >
                <option value="" className="bg-neutral-800">Select a performance</option>
                {performances.map(performance => (
                  <option key={performance.id} value={performance.id} className="bg-neutral-800">
                    {performance.performer?.name} - {new Date(performance.startTime).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Start Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                End Date & Time *
              </label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', parseInt(e.target.value) as WorkTaskStatus)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-lime-400"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-neutral-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Task Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter task description and details..."
              rows={4}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 resize-vertical"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 hover:border-lime-400/50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lime-400 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Task' : 'Create Task'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddWorkTask;