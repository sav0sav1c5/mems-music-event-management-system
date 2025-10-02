import { useState, useEffect } from 'react';
import { 
  Search, MapPin, Users, Calendar, Settings, Edit, Eye, 
  ArrowLeft, Plus, RefreshCw, X 
} from 'lucide-react';

// Import servisa
import VenueService from '../services/venueService';
import SegmentService from '../services/segmentService';
import ZoneService from '../services/zoneService';
import { EventService } from '../../event-organization/services/eventService';

// Import tipova
import type { VenueResponse } from '../types/api/venue';
import type { SegmentResponse } from '../types/api/segment';
import type { ZoneResponse } from '../types/api/zone';
import type { EventResponse } from '../../event-organization/types/api/event';

// Import enumova
import { VenueType, SegmentType, ZonePosition } from '../types/enums/TicketSales';
import { EventStatus } from '../../event-organization/types/enums/EventOrganization';

// Form tipovi
import type { VenueCreateForm, VenueUpdateForm } from '../types/forms/venue';
import type { SegmentCreateForm } from '../types/forms/segment';
import type { ZoneCreateForm } from '../types/forms/zone';

// Import Card komponenti
import { Card } from '../components/card';

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
  const [loading, setLoading] = useState(true);
  const [showVenueModal, setShowVenueModal] = useState(false);
  const [venueForm, setVenueForm] = useState<VenueCreateForm>({
    name: '',
    address: '',
    city: '',
    capacity: 0,
    eventId: 0,
    venueType: VenueType.Indoor
  });

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
      // Set empty arrays on error
      setEvents([]);
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue =>
    venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateVenue = async () => {
    try {
      const created = await VenueService.createVenue(venueForm);
      setVenues([...venues, created]);
      setShowVenueModal(false);
      setVenueForm({
        name: '',
        address: '',
        city: '',
        capacity: 0,
        eventId: 0,
        venueType: VenueType.Indoor
      });
    } catch (error) {
      console.error('Failed to create venue:', error);
    }
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
    <div className="text-white h-full flex flex-col p-4 m-1">
      {selectedVenue ? (
        <VenueDetailView 
          venue={selectedVenue}
          onBack={() => setSelectedVenue(null)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          
          {/* PRVA KOLONA - Leva strana (3/4) */}
          <div className="lg:col-span-3 space-y-4">
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
                    onClick={() => setShowVenueModal(true)}
                    className="px-6 py-3 rounded-xl bg-lime-500 text-black font-medium hover:bg-lime-400 transition-all duration-200 flex items-center gap-2 text-base"
                  >
                    <Plus size={20} />
                    New Venue
                  </button>
                </div>
              </div>
              
              {/* Search Bar - Konzistentan stil */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search venues by name, city, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
                />
              </div>
            </div>

            {/* Venues Section */}
            <Card className="overflow-hidden">
              <div className="flex items-center justify-between border-b border-neutral-800">
                <h3 className="text-xl font-semibold text-white mb-4">Venues</h3>
                <p className="text-neutral-400 text-sm">{filteredVenues.length} venue(s) found</p>
              </div>
              
              <div className="">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                  {filteredVenues.map((venue) => (
                    <Card
                      key={venue.venueId}
                      hover={true}
                      onClick={() => setSelectedVenue(venue)}
                      className="group cursor-pointer p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-lime-500/20 p-3 rounded-xl mr-4">
                            <MapPin className="w-6 h-6 text-lime-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                              {venue.name || 'Unnamed Venue'}
                            </h3>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getVenueTypeColor(venue.venueType)}`}>
                              {getVenueTypeName(venue.venueType)}
                            </span>
                          </div>
                        </div>
                        <Edit className="w-5 h-5 text-neutral-400 group-hover:text-lime-400 transition-colors" />
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center text-neutral-300">
                          <Users className="w-5 h-5 mr-3 text-neutral-400" />
                          <span className="text-base">Capacity: {(venue.capacity || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center text-neutral-300">
                          <MapPin className="w-5 h-5 mr-3 text-neutral-400" />
                          <span className="text-base">{venue.city || 'Unknown City'}, {venue.address}</span>
                        </div>
                        <div className="text-sm text-neutral-500 mt-4 group-hover:text-lime-400/70 transition-colors">
                          Click to configure seat layout and zones
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
                      {searchTerm ? 'Try adjusting your search criteria' : 'No venues available in the system'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* DRUGA KOLONA - Desna strana (1/4) */}
          <div className="lg:col-span-1">
            <Card className="overflow-hidden h-full">
              <div className="flex items-center justify-between border-b border-neutral-800">
                <h3 className="text-xl font-semibold text-white mb-4">Upcoming Events</h3>
                <p className="text-neutral-400 text-sm">{events.length} total</p>
              </div>
              
              <div 
                className="space-y-4 overflow-y-auto scrollbar-hide mt-4" 
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                {events.map((event) => (
                  <Card
                    key={event.id}
                    hover={true}
                    onClick={() => setSelectedEvent(event)}
                    className={`p-4 cursor-pointer transition-all duration-200 ${
                      selectedEvent?.id === event.id
                        ? 'bg-lime-500/20 border-lime-500/50 shadow-lg'
                        : ''
                    }`}
                  >
                    <h4 className="font-medium text-base mb-3 leading-tight line-clamp-2">{event.name}</h4>
                    
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(event.status)}`}>
                        {getEventStatusName(event.status)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {venues.length} venue{venues.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </Card>
                ))}

                {events.length === 0 && (
                  <div className="text-center py-12 text-neutral-400">
                    <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-base">No events available</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {/* Venue Creation Modal - ostaje isti */}
      {showVenueModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <Card className="w-full max-w-md p-6 border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Create New Venue</h2>
              <button
                onClick={() => setShowVenueModal(false)}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Venue Name</label>
                <input
                  type="text"
                  value={venueForm.name}
                  onChange={(e) => setVenueForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter venue name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Address</label>
                <input
                  type="text"
                  value={venueForm.address}
                  onChange={(e) => setVenueForm(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter venue address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">City</label>
                <input
                  type="text"
                  value={venueForm.city}
                  onChange={(e) => setVenueForm(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter city"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Capacity</label>
                <input
                  type="number"
                  value={venueForm.capacity}
                  onChange={(e) => setVenueForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter capacity"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Venue Type</label>
                <select
                  value={venueForm.venueType}
                  onChange={(e) => setVenueForm(prev => ({ ...prev, venueType: parseInt(e.target.value) as VenueType }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                >
                  <option value={VenueType.Indoor}>Indoor</option>
                  <option value={VenueType.Outdoor}>Outdoor</option>
                  <option value={VenueType.Stadium}>Stadium</option>
                  <option value={VenueType.Arena}>Arena</option>
                  <option value={VenueType.Theater}>Theater</option>
                  <option value={VenueType.Club}>Club</option>
                  <option value={VenueType.Festival}>Festival</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowVenueModal(false)}
                  className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateVenue}
                  className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold"
                >
                  Create Venue
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
            <button className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl transition-colors font-medium flex items-center gap-2 text-sm">
              <Settings size={18} />
              Settings
            </button>
            <button className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl transition-colors font-medium text-sm">
              Save Layout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Konzistentan sa Dashboard-om */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Seat Plan Editor - Left Half */}
        <div className="xl:col-span-1">
          <Card className="overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Seat Plan Editor</h2>
                <div className="flex bg-neutral-800 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('segments')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'segments'
                        ? 'bg-lime-500 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Segments
                  </button>
                  <button
                    onClick={() => setActiveTab('zones')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'zones'
                        ? 'bg-lime-500 text-white'
                        : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    Zones
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto" style={{ maxHeight: '600px' }}>
              {activeTab === 'segments' ? 
                <SegmentEditor segments={segments} venueId={venue.venueId} onSegmentsUpdate={setSegments} /> : 
                <ZoneEditor zones={zones} segments={segments} onZonesUpdate={setZones} />
              }
            </div>
          </Card>
        </div>

        {/* Interactive Seat Map - Right Half */}
        <div className="xl:col-span-1">
          <Card className="overflow-hidden h-full">
            <div className="p-6 border-b border-neutral-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">Interactive Seat Map</h2>
                <div className="flex items-center space-x-3">
                  <button className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded-xl transition-colors flex items-center gap-2 text-sm">
                    <Eye size={16} />
                    View Mode
                  </button>
                  <button className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded-xl transition-colors flex items-center gap-2 text-sm">
                    <Settings size={16} />
                    Settings
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <VenueLayoutPreview venue={venue} segments={segments} zones={zones} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// Segment Editor - Konzistentan stil
const SegmentEditor = ({ segments, venueId, onSegmentsUpdate }: { 
  segments: SegmentResponse[]; 
  venueId: number;
  onSegmentsUpdate: (segments: SegmentResponse[]) => void;
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [segmentForm, setSegmentForm] = useState<SegmentCreateForm>({
    name: '',
    description: '',
    capacity: 0,
    segmentType: SegmentType.Standard,
    venueId: venueId
  });

  const handleCreateSegment = async () => {
    try {
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
    } catch (error) {
      console.error('Failed to create segment:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Segments Configuration</h3>
          <p className="text-neutral-400 text-sm">Manage seating segments</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {showCreateForm && (
        <Card className="p-4">
          <h4 className="font-semibold text-white mb-3">Create New Segment</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Name</label>
              <input
                type="text"
                placeholder="VIP Section"
                value={segmentForm.name}
                onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Capacity</label>
              <input
                type="number"
                placeholder="100"
                value={segmentForm.capacity}
                onChange={(e) => setSegmentForm({ ...segmentForm, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateSegment}
              className="px-4 py-2 rounded-xl bg-lime-500 text-black font-medium hover:bg-lime-400 transition-all text-sm"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700 text-white hover:bg-neutral-700/60 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
      
      <div className="space-y-4">
        {segments.map((segment) => (
          <Card key={segment.segmentId} hover={true} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-lime-500 mr-3"></div>
                <div>
                  <h4 className="font-semibold text-white">{segment.name}</h4>
                  <p className="text-neutral-400 text-sm">
                    {segment.capacity} seats • {getSegmentTypeName(segment.segmentType)}
                  </p>
                </div>
              </div>
              <button className="text-neutral-400 hover:text-lime-400 transition-colors p-1">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}

        {segments.length === 0 && (
          <div className="text-center py-8 text-neutral-400">
            <Users size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-base">No segments configured</p>
            <p className="text-sm">Create your first segment to get started</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Zone Editor - Konzistentan stil
const ZoneEditor = ({ zones, segments, onZonesUpdate }: { 
  zones: ZoneResponse[]; 
  segments: SegmentResponse[];
  onZonesUpdate: (zones: ZoneResponse[]) => void;
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [zoneForm, setZoneForm] = useState<ZoneCreateForm>({
    name: '',
    description: '',
    capacity: 0,
    basePrice: 0,
    position: ZonePosition.Center,
    segmentId: 0
  });

  const handleCreateZone = async () => {
    try {
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
    } catch (error) {
      console.error('Failed to create zone:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Zones Configuration</h3>
          <p className="text-neutral-400 text-sm">Manage zones within segments</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-2"
        >
          <Plus size={18} />
          Add
        </button>
      </div>

      {showCreateForm && (
        <Card className="p-4">
          <h4 className="font-semibold text-white mb-3">Create New Zone</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Name</label>
              <input
                type="text"
                placeholder="Front Row"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Capacity</label>
              <input
                type="number"
                placeholder="50"
                value={zoneForm.capacity}
                onChange={(e) => setZoneForm({ ...zoneForm, capacity: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleCreateZone}
              className="px-4 py-2 rounded-xl bg-lime-500 text-black font-medium hover:bg-lime-400 transition-all text-sm"
            >
              Create
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700 text-white hover:bg-neutral-700/60 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
      
      <div className="space-y-4">
        {zones.map((zone) => (
          <Card key={zone.zoneId} hover={true} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-4 h-4 rounded bg-blue-500 mr-3"></div>
                <div>
                  <h4 className="font-semibold text-white">{zone.name}</h4>
                  <p className="text-neutral-400 text-sm">
                    ${zone.basePrice} • {zone.capacity} seats
                  </p>
                </div>
              </div>
              <button className="text-neutral-400 hover:text-lime-400 transition-colors p-1">
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </Card>
        ))}

        {zones.length === 0 && (
          <div className="text-center py-8 text-neutral-400">
            <MapPin size={48} className="mx-auto mb-3 opacity-50" />
            <p className="text-base">No zones configured</p>
            <p className="text-sm">Create zones to organize seating within segments</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Venue Layout Preview - Konzistentan stil
const VenueLayoutPreview = ({ venue, segments, zones }: { 
  venue: VenueResponse; 
  segments: SegmentResponse[]; 
  zones: ZoneResponse[];
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-96">
      <div className="relative w-full max-w-md">
        {/* Stage */}
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-6 text-center mb-8 shadow-lg border-0">
          <h3 className="font-bold text-lg">STAGE</h3>
        </Card>
        
        {/* Seating Areas */}
        <div className="grid grid-cols-3 gap-4">
          {segments.map((segment) => (
            <Card
              key={segment.segmentId}
              hover={true}
              className="p-4 text-center cursor-pointer"
            >
              <div className="text-xs font-semibold text-lime-400 mb-1">{segment.name}</div>
              <div className="text-xs text-neutral-400">{segment.capacity} seats</div>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="mt-8 text-center text-neutral-500 text-sm">
        Interactive seat map visualization
        <br />
        <span className="text-xs">Drag and drop to configure seating layout</span>
      </div>
    </div>
  );
};

export default Infrastructure;