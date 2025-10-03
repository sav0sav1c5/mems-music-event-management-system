import { useState, useEffect } from 'react';
import { Search, MapPin, Users, Settings, Edit, Eye, ArrowLeft, Plus, RefreshCw, X, Filter } from 'lucide-react';

// Import servisa
import VenueService from '../../services/venueService';
import SegmentService from '../../services/segmentService';
import ZoneService from '../../services/zoneService';
import { EventService } from '../../../event-organization/services/eventService';

// Import tipova
import type { VenueResponse } from '../../types/api/venue';
import type { SegmentResponse } from '../../types/api/segment';
import type { ZoneResponse } from '../../types/api/zone';
import type { EventResponse } from '../../../event-organization/types/api/event';

// Import enumova
import { VenueType, SegmentType, ZonePosition } from '../../types/enums/TicketSales';
import { EventStatus } from '../../../event-organization/types/enums/EventOrganization';

// Form tipovi
import type { VenueCreateForm, VenueUpdateForm } from '../../types/forms/venue';
import type { SegmentCreateForm } from '../../types/forms/segment';
import type { ZoneCreateForm } from '../../types/forms/zone';

// Import Card komponenti
import { Card } from '../card';
import { CustomSelect } from '../customSelect';
import { toast } from 'react-toastify';

// Helper funkcije za mappiranje enumova
const getStatusColor = (status: EventStatus) => {
  switch (status) {
    case EventStatus.Planned: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case EventStatus.InProgress: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case EventStatus.Completed: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case EventStatus.Cancelled: return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};

const getVenueTypeColor = (type: VenueType) => {
  switch (type) {
    case VenueType.Club: return 'bg-purple-500/20 text-purple-300';
    case VenueType.Arena: return 'bg-orange-500/20 text-orange-300';
    case VenueType.Outdoor: return 'bg-green-500/20 text-green-300';
    case VenueType.Indoor: return 'bg-blue-500/20 text-blue-300';
    case VenueType.Stadium: return 'bg-red-500/20 text-red-300';
    case VenueType.Theater: return 'bg-pink-500/20 text-pink-300';
    case VenueType.Festival: return 'bg-yellow-500/20 text-yellow-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
};

const getVenueTypeName = (type: VenueType): string => {
  const typeMap = {
    [VenueType.Indoor]: 'Indoor',
    [VenueType.Outdoor]: 'Outdoor', 
    [VenueType.Stadium]: 'Stadium',
    [VenueType.Arena]: 'Arena',
    [VenueType.Theater]: 'Theater',
    [VenueType.Club]: 'Club',
    [VenueType.Festival]: 'Festival'
  };
  return typeMap[type] || 'Unknown';
};

const getSegmentTypeName = (type: SegmentType): string => {
  const typeMap = {
    [SegmentType.VIP]: 'VIP',
    [SegmentType.Standard]: 'Standard',
    [SegmentType.Premium]: 'Premium',
    [SegmentType.Standing]: 'Standing',
    [SegmentType.Seated]: 'Seated'
  };
  return typeMap[type] || 'Unknown';
};

const getEventStatusName = (status: EventStatus): string => {
  switch (status) {
    case EventStatus.Planned: return 'Planned';
    case EventStatus.InProgress: return 'In Progress';
    case EventStatus.Completed: return 'Completed';
    case EventStatus.Cancelled: return 'Cancelled';
    default: return 'Unknown';
  }
};

const Infrastructure = () => {
  const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
  const [selectedVenue, setSelectedVenue] = useState<VenueResponse | null>(null);
  const [activeTab, setActiveTab] = useState('segments');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventFilter, setSelectedEventFilter] = useState<number>(0); // 0 = svi eventi
  const [loading, setLoading] = useState(true);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [venueForm, setVenueForm] = useState<VenueCreateForm>({
    name: '',
    address: '',
    city: '',
    capacity: 0,
    eventId: 0,
    venueType: VenueType.Indoor
  });
  const [editingVenue, setEditingVenue] = useState<VenueResponse | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [venueUpdateForm, setVenueUpdateForm] = useState<VenueUpdateForm>({});

  const handleEditVenue = (venue: VenueResponse) => {
    setEditingVenue(venue);
    setVenueUpdateForm({
      name: venue.name,
      address: venue.address,
      city: venue.city,
      capacity: venue.capacity,
      eventId: venue.eventId,
      venueType: venue.venueType
    });
    setShowEditForm(true);
    setShowVenueForm(false);
  };

  const handleUpdateVenue = async () => {
    if (!editingVenue) return;
    
    try {
      const updated = await VenueService.updateVenue(editingVenue.venueId, venueUpdateForm);
      setVenues(venues.map(v => v.venueId === editingVenue.venueId ? updated : v));
      setShowEditForm(false);
      setEditingVenue(null);
      setVenueUpdateForm({});
      toast.success('Venue updated successfully');
    } catch (error) {
      console.error('Failed to update venue:', error);
      toast.error('Failed to update venue');
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingVenue(null);
    setVenueUpdateForm({});
  };

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
        // Postavi prvi event kao podrazumevani u formi
        setVenueForm(prev => ({ ...prev, eventId: eventsData[0].id }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays on error
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

  const handleCreateVenue = async () => {
    try {
      const created = await VenueService.createVenue(venueForm);
      setVenues([...venues, created]);
      setShowVenueForm(false);
      setVenueForm({
        name: '',
        address: '',
        city: '',
        capacity: 0,
        eventId: selectedEvent?.id || 0,
        venueType: VenueType.Indoor
      });
    } catch (error) {
      console.error('Failed to create venue:', error);
    }
  };

  const handleCancelVenue = () => {
    setShowVenueForm(false);
    setVenueForm({
      name: '',
      address: '',
      city: '',
      capacity: 0,
      eventId: selectedEvent?.id || 0,
      venueType: VenueType.Indoor
    });
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
    <div className="flex gap-3 h-full">
      {/* Glavni sadržaj - zauzima celu širinu kada forma nije otvorena, 3/4 kada jeste */}
      <div className={`${showVenueForm ? 'w-3/4' : 'w-full'}`}>
        <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl h-full shadow-xl">
          <div className="text-white h-full flex flex-col p-4 m-1">
            {selectedVenue ? (
              <VenueDetailView 
                venue={selectedVenue}
                onBack={() => setSelectedVenue(null)}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
              />
            ) : (
              <div className="space-y-4">
                {/* Header - Konzistentan sa Dashboard-om */}
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
                        icon={<Filter className="w-5 h-5 text-neutral-400" />}
                      />
                    </div>
                  </div>
                </div>

                {/* Venues Section */}
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between border-b border-neutral-800">
                    <h3 className="text-xl font-semibold text-white mb-4">Venues</h3>
                    <div className="flex items-center gap-4">
                      {selectedEventFilter !== 0 && (
                        <span className="text-neutral-400 text-sm">
                          Filtered by: {events.find(e => e.id === selectedEventFilter)?.name}
                        </span>
                      )}
                      <p className="text-neutral-400 text-sm">{filteredVenues.length} venue(s) found</p>
                    </div>
                  </div>
                  
                  <div className="">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-4">
                      {filteredVenues.map((venue) => (
                      <Card
                        key={venue.venueId}
                        className="group p-6 relative"
                      >
                        {/* Dugmad u gornjem desnom uglu - UVIJEK VIDLJIVA */}
                        <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVenue(venue);
                            }}
                            className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                            title="Configure seat layout"
                          >
                            <Settings className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditVenue(venue);
                            }}
                            className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                            title="Edit venue"
                          >
                            <Edit className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
                          </button>
                        </div>

                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="bg-lime-500/20 p-3 rounded-xl mr-4">
                              <MapPin className="w-6 h-6 text-lime-400" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                                {venue.name || 'Unnamed Venue'}
                              </h3>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getVenueTypeColor(venue.venueType)}`}>
                                  {getVenueTypeName(venue.venueType)}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                                  Event: {events.find(e => e.id === venue.eventId)?.name || 'Unknown'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex-col justify-between items-center text-neutral-300">
                          <div className="flex items-center mb-3">
                            <Users className="w-5 h-5 mr-2 text-neutral-400" />
                            <span className="text-base">Capacity: {(venue.capacity || 0).toLocaleString()}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-5 h-5 mr-2 text-neutral-400" />
                            <span className="text-base">{venue.city || 'Unknown City'}, {venue.address}</span>
                          </div>
                        </div>
                      </Card>
                      ))}
                    </div>

                    {filteredVenues.length === 0 && (
                      <div className="text-center py-16 text-neutral-400">
                        <MapPin size={64} className="mx-auto mb-4 opacity-50" />
                        <h4 className="text-xl mb-2">No venues found</h4>
                        <p className="text-base">
                          {searchTerm || selectedEventFilter !== 0 
                            ? 'Try adjusting your search criteria or event filter' 
                            : 'No venues available in the system'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forma za kreiranje/edit venue - sa desne strane */}
      {(showVenueForm || showEditForm) && (
        <div className="w-3/6">
          <Card className="overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900/60 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-neutral-800">
              <h2 className="text-xl font-bold text-lime-400">
                {showEditForm ? 'Edit Venue' : 'Create New Venue'}
              </h2>
              <button
                onClick={showEditForm ? handleCancelEdit : handleCancelVenue}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto px-1">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Venue Name</label>
                <input
                  type="text"
                  value={showEditForm ? venueUpdateForm.name : venueForm.name}
                  onChange={(e) => showEditForm 
                    ? setVenueUpdateForm(prev => ({ ...prev, name: e.target.value }))
                    : setVenueForm(prev => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter venue name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Address</label>
                <input
                  type="text"
                  value={showEditForm ? venueUpdateForm.address : venueForm.address}
                  onChange={(e) => showEditForm
                    ? setVenueUpdateForm(prev => ({ ...prev, address: e.target.value }))
                    : setVenueForm(prev => ({ ...prev, address: e.target.value }))
                  }
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter venue address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">City</label>
                <input
                  type="text"
                  value={showEditForm ? venueUpdateForm.city : venueForm.city}
                  onChange={(e) => showEditForm
                    ? setVenueUpdateForm(prev => ({ ...prev, city: e.target.value }))
                    : setVenueForm(prev => ({ ...prev, city: e.target.value }))
                  }
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Capacity</label>
                <input
                  type="number"
                  value={showEditForm ? venueUpdateForm.capacity : venueForm.capacity}
                  onChange={(e) => showEditForm
                    ? setVenueUpdateForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                    : setVenueForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))
                  }
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter capacity"
                  min="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Event</label>
                  <CustomSelect
                    value={showEditForm ? (venueUpdateForm.eventId?.toString() || '0') : venueForm.eventId.toString()}
                    onChange={(value) => showEditForm
                      ? setVenueUpdateForm(prev => ({ ...prev, eventId: parseInt(value) }))
                      : setVenueForm(prev => ({ ...prev, eventId: parseInt(value) }))
                    }
                    options={[
                      { value: '0', label: 'Select Event' },
                      ...events.map(event => ({
                        value: event.id.toString(),
                        label: event.name
                      }))
                    ]}
                    placeholder="Select Event"
                    className='w-full'
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Venue Type</label>
                  <CustomSelect
                    value={showEditForm ? (venueUpdateForm.venueType?.toString() || '0') : venueForm.venueType.toString()}
                    onChange={(value) => showEditForm
                      ? setVenueUpdateForm(prev => ({ ...prev, venueType: parseInt(value) as VenueType }))
                      : setVenueForm(prev => ({ ...prev, venueType: parseInt(value) as VenueType }))
                    }
                    options={[
                      { value: VenueType.Indoor.toString(), label: 'Indoor' },
                      { value: VenueType.Outdoor.toString(), label: 'Outdoor' },
                      { value: VenueType.Stadium.toString(), label: 'Stadium' },
                      { value: VenueType.Arena.toString(), label: 'Arena' },
                      { value: VenueType.Theater.toString(), label: 'Theater' },
                      { value: VenueType.Club.toString(), label: 'Club' },
                      { value: VenueType.Festival.toString(), label: 'Festival' }
                    ]}
                    placeholder="Select Venue Type"
                    className='w-full'
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={showEditForm ? handleCancelEdit : handleCancelVenue}
                  className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={showEditForm ? handleUpdateVenue : handleCreateVenue}
                  disabled={showEditForm 
                    ? !venueUpdateForm.name 
                    : (!venueForm.name || !venueForm.address || !venueForm.city || venueForm.eventId === 0)
                  }
                  className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold"
                >
                  {showEditForm ? 'Update Venue' : 'Create Venue'}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Venue Detail Component - Konzistentan Dashboard stil
const VenueDetailView = ({ venue, onBack, activeTab, setActiveTab }: { 
  venue: VenueResponse; 
  onBack: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => {
  const [segments, setSegments] = useState<SegmentResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLayoutView, setShowLayoutView] = useState(false);

  useEffect(() => {
    loadVenueData();
  }, [venue]);

  const loadVenueData = async () => {
    try {
      setLoading(true);
      const [segmentsData, allZones] = await Promise.all([
        SegmentService.getSegmentsByVenueId(venue.venueId).catch(() => []),
        ZoneService.getAllZones().catch(() => [])
      ]);
      
      setSegments(segmentsData || []);
      
      // Filter zones for the current venue's segments
      const venueZones = allZones.filter(zone => 
        segmentsData.some(segment => segment.segmentId === zone.segmentId)
      );
      setZones(venueZones || []);
    } catch (error) {
      console.error('Error loading venue data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header - Konzistentan sa Dashboard-om */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl mr-6 transition-colors flex items-center gap-2 text-sm"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">{venue.name}</h1>
              <div className="flex items-center mt-1 text-neutral-400">
                <Users className="w-4 h-4 mr-2" />
                <span className="text-sm">Capacity: {(venue.capacity || 0).toLocaleString()}</span>
                <span className="mx-3">•</span>
                <span className="text-sm">{getVenueTypeName(venue.venueType)}</span>
                <span className="mx-3">•</span>
                <span className="text-sm">{venue.city}, {venue.address}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setShowLayoutView(true)}
              className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
            >
              <Eye size={18} />
              View Layout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Izmenjeno prema zahtevima */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 flex-1">
        
        {/* Seat Plan Editor - Leva strana (2/3 širine) */}
        <div className="xl:col-span-2">
          <Card className="overflow-hidden h-full">
            <div className="mb-3 border-b border-neutral-800">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-semibold text-white">Seat Plan Editor</h2>
                <div className="flex bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('segments')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'segments'
                        ? 'bg-lime-500 text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Segments
                  </button>
                  <button
                    onClick={() => setActiveTab('zones')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'zones'
                        ? 'bg-lime-500 text-black'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Zones
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              {activeTab === 'segments' ? 
                <SegmentEditor segments={segments} venueId={venue.venueId} onSegmentsUpdate={setSegments} /> : 
                <ZoneEditor zones={zones} segments={segments} onZonesUpdate={setZones} />
              }
            </div>
          </Card>
        </div>

        {/* Forms Panel - Desna strana (1/3 širine) */}
        <div className="xl:col-span-1">
          <Card className="overflow-hidden">
            <div className="mb-3 border-b border-neutral-800">
              <h2 className="text-xl font-semibold text-white mb-3">
                {activeTab === 'segments' ? 'Segment Configuration' : 'Zone Configuration'}
              </h2>
            </div>
            
            <div className="">
              {activeTab === 'segments' ? (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Create New Segment</h3>
                  <SegmentCreateForm 
                    venueId={venue.venueId}
                    segments={segments}
                    onSegmentCreated={(newSegment) => {
                      setSegments(prev => [...prev, newSegment]);
                    }}
                  />
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Create New Zone</h3>
                  <ZoneCreateForm 
                    segments={segments}
                    onZoneCreated={(newZone) => {
                      setZones(prev => [...prev, newZone]);
                    }}
                  />
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* View Layout Modal */}
      {showLayoutView && (
        <LayoutViewModal 
          venue={venue}
          segments={segments}
          zones={zones}
          onClose={() => setShowLayoutView(false)}
        />
      )}
    </div>
  );
};

// Segment Create Form Component
const SegmentCreateForm = ({ venueId, segments, onSegmentCreated }: {
  venueId: number;
  segments: SegmentResponse[];
  onSegmentCreated: (segment: SegmentResponse) => void;
}) => {
  const [segmentForm, setSegmentForm] = useState<SegmentCreateForm>({
    name: '',
    description: '',
    capacity: 0,
    segmentType: SegmentType.Standard,
    venueId: venueId
  });

  const segmentTypeOptions = [
    { value: SegmentType.Standard.toString(), label: 'Standard' },
    { value: SegmentType.VIP.toString(), label: 'VIP' },
    { value: SegmentType.Premium.toString(), label: 'Premium' },
    { value: SegmentType.Standing.toString(), label: 'Standing' },
    { value: SegmentType.Seated.toString(), label: 'Seated' }
  ];

  const handleCreateSegment = async () => {
    try {
      if (!segmentForm.name || segmentForm.capacity <= 0) {
        toast.error('Please fill in all required fields with valid values');
        return;
      }

      const created = await SegmentService.createSegment(segmentForm);
      onSegmentCreated(created);
      setSegmentForm({
        name: '',
        description: '',
        capacity: 0,
        segmentType: SegmentType.Standard,
        venueId: venueId
      });

      toast.success('Segment created successfully');
    } catch (error) {
      console.error('Failed to create segment:', error);
      toast.error('Failed to create segment');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
        <input
          type="text"
          placeholder="VIP Section"
          value={segmentForm.name}
          onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
        <textarea
          placeholder="Segment description..."
          value={segmentForm.description || ''}
          onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Capacity *</label>
          <input
            type="number"
            placeholder="100"
            value={segmentForm.capacity}
            onChange={(e) => setSegmentForm({ ...segmentForm, capacity: parseInt(e.target.value) || 0 })}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Segment Type *</label>
          <CustomSelect
            value={segmentForm.segmentType.toString()}
            onChange={(value) => setSegmentForm({ ...segmentForm, segmentType: parseInt(value) as SegmentType })}
            options={segmentTypeOptions}
            placeholder="Select Type"
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={handleCreateSegment}
        disabled={!segmentForm.name || segmentForm.capacity <= 0}
        className="w-full p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold text-sm"
      >
        Create Segment
      </button>
    </div>
  );
};

// Zone Create Form Component
const ZoneCreateForm = ({ segments, onZoneCreated }: {
  segments: SegmentResponse[];
  onZoneCreated: (zone: ZoneResponse) => void;
}) => {
  const [zoneForm, setZoneForm] = useState<ZoneCreateForm>({
    name: '',
    description: '',
    capacity: 0,
    basePrice: 0,
    position: ZonePosition.Center,
    segmentId: 0
  });

  const getRemainingCapacity = (segmentId: number) => {
    const segment = segments.find(s => s.segmentId === segmentId);
    return segment ? segment.capacity : 0;
  };

  const handleCreateZone = async () => {
    try {
      if (!zoneForm.name || zoneForm.capacity <= 0 || zoneForm.basePrice < 0 || zoneForm.segmentId === 0) {
        toast.error('Please fill in all required fields with valid values');
        return;
      }

      const created = await ZoneService.createZone(zoneForm);
      onZoneCreated(created);
      setZoneForm({
        name: '',
        description: '',
        capacity: 0,
        basePrice: 0,
        position: ZonePosition.Center,
        segmentId: 0
      });

      toast.success('Zone created successfully');
    } catch (error) {
      console.error('Failed to create zone:', error);
      toast.error('Failed to create zone');
    }
  };

  const handleSegmentChange = (segmentId: number) => {
    setZoneForm(prev => ({
      ...prev,
      segmentId: segmentId,
      capacity: 0
    }));
  };

  const segmentOptions = [
    { value: '0', label: 'Select Segment' },
    ...segments.map(segment => ({
      value: segment.segmentId.toString(),
      label: segment.name || 'Unnamed Segment'
    }))
  ];

  const positionOptions = [
    { value: ZonePosition.Front.toString(), label: 'Front' },
    { value: ZonePosition.Center.toString(), label: 'Center' },
    { value: ZonePosition.Back.toString(), label: 'Back' },
    { value: ZonePosition.Left.toString(), label: 'Left' },
    { value: ZonePosition.Right.toString(), label: 'Right' },
    { value: ZonePosition.Upper.toString(), label: 'Upper' },
    { value: ZonePosition.Lower.toString(), label: 'Lower' },
    { value: ZonePosition.Balcony.toString(), label: 'Balcony' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
        <input
          type="text"
          placeholder="Front Row"
          value={zoneForm.name}
          onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
        <textarea
          placeholder="Zone description..."
          value={zoneForm.description || ''}
          onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Segment *</label>
          <CustomSelect
            value={zoneForm.segmentId.toString()}
            onChange={(value) => handleSegmentChange(parseInt(value))}
            options={segmentOptions}
            placeholder="Select Segment"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Position *</label>
          <CustomSelect
            value={zoneForm.position.toString()}
            onChange={(value) => setZoneForm({ ...zoneForm, position: parseInt(value) as ZonePosition })}
            options={positionOptions}
            placeholder="Select Position"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Capacity *</label>
          <input
            type="number"
            placeholder="50"
            value={zoneForm.capacity}
            onChange={(e) => setZoneForm({ ...zoneForm, capacity: parseInt(e.target.value) || 0 })}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
            min="1"
            max={zoneForm.segmentId ? getRemainingCapacity(zoneForm.segmentId) : undefined}
          />
          {zoneForm.segmentId > 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Available in segment: {getRemainingCapacity(zoneForm.segmentId)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Base Price ($) *</label>
          <input
            type="number"
            placeholder="100.00"
            value={zoneForm.basePrice}
            onChange={(e) => setZoneForm({ ...zoneForm, basePrice: parseFloat(e.target.value) || 0 })}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <button
        onClick={handleCreateZone}
        disabled={!zoneForm.name || zoneForm.capacity <= 0 || zoneForm.basePrice < 0 || zoneForm.segmentId === 0}
        className="w-full p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold text-sm"
      >
        Create Zone
      </button>
    </div>
  );
};

// Layout View Modal Component
const LayoutViewModal = ({ venue, segments, zones, onClose }: {
  venue: VenueResponse;
  segments: SegmentResponse[];
  zones: ZoneResponse[];
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">
            {venue.name} - Layout View
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <VenueLayoutPreview venue={venue} segments={segments} zones={zones} />
        </div>
      </div>
    </div>
  );
};

// Segment Editor
const SegmentEditor = ({ segments, venueId, onSegmentsUpdate }: { 
  segments: SegmentResponse[]; 
  venueId: number;
  onSegmentsUpdate: (segments: SegmentResponse[]) => void;
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SegmentResponse | null>(null);
  const [segmentForm, setSegmentForm] = useState<SegmentCreateForm>({
    name: '',
    description: '',
    capacity: 0,
    segmentType: SegmentType.Standard,
    venueId: venueId
  });

  const segmentTypeOptions = [
    { value: SegmentType.Standard.toString(), label: 'Standard' },
    { value: SegmentType.VIP.toString(), label: 'VIP' },
    { value: SegmentType.Premium.toString(), label: 'Premium' },
    { value: SegmentType.Standing.toString(), label: 'Standing' },
    { value: SegmentType.Seated.toString(), label: 'Seated' }
  ];

  const handleCreateSegment = async () => {
    try {
      if (!segmentForm.name || segmentForm.capacity <= 0) {
        toast.error('Please fill in all required fields with valid values');
        return;
      }

      const created = await SegmentService.createSegment(segmentForm);
      onSegmentsUpdate([...segments, created]);
      setShowCreateForm(false);
      setSegmentForm({
        name: '',
        description: '',
        capacity: 0,
        segmentType: SegmentType.Standard,
        venueId: venueId
      });

      toast.success('Segment created successfully');
    } catch (error) {
      console.error('Failed to create segment:', error);
      toast.error('Failed to create segment');
    }
  };

  const handleEditSegment = (segment: SegmentResponse) => {
    setEditingSegment(segment);
    setSegmentForm({
      name: segment.name || '',
      description: segment.description || '',
      capacity: segment.capacity,
      segmentType: segment.segmentType,
      venueId: venueId
    });
    setShowCreateForm(false);
  };

  const handleUpdateSegment = async () => {
    if (!editingSegment) return;

    try {
      const updateData = {
        name: segmentForm.name,
        description: segmentForm.description,
        capacity: segmentForm.capacity,
        segmentType: segmentForm.segmentType
      };

      const updated = await SegmentService.updateSegment(editingSegment.segmentId, updateData);
      onSegmentsUpdate(segments.map(s => s.segmentId === editingSegment.segmentId ? updated : s));
      setEditingSegment(null);
      setSegmentForm({
        name: '',
        description: '',
        capacity: 0,
        segmentType: SegmentType.Standard,
        venueId: venueId
      });
      
      toast.success('Segment updated successfully');
    } catch (error) {
      console.error('Failed to update segment:', error);
      toast.error('Failed to update segment');
    }
  };

  const handleDeleteSegment = async (segmentId: number) => {
    if (!confirm('Are you sure you want to delete this segment? This action cannot be undone.')) {
      return;
    }

    try {
      await SegmentService.deleteSegment(segmentId);
      onSegmentsUpdate(segments.filter(s => s.segmentId !== segmentId));
      toast.success('Segment deleted successfully');
    } catch (error) {
      console.error('Failed to delete segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingSegment(null);
    setSegmentForm({
      name: '',
      description: '',
      capacity: 0,
      segmentType: SegmentType.Standard,
      venueId: venueId
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Segments Configuration</h3>
          <p className="text-neutral-400 text-sm">Manage seating segments</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} />
          Add Segment
        </button>
      </div>

      {(showCreateForm || editingSegment) && (
        <Card className="p-4">
          <h4 className="font-semibold text-white mb-3">
            {editingSegment ? 'Edit Segment' : 'Create New Segment'}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Name *</label>
              <input
                type="text"
                placeholder="VIP Section"
                value={segmentForm.name}
                onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Description</label>
              <textarea
                placeholder="Segment description..."
                value={segmentForm.description || ''}
                onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Capacity *</label>
                <input
                  type="number"
                  placeholder="100"
                  value={segmentForm.capacity}
                  onChange={(e) => setSegmentForm({ ...segmentForm, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  min="1"
                />
              </div>
              
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Segment Type *</label>
                <CustomSelect
                  value={segmentForm.segmentType.toString()}
                  onChange={(value) => setSegmentForm({ ...segmentForm, segmentType: parseInt(value) as SegmentType })}
                  options={segmentTypeOptions}
                  placeholder="Select Type"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={editingSegment ? handleUpdateSegment : handleCreateSegment}
              disabled={!segmentForm.name || segmentForm.capacity <= 0}
              className="px-4 py-2 rounded-xl bg-lime-500 text-black font-medium hover:bg-lime-400 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all text-sm"
            >
              {editingSegment ? 'Update Segment' : 'Create Segment'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700 text-white hover:bg-neutral-700/60 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {segments.map((segment) => (
          <Card key={segment.segmentId} hover={true} className="p-3">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded bg-lime-500 mr-2"></div>
                  <h4 className="font-semibold text-white text-sm">{segment.name}</h4>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditSegment(segment)}
                    className="text-neutral-400 hover:text-lime-400 transition-colors p-1"
                    title="Edit segment"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSegment(segment.segmentId)}
                    className="text-neutral-400 hover:text-red-400 transition-colors p-1"
                    title="Delete segment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <p className="text-neutral-400 text-xs">
                  Capacity: <span className="font-medium">{segment.capacity}</span>
                </p>
                <p className="text-neutral-400 text-xs">
                  Type: <span className="font-medium">{getSegmentTypeName(segment.segmentType)}</span>
                </p>
                {/* {segment.description && (
                  <p className="text-neutral-400 text-xs font-medium line-clamp-2">Description: {segment.description}</p>
                )} */}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-8 text-neutral-400">
          <Users size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-base">No segments configured</p>
          <p className="text-sm">Create your first segment to get started</p>
        </div>
      )}
    </div>
  );
};

// Zone Editor
const ZoneEditor = ({ zones, segments, onZonesUpdate }: { 
  zones: ZoneResponse[]; 
  segments: SegmentResponse[];
  onZonesUpdate: (zones: ZoneResponse[]) => void;
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneResponse | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneCreateForm>({
    name: '',
    description: '',
    capacity: 0,
    basePrice: 0,
    position: ZonePosition.Center,
    segmentId: 0
  });

  // Računanje preostalog kapaciteta za selektovani segment
  const getRemainingCapacity = (segmentId: number, excludeZoneId?: number) => {
    const segment = segments.find(s => s.segmentId === segmentId);
    if (!segment) return 0;

    const usedCapacity = zones
      .filter(zone => zone.segmentId === segmentId && zone.zoneId !== excludeZoneId)
      .reduce((total, zone) => total + zone.capacity, 0);

    return segment.capacity - usedCapacity;
  };

  const handleCreateZone = async () => {
    try {
      if (!zoneForm.name || zoneForm.capacity <= 0 || zoneForm.basePrice < 0 || zoneForm.segmentId === 0) {
        toast.error('Please fill in all required fields with valid values');
        return;
      }

      const remainingCapacity = getRemainingCapacity(zoneForm.segmentId);
      if (zoneForm.capacity > remainingCapacity) {
        toast.error(`Capacity exceeds available space in segment. Maximum available: ${remainingCapacity}`);
        return;
      }

      const created = await ZoneService.createZone(zoneForm);
      onZonesUpdate([...zones, created]);
      setShowCreateForm(false);
      setZoneForm({
        name: '',
        description: '',
        capacity: 0,
        basePrice: 0,
        position: ZonePosition.Center,
        segmentId: 0
      });

      toast.success('Zone created successfully');
    } catch (error) {
      console.error('Failed to create zone:', error);
      toast.error('Failed to create zone');
    }
  };

  const handleEditZone = (zone: ZoneResponse) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name || '',
      description: zone.description || '',
      capacity: zone.capacity,
      basePrice: zone.basePrice,
      position: zone.position,
      segmentId: zone.segmentId
    });
    setShowCreateForm(false);
  };

  const handleUpdateZone = async () => {
    if (!editingZone) return;

    try {
      const updateData = {
        name: zoneForm.name,
        description: zoneForm.description,
        capacity: zoneForm.capacity,
        basePrice: zoneForm.basePrice,
        position: zoneForm.position,
        segmentId: zoneForm.segmentId
      };

      const remainingCapacity = getRemainingCapacity(zoneForm.segmentId, editingZone.zoneId);
      if (zoneForm.capacity > remainingCapacity) {
        toast.error(`Capacity exceeds available space in segment. Maximum available: ${remainingCapacity}`);
        return;
      }

      const updated = await ZoneService.updateZone(editingZone.zoneId, updateData);
      onZonesUpdate(zones.map(z => z.zoneId === editingZone.zoneId ? updated : z));
      setEditingZone(null);
      setZoneForm({
        name: '',
        description: '',
        capacity: 0,
        basePrice: 0,
        position: ZonePosition.Center,
        segmentId: 0
      });
      
      toast.success('Zone updated successfully');
    } catch (error) {
      console.error('Failed to update zone:', error);
      toast.error('Failed to update zone');
    }
  };

  const handleDeleteZone = async (zoneId: number) => {
    if (!confirm('Are you sure you want to delete this zone? This action cannot be undone.')) {
      return;
    }

    try {
      await ZoneService.deleteZone(zoneId);
      onZonesUpdate(zones.filter(z => z.zoneId !== zoneId));
      toast.success('Zone deleted successfully');
    } catch (error) {
      console.error('Failed to delete zone:', error);
      toast.error('Failed to delete zone');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingZone(null);
    setZoneForm({
      name: '',
      description: '',
      capacity: 0,
      basePrice: 0,
      position: ZonePosition.Center,
      segmentId: 0
    });
  };

  const handleSegmentChange = (segmentId: number) => {
    setZoneForm(prev => ({
      ...prev,
      segmentId: segmentId,
      capacity: editingZone ? prev.capacity : 0 // Ne resetuj capacity ako editujemo
    }));
  };

  const segmentOptions = [
    { value: '0', label: 'Select Segment' },
    ...segments.map(segment => ({
      value: segment.segmentId.toString(),
      label: segment.name || 'Unnamed Segment'
    }))
  ];

  const positionOptions = [
    { value: ZonePosition.Front.toString(), label: 'Front' },
    { value: ZonePosition.Center.toString(), label: 'Center' },
    { value: ZonePosition.Back.toString(), label: 'Back' },
    { value: ZonePosition.Left.toString(), label: 'Left' },
    { value: ZonePosition.Right.toString(), label: 'Right' },
    { value: ZonePosition.Upper.toString(), label: 'Upper' },
    { value: ZonePosition.Lower.toString(), label: 'Lower' },
    { value: ZonePosition.Balcony.toString(), label: 'Balcony' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Zones Configuration</h3>
          <p className="text-neutral-400 text-sm">Manage zones within segments</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} />
          Add Zone
        </button>
      </div>

      {(showCreateForm || editingZone) && (
        <Card className="p-4">
          <h4 className="font-semibold text-white mb-3">
            {editingZone ? 'Edit Zone' : 'Create New Zone'}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Name *</label>
              <input
                type="text"
                placeholder="Front Row"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Description</label>
              <textarea
                placeholder="Zone description..."
                value={zoneForm.description || ''}
                onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Segment *</label>
                <CustomSelect
                  value={zoneForm.segmentId.toString()}
                  onChange={(value) => handleSegmentChange(parseInt(value))}
                  options={segmentOptions}
                  placeholder="Select Segment"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Position *</label>
                <CustomSelect
                  value={zoneForm.position.toString()}
                  onChange={(value) => setZoneForm({ ...zoneForm, position: parseInt(value) as ZonePosition })}
                  options={positionOptions}
                  placeholder="Select Position"
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Capacity *</label>
                <input
                  type="number"
                  placeholder="50"
                  value={zoneForm.capacity}
                  onChange={(e) => setZoneForm({ ...zoneForm, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  min="1"
                  max={zoneForm.segmentId ? getRemainingCapacity(zoneForm.segmentId, editingZone?.zoneId) : undefined}
                />
                {zoneForm.segmentId > 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Available in segment: {getRemainingCapacity(zoneForm.segmentId, editingZone?.zoneId)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Base Price ($) *</label>
                <input
                  type="number"
                  placeholder="100.00"
                  value={zoneForm.basePrice}
                  onChange={(e) => setZoneForm({ ...zoneForm, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={editingZone ? handleUpdateZone : handleCreateZone}
              disabled={!zoneForm.name || zoneForm.capacity <= 0 || zoneForm.basePrice < 0 || zoneForm.segmentId === 0}
              className="px-4 py-2 rounded-xl bg-lime-500 text-black font-medium hover:bg-lime-400 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all text-sm"
            >
              {editingZone ? 'Update Zone' : 'Create Zone'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700 text-white hover:bg-neutral-700/60 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {zones.map((zone) => {
          const segment = segments.find(s => s.segmentId === zone.segmentId);
          return (
            <Card key={zone.zoneId} hover={true} className="p-3">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded bg-blue-500 mr-2"></div>
                    <h4 className="font-semibold text-white text-sm">{zone.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditZone(zone)}
                      className="text-neutral-400 hover:text-lime-400 transition-colors p-1"
                      title="Edit zone"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteZone(zone.zoneId)}
                      className="text-neutral-400 hover:text-red-400 transition-colors p-1"
                      title="Delete zone"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <p className="text-neutral-400 text-xs">
                    Base Price: <span className="font-medium text-lime-400">${zone.basePrice}</span>
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Capacity: <span className="font-medium">{zone.capacity}</span>
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Segment: <span className="font-medium">{segment?.name || 'Unknown'}</span>
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Position: <span className="font-medium">
                      {Object.keys(ZonePosition).find(key => ZonePosition[key as keyof typeof ZonePosition] === zone.position)}
                    </span>
                  </p>
                  {/* {zone.description && (
                    <p className="text-neutral-500 text-xs line-clamp-2">{zone.description}</p>
                  )} */}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {zones.length === 0 && (
        <div className="text-center py-8 text-neutral-400">
          <MapPin size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-base">No zones configured</p>
          <p className="text-sm">Create zones to organize seating within segments</p>
        </div>
      )}
    </div>
  );
};

// Venue Layout Preview - Konzistentan stil
const VenueLayoutPreview = ({ venue, segments, zones }: { 
  venue: VenueResponse; 
  segments: SegmentResponse[]; 
  zones: ZoneResponse[];
}) => {
  // Group zones by segment
  const zonesBySegment = zones.reduce((acc, zone) => {
    if (!acc[zone.segmentId]) {
      acc[zone.segmentId] = [];
    }
    acc[zone.segmentId].push(zone);
    return acc;
  }, {} as Record<number, ZoneResponse[]>);

  return (
    <div className="flex flex-col h-full">      
      {/* Seating Areas with Zones */}
      <div className="flex-1 overflow-y-auto">
        {segments.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {segments.map((segment) => {
              const segmentZones = zonesBySegment[segment.segmentId] || [];
              
              return (
                <Card
                  key={segment.segmentId}
                  className="p-5 bg-neutral-800 border border-neutral-700 hover:border-lime-500/50 transition-all duration-300"
                >
                  {/* Segment Header */}
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-neutral-700">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-lime-500 shadow-lg shadow-lime-500/50"></div>
                      <div>
                        <h4 className="font-bold text-white text-lg">{segment.name}</h4>
                        <p className="text-neutral-400 text-sm">
                          {segment.capacity.toLocaleString()} seats • {getSegmentTypeName(segment.segmentType)}
                        </p>
                      </div>
                    </div>
                    {segmentZones.length > 0 && (
                      <div className="px-3 py-1 bg-lime-500/20 border border-lime-500/30 rounded-full">
                        <span className="text-lime-400 text-sm font-medium">
                          {segmentZones.length} zone{segmentZones.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Zones Grid */}
                  {segmentZones.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {segmentZones.map((zone) => (
                        <div
                          key={zone.zoneId}
                          className="p-3 bg-neutral-900/60 border border-neutral-700 rounded-xl hover:border-lime-500/50 hover:bg-neutral-800/60 transition-all duration-200 group"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-lime-400 shadow-sm shadow-lime-400/50"></div>
                            <h5 className="font-semibold text-white text-sm group-hover:text-lime-400 transition-colors">
                              {zone.name}
                            </h5>
                          </div>
                          <div className="space-y-1">
                            <p className="text-neutral-400 text-xs">
                              <span className="text-lime-400 font-medium">${zone.basePrice}</span> base price
                            </p>
                            <p className="text-neutral-400 text-xs">
                              {zone.capacity} seats
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-500">
                      <MapPin size={24} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No zones configured for this segment</p>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-neutral-400">
            <MapPin size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No segments configured</p>
            <p className="text-sm">Add segments to see the venue layout</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Infrastructure;