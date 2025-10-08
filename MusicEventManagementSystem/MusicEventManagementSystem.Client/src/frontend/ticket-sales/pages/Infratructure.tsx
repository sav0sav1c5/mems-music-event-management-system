import { useState, useEffect } from 'react';
import { Search, RefreshCw, Plus } from 'lucide-react';

// Import servisa
import VenueService from '../services/venueService';
import { EventService } from '../../event-organization/services/eventService';

// Import tipova
import type { VenueResponse } from '../types/api/venue';
import type { EventResponse } from '../../event-organization/types/api/event';

// Import komponenti
import { CustomSelect } from '../components/ui/customSelect';
import VenueList from '../components/infrastructure/VenueList';
import VenueForm from '../components/infrastructure/VenueForm';
import VenueDetailView from '../components/infrastructure/VenueDetailView';

const Infrastructure = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<VenueResponse | null>(null);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueResponse | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Učitavanje podataka
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [eventsData, venuesData] = await Promise.all([
        EventService.getAllEvents().catch(() => []),
        VenueService.getAllVenues().catch(() => [])
      ]);

      setEvents(eventsData || []);
      setVenues(venuesData || []);
      
      if (eventsData && eventsData.length > 0) {
        setSelectedEvent(eventsData[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setEvents([]);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue => {
    const matchesSearch = venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesEvent = selectedEventFilter === 0 || venue.eventId === selectedEventFilter;
    
    return matchesSearch && matchesEvent;
  });

  const handleEditVenue = (venue: VenueResponse) => {
    setEditingVenue(venue);
    setShowEditForm(true);
    setShowVenueForm(false);
  };

  const handleVenueCreated = (newVenue: VenueResponse) => {
    setVenues([...venues, newVenue]);
    setShowVenueForm(false);
  };

  const handleVenueUpdated = (updatedVenue: VenueResponse) => {
    setVenues(venues.map(v => v.venueId === updatedVenue.venueId ? updatedVenue : v));
    setShowEditForm(false);
    setEditingVenue(null);
  };

  const handleCancelForm = () => {
    setShowVenueForm(false);
    setShowEditForm(false);
    setEditingVenue(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-10 h-10 text-lime-400 animate-spin" />
          <p className="text-neutral-400 text-base">Loading infrastructure data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        <div className="flex gap-3 h-full">
          {/* Glavni sadržaj */}
          <div className={`flex-1 transition-all duration-300 ${(showVenueForm || showEditForm) ? 'w-3/4' : 'w-full'}`}>
            <div className="h-full flex flex-col">
              {selectedVenue ? (
                <VenueDetailView 
                  venue={selectedVenue}
                  onBack={() => setSelectedVenue(null)}
                />
              ) : (
                <div className="space-y-4 flex-1 flex flex-col">
                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h1 className="text-2xl font-bold text-white mb-1">Infrastructure Management</h1>
                        <p className="text-neutral-400 text-sm">Manage venues, segments, and seating zones by event</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={loadInitialData}
                          className="px-4 py-3 rounded-xl bg-neutral-800 text-white font-medium hover:bg-neutral-700 transition-all duration-200 flex items-center gap-2 text-base"
                        >
                          <RefreshCw size={20} />
                          Refresh
                        </button>
                        <button 
                          onClick={() => setShowVenueForm(!showVenueForm)}
                          className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400"
                        >
                          <Plus size={20} />
                          New Venue
                        </button>
                      </div>
                    </div>
                    
                    {/* Search i Filter Bar */}
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search venues by name, city, or address..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
                        />
                      </div>
                      <div className="w-80">
                        <CustomSelect
                          value={selectedEventFilter.toString()}
                          onChange={(value) => setSelectedEventFilter(parseInt(value))}
                          options={[
                            { value: '0', label: 'All Events' },
                            ...events.map(event => ({
                              value: event.id.toString(),
                              label: event.name
                            }))
                          ]}
                          placeholder="All Events"
                          icon={<Search className="w-5 h-5 text-neutral-400" />}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Venues Section */}
                  <div className="flex-1 min-h-0">
                    <VenueList
                      venues={filteredVenues}
                      events={events}
                      selectedEventFilter={selectedEventFilter}
                      onVenueSelect={setSelectedVenue}
                      onVenueEdit={handleEditVenue}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Forma za kreiranje/edit venue */}
          {(showVenueForm || showEditForm) && (
            <div className="w-2/5 transition-all duration-300">
              <VenueForm
                venue={editingVenue}
                events={events}
                isEdit={showEditForm}
                onVenueCreated={handleVenueCreated}
                onVenueUpdated={handleVenueUpdated}
                onCancel={handleCancelForm}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Infrastructure;