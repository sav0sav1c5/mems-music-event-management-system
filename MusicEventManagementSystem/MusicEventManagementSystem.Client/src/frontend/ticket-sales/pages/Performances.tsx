import { Card, KpiCard } from "../components/card";
import { useState, useEffect } from "react"; 
import { MapPin, X, AlertCircle, Music, Calendar, Clock, Eye, Users, Filter, RefreshCw } from "lucide-react";
import { PerformerService } from "../../event-organization/services/performerService";
import { PerformanceService } from "../../event-organization/services/performanceService";
import { VenueService } from "../services/venueService";
import { EventService } from "../../event-organization/services/eventService";
import { CustomSelect } from '../components/customSelect';
import type { PerformerResponse } from "../../event-organization/types/api/performer";
import type { PerformanceResponse } from "../../event-organization/types/api/performance";
import type { VenueResponse } from "../types/api/venue";
import type { EventResponse } from "../../event-organization/types/api/event";
import { toast } from 'react-toastify';

interface PerformanceWithDetails extends PerformanceResponse {
  performer?: PerformerResponse;
  venue?: VenueResponse;
  event?: EventResponse;
}

const PerformanceStatus = {
  1: { label: "Planned", color: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
  2: { label: "In Progress", color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30" },
  3: { label: "Completed", color: "text-green-400 bg-green-500/20 border-green-500/30" },
  4: { label: "Cancelled", color: "text-red-400 bg-red-500/20 border-red-500/30" }
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
  const [filterStatus, setFilterStatus] = useState<number | null>(null);
  const [filterVenue, setFilterVenue] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

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

      toast.success('Venue assigned successfully!');
      closeVenuePanel();
    } catch (err: any) {
      const errorMessage = err.message || "Failed to assign venue. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
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
      'Rock': 'text-red-400 bg-red-500/20 border-red-500/30',
      'Pop': 'text-pink-400 bg-pink-500/20 border-pink-500/30',
      'Electronic': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      'Jazz': 'text-purple-400 bg-purple-500/20 border-purple-500/30',
      'Classical': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      'Hip Hop': 'text-orange-400 bg-orange-500/20 border-orange-500/30'
    };
    return colors[genre] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
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
    const matchesSearch = searchTerm === '' || 
      perf.performer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perf.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perf.event?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === null || perf.status === filterStatus;
    const matchesVenue = filterVenue === "all" || 
      (filterVenue === "assigned" && perf.venueId !== 0) ||
      (filterVenue === "unassigned" && perf.venueId === 0);

    return matchesSearch && matchesStatus && matchesVenue;
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
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Main Content Area with Right Panel - KAO U INFRASTRUCTURE */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Performances List - SVE SE POMERA ZAJEDNO */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${(showVenuePanel || showPerformerPanel) ? 'w-3/5' : 'w-full'}`}>
            {/* Header - POMERA SE ZAJEDNO SA OSTALIM SADRŽAJEM */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Performance Management</h1>
                  <p className="text-neutral-400 text-sm">Manage performances and assign venues</p>
                </div>
                
                {/* Search and Filter - POMERAJU SE ZAJEDNO SA HEADEROM SA RESPONSIVE ŠIRINAMA */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="min-w-0 flex-1 max-w-80">
                    <div className="relative">
                      <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search performances..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomSelect
                      value={filterVenue}
                      onChange={setFilterVenue}
                      options={[
                        { value: 'all', label: 'All Venues' },
                        { value: 'assigned', label: 'Assigned' },
                        { value: 'unassigned', label: 'Unassigned' }
                      ]}
                      placeholder="Venue Status"
                      icon={<MapPin className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>

                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomSelect
                      value={filterStatus === null ? "all" : filterStatus.toString()}
                      onChange={(value) => setFilterStatus(value === "all" ? null : parseInt(value))}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: '1', label: 'Planned' },
                        { value: '2', label: 'In Progress' },
                        { value: '3', label: 'Completed' },
                        { value: '4', label: 'Cancelled' }
                      ]}
                      placeholder="Performance Status"
                      icon={<Calendar className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message - POMERA SE ZAJEDNO */}
            {error && !showVenuePanel && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Statistics - POMERA SE ZAJEDNO */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <KpiCard
                icon={Music}
                title="Total Performances"
                value={totalPerformances}
                change={12.5}
                changeType="percentage"
                color="lime"
              />
              
              <KpiCard
                icon={MapPin}
                title="Assigned to Venue"
                value={assignedCount}
                change={8.2}
                changeType="percentage"
                color="lime"
              />
              
              <KpiCard
                icon={AlertCircle}
                title="Unassigned"
                value={unassignedCount}
                change={-5.0}
                changeType="percentage"
                color="orange"
              />
              
              <KpiCard
                icon={Calendar}
                title="Upcoming"
                value={upcomingCount}
                change={15.3}
                changeType="percentage"
                color="sky"
              />
            </div>

            {/* Performances List - POMERA SE ZAJEDNO */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <Card className="overflow-hidden h-full">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold text-white">Performances</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-neutral-400 text-sm">{filteredPerformances.length} performance(s) found</p>
                  </div>
                </div>
                
                <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <RefreshCw className="w-10 h-10 text-lime-400 animate-spin mb-3" />
                      <p className="text-neutral-400 text-base">Loading performances...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredPerformances.map((performance) => (
                        <Card
                          key={performance.id}
                          className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200"
                        >
                          {/* Dugmad u gornjem desnom uglu - UVIJEK VIDLJIVA */}
                          <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openPerformerPanel(performance);
                              }}
                              className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200"
                              title="View performer details"
                            >
                              <Eye className="w-5 h-5 text-neutral-400 hover:text-blue-400 transition-colors" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openVenuePanel(performance);
                              }}
                              className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                              title="Assign venue"
                            >
                              <MapPin className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
                            </button>
                          </div>

                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center">
                              <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
                                <Music className="w-6 h-6 text-lime-400" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                                  {performance.performer?.name || 'Unknown Performer'}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGenreColor(performance.performer?.genre || '')}`}>
                                    {performance.performer?.genre || "N/A"}
                                  </span>
                                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.color}`}>
                                    {PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {/* Event Information */}
                            {performance.event && (
                              <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                                <div>
                                  <span className="text-white text-sm font-medium block">{performance.event.name}</span>
                                  <span className="text-neutral-400 text-xs">
                                    {formatDateTime(performance.startTime)} - {formatDateTime(performance.endTime)}
                                  </span>
                                </div>
                              </div>
                            )}
                            
                            {/* Venue Information */}
                            <div className="flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
                              {performance.venue ? (
                                <div>
                                  <span className="text-lime-400 text-sm font-medium block">{performance.venue.name}</span>
                                  <span className="text-neutral-400 text-xs">
                                    {performance.venue.city} • {performance.venue.capacity.toLocaleString()} capacity
                                  </span>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-orange-400" />
                                  <span className="text-orange-400 text-sm font-medium">Venue Not Assigned</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {filteredPerformances.length === 0 && !loading && (
                    <div className="text-center py-16 text-neutral-400">
                      <Music size={64} className="mx-auto mb-4 opacity-50" />
                      <h4 className="text-xl mb-2">No performances found</h4>
                      <p className="text-base">
                        {searchTerm || filterStatus !== null || filterVenue !== "all" 
                          ? 'Try adjusting your search criteria or filters' 
                          : 'No performances available in the system'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Panel - Desno od CELOG SADRŽAJA (kao u Infrastructure) */}
          {(showVenuePanel || showPerformerPanel) && (
            <div className="w-2/5 transition-all duration-300">
              {/* Venue Assignment Panel */}
              {showVenuePanel && (
                <Card className="overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900/60 backdrop-blur-sm h-full">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
                    <h2 className="text-xl font-bold text-lime-400">Assign Venue</h2>
                    <button
                      onClick={closeVenuePanel}
                      className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6 overflow-y-auto px-1">
                    {/* Performance Summary */}
                    {selectedPerformance && (
                      <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700">
                        <h4 className="text-white font-semibold text-lg mb-3">Performance Details</h4>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Performer:</span>
                            <span className="text-white font-medium">{selectedPerformance.performer?.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Genre:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getGenreColor(selectedPerformance.performer?.genre || '')}`}>
                              {selectedPerformance.performer?.genre || "N/A"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Start Time:</span>
                            <span className="text-white font-medium">{formatDateTime(selectedPerformance.startTime)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Duration:</span>
                            <span className="text-white font-medium">{formatDuration(selectedPerformance.startTime, selectedPerformance.endTime)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-neutral-400">Status:</span>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${PerformanceStatus[selectedPerformance.status as keyof typeof PerformanceStatus]?.color}`}>
                              {PerformanceStatus[selectedPerformance.status as keyof typeof PerformanceStatus]?.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Venue Selection Form sa CUSTOM SELECT */}
                    <div>
                      <label className="block text-sm font-medium mb-3 text-neutral-300">Select Venue *</label>
                      <CustomSelect
                        value={selectedVenueId.toString()}
                        onChange={(value) => setSelectedVenueId(parseInt(value))}
                        options={[
                          { value: '0', label: 'Select Venue' },
                          ...venues.map(v => ({ 
                            value: v.venueId.toString(), 
                            label: `${v.name} (${v.city} • ${v.capacity.toLocaleString()} capacity)` 
                          }))
                        ]}
                        placeholder="Select Venue"
                        className="w-full"
                      />
                    </div>

                    {error && showVenuePanel && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-400" />
                          <span className="text-red-400 text-sm">{error}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-3 pt-4 border-t border-neutral-800">
                      <button
                        type="button"
                        onClick={closeVenuePanel}
                        className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={assignVenue}
                        disabled={submitting || selectedVenueId === 0}
                        className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold"
                      >
                        {submitting ? 'Assigning...' : 'Assign Venue'}
                      </button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Performer Details Panel */}
              {showPerformerPanel && selectedPerformance && selectedPerformance.performer && (
                <Card className="overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900/60 backdrop-blur-sm h-full">
                  <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
                    <h2 className="text-xl font-bold text-lime-400">Performer Details</h2>
                    <button
                      onClick={closePerformerPanel}
                      className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6 overflow-y-auto px-1">
                    {/* Performer Header */}
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-lime-500/20 rounded-xl border border-lime-500/30">
                        <Music className="w-8 h-8 text-lime-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-xl">
                          {selectedPerformance.performer.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getGenreColor(selectedPerformance.performer.genre)}`}>
                            {selectedPerformance.performer.genre}
                          </span>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${
                            selectedPerformance.performer.status === 'Active' 
                              ? 'text-green-400 bg-green-500/20 border-green-500/30' 
                              : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                          }`}>
                            {selectedPerformance.performer.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Performer Details */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
                        <span className="text-neutral-300 text-base">Popularity</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-neutral-700 rounded-full h-2">
                            <div 
                              className="bg-yellow-400 h-2 rounded-full" 
                              style={{ width: `${selectedPerformance.performer.popularity}%` }}
                            ></div>
                          </div>
                          <span className="text-yellow-400 text-base font-bold">
                            {selectedPerformance.performer.popularity}%
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
                        <span className="text-neutral-300 text-base">Price Range</span>
                        <span className="text-green-400 text-base font-bold">
                          ${selectedPerformance.performer.minPrice.toLocaleString()} - ${selectedPerformance.performer.maxPrice.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
                        <span className="text-neutral-300 text-base">Email</span>
                        <span className="text-white text-base">{selectedPerformance.performer.email}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
                        <span className="text-neutral-300 text-base">Contact</span>
                        <span className="text-white text-base">{selectedPerformance.performer.contact}</span>
                      </div>

                      {selectedPerformance.performer.technicalRequirements && (
                        <div className="p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
                          <span className="text-neutral-300 text-base block mb-2">Technical Requirements</span>
                          <p className="text-white text-sm">{selectedPerformance.performer.technicalRequirements}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-neutral-700">
                        <span className="text-neutral-300 text-base">Average Response Time</span>
                        <span className="text-white text-base">{selectedPerformance.performer.averageResponseTime}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-neutral-800">
                      <button 
                        onClick={closePerformerPanel}
                        className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold rounded-xl transition-all duration-200 border border-neutral-700 hover:border-neutral-500"
                      >
                        Close Details
                      </button>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Performances;