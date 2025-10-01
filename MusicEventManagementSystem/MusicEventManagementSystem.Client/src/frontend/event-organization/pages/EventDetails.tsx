import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Calendar, MapPin, Clock, Save } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Card } from '../../shared/components/ui/card';
import { eventService } from '../services/eventService';
import { locationService } from '../services/locationService';
import type { Event } from '../services/eventService';
import type { Location } from '../services/locationService';

const EventDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadEvent(parseInt(id));
    }
  }, [id]);

  const loadEvent = async (eventId: number) => {
    try {
      setLoading(true);
      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (err) {
      setError('Failed to load event details');
      console.error('Error loading event:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (event?.id) {
      navigate(`/event-organization/events/${event.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (event?.id) {
      if (window.confirm(`Are you sure you want to delete "${event.name}"? This action cannot be undone.`)) {
        try {
          await eventService.deleteEvent(event.id);
          navigate('/event-organization/events');
        } catch (err) {
          setError('Failed to delete event');
          console.error('Error deleting event:', err);
        }
      }
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.warn('Error formatting date:', dateString, error);
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'PLANNED': return 'text-blue-400 bg-blue-400/20 border-blue-400/30';
      case 'IN_PROGRESS': return 'text-lime-400 bg-lime-400/20 border-lime-400/30';
      case 'COMPLETED': return 'text-green-400 bg-green-400/20 border-green-400/30';
      case 'CANCELLED': return 'text-red-400 bg-red-400/20 border-red-400/30';
      default: return 'text-neutral-400 bg-neutral-400/20 border-neutral-400/30';
    }
  };

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/event-organization/events')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/event-organization/events')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </div>
        <div className="text-center py-8 text-red-400">{error || 'Event not found'}</div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/event-organization/events')}
          className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
        <h1 className="text-2xl font-bold text-white">Event Details</h1>
        <div className="w-32 flex gap-2">
          <Button
            onClick={handleEdit}
            className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 hover:border-lime-400/50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            onClick={handleDelete}
            className="bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-400/30 hover:border-red-400/50"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {error && <div className="text-red-400 mb-4">{error}</div>}

      <Card className="bg-neutral-900/60 border-neutral-800 p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Event Information</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-neutral-400">Name</h3>
                <p className="text-white">{event.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-400">Description</h3>
                <p className="text-white">{event.description || 'No description available'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-neutral-400">Status</h3>
                <span className={`px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(event.status)}`}>
                  {event.status ? event.status.replace('_', ' ') : 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Schedule</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-neutral-400" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-400">Start Date</h3>
                  <p className="text-white">{formatDate(event.interval)}</p>
                </div>
              </div>
              {event.endInterval && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neutral-400" />
                  <div>
                    <h3 className="text-sm font-medium text-neutral-400">End Date</h3>
                    <p className="text-white">{formatDate(event.endInterval)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Location</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-neutral-400" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-400">Name</h3>
                  <p className="text-white">{event.location?.name ?? 'No location assigned'}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-2">Additional Details</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-neutral-400" />
                <div>
                  <h3 className="text-sm font-medium text-neutral-400">Created</h3>
                  <p className="text-white">{formatDate(event.createdAt)}</p>
                </div>
              </div>
              {event.updatedAt && (
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-neutral-400" />
                  <div>
                    <h3 className="text-sm font-medium text-neutral-400">Last Updated</h3>
                    <p className="text-white">{formatDate(event.updatedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EventDetails;