import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, MapPin, FileText } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Card } from '../../shared/components/ui/card';
import { eventService } from '../services/eventService';
import { locationService } from '../services/locationService';
import type { Location } from '../services/locationService';
import type { CreateEventDto } from '../services/eventService';


interface EventFormData {
  name: string;
  locationId: number | '';
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  status: string;
  description: string;
}

const AddEvent = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    locationId: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    status: 'PLANNED',
    description: ''
  });

  const statusOptions = [
    { value: 'PLANNED', label: 'Planned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  useEffect(() => {
    loadLocations();
    if (isEditing && id) {
      loadEvent(parseInt(id));
    }
  }, [isEditing, id]);

  const loadLocations = async () => {
    try {
      const locationsList = await locationService.getAllLocations();
      setLocations(locationsList);
    } catch (err) {
      setError('Failed to load locations');
      console.error('Error loading locations:', err);
    }
  };

  const loadEvent = async (eventId: number) => {
    try {
      setLoading(true);
      const event = await eventService.getEventById(eventId);
      const startInterval = new Date(event.interval);
      const endInterval = event.endInterval ? new Date(event.endInterval) : startInterval;

      setFormData({
        name: event.name,
        locationId: event.locationId,
        startDate: startInterval.toISOString().split('T')[0],
        startTime: startInterval.toISOString().split('T')[1].slice(0, 5),
        endDate: endInterval.toISOString().split('T')[0],
        endTime: endInterval.toISOString().split('T')[1].slice(0, 5),
        status: event.status || 'PLANNED',
        description: event.description || ''
      });
    } catch (err) {
      setError('Failed to load event');
      console.error('Error loading event:', err);
      navigate('/event-organization/events');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.locationId || !formData.startDate || !formData.startTime) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const startInterval = `${formData.startDate}T${formData.startTime}:00Z`;
      const endInterval = formData.endDate && formData.endTime ? `${formData.endDate}T${formData.endTime}:00Z` : undefined;

      const eventData: CreateEventDto = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        interval: startInterval,
        status: formData.status, //as EventStatus, // Mapiranje na enum
        locationId: Number(formData.locationId),
        createdById: '00000000-0000-0000-0000-000000000000', // Zameni sa auth user id
        endInterval: endInterval
      };

      if (isEditing && id) {
        await eventService.updateEvent(Number(id), { ...eventData, id: Number(id) });
      } else {
        await eventService.createEvent(eventData);
      }

      navigate('/event-organization/events');
    } catch (err) {
      setError('Failed to save event. Please try again.');
      console.error('Error saving event:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/event-organization/events');
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
            Back to Events
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
      <div className="flex items-center justify-between">
        <Button
          onClick={handleCancel}
          className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Event' : 'Add New Event'}
        </h1>

        <div className="w-32" />
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Event Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter event name"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location *
              </label>
              <select
                value={formData.locationId}
                onChange={(e) => handleInputChange('locationId', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              >
                <option value="">Select a location</option>
                {locations.map(location => (
                  <option key={location.id} value={location.id} className="bg-neutral-800">
                    {location.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Date *
              </label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Start Time *
              </label>
              <Input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                End Date
              </label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                End Time
              </label>
              <Input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
                className="bg-neutral-800 border-neutral-700 text-white"
              />
            </div>
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

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter event description..."
              rows={4}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-vertical"
            />
          </div>

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
              className="flex-1 bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-pink-400 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Event' : 'Create Event'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddEvent;