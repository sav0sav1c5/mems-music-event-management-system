import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, Search, Plus, MoreHorizontal, Edit, Trash2, ArrowUp, ArrowDown, Filter } from 'lucide-react';
import { eventService } from '../services/eventService';
import { locationService } from '../services/locationService';
import type { Event } from '../services/eventService';
import type { Location } from '../services/locationService';

const Events = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const navigate = useNavigate();

  const statusOptions = [
    { value: 'ALL', label: 'All Events' },
    { value: 'PLANNED', label: 'Planned' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    filterAndSortEvents();
  }, [events, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents();
      setEvents(data);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortEvents = () => {
    let result = [...events];

    if (searchTerm) {
      result = result.filter(event =>
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      result = result.filter(event => event.status === statusFilter);
    }

    result.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "status":
          aValue = a.status || "";
          bValue = b.status || "";
          break;
        case "createdAt":
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case "location":
          aValue = a.location?.name || "";
          bValue = b.location?.name || "";
          break;
        default:
          aValue = a.name;
          bValue = b.name;
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredEvents(result);
  };

  const handleDeleteEvent = async (event: Event) => {
    setEventToDelete(event);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      await eventService.deleteEvent(eventToDelete.id);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      setDeleteModalOpen(false);
      setEventToDelete(null);
    } catch (err) {
      setError('Failed to delete event');
      console.error('Error deleting event:', err);
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

  const handleEventClick = (eventId: number) => {
    navigate(`/event-organization/events/${eventId}`);
  };

  const handleEditEvent = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/event-organization/events/${event.id}/edit`);
  };

  const handleDeleteClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    handleDeleteEvent(event);
  };

  const stats = [
    {
      title: "Total Events",
      value: events.length.toString(),
      change: `+${events.filter(e => e.status === 'PLANNED').length} planned`,
      trend: "up",
      icon: <Calendar className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Active Events",
      value: events.filter(e => e.status === 'IN_PROGRESS').length.toString(),
      change: "+12.5%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Completed",
      value: events.filter(e => e.status === 'COMPLETED').length.toString(),
      change: "+8.1%",
      trend: "up",
      icon: <MapPin className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "This Month",
      value: events.filter(e => {
        const eventDate = new Date(e.createdAt);
        const now = new Date();
        return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      }).length.toString(),
      change: "+15.2%",
      trend: "up",
      icon: <Plus className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">Events</h1>
          <p className="text-neutral-400 text-sm">
            Manage event creation, scheduling, and details
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-400"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-1">Events</h1>
          <p className="text-neutral-400 text-sm">
            Manage event creation, scheduling, and details
          </p>
        </div>
        <div className="text-center py-8 text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Events</h1>
          <p className="text-neutral-400 text-sm">
            Manage event creation, scheduling, and details
          </p>
        </div>
        <button
          onClick={() => navigate('/event-organization/events/add')}
          className="bg-pink-400/20 hover:bg-pink-400/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-pink-400 font-medium border border-pink-400/30 hover:border-pink-400/50"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-3 hover:border-lime-400/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                                                stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                                                stat.color === 'purple' ? 'bg-purple-400/20 text-purple-400' :
                                                'bg-orange-400/20 text-orange-400'}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-lime-400' : 'text-red-400'}`}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-xs mb-1">{stat.title}</p>
              <h3 className="text-lg font-bold text-white group-hover:text-lime-400 transition-colors">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm min-w-[120px]"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value} className="bg-neutral-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm"
            >
              <option value="name">Name</option>
              <option value="status">Status</option>
              <option value="location">Location</option>
              <option value="createdAt">Created</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-400/30"
            >
              {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
          <Filter className="w-3 h-3" />
          <span>Showing {filteredEvents.length} of {events.length} events</span>
        </div>
      </div>

      {filteredEvents.length === 0 ? (
        <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">
            {searchTerm || statusFilter !== 'ALL' ? 'No events found' : 'No events yet'}
          </h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm || statusFilter !== 'ALL' 
              ? 'Try adjusting your search or filters' 
              : 'Create your first event to get started'
            }
          </p>
          {!searchTerm && statusFilter === 'ALL' && (
            <button
              onClick={() => navigate('/event-organization/events/add')}
              className="bg-pink-400/20 hover:bg-pink-400/30 px-4 py-2 rounded-xl text-pink-400 font-medium transition-all duration-200 border border-pink-400/30 hover:border-pink-400/50"
            >
              <Plus className="w-4 h-4 mr-2 inline" />
              Add Your First Event
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-auto">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => handleEventClick(event.id)}
              className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 hover:border-lime-400/30 transition-all duration-200 cursor-pointer p-4 rounded-xl group"
            >
              <div className="flex justify-between items-start mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(event.status)}`}>
                  {event.status ? event.status.replace('_', ' ') : 'Unknown'}
                </span>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleEditEvent(event, e)}
                    className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(event, e)}
                    className="p-1.5 hover:bg-red-900/50 rounded-lg transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-lime-400 transition-colors">
                  {event.name}
                </h3>
                {event.description && (
                  <p className="text-neutral-400 text-sm line-clamp-2">
                    {event.description}
                  </p>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-neutral-400">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location?.name ?? 'No location'}</span> {/* Promenjeno sa ?? za sigurnost */}
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(event.interval)}</span>
                </div>
                {event.endInterval && (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Clock className="w-4 h-4" />
                    <span>Ends {formatDate(event.endInterval)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span>Created {formatDate(event.createdAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-400/20 rounded-lg">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Delete Event</h2>
            </div>
            
            <p className="text-neutral-400 mb-6">
              Are you sure you want to delete "{eventToDelete?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 p-3 bg-red-600 hover:bg-red-700 rounded-xl transition-all duration-200 text-white border border-red-500/30 hover:border-red-500"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;