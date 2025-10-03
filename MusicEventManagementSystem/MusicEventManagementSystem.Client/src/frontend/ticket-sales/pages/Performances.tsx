import { Card, KpiCard } from "../../ticket-sales/components/card";
import { useState, useEffect } from "react"; 
import { MapPin, X, AlertCircle, Music, Calendar, Clock, Eye } from "lucide-react";
import { PerformerService } from "../../event-organization/services/performerService";
import { PerformanceService } from "../../event-organization/services/performanceService";
import { VenueService } from "../services/venueService";
import { EventService } from "../../event-organization/services/eventService";
import { CustomSelect } from '../components/customSelect';
import FormPanel from '../components/formPanel';
import type { FormField } from '../components/formPanel';
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
  1: { label: "Planned", color: "text-blue-400 bg-blue-500/20" },
  2: { label: "In Progress", color: "text-yellow-400 bg-yellow-500/20" },
  3: { label: "Completed", color: "text-green-400 bg-green-500/20" },
  4: { label: "Cancelled", color: "text-red-400 bg-red-500/20" }
};

// Form fields for venue assignment
const venueFormFields: FormField[] = [
  {
    name: 'venueId',
    label: 'Select Venue',
    type: 'select',
    required: true,
    options: [] // Will be populated dynamically
  }
];

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
  const assignVenue = async (formData: Partial<PerformanceWithDetails>) => {
    if (!selectedPerformance) return;

    try {
      setSubmitting(true);
      setError("");

      const venueId = formData.venueId as number;
      
      const updateData = {
        venueId: venueId
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
    <div className="relative flex gap-3">
      {/* Main Content - Left Side */}
      <div className={`bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl transition-all duration-300 ${
        (showVenuePanel || showPerformerPanel) ? 'w-3/5' : 'w-full'
      }`}>
        <div className="text-white h-full flex flex-col p-4 m-1">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Performance Management</h1>
                <p className="text-neutral-400 text-sm">Manage performances and assign venues</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <CustomSelect
                  value={filterVenue}
                  onChange={setFilterVenue}
                  options={[
                    { value: 'all', label: 'All Venues' },
                    { value: 'assigned', label: 'Assigned' },
                    { value: 'unassigned', label: 'Unassigned' }
                  ]}
                  className="min-w-40"
                />

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
                  className="min-w-40"
                />
              </div>
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

          {/* Performances Grid */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-white text-base">Loading performances...</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 pb-4">
                {filteredPerformances.map((performance) => (
                  <Card
                    key={performance.id}
                    hover={true}
                    className="p-6 cursor-pointer transition-all duration-200"
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
                  </Card>
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
      </div>

      {/* Right Panel - Venue Assignment */}
      <FormPanel
        isOpen={showVenuePanel}
        onClose={closeVenuePanel}
        mode="edit"
        title="Assign Venue"
        entity={{ venueId: selectedVenueId } as PerformanceWithDetails}
        fields={venueFormFields.map(field => 
          field.name === 'venueId' 
            ? { 
                ...field, 
                options: [
                  { value: 0, label: 'Select Venue' },
                  ...venues.map(v => ({ 
                    value: v.venueId, 
                    label: `${v.name} (${v.city} • ${v.capacity.toLocaleString()} capacity)` 
                  }))
                ] 
              }
            : field
        )}
        onSubmit={assignVenue}
        loading={submitting}
        width="w-2/5"
      >
        {error && showVenuePanel && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}
        
        {/* Performance Summary */}
        {selectedPerformance && (
          <div className="bg-neutral-800/30 rounded-xl p-4 mb-4">
            <h4 className="text-white font-medium text-base mb-3">Performance Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-400">Performer:</span>
                <span className="text-white">{selectedPerformance.performer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Genre:</span>
                <span className={`inline-block px-2 py-1 rounded-xl text-xs ${getGenreColor(selectedPerformance.performer?.genre || '')}`}>
                  {selectedPerformance.performer?.genre}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Start Time:</span>
                <span className="text-white">{formatDateTime(selectedPerformance.startTime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-400">Duration:</span>
                <span className="text-white">{formatDuration(selectedPerformance.startTime, selectedPerformance.endTime)}</span>
              </div>
            </div>
          </div>
        )}
      </FormPanel>

      {/* Right Panel - Performer Details (Manual implementation since it's view-only) */}
      {showPerformerPanel && selectedPerformance && selectedPerformance.performer && (
        <div className="w-2/5 transition-all duration-300">
          <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-max">
            <div className="p-4 m-1 h-full flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white">Performer Details</h3>
                <button
                  onClick={closePerformerPanel}
                  className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto flex-1">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-white font-medium text-lg mb-2">
                      {selectedPerformance.performer.name}
                    </h4>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 text-base">Genre</span>
                      <span className={`inline-block px-2 py-1 rounded-xl text-xs ${getGenreColor(selectedPerformance.performer.genre)}`}>
                        {selectedPerformance.performer.genre}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 text-base">Popularity</span>
                      <span className="text-white text-base font-medium">
                        {selectedPerformance.performer.popularity}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 text-base">Email</span>
                      <span className="text-white text-base">{selectedPerformance.performer.email}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 text-base">Contact</span>
                      <span className="text-white text-base">{selectedPerformance.performer.contact}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 text-base">Price Range</span>
                      <span className="text-green-400 text-base font-medium">
                        ${selectedPerformance.performer.minPrice.toLocaleString()} - ${selectedPerformance.performer.maxPrice.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-neutral-300 text-base">Status</span>
                      <span className={`inline-block px-2 py-1 rounded-xl text-xs ${
                        selectedPerformance.performer.status === 'Active' 
                          ? 'text-green-400 bg-green-500/20' 
                          : 'text-gray-400 bg-gray-500/20'
                      }`}>
                        {selectedPerformance.performer.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button 
                      onClick={closePerformerPanel}
                      className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Performances;