import { useState, useEffect } from "react"; 
import { PerformanceService } from "../../event-organization/services/performanceService";
import { VenueService } from "../services/venueService";
import { PerformerService } from "../../event-organization/services/performerService";
import { EventService } from "../../event-organization/services/eventService";
import type { PerformerResponse } from "../../event-organization/types/api/performer";
import type { PerformanceResponse } from "../../event-organization/types/api/performance";
import type { VenueResponse } from "../types/api/venue";
import type { EventResponse } from "../../event-organization/types/api/event";
import { toast } from 'react-toastify';
import PerformanceHeader from "../components/performances/PerformanceHeader";
import PerformanceStats from "../components/performances/PerformanceStats";
import PerformanceList from "../components/performances/PerformanceList";
import VenueAssignmentPanel from "../components/performances/VenueAssignmentPanel";
import PerformerDetailsPanel from "../components/performances/PerformerDetailsPanel";
import { AlertCircle } from "lucide-react";

// Export the interface so it can be used in other components
export interface PerformanceWithDetails extends PerformanceResponse {
  performer?: PerformerResponse;
  venue?: VenueResponse;
  event?: EventResponse;
}

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

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Performances List */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${(showVenuePanel || showPerformerPanel) ? 'w-3/5' : 'w-full'}`}>
            
            <PerformanceHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              filterVenue={filterVenue}
              onFilterVenueChange={setFilterVenue}
              filterStatus={filterStatus}
              onFilterStatusChange={setFilterStatus}
            />

            {/* Error Message */}
            {error && !showVenuePanel && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <AlertCircle size={20} className="text-red-400" />
                </div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            <PerformanceStats performances={performances} />

            <PerformanceList
              performances={filteredPerformances}
              loading={loading}
              onVenueAssign={openVenuePanel}
              onPerformerView={openPerformerPanel}
              getGenreColor={getGenreColor}
              formatDateTime={formatDateTime}
              formatDuration={formatDuration}
            />
          </div>

          {/* Right Panels */}
          {showVenuePanel && selectedPerformance && (
            <VenueAssignmentPanel
              performance={selectedPerformance}
              venues={venues}
              selectedVenueId={selectedVenueId}
              onVenueChange={setSelectedVenueId}
              onSubmit={assignVenue}
              onCancel={closeVenuePanel}
              submitting={submitting}
              error={error}
              getGenreColor={getGenreColor}
              formatDateTime={formatDateTime}
              formatDuration={formatDuration}
            />
          )}

          {showPerformerPanel && selectedPerformance && selectedPerformance.performer && (
            <PerformerDetailsPanel
              performance={selectedPerformance}
              onClose={closePerformerPanel}
              getGenreColor={getGenreColor}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Performances;