import { useState, useEffect } from "react"; 
import { MapPin, X, AlertCircle, Music, Calendar, Clock, User, Eye, Search } from "lucide-react";
import { PerformerService } from "../../event-organization/services/performerService";
import { PerformanceService } from "../../event-organization/services/performanceService";
import { VenueService } from "../services/venueService";
import { EventService } from "../../event-organization/services/eventService";
import type { PerformerResponse } from "../../event-organization/types/api/performer";
import type { PerformanceResponse } from "../../event-organization/types/api/performance";
import type { VenueResponse } from "../types/api/venue";
import type { EventResponse } from "../../event-organization/types/api/event";

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  
  // Panel states
  const [showVenuePanel, setShowVenuePanel] = useState(false);
  const [showPerformerPanel, setShowPerformerPanel] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceWithDetails | null>(null);
  const [selectedVenueId, setSelectedVenueId] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [filterVenue, setFilterVenue] = useState<string>("all");

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [performancesData, venuesData, performersData, eventsData] = await Promise.all([
        PerformanceService.getAllPerformances(),
        VenueService.getAllVenues(),
        PerformerService.getAllPerformers(),
        EventService.getAllEvents()
      ]);

      const processedPerformances = performancesData.map(perf => ({
        ...perf,
        startTime: new Date(perf.startTime),
        endTime: new Date(perf.endTime),
        createdAt: new Date(perf.createdAt),
        updatedAt: new Date(perf.updatedAt),
        deletedAt: perf.deletedAt ? new Date(perf.deletedAt) : undefined
      }));

      const processedEvents = eventsData.map(event => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
        createdAt: new Date(event.createdAt),
        updatedAt: new Date(event.updatedAt),
        deletedAt: event.deletedAt ? new Date(event.deletedAt) : undefined
      }));

      setVenues(venuesData);

      const enrichedPerformances: PerformanceWithDetails[] = processedPerformances.map(perf => {
        const performer = performersData.find(p => p.performerId === perf.performerId);
        const venue = venuesData.find(v => v.venueId === perf.venueId);
        
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

  // Venue assignment
  const assignVenue = async () => {
    if (!selectedPerformance) return;

    try {
      setSubmitting(true);
      setError("");

      const updateData = {
        venueId: selectedVenueId
      };

      await PerformanceService.updatePerformance(selectedPerformance.id, updateData);
      await fetchData();
      closeVenuePanel();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to assign venue. Please try again.";
      setError(errorMessage);
      console.error("Error assigning venue:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Panel handlers
  const openVenuePanel = (performance: PerformanceWithDetails) => {
    setError("");
    setSelectedPerformance(performance);
    setSelectedVenueId(performance.venueId || 0);
    setShowVenuePanel(true);
    setShowPerformerPanel(false);
  };

  const closeVenuePanel = () => {
    setShowVenuePanel(false);
    setSelectedPerformance(null);
    setSelectedVenueId(0);
    setError("");
  };

  const openPerformerPanel = (performance: PerformanceWithDetails) => {
    setSelectedPerformance(performance);
    setShowPerformerPanel(true);
    setShowVenuePanel(false);
  };

  const closePerformerPanel = () => {
    setShowPerformerPanel(false);
    setSelectedPerformance(null);
  };

  // Utility functions
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

  // Filter performances
  const filteredPerformances = performances.filter(perf => {
    if (searchTerm && !perf.performer?.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !perf.event?.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (filterStatus !== null && perf.status !== filterStatus) return false;
    if (filterVenue === "assigned" && perf.venueId === 0) return false;
    if (filterVenue === "unassigned" && perf.venueId !== 0) return false;
    return true;
  });

  // Statistics
  const totalPerformances = performances.length;
  const unassignedCount = performances.filter(p => p.venueId === 0).length;
  const assignedCount = performances.filter(p => p.venueId !== 0).length;
  const upcomingCount = performances.filter(p => p.status === 1).length;

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="text-white h-full p-4 m-1 flex flex-col">
      <div className="flex gap-4 h-full flex-1 min-h-0">
        {/* Left side - Performance list */}
        <div className={`transition-all duration-300 flex flex-col flex-1 min-h-0 ${
          (showVenuePanel || showPerformerPanel) ? 'w-3/5' : 'w-full'
        }`}>
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Performance Management</h1>
              <p className="text-neutral-400 text-sm">Manage performances and assign venues</p>
            </div>
          </div>

          {/* Error Message */}
          {error && !showVenuePanel && (
            <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
              <div className="p-2 bg-red-500/20 rounded-xl">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <Music className="w-6 h-6 text-lime-400" />
                </div>
                <div className="text-right">
                  <p className="text-neutral-400 text-sm">Total Performances</p>
                  <p className="text-white text-2xl">{totalPerformances}</p>
                  <p className="text-lime-400 text-sm">+12.5%</p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-lime-400/20 rounded-xl">
                  <MapPin className="w-6 h-6 text-lime-400" />
                </div>
                <div className="text-right">
                  <p className="text-neutral-400 text-sm">Assigned to Venue</p>
                  <p className="text-white text-2xl">{assignedCount}</p>
                  <p className="text-lime-400 text-sm">+8.2%</p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-orange-400/20 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                </div>
                <div className="text-right">
                  <p className="text-neutral-400 text-sm">Unassigned</p>
                  <p className="text-white text-2xl">{unassignedCount}</p>
                  <p className="text-red-400 text-sm">Needs attention</p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-blue-400/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <p className="text-neutral-400 text-sm">Upcoming</p>
                  <p className="text-white text-2xl">{upcomingCount}</p>
                  <p className="text-blue-400 text-sm">Planned</p>
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by performer or event name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterVenue("all")}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  filterVenue === "all"
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterVenue("assigned")}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  filterVenue === "assigned"
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Assigned
              </button>
              <button
                onClick={() => setFilterVenue("unassigned")}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  filterVenue === "unassigned"
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Unassigned
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus(null)}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  filterStatus === null
                    ? "bg-blue-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setFilterStatus(1)}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  filterStatus === 1
                    ? "bg-blue-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Planned
              </button>
            </div>
          </div>

          {/* Performances Grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-white text-base">Loading performances...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-4">
                {filteredPerformances.map((performance) => (
                  <div
                    key={performance.id}
                    className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 hover:border-neutral-700 transition-all duration-200 shadow-lg"
                  >
                    {/* Performance Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-lime-500/20 rounded-xl">
                          <Music className="w-5 h-5 text-lime-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg text-white truncate">
                            {performance.performer?.name || "Unknown Performer"}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-1 rounded-xl ${getGenreColor(performance.performer?.genre || '')}`}>
                              {performance.performer?.genre || "N/A"}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-xl ${PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.color}`}>
                              {PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openPerformerPanel(performance)}
                          className="p-2 bg-neutral-800 hover:bg-blue-600 rounded-xl transition-all duration-200"
                          title="View performer details"
                        >
                          <Eye size={16} className="text-neutral-400 hover:text-white" />
                        </button>
                        <button
                          onClick={() => openVenuePanel(performance)}
                          className="p-2 bg-neutral-800 hover:bg-lime-600 rounded-xl transition-all duration-200"
                          title="Assign venue"
                        >
                          <MapPin size={16} className="text-neutral-400 hover:text-white" />
                        </button>
                      </div>
                    </div>

                    {/* Event Information */}
                    {performance.event && (
                      <div className="bg-neutral-800/30 rounded-xl p-4 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span className="text-white text-sm">
                            {performance.event.name}: {formatDateTime(performance.startTime)} - {formatDateTime(performance.endTime)}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Performance Details */}
                    <div className="flex px-4 space-y-3 text-sm justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <Clock className="w-4 h-4 text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-neutral-400 text-xs mb-1">Performance Time</p>
                          <p className="text-white text-sm">{formatDateTime(performance.startTime)}</p>
                          <p className="text-neutral-400 text-xs">Duration: {formatDuration(performance.startTime, performance.endTime)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-lime-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-neutral-400 text-xs mb-1">Venue Assignment</p>
                          {performance.venue ? (
                            <div>
                              <p className="text-lime-400 text-sm">{performance.venue.name}</p>
                              <p className="text-neutral-400 text-xs">{performance.venue.city} • {performance.venue.capacity.toLocaleString()} capacity</p>
                            </div>
                          ) : (
                            <p className="text-orange-400 text-sm">Not Assigned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredPerformances.length === 0 && !loading && (
              <div className="text-center py-16 bg-neutral-900/30 rounded-2xl border border-neutral-800">
                <div className="p-4 bg-neutral-800/50 rounded-xl w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <Music className="w-8 h-8 text-neutral-400" />
                </div>
                <p className="text-neutral-400 text-base mb-2">No performances found</p>
                <p className="text-neutral-500 text-sm">No performances match your search criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Right side - Details Panel */}
        {(showPerformerPanel || showVenuePanel) && selectedPerformance && (
          <div className="w-2/5 transition-all duration-300 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto">
              {/* Performer Details Panel */}
              {showPerformerPanel && (
                <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl shadow-lg h-full">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-lime-500/20 rounded-xl">
                          <User className="w-6 h-6 text-lime-400" />
                        </div>
                        <div>
                          <h2 className="text-xl text-white">Performer Details</h2>
                          <p className="text-sm text-neutral-400">Read-only information</p>
                        </div>
                      </div>
                      <button
                        onClick={closePerformerPanel}
                        className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200"
                      >
                        <X size={20} className="text-neutral-400" />
                      </button>
                    </div>

                    {selectedPerformance.performer && (
                      <div className="space-y-4">
                        <div className="bg-neutral-800/30 rounded-xl p-4">
                          <h3 className="text-white text-lg mb-3">{selectedPerformance.performer.name}</h3>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-neutral-400">Genre</p>
                              <span className={`inline-block px-2 py-1 rounded-xl text-xs ${getGenreColor(selectedPerformance.performer.genre)}`}>
                                {selectedPerformance.performer.genre}
                              </span>
                            </div>
                            <div>
                              <p className="text-neutral-400">Popularity</p>
                              <p className="text-white">{selectedPerformance.performer.popularity}%</p>
                            </div>
                            <div>
                              <p className="text-neutral-400">Email</p>
                              <p className="text-white">{selectedPerformance.performer.email}</p>
                            </div>
                            <div>
                              <p className="text-neutral-400">Contact</p>
                              <p className="text-white">{selectedPerformance.performer.contact}</p>
                            </div>
                            <div>
                              <p className="text-neutral-400">Price Range</p>
                              <p className="text-green-400">
                                ${selectedPerformance.performer.minPrice.toLocaleString()} - ${selectedPerformance.performer.maxPrice.toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-neutral-400">Status</p>
                              <span className={`inline-block px-2 py-1 rounded-xl text-xs ${
                                selectedPerformance.performer.status === 'Active' 
                                  ? 'text-green-400 bg-green-500/20' 
                                  : 'text-gray-400 bg-gray-500/20'
                              }`}>
                                {selectedPerformance.performer.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={closePerformerPanel}
                            className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-3 rounded-xl transition-all duration-200 border border-neutral-700"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Venue Assignment Panel */}
              {showVenuePanel && (
                <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl shadow-lg h-full">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-lime-500/20 rounded-xl">
                          <MapPin className="w-6 h-6 text-lime-400" />
                        </div>
                        <div>
                          <h2 className="text-xl text-white">Assign Venue</h2>
                          <p className="text-sm text-neutral-400">Select a venue for this performance</p>
                        </div>
                      </div>
                      <button
                        onClick={closeVenuePanel}
                        className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200"
                      >
                        <X size={20} className="text-neutral-400" />
                      </button>
                    </div>

                    {error && (
                      <div className="bg-red-900/30 border border-red-500/30 text-red-200 p-3 rounded-xl flex items-center gap-3 mb-6">
                        <AlertCircle size={16} className="text-red-400" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}

                    {/* Performance Summary */}
                    <div className="bg-neutral-800/30 rounded-xl p-4 mb-6">
                      <h3 className="text-white text-base mb-3">Performance Details</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-neutral-400">Performer:</span>
                          <p className="text-white">{selectedPerformance.performer?.name}</p>
                        </div>
                        <div>
                          <span className="text-neutral-400">Genre:</span>
                          <span className={`inline-block px-2 py-1 rounded-xl text-xs ml-2 ${getGenreColor(selectedPerformance.performer?.genre || '')}`}>
                            {selectedPerformance.performer?.genre}
                          </span>
                        </div>
                        <div>
                          <span className="text-neutral-400">Start Time:</span>
                          <p className="text-white">{formatDateTime(selectedPerformance.startTime)}</p>
                        </div>
                        <div>
                          <span className="text-neutral-400">Duration:</span>
                          <p className="text-white">{formatDuration(selectedPerformance.startTime, selectedPerformance.endTime)}</p>
                        </div>
                        {selectedPerformance.event && (
                          <>
                            <div>
                              <span className="text-neutral-400">Event:</span>
                              <p className="text-white">{selectedPerformance.event.name}</p>
                            </div>
                            <div>
                              <span className="text-neutral-400">Event Date:</span>
                              <p className="text-white">{formatDateTime(selectedPerformance.event.startDate)}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Venue Selection */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-neutral-300 mb-3">
                          Select Venue *
                        </label>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {venues.map((venue) => (
                            <button
                              key={venue.venueId}
                              onClick={() => setSelectedVenueId(venue.venueId)}
                              className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                                selectedVenueId === venue.venueId
                                  ? "bg-lime-500/20 border-2 border-lime-500"
                                  : "bg-neutral-800/50 border-2 border-neutral-700 hover:border-neutral-600"
                              }`}
                              disabled={submitting}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <h4 className={`text-base ${selectedVenueId === venue.venueId ? "text-lime-400" : "text-white"}`}>
                                    {venue.name || "Unnamed Venue"}
                                  </h4>
                                  <p className="text-neutral-400 text-sm">{venue.city} • {venue.address}</p>
                                  <p className="text-neutral-400 text-xs mt-1">Capacity: {venue.capacity.toLocaleString()}</p>
                                </div>
                                {selectedVenueId === venue.venueId && (
                                  <div className="p-2 bg-lime-500/30 rounded-xl">
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
                          onClick={assignVenue}
                          disabled={submitting || selectedVenueId === 0}
                          className="flex-1 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-black py-3 rounded-xl transition-all duration-200 shadow-lg"
                        >
                          {submitting ? "Assigning..." : "Assign Venue"}
                        </button>
                        <button
                          onClick={closeVenuePanel}
                          disabled={submitting}
                          className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white py-3 rounded-xl transition-all duration-200 border border-neutral-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Performances;