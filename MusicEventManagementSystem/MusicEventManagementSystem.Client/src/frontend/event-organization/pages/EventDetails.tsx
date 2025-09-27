import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, MapPin, Edit3, Trash2 } from 'lucide-react';
import eventService from '../services/eventsService';
import type { Event } from '../types/types';

interface EventOrgEventDetailsProps {
  eventId?: number;
  event?: Event;
  onBack: () => void;
  onEdit?: (event: Event) => void;
  onDelete?: (eventId: number) => void;
}

const EventOrgEventDetails: React.FC<EventOrgEventDetailsProps> = ({ 
  eventId, 
  event: propEvent, 
  onBack, 
  onEdit, 
  onDelete 
}) => {
  const [event, setEvent] = useState<Event | null>(propEvent || null);
  const [loading, setLoading] = useState(!propEvent && !!eventId);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId && !propEvent) {
      fetchEvent();
    }
  }, [eventId, propEvent]);

  const fetchEvent = async () => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const data = await eventService.getEventById(eventId);
      setEvent(data);
    } catch (error) {
      console.error('Failed to fetch event:', error);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-emerald-500 text-white';
      case 'IN PROGRESS':
        return 'bg-amber-500 text-white';
      case 'PLANNED':
        return 'bg-blue-500 text-white';
      case 'CANCELLED':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleEdit = () => {
    if (event && onEdit) {
      onEdit(event);
    }
  };

  const handleDelete = () => {
    if (event && onDelete && window.confirm('Are you sure you want to delete this event?')) {
      onDelete(event.id);
    }
  };

  const handleViewInCalendar = () => {
    // Implementacija za kalendar
    console.log('View in calendar');
  };

  if (loading) {
    return (
      <div className="text-white h-full flex items-center justify-center p-6">
        <div className="text-xl">Loading event details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white h-full flex flex-col items-center justify-center p-6">
        <div className="text-xl text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchEvent} 
          className="bg-pink-400 text-white px-4 py-2 rounded-lg hover:bg-pink-500 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-white h-full flex items-center justify-center p-6">
        <div className="text-xl text-gray-400">Event not found</div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-start">
        <div className="flex items-start space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors mt-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">Event Details</h1>
            <p className="text-gray-400 text-sm">
              View and manage event information
            </p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium"
        >
          Back to Events
        </button>
      </div>

      {/* Event Header */}
      <div className="mb-8 flex justify-between items-start">
        <h2 className="text-3xl font-bold text-white">{event.name}</h2>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusBadge(event.status)}`}>
          {event.status}
        </span>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {/* Event Information */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">Event Information</h3>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Location</p>
                  <p className="text-white font-medium">
                    {event.location?.name || `Location ID: ${event.locationId}`}
                  </p>
                  {event.location?.address && (
                    <p className="text-gray-400 text-sm mt-1">{event.location.address}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Calendar className="w-5 h-5 text-pink-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400 mb-1">Date & Time</p>
                  <p className="text-white font-medium">
                    {new Date(event.interval).toLocaleDateString('sr-RS', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {new Date(event.interval).toLocaleTimeString('sr-RS', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {event.description && (
                <div>
                  <p className="text-sm text-gray-400 mb-2">Description</p>
                  <p className="text-white leading-relaxed">{event.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description and Actions */}
        <div className="space-y-6">
          {/* Description Card */}
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Description</h3>
            <p className="text-gray-300 leading-relaxed">
              {event.description || 'No description available for this event.'}
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={onBack}
              className="w-full bg-gray-700 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors font-medium"
            >
              Back
            </button>
            
            <button
              onClick={handleViewInCalendar}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>View in Calendar</span>
            </button>

            {onEdit && (
              <button
                onClick={handleEdit}
                className="w-full bg-pink-400 text-white py-3 px-4 rounded-lg hover:bg-pink-500 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Event</span>
              </button>
            )}

            {onDelete && (
              <button
                onClick={handleDelete}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventOrgEventDetails;