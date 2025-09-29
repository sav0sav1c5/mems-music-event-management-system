import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, AlertCircle, Music, Calendar, MapPin, Clock, User } from "lucide-react";
import PerformanceService from '../../event-organization/services/performanceService';
import PerformerService from '../../event-organization/services/performerService';
import VenueService from '../services/venueService';
import EventService from '../../event-organization/services/eventService';

// Types based on your provided files
interface PerformanceResponse {
  id: number;
  performerId: number;
  venueId: number;
  startTime: Date;
  endTime: Date;
  setupTime: number;
  soundcheckTime: number;
  status: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

interface PerformerResponse {
  performerId: number;
  name: string;
  email: string;
  contact: string;
  genre: string;
  popularity: number;
  technicalRequirements: string;
  minPrice: number;
  maxPrice: number;
  averageResponseTime: string;
  status: string;
}

interface VenueResponse {
  venueId: number;
  name?: string;
  description?: string;
  city?: string;
  address?: string;
  capacity: number;
  venueType: number;
  eventId: number;
}

interface EventResponse {
  id: number;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  status: number;
}

interface PerformanceWithDetails extends PerformanceResponse {
  performer?: PerformerResponse;
  venue?: VenueResponse;
  event?: EventResponse;
}

const PerformanceStatus = {
  1: { label: "Planned", color: "text-blue-400 bg-blue-500/20" },
  2: { label: "In Progress", color: "text-yellow-400 bg-yellow-500/20" },
  3: { label: "Completed", color: "text-green-400 bg-green-500/20" },
  4: { label: "Cancelled", color: "text-red-400 bg-red-500/20" }
};

const Performances = () => {
  const [performances, setPerformances] = useState<PerformanceWithDetails[]>([]);
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [performers, setPerformers] = useState<PerformerResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceWithDetails | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [filterVenue, setFilterVenue] = useState<string>("all");

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [performancesData, venuesData, performersData, eventsData] = await Promise.all([
        PerformanceService.getAllPerformances(),
        VenueService.getAllVenues(),
        PerformerService.getAllPerformers(),
        EventService.getAllEvents()
      ]);

      // Process performances data to ensure dates are properly converted
      const processedPerformances = performancesData.map(perf => ({
        ...perf,
        startTime: new Date(perf.startTime),
        endTime: new Date(perf.endTime),
        createdAt: new Date(perf.createdAt),
        updatedAt: new Date(perf.updatedAt),
        deletedAt: perf.deletedAt ? new Date(perf.deletedAt) : undefined
      }));

      // Process events data to ensure dates are properly converted
      const processedEvents = eventsData.map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
        deletedAt: event.deletedAt ? new Date(event.deletedAt) : undefined
      }));

      setVenues(venuesData);
      setPerformers(performersData);
      setEvents(processedEvents);

      // Enrich performances with related data
      const enrichedPerformances: PerformanceWithDetails[] = processedPerformances.map(perf => {
        const performer = performersData.find(p => p.performerId === perf.performerId);
        const venue = venuesData.find(v => v.venueId === perf.venueId);
        
        // Find event that might be associated with this performance
        // This logic might need adjustment based on your actual data relationships
        const event = processedEvents.find(e => 
          e.venueIds?.includes(perf.venueId) || 
          e.id === venuesData.find(v => v.venueId === perf.venueId)?.eventId
        );

        return {
          ...perf,
          performer,
          venue,
          event
        };
      });

      setPerformances(enrichedPerformances);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch data. Please try again.";
      setError(errorMessage);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const assignVenue = async () => {
    if (!selectedPerformance) return;

    try {
      setSubmitting(true);
      setError("");

      // Prepare update data
      const updateData = {
        venueId: selectedVenueId
      };

      // Update the performance with the selected venue
      await PerformanceService.updatePerformance(selectedPerformance.id, updateData);

      // Refresh data to show updated information
      await fetchAllData();
      closeModal();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to assign venue. Please try again.";
      setError(errorMessage);
      console.error("Error assigning venue:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const openModal = (performance: PerformanceWithDetails) => {
    setError("");
    setSelectedPerformance(performance);
    setSelectedVenueId(performance.venueId || 0);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPerformance(null);
    setSelectedVenueId(0);
    setError("");
  };

  const handleSubmit = () => {
    assignVenue();
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('sr-RS', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      'Rock': 'text-red-400 bg-red-500/20',
      'Pop': 'text-pink-400 bg-pink-500/20',
      'Electronic': 'text-blue-400 bg-blue-500/20',
      'Jazz': 'text-purple-400 bg-purple-500/20',
      'Classical': 'text-yellow-400 bg-yellow-500/20',
      'Hip Hop': 'text-orange-400 bg-orange-500/20'
    };
    return colors[genre] || 'text-gray-400 bg-gray-500/20';
  };

  const filteredPerformances = performances.filter(perf => {
    if (filterStatus !== null && perf.status !== filterStatus) return false;
    if (filterVenue === "assigned" && perf.venueId === 0) return false;
    if (filterVenue === "unassigned" && perf.venueId !== 0) return false;
    return true;
  });

  const unassignedCount = performances.filter(p => p.venueId === 0).length;
  const assignedCount = performances.filter(p => p.venueId !== 0).length;
  const totalPerformances = performances.length;

  useEffect(() => {
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading performances...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Performances</h1>
          <p className="text-gray-400">Assign venues to performances</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Performances</p>
              <h3 className="text-2xl font-bold text-white">{totalPerformances}</h3>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <MapPin className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Assigned to Venue</p>
              <h3 className="text-2xl font-bold text-white">{assignedCount}</h3>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <AlertCircle className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Unassigned</p>
              <h3 className="text-2xl font-bold text-white">{unassignedCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterVenue("all")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterVenue === "all"
                ? "bg-lime-500 text-black"
                : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterVenue("assigned")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterVenue === "assigned"
                ? "bg-lime-500 text-black"
                : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
            }`}
          >
            Assigned
          </button>
          <button
            onClick={() => setFilterVenue("unassigned")}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterVenue === "unassigned"
                ? "bg-lime-500 text-black"
                : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
            }`}
          >
            Unassigned
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === null
                ? "bg-blue-500 text-black"
                : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
            }`}
          >
            All Status
          </button>
          <button
            onClick={() => setFilterStatus(1)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 1
                ? "bg-blue-500 text-black"
                : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
            }`}
          >
            Planned
          </button>
          <button
            onClick={() => setFilterStatus(2)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filterStatus === 2
                ? "bg-yellow-500 text-black"
                : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
            }`}
          >
            In Progress
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPerformances.map((performance) => (
          <div
            key={performance.id}
            className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl hover:border-neutral-700 transition-all duration-200 group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-lime-500/20 rounded-lg">
                  <Music className="w-5 h-5 text-lime-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white group-hover:text-lime-400 transition-colors">
                    {performance.performer?.name || "Unknown Performer"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-lg ${getGenreColor(performance.performer?.genre || '')}`}>
                      {performance.performer?.genre || "N/A"}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-lg ${PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.color}`}>
                      {PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.label}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => openModal(performance)}
                className="p-2 bg-neutral-800 hover:bg-lime-600 rounded-lg transition-colors"
                title="Assign venue"
              >
                <MapPin size={16} className="text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <Calendar className="w-4 h-4 text-blue-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Performance Time</p>
                  <p className="text-white font-medium">{formatDateTime(performance.startTime)}</p>
                  <p className="text-gray-400 text-xs">Duration: {formatDuration(performance.startTime, performance.endTime)}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <User className="w-4 h-4 text-purple-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Performer Details</p>
                  <p className="text-white text-xs">{performance.performer?.contact}</p>
                  <p className="text-gray-400 text-xs">Popularity: {performance.performer?.popularity}%</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-gray-400 text-xs">Setup & Soundcheck</p>
                  <p className="text-white text-xs">Setup: {performance.setupTime} min | Soundcheck: {performance.soundcheckTime} min</p>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Assigned Venue:</span>
                  {performance.venue ? (
                    <div className="text-right">
                      <p className="text-lime-400 font-bold text-sm">{performance.venue.name}</p>
                      <p className="text-gray-400 text-xs">{performance.venue.city} • {performance.venue.capacity.toLocaleString()} cap.</p>
                    </div>
                  ) : (
                    <span className="text-orange-400 font-medium text-sm">Not Assigned</span>
                  )}
                </div>
              </div>

              {performance.performer?.technicalRequirements && (
                <div className="pt-2 border-t border-neutral-800">
                  <p className="text-gray-400 text-xs mb-1">Technical Requirements:</p>
                  <p className="text-gray-300 text-xs">{performance.performer.technicalRequirements}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPerformances.length === 0 && !loading && (
        <div className="text-center py-16 bg-neutral-900/30 rounded-2xl border border-neutral-800">
          <div className="p-4 bg-neutral-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Music className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg mb-2">No performances found</p>
          <p className="text-gray-500 text-sm">No performances match your filter criteria</p>
        </div>
      )}

      {showModal && selectedPerformance && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lime-500/20 rounded-lg">
                  <MapPin className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Assign Venue</h2>
                  <p className="text-sm text-gray-400">Select a venue for this performance</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-200 p-3 rounded-xl flex items-center gap-3 mb-6">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="bg-neutral-800/30 rounded-xl p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">Performance Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Performer:</span>
                  <span className="text-white font-medium">{selectedPerformance.performer?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Genre:</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getGenreColor(selectedPerformance.performer?.genre || '')}`}>
                    {selectedPerformance.performer?.genre}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Start Time:</span>
                  <span className="text-white">{formatDateTime(selectedPerformance.startTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="text-white">{formatDuration(selectedPerformance.startTime, selectedPerformance.endTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Setup Time:</span>
                  <span className="text-white">{selectedPerformance.setupTime} minutes</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Select Venue *
                </label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {venues.map((venue) => (
                    <button
                      key={venue.venueId}
                      onClick={() => setSelectedVenueId(venue.venueId)}
                      className={`w-full p-4 rounded-xl text-left transition-all ${
                        selectedVenueId === venue.venueId
                          ? "bg-lime-500/20 border-2 border-lime-500"
                          : "bg-neutral-800/50 border-2 border-neutral-700 hover:border-neutral-600"
                      }`}
                      disabled={submitting}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${selectedVenueId === venue.venueId ? "text-lime-400" : "text-white"}`}>
                            {venue.name || "Unnamed Venue"}
                          </h4>
                          <p className="text-gray-400 text-sm">{venue.city} • {venue.address}</p>
                          <p className="text-gray-400 text-xs mt-1">Capacity: {venue.capacity.toLocaleString()}</p>
                        </div>
                        {selectedVenueId === venue.venueId && (
                          <div className="p-2 bg-lime-500/30 rounded-lg">
                            <MapPin className="w-5 h-5 text-lime-400" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || selectedVenueId === 0}
                  className="flex-1 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-black py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
                >
                  {submitting ? "Assigning..." : "Assign Venue"}
                </button>
                <button
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors border border-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performances;