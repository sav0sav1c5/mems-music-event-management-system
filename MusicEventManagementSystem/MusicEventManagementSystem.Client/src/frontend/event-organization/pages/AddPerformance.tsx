import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Clock, MapPin, FileText, Calendar } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Card } from '../../shared/components/ui/card';
import { performanceService } from '../services/performanceService';
import type { Performance } from '../services/performanceService';
import type { CreatePerformanceDto } from '../services/performanceService';
import { eventService } from '../services/eventService';
import type { Event } from '../services/eventService';

const AddPerformance = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [events, setEvents] = useState<Event[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    eventId: '',
    startDate: '',
    endDate: '',
    venue: '',
    status: 'PLANNED' as Performance['status'],
    description: '',
    artistName: '',
    duration: ''
  });

  const statusOptions = [
    { value: 'PLANNED', label: 'Planned' },
    { value: 'IN PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  useEffect(() => {
    loadEvents();
    if (isEditing && id) {
      loadPerformance(parseInt(id));
    }
  }, [isEditing, id]);

  const loadEvents = async () => {
    try {
      const eventsData = await eventService.getAllEvents();
      setEvents(eventsData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadPerformance = async (performanceId: number) => {
    try {
      setLoading(true);
      const performance = await performanceService.getPerformanceById(performanceId);
      
      // Format dates for input fields
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
        name: performance.name,
        eventId: performance.eventId?.toString() || '',
        startDate: formatDateForInput(performance.startDate),
        endDate: formatDateForInput(performance.endDate),
        venue: performance.venue || '',
        status: performance.status,
        description: performance.description || '',
        artistName: performance.artistName || '',
        duration: performance.duration || ''
      });
    } catch (error) {
      console.error('Error loading performance:', error);
      navigate('/event-organization/performances');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.startDate) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      const performanceData: CreatePerformanceDto = {
        name: formData.name.trim(),
        eventId: formData.eventId ? parseInt(formData.eventId) : undefined,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date(formData.startDate).toISOString(),
        venue: formData.venue.trim(),
        status: formData.status,
        description: formData.description.trim(),
        artistName: formData.artistName.trim(),
        duration: formData.duration.trim()
      };

      if (isEditing && id) {
        await performanceService.updatePerformance(parseInt(id), { ...performanceData, id: parseInt(id) });
      } else {
        await performanceService.createPerformance(performanceData);
      }

      navigate('/event-organization/performances');
    } catch (error) {
      console.error('Error saving performance:', error);
      alert('Failed to save performance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/event-organization/performances');
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
            Back to Performances
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
      <div className="flex items-center justify-between">
        <Button
          onClick={handleCancel}
          className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Performances
        </Button>
        
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Performance' : 'Add New Performance'}
        </h1>

        <div className="w-40" /> {/* Spacer for centering */}
      </div>

      {/* Form */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Clock className="w-4 h-4 inline mr-2" />
                Performance Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter performance name"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Related Event
              </label>
              <select
                value={formData.eventId}
                onChange={(e) => handleInputChange('eventId', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                <option value="" className="bg-neutral-800">No related event</option>
                {events.map(event => (
                  <option key={event.id} value={event.id} className="bg-neutral-800">
                    {event.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Artist/Performer Name
              </label>
              <Input
                type="text"
                value={formData.artistName}
                onChange={(e) => handleInputChange('artistName', e.target.value)}
                placeholder="Enter artist or performer name"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Venue
              </label>
              <Input
                type="text"
                value={formData.venue}
                onChange={(e) => handleInputChange('venue', e.target.value)}
                placeholder="Enter performance venue"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
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
                End Date & Time
              </label>
              <Input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Duration
              </label>
              <Input
                type="text"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="e.g., 2 hours, 90 minutes"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
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
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter performance description..."
              rows={4}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-vertical"
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
              className="flex-1 bg-purple-400/20 hover:bg-purple-400/30 text-purple-400 border border-purple-400/30 hover:border-purple-400/50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Performance' : 'Create Performance'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddPerformance;