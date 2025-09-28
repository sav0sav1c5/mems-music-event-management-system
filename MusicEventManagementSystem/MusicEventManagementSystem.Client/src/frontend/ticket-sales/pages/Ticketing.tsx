import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Tag, Calendar, Percent, Clock, Gift, ArrowUp, ArrowDown, Filter, Users, Target, CheckCircle, XCircle, AlertTriangle, Settings, DollarSign, TrendingUp, Calculator } from 'lucide-react';
import { SpecialOfferService } from '../services/specialOfferService';
import { TicketTypeService } from '../services/ticketTypeService';
import { PricingRuleService } from '../services/pricingRuleService';
import { ZoneService } from '../services/zoneService';

// Import proper types
import type { 
  SpecialOfferResponse,
  TicketTypeResponse,
  ZoneResponse,
  PricingRuleResponse,
  TicketTypeStatus,
  OfferType
} from '../types';

// Mock EventResponse type - replace with actual import when available
interface EventResponse {
  id: number;
  name: string;
}

// Utility functions
const formatOfferType = (offerType: OfferType): string => {
  switch (offerType) {
    case 0: return 'Early Bird';
    case 1: return 'Student Discount';
    case 2: return 'Group Discount';
    case 3: return 'Senior Discount';
    case 4: return 'Loyalty Discount';
    case 5: return 'Season Pass';
    case 6: return 'Buy One Get One';
    case 7: return 'Percentage Off';
    case 8: return 'Fixed Amount Off';
    default: return 'Unknown';
  }
};

const formatTicketTypeStatus = (status: TicketTypeStatus): string => {
  switch (status) {
    case 0: return 'Active';
    case 1: return 'Inactive';
    case 2: return 'Sold Out';
    case 3: return 'Coming Soon';
    case 4: return 'Suspended';
    default: return 'Unknown';
  }
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const Ticketing = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState('ticket-types');

  // Common state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Special Offers state
  const [specialOffers, setSpecialOffers] = useState<SpecialOfferResponse[]>([]);
  const [selectedSpecialOffer, setSelectedSpecialOffer] = useState<SpecialOfferResponse | null>(null);
  const [offerSearchTerm, setOfferSearchTerm] = useState('');

  // Ticket Types state
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeResponse | null>(null);
  const [ticketTypeSearchTerm, setTicketTypeSearchTerm] = useState('');

  // Pricing Rules state
  const [pricingRules, setPricingRules] = useState<PricingRuleResponse[]>([]);
  const [pricingRuleSearchTerm, setPricingRuleSearchTerm] = useState('');

  // Supporting data
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);

  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Load data functions
  const loadSpecialOffers = async () => {
    try {
      setLoading(true);
      const data = await SpecialOfferService.getAllSpecialOffers();
      setSpecialOffers(data);
      if (data.length > 0 && !selectedSpecialOffer) {
        setSelectedSpecialOffer(data[0]);
      }
    } catch (err) {
      setError('Failed to load special offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const data = await TicketTypeService.getAllTicketTypes();
      setTicketTypes(data);
      if (data.length > 0 && !selectedTicketType) {
        setSelectedTicketType(data[0]);
      }
    } catch (err) {
      setError('Failed to load ticket types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPricingRules = async () => {
    try {
      setLoading(true);
      const data = await PricingRuleService.getAllPricingRules();
      setPricingRules(data);
    } catch (err) {
      setError('Failed to load pricing rules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSupportingData = async () => {
    try {
      const zonesData = await ZoneService.getAllZones();
      setZones(zonesData);
    } catch (err) {
      console.error('Failed to load supporting data:', err);
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'ticket-types',
      label: 'Ticket Types',
      icon: Target,
      count: ticketTypes.length
    },
    {
      id: 'pricing-rules',
      label: 'Pricing Rules',
      icon: Settings,
      count: pricingRules.length
    },
    {
      id: 'special-offers',
      label: 'Special Offers',
      icon: Gift,
      count: specialOffers.length
    }
  ];

  // Statistics for overview
  const getOverviewStats = () => {
    const activeOffers = specialOffers.filter(offer => {
      const now = new Date();
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
      return now >= startDate && now <= endDate;
    });

    const activeTicketTypes = ticketTypes.filter(type => type.status === 0);
    const totalAvailableTickets = ticketTypes.reduce((sum, type) => sum + type.availableQuantity, 0);
    const avgMinPrice = pricingRules.length > 0 
      ? pricingRules.reduce((sum, rule) => sum + rule.minimumPrice, 0) / pricingRules.length 
      : 0;

    return [
      {
        title: "Active Ticket Types",
        value: activeTicketTypes.length.toString(),
        change: `${ticketTypes.length - activeTicketTypes.length} inactive`,
        trend: activeTicketTypes.length > 0 ? "up" : "down",
        icon: Target,
        color: "lime"
      },
      {
        title: "Available Tickets",
        value: totalAvailableTickets.toString(),
        change: "-125 today",
        trend: "down",
        icon: Users,
        color: "blue"
      },
      {
        title: "Active Offers",
        value: activeOffers.length.toString(),
        change: `${specialOffers.length - activeOffers.length} expired`,
        trend: activeOffers.length > 0 ? "up" : "down",
        icon: Gift,
        color: "purple"
      },
      {
        title: "Avg. Min Price",
        value: formatPrice(avgMinPrice),
        change: "+5.2%",
        trend: "up",
        icon: DollarSign,
        color: "orange"
      }
    ];
  };

  const overviewStats = getOverviewStats();

  // Load data on component mount
  useEffect(() => {
    loadTicketTypes();
    loadSpecialOffers();
    loadPricingRules();
    loadSupportingData();
  }, []);

  // Filtered data getters
  const getFilteredTicketTypes = () => {
    let result = [...ticketTypes];
    
    if (ticketTypeSearchTerm) {
      result = result.filter(type => 
        type.name?.toLowerCase().includes(ticketTypeSearchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(ticketTypeSearchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(type => type.status.toString() === statusFilter);
    }
    
    if (eventFilter !== 'all') {
      result = result.filter(type => type.eventId.toString() === eventFilter);
    }
    
    result.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'quantity':
          aValue = a.availableQuantity;
          bValue = b.availableQuantity;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return result;
  };

  const getFilteredSpecialOffers = () => {
    let result = [...specialOffers];
    
    if (offerSearchTerm) {
      result = result.filter(offer => 
        offer.name?.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
        formatOfferType(offer.offerType).toLowerCase().includes(offerSearchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(offer => {
        const status = getOfferStatus(offer).status;
        return status === statusFilter;
      });
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(offer => offer.offerType.toString() === typeFilter);
    }
    
    result.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'discount':
          aValue = a.discountValue;
          bValue = b.discountValue;
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        default:
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return result;
  };

  const getFilteredPricingRules = () => {
    let result = [...pricingRules];
    
    if (pricingRuleSearchTerm) {
      result = result.filter(rule => 
        rule.name?.toLowerCase().includes(pricingRuleSearchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(pricingRuleSearchTerm.toLowerCase()) ||
        rule.dynamicCondition?.toLowerCase().includes(pricingRuleSearchTerm.toLowerCase())
      );
    }
    
    result.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "minPrice":
          aValue = a.minimumPrice;
          bValue = b.minimumPrice;
          break;
        case "maxPrice":
          aValue = a.maximumPrice;
          bValue = b.maximumPrice;
          break;
        case "modifier":
          aValue = a.modifier;
          bValue = b.modifier;
          break;
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return result;
  };

  // Utility functions for special offers
  const getOfferStatus = (offer: SpecialOfferResponse) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-400/20 text-blue-400', icon: Clock };
    if (now > endDate) return { status: 'expired', color: 'bg-red-400/20 text-red-400', icon: XCircle };
    return { status: 'active', color: 'bg-green-400/20 text-green-400', icon: CheckCircle };
  };

  const getOfferTypeIcon = (type: OfferType) => {
    switch (type) {
      case 0: return Clock; // Early Bird
      case 1: return Users; // Student Discount
      case 2: return Users; // Group Discount
      case 3: return Users; // Senior Discount
      case 4: return Target; // Loyalty Discount
      case 5: return Gift; // Season Pass
      case 6: return Gift; // Buy One Get One
      case 7: return Percent; // Percentage Off
      case 8: return Tag; // Fixed Amount Off
      default: return Tag;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2">Ticketing & Pricing</h1>
          <p className="text-neutral-400">Manage ticket types, pricing rules, and special offers</p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 hover:border-lime-400/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                  stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                  stat.color === 'purple' ? 'bg-purple-400/20 text-purple-400' :
                  'bg-orange-400/20 text-orange-400'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-lime-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-neutral-400 text-xs mb-1">{stat.title}</p>
                <h3 className="text-lg font-bold text-white">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tab Navigation */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-1 flex gap-1">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-3 px-6 py-3 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-lime-400/20 text-lime-400 border border-lime-400/30'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
              }`}
            >
              <IconComponent className="w-5 h-5" />
              <span className="font-medium">{tab.label}</span>
              <div className={`px-2 py-1 rounded-full text-xs ${
                activeTab === tab.id 
                  ? 'bg-lime-400/30 text-lime-400' 
                  : 'bg-neutral-700 text-neutral-400'
              }`}>
                {tab.count}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'ticket-types' && (
          <TicketTypesTab
            ticketTypes={getFilteredTicketTypes()}
            selectedTicketType={selectedTicketType}
            setSelectedTicketType={setSelectedTicketType}
            searchTerm={ticketTypeSearchTerm}
            setSearchTerm={setTicketTypeSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            eventFilter={eventFilter}
            setEventFilter={setEventFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            events={events}
            zones={zones}
            loading={loading}
          />
        )}

        {activeTab === 'pricing-rules' && (
          <PricingRulesTab
            pricingRules={getFilteredPricingRules()}
            searchTerm={pricingRuleSearchTerm}
            setSearchTerm={setPricingRuleSearchTerm}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            loading={loading}
          />
        )}

        {activeTab === 'special-offers' && (
          <SpecialOffersTab
            specialOffers={getFilteredSpecialOffers()}
            selectedSpecialOffer={selectedSpecialOffer}
            setSelectedSpecialOffer={setSelectedSpecialOffer}
            searchTerm={offerSearchTerm}
            setSearchTerm={setOfferSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
            loading={loading}
            getOfferStatus={getOfferStatus}
            getOfferTypeIcon={getOfferTypeIcon}
            formatOfferType={formatOfferType}
            formatDate={formatDate}
          />
        )}
      </div>
    </div>
  );
};

// Tab Components
interface TicketTypesTabProps {
  ticketTypes: TicketTypeResponse[];
  selectedTicketType: TicketTypeResponse | null;
  setSelectedTicketType: (type: TicketTypeResponse | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  eventFilter: string;
  setEventFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  events: EventResponse[];
  zones: ZoneResponse[];
  loading: boolean;
}

const TicketTypesTab = ({ 
  ticketTypes, 
  selectedTicketType, 
  setSelectedTicketType,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  eventFilter,
  setEventFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  events,
  loading 
}: TicketTypesTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Ticket Types List */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Ticket Types</h3>
          <div className="flex gap-2">
            <div className="bg-lime-400/20 text-lime-400 px-2 py-1 rounded-full text-sm">
              {ticketTypes.length}
            </div>
            <button className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 px-3 py-1 rounded-lg flex items-center gap-1 transition-all duration-200 text-sm">
              <Plus size={14} />
              New
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              placeholder="Search ticket types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="all">All Status</option>
              <option value="0">Active</option>
              <option value="1">Inactive</option>
              <option value="2">Sold Out</option>
              <option value="3">Coming Soon</option>
              <option value="4">Suspended</option>
            </select>
            
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id.toString()}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="name">Name</option>
              <option value="quantity">Quantity</option>
              <option value="status">Status</option>
              <option value="event">Event</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-400/30"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Filter className="w-3 h-3" />
            <span>Showing {ticketTypes.length} ticket types</span>
          </div>
        </div>

        {/* Ticket Types List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center text-neutral-400 py-8">Loading ticket types...</div>
          ) : ticketTypes.length === 0 ? (
            <div className="text-center text-neutral-400 py-8">No ticket types found</div>
          ) : (
            ticketTypes.map((type) => (
              <div
                key={type.ticketTypeId}
                onClick={() => setSelectedTicketType(type)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                  selectedTicketType?.ticketTypeId === type.ticketTypeId
                    ? 'bg-lime-400/20 border border-lime-400/30'
                    : 'bg-neutral-800/50 hover:bg-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-2">
                      {type.name || 'Unnamed Ticket Type'}
                    </h4>
                    <p className="text-neutral-400 text-sm mb-2 line-clamp-2">
                      {type.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="bg-neutral-700 text-neutral-300 text-xs px-2 py-1 rounded-full">
                        {type.availableQuantity} available
                      </div>
                      <div className="bg-neutral-700 text-neutral-300 text-xs px-2 py-1 rounded-full">
                        Event: {events.find(e => e.id === type.eventId)?.name || type.eventId}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      type.status === 0 // Active
                        ? 'bg-green-400/20 text-green-400 border-green-900/50'
                        : type.status === 2 // SoldOut
                        ? 'bg-red-400/20 text-red-400 border-red-900/50'
                        : 'bg-yellow-400/20 text-yellow-400 border-yellow-900/50'
                    }`}>
                      {formatTicketTypeStatus(type.status)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Type Details */}
      <div className="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
        {selectedTicketType ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">{selectedTicketType.name || 'Unnamed Ticket Type'}</h3>
              <div className="flex gap-2">
                <button className="border border-neutral-700 text-neutral-300 hover:text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-all duration-200 hover:border-lime-400/30">
                  <Edit size={14} />
                  Edit
                </button>
                <button className="border border-red-700 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1 rounded-lg text-sm transition-all duration-200">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedTicketType.description && (
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Description</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg">
                    {selectedTicketType.description}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Available Quantity</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                    <Target className="w-4 h-4 mr-2 text-lime-400" />
                    {selectedTicketType.availableQuantity}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Status</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                    {selectedTicketType.status === 0 ? (
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                    ) : selectedTicketType.status === 2 ? (
                      <XCircle className="w-4 h-4 mr-2 text-red-400" />
                    ) : (
                      <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                    )}
                    {formatTicketTypeStatus(selectedTicketType.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Zone ID</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg">
                    {selectedTicketType.zoneId}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Event</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg">
                    {events.find(e => e.id === selectedTicketType.eventId)?.name || `Event ${selectedTicketType.eventId}`}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <h4 className="text-white text-sm mb-3 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-lime-400" />
                  Related Data
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Tickets</span>
                    <div className="text-lime-400">{selectedTicketType.ticketIds?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Special Offers</span>
                    <div className="text-lime-400">{selectedTicketType.specialOfferIds?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Pricing Rules</span>
                    <div className="text-lime-400">{selectedTicketType.pricingRuleIds?.length || 0}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200">
                  <Calculator className="w-4 h-4" />
                  Test Pricing
                </button>
                <button className="border border-neutral-700 text-neutral-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:border-lime-400/30">
                  Update Quantity
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-neutral-400 py-8">
            <Target className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
            <p>Select a ticket type to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Pricing Rules Tab Component
interface PricingRulesTabProps {
  pricingRules: PricingRuleResponse[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  loading: boolean;
}

const PricingRulesTab = ({ 
  pricingRules, 
  searchTerm, 
  setSearchTerm, 
  sortBy, 
  setSortBy, 
  sortOrder, 
  setSortOrder, 
  loading
}: PricingRulesTabProps) => {
  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm"
            >
              <option value="name">Name</option>
              <option value="minPrice">Min Price</option>
              <option value="maxPrice">Max Price</option>
              <option value="modifier">Modifier</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-400/30"
            >
              {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
            
            <button className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400">
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
          <Filter className="w-3 h-3" />
          <span>Showing {pricingRules.length} rules</span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-800/80 text-neutral-400 text-left">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Price Range</th>
                <th className="p-4 font-medium">Occupancy</th>
                <th className="p-4 font-medium">Early Bird</th>
                <th className="p-4 font-medium">Modifier</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {pricingRules.map((rule) => (
                <tr key={rule.pricingRuleId} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="p-4">
                    <div>
                      <h3 className="font-medium text-white group-hover:text-lime-400 transition-colors">
                        {rule.name || `Rule #${rule.pricingRuleId}`}
                      </h3>
                      {rule.description && (
                        <p className="text-neutral-500 text-xs mt-1 line-clamp-1">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-lime-400 font-medium">
                      {formatPrice(rule.minimumPrice)} - {formatPrice(rule.maximumPrice)}
                    </div>
                  </td>
                  <td className="p-4">
                    {rule.occupancyThreshold1 > 0 && (
                      <div className="text-xs text-neutral-400">
                        {rule.occupancyThreshold1}% → {rule.occupancyPercentage1}%
                      </div>
                    )}
                    {rule.occupancyThreshold2 > 0 && (
                      <div className="text-xs text-neutral-400">
                        {rule.occupancyThreshold2}% → {rule.occupancyPercentage2}%
                      </div>
                    )}
                    {rule.occupancyThreshold1 === 0 && rule.occupancyThreshold2 === 0 && (
                      <div className="text-xs text-neutral-500">Not set</div>
                    )}
                  </td>
                  <td className="p-4">
                    {rule.earlyBirdPercentage > 0 ? (
                      <div className="text-blue-400 font-medium">
                        {rule.earlyBirdPercentage}%
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500">Not set</div>
                    )}
                  </td>
                  <td className="p-4">
                    {rule.modifier !== 0 ? (
                      <div className={`font-medium ${rule.modifier > 0 ? 'text-lime-400' : 'text-red-400'}`}>
                        {rule.modifier > 0 ? '+' : ''}{rule.modifier}%
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500">None</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 hover:bg-red-900/50 rounded-lg transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pricingRules.length === 0 && !loading && (
          <div className="text-center py-12 text-neutral-400">
            <Settings className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
            <p className="text-lg mb-2">No pricing rules found</p>
            <p className="text-sm">Create your first pricing rule to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Special Offers Tab Component
interface SpecialOffersTabProps {
  specialOffers: SpecialOfferResponse[];
  selectedSpecialOffer: SpecialOfferResponse | null;
  setSelectedSpecialOffer: (offer: SpecialOfferResponse | null) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  typeFilter: string;
  setTypeFilter: (filter: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: string;
  setSortOrder: (order: string) => void;
  loading: boolean;
  getOfferStatus: (offer: SpecialOfferResponse) => any;
  getOfferTypeIcon: (type: OfferType) => any;
  formatOfferType: (type: OfferType) => string;
  formatDate: (date: Date | string) => string;
}

const SpecialOffersTab = ({ 
  specialOffers,
  selectedSpecialOffer,
  setSelectedSpecialOffer,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  loading,
  getOfferStatus,
  getOfferTypeIcon,
  formatOfferType,
  formatDate
}: SpecialOffersTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Special Offers List */}
      <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white">Special Offers</h3>
          <div className="flex gap-2">
            <div className="bg-lime-400/20 text-lime-400 px-2 py-1 rounded-full text-sm">
              {specialOffers.length}
            </div>
            <button className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 px-3 py-1 rounded-lg flex items-center gap-1 transition-all duration-200 text-sm">
              <Plus size={14} />
              New
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <input
              placeholder="Search special offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="all">All Types</option>
              <option value="0">Early Bird</option>
              <option value="1">Student</option>
              <option value="2">Group</option>
              <option value="3">Senior</option>
              <option value="4">Loyalty</option>
              <option value="5">Season Pass</option>
              <option value="6">BOGO</option>
              <option value="7">Percentage</option>
              <option value="8">Fixed Amount</option>
            </select>
          </div>

          <div className="flex gap-2 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
              <option value="name">Name</option>
              <option value="discount">Discount</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-400/30"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <Filter className="w-3 h-3" />
            <span>Showing {specialOffers.length} offers</span>
          </div>
        </div>

        {/* Offers List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center text-neutral-400 py-8">Loading special offers...</div>
          ) : specialOffers.length === 0 ? (
            <div className="text-center text-neutral-400 py-8">No special offers found</div>
          ) : (
            specialOffers.map((offer) => {
              const { status, color, icon: StatusIcon } = getOfferStatus(offer);
              const OfferIcon = getOfferTypeIcon(offer.offerType);
              
              return (
                <div
                  key={offer.specialOfferId}
                  onClick={() => setSelectedSpecialOffer(offer)}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedSpecialOffer?.specialOfferId === offer.specialOfferId
                      ? 'bg-lime-400/20 border border-lime-400/30'
                      : 'bg-neutral-800/50 hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <OfferIcon className="w-4 h-4 text-lime-400" />
                        <h4 className="text-white font-medium">
                          {offer.name || `Offer ${offer.specialOfferId}`}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${color} border`}>
                          <StatusIcon className="w-3 h-3 inline mr-1" />
                          {status}
                        </div>
                        <div className="bg-lime-400/20 text-lime-400 px-2 py-1 rounded-full text-xs">
                          {offer.discountValue}% off
                        </div>
                      </div>
                      
                      <p className="text-neutral-400 text-sm mb-2 line-clamp-2">
                        {offer.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                        </span>
                        <span>Limit: {offer.ticketLimit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Special Offer Details */}
      <div className="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
        {selectedSpecialOffer ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white">{selectedSpecialOffer.name || `Offer ${selectedSpecialOffer.specialOfferId}`}</h3>
              <div className="flex gap-2">
                <button className="border border-neutral-700 text-neutral-300 hover:text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-all duration-200 hover:border-lime-400/30">
                  <Edit size={14} />
                  Edit
                </button>
                <button className="border border-red-700 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1 rounded-lg text-sm transition-all duration-200">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {selectedSpecialOffer.description && (
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Description</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg">
                    {selectedSpecialOffer.description}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Offer Type</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                    {(() => {
                      const OfferIcon = getOfferTypeIcon(selectedSpecialOffer.offerType);
                      return <OfferIcon className="w-4 h-4 mr-2 text-lime-400" />;
                    })()}
                    {formatOfferType(selectedSpecialOffer.offerType)}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Discount Value</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                    <Percent className="w-4 h-4 mr-2 text-lime-400" />
                    {selectedSpecialOffer.discountValue}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Start Date</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-lime-400" />
                    {formatDate(selectedSpecialOffer.startDate)}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">End Date</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-lime-400" />
                    {formatDate(selectedSpecialOffer.endDate)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Ticket Limit</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                    <Target className="w-4 h-4 mr-2 text-lime-400" />
                    {selectedSpecialOffer.ticketLimit}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Status</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                    {(() => {
                      const { icon: StatusIcon } = getOfferStatus(selectedSpecialOffer);
                      return <StatusIcon className="w-4 h-4 mr-2 text-lime-400" />;
                    })()}
                    {getOfferStatus(selectedSpecialOffer).status}
                  </div>
                </div>
              </div>

              {selectedSpecialOffer.applicationCondition && (
                <div>
                  <label className="text-neutral-300 text-sm block mb-2">Application Condition</label>
                  <div className="text-white bg-neutral-800/50 p-3 rounded-lg">
                    {selectedSpecialOffer.applicationCondition}
                  </div>
                </div>
              )}

              <div className="p-4 bg-neutral-800/50 rounded-lg">
                <h4 className="text-white text-sm mb-3 flex items-center">
                  <Gift className="w-4 h-4 mr-2 text-lime-400" />
                  Related Data
                </h4>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-neutral-400">Ticket Types</span>
                    <div className="text-lime-400">{selectedSpecialOffer.ticketTypeIds?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Usage Count</span>
                    <div className="text-lime-400">-</div>
                  </div>
                  <div>
                    <span className="text-neutral-400">Remaining</span>
                    <div className="text-lime-400">{selectedSpecialOffer.ticketLimit}</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-neutral-400 py-8">
            <Percent className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
            <p>Select a special offer to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Ticketing;