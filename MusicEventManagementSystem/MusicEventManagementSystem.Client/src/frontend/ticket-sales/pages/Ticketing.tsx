import { Card, KpiCard } from '../components/card';
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

  const [previousStats, setPreviousStats] = useState({
    activeTicketTypes: 0,
    availableTickets: 0,
    activeOffers: 0,
    avgMinPrice: 0
  });

  // Additional state to ensure stats are only calculated after initial load
  const [isInitialized, setIsInitialized] = useState(false);

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

    // Računanje promena u odnosu na prethodne podatke
    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const activeTicketTypesChange = calculateChange(activeTicketTypes.length, previousStats.activeTicketTypes);
    const availableTicketsChange = calculateChange(totalAvailableTickets, previousStats.availableTickets);
    const activeOffersChange = calculateChange(activeOffers.length, previousStats.activeOffers);
    const avgMinPriceChange = calculateChange(avgMinPrice, previousStats.avgMinPrice);

    return [
      {
        title: "Active Ticket Types",
        value: activeTicketTypes.length.toString(),
        change: activeTicketTypesChange,
        trend: activeTicketTypesChange >= 0 ? "up" as const : "down" as const,
        icon: Target,
      },
      {
        title: "Available Tickets",
        value: totalAvailableTickets.toString(),
        change: availableTicketsChange,
        trend: availableTicketsChange >= 0 ? "up" as const : "down" as const,
        icon: Users,
      },
      {
        title: "Active Offers",
        value: activeOffers.length.toString(),
        change: activeOffersChange,
        trend: activeOffersChange >= 0 ? "up" as const : "down" as const,
        icon: Gift,
      },
      {
        title: "Avg. Min Price",
        value: formatPrice(avgMinPrice),
        change: avgMinPriceChange,
        trend: avgMinPriceChange >= 0 ? "up" as const : "down" as const,
        icon: DollarSign,
      }
    ];
  };

  useEffect(() => {
    if (ticketTypes.length > 0 || specialOffers.length > 0 || pricingRules.length > 0) {
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

      setPreviousStats({
        activeTicketTypes: activeTicketTypes.length,
        availableTickets: totalAvailableTickets,
        activeOffers: activeOffers.length,
        avgMinPrice: avgMinPrice
      });
      
      if (!isInitialized) {
        setIsInitialized(true);
      }
    }
  }, [ticketTypes.length, specialOffers.length, pricingRules.length, isInitialized]);

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
    <div className="text-white h-full flex flex-col p-2">
      {/* Page Header - Konzistentan sa Dashboard-om */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Ticketing & Pricing</h1>
            <p className="text-neutral-400 text-sm">Manage ticket types, pricing rules, and special offers</p>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="bg-red-500/20 border border-red-500/30 mb-4">
          <div className="flex items-center gap-2 p-4">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <span className="text-red-400 text-base">{error}</span>
          </div>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {overviewStats.map((stat, index) => (
          <KpiCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType="percentage"
          />
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="space-y-4 mb-4">
        <div className="flex space-x-1 rounded-2xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-1 shadow-lg">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-lime-400 text-black shadow-lg font-medium'
                    : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50'
                }`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{tab.label}</span>
                <div className={`px-2 py-1 rounded-lg text-xs ${
                  activeTab === tab.id 
                    ? 'bg-black/20 text-black' 
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {tab.count}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-[600px]">
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      {/* Ticket Types List */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Ticket Types</h3>
          <div className="flex gap-2">
            <div className="bg-lime-500/20 text-lime-400 px-3 py-1 rounded-xl text-base">
              {ticketTypes.length}
            </div>
            <button className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold text-base">
              <Plus size={18} />
              New
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              placeholder="Search ticket types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-base"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
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
              className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="all">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id.toString()}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="name">Name</option>
              <option value="quantity">Quantity</option>
              <option value="status">Status</option>
              <option value="event">Event</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-500/30"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Filter className="w-4 h-4" />
            <span>Showing {ticketTypes.length} ticket types</span>
          </div>
        </div>

        {/* Ticket Types List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="text-center text-neutral-400 py-8 text-base">Loading ticket types...</div>
          ) : ticketTypes.length === 0 ? (
            <div className="text-center text-neutral-400 py-8 text-base">No ticket types found</div>
          ) : (
            ticketTypes.map((type) => (
              <Card
                key={type.ticketTypeId}
                hover={true}
                onClick={() => setSelectedTicketType(type)}
                className={`p-4 cursor-pointer transition-all duration-200 ${
                  selectedTicketType?.ticketTypeId === type.ticketTypeId
                    ? 'bg-lime-500/20 border border-lime-500/30'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-white font-medium text-lg mb-2">
                      {type.name || 'Unnamed Ticket Type'}
                    </h4>
                    <p className="text-neutral-400 text-base mb-2 line-clamp-2">
                      {type.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="bg-neutral-700 text-neutral-300 text-sm px-3 py-1 rounded-xl">
                        {type.availableQuantity} available
                      </div>
                      <div className="bg-neutral-700 text-neutral-300 text-sm px-3 py-1 rounded-xl">
                        Event: {events.find(e => e.id === type.eventId)?.name || type.eventId}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-xl text-sm font-medium border ${
                      type.status === 0 // Active
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : type.status === 2 // SoldOut
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                    }`}>
                      {formatTicketTypeStatus(type.status)}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      {/* Ticket Type Details */}
      <Card className="lg:col-span-2 overflow-hidden">
        {selectedTicketType ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedTicketType.name || 'Unnamed Ticket Type'}</h3>
              <div className="flex gap-2">
                <button className="border border-neutral-700 text-neutral-300 hover:text-white px-4 py-2 rounded-xl text-base flex items-center gap-2 transition-all duration-200 hover:border-lime-500/30">
                  <Edit size={18} />
                  Edit
                </button>
                <button className="border border-red-700 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl text-base transition-all duration-200">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {selectedTicketType.description && (
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Description</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl text-base">
                    {selectedTicketType.description}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Available Quantity</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl flex items-center text-base">
                    <Target className="w-5 h-5 mr-3 text-lime-400" />
                    {selectedTicketType.availableQuantity}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Status</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl flex items-center text-base">
                    {selectedTicketType.status === 0 ? (
                      <CheckCircle className="w-5 h-5 mr-3 text-emerald-400" />
                    ) : selectedTicketType.status === 2 ? (
                      <XCircle className="w-5 h-5 mr-3 text-red-400" />
                    ) : (
                      <Clock className="w-5 h-5 mr-3 text-yellow-400" />
                    )}
                    {formatTicketTypeStatus(selectedTicketType.status)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Zone ID</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl text-base">
                    {selectedTicketType.zoneId}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Event</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl text-base">
                    {events.find(e => e.id === selectedTicketType.eventId)?.name || `Event ${selectedTicketType.eventId}`}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-800/50 rounded-2xl">
                <h4 className="text-white text-base mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-3 text-lime-400" />
                  Related Data
                </h4>
                <div className="grid grid-cols-3 gap-6 text-base">
                  <div>
                    <span className="text-neutral-400 text-sm">Tickets</span>
                    <div className="text-lime-400 text-lg font-semibold">{selectedTicketType.ticketIds?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-sm">Special Offers</span>
                    <div className="text-lime-400 text-lg font-semibold">{selectedTicketType.specialOfferIds?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-sm">Pricing Rules</span>
                    <div className="text-lime-400 text-lg font-semibold">{selectedTicketType.pricingRuleIds?.length || 0}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 text-base">
                  <Calculator className="w-5 h-5" />
                  Test Pricing
                </button>
                <button className="border border-neutral-700 text-neutral-300 hover:text-white px-4 py-3 rounded-xl text-base transition-all duration-200 hover:border-lime-500/30">
                  Update Quantity
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-neutral-400 py-8">
            <Target className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
            <p className="text-base">Select a ticket type to view details</p>
          </div>
        )}
      </Card>
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
    <div className="space-y-6 h-full">
      {/* Filters and Controls */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                placeholder="Search pricing rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-base"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-base"
            >
              <option value="name">Name</option>
              <option value="minPrice">Min Price</option>
              <option value="maxPrice">Max Price</option>
              <option value="modifier">Modifier</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-500/30"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
            </button>
            
            <button className="bg-lime-500 hover:bg-lime-600 px-4 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold text-base whitespace-nowrap">
              <Plus size={18} />
              New Rule
            </button>
          </div>
        </div>
      </Card>

      {/* Pricing Rules Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-neutral-400 py-8 text-base">Loading pricing rules...</div>
        ) : pricingRules.length === 0 ? (
          <div className="col-span-full text-center text-neutral-400 py-8 text-base">No pricing rules found</div>
        ) : (
          pricingRules.map((rule) => (
            <Card key={rule.pricingRuleId} hover={true} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-white font-medium text-lg">{rule.name || 'Unnamed Rule'}</h4>
                <div className="flex gap-2">
                  <button className="text-neutral-400 hover:text-white transition-colors duration-200">
                    <Edit size={16} />
                  </button>
                  <button className="text-red-400 hover:text-red-300 transition-colors duration-200">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {rule.description && (
                <p className="text-neutral-400 text-base mb-4 line-clamp-2">{rule.description}</p>
              )}
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-base">Min Price</span>
                  <span className="text-white font-medium text-base">{formatPrice(rule.minimumPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-base">Max Price</span>
                  <span className="text-white font-medium text-base">{formatPrice(rule.maximumPrice)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-base">Modifier</span>
                  <span className="text-lime-400 font-medium text-base">{rule.modifier}x</span>
                </div>
              </div>
              
              {rule.dynamicCondition && (
                <div className="bg-neutral-800/50 p-3 rounded-xl mb-4">
                  <div className="text-neutral-400 text-sm mb-1">Dynamic Condition</div>
                  <div className="text-white text-sm font-mono">{rule.dynamicCondition}</div>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-neutral-400">
                  {rule.ticketTypesIds?.length || 0} ticket types
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-400">Active</span>
                </div>
              </div>
            </Card>
          ))
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Special Offers List */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Special Offers</h3>
          <div className="flex gap-2">
            <div className="bg-lime-500/20 text-lime-400 px-3 py-1 rounded-xl text-base">
              {specialOffers.length}
            </div>
            <button className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold text-base">
              <Plus size={18} />
              New
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              placeholder="Search special offers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-base"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="expired">Expired</option>
            </select>
            
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="all">All Types</option>
              <option value="0">Early Bird</option>
              <option value="1">Student Discount</option>
              <option value="2">Group Discount</option>
              <option value="3">Senior Discount</option>
              <option value="4">Loyalty Discount</option>
              <option value="5">Season Pass</option>
              <option value="6">Buy One Get One</option>
              <option value="7">Percentage Off</option>
              <option value="8">Fixed Amount Off</option>
            </select>
          </div>

          <div className="flex gap-3 items-center">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="name">Name</option>
              <option value="discount">Discount</option>
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-500/30"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
            </button>
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral-400">
            <Filter className="w-4 h-4" />
            <span>Showing {specialOffers.length} offers</span>
          </div>
        </div>

        {/* Special Offers List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {loading ? (
            <div className="text-center text-neutral-400 py-8 text-base">Loading special offers...</div>
          ) : specialOffers.length === 0 ? (
            <div className="text-center text-neutral-400 py-8 text-base">No special offers found</div>
          ) : (
            specialOffers.map((offer) => {
              const status = getOfferStatus(offer);
              const StatusIcon = status.icon;
              const TypeIcon = getOfferTypeIcon(offer.offerType);

              return (
                <Card
                  key={offer.specialOfferId}
                  hover={true}
                  onClick={() => setSelectedSpecialOffer(offer)}
                  className={`p-4 cursor-pointer transition-all duration-200 ${
                    selectedSpecialOffer?.specialOfferId === offer.specialOfferId
                      ? 'bg-lime-500/20 border border-lime-500/30'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-lg mb-2">
                        {offer.name || 'Unnamed Offer'}
                      </h4>
                      <p className="text-neutral-400 text-base mb-2 line-clamp-2">
                        {offer.description}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <div className="bg-neutral-700 text-neutral-300 text-sm px-3 py-1 rounded-xl flex items-center gap-2">
                          <TypeIcon className="w-4 h-4" />
                          {formatOfferType(offer.offerType)}
                        </div>
                        <div className="bg-neutral-700 text-neutral-300 text-sm px-3 py-1 rounded-xl">
                          {offer.discountValue}% off
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className={`px-3 py-1 rounded-xl text-sm font-medium border flex items-center gap-2 ${status.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        {status.status}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </Card>

      {/* Special Offer Details */}
      <Card className="lg:col-span-2 overflow-hidden">
        {selectedSpecialOffer ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">{selectedSpecialOffer.name || 'Unnamed Offer'}</h3>
              <div className="flex gap-2">
                <button className="border border-neutral-700 text-neutral-300 hover:text-white px-4 py-2 rounded-xl text-base flex items-center gap-2 transition-all duration-200 hover:border-lime-500/30">
                  <Edit size={18} />
                  Edit
                </button>
                <button className="border border-red-700 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-4 py-2 rounded-xl text-base transition-all duration-200">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {selectedSpecialOffer.description && (
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Description</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl text-base">
                    {selectedSpecialOffer.description}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Discount Value</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl flex items-center text-base">
                    <Percent className="w-5 h-5 mr-3 text-lime-400" />
                    {selectedSpecialOffer.discountValue}%
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Offer Type</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl flex items-center text-base">
                    {(() => {
                      const IconComponent = getOfferTypeIcon(selectedSpecialOffer.offerType);
                      return <IconComponent className="w-5 h-5 mr-3 text-lime-400" />;
                    })()}
                    {formatOfferType(selectedSpecialOffer.offerType)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-neutral-300 text-base block mb-3">Start Date</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl flex items-center text-base">
                    <Calendar className="w-5 h-5 mr-3 text-lime-400" />
                    {formatDate(selectedSpecialOffer.startDate)}
                  </div>
                </div>
                <div>
                  <label className="text-neutral-300 text-base block mb-3">End Date</label>
                  <div className="text-white bg-neutral-800/50 p-4 rounded-2xl flex items-center text-base">
                    <Calendar className="w-5 h-5 mr-3 text-lime-400" />
                    {formatDate(selectedSpecialOffer.endDate)}
                  </div>
                </div>
              </div>

              <div>
                <label className="text-neutral-300 text-base block mb-3">Status</label>
                <div className="text-white bg-neutral-800/50 p-4 rounded-2xl flex items-center text-base">
                  {(() => {
                    const status = getOfferStatus(selectedSpecialOffer);
                    const StatusIcon = status.icon;
                    return (
                      <>
                        <StatusIcon className="w-5 h-5 mr-3" />
                        <span className="capitalize">{status.status}</span>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="p-4 bg-neutral-800/50 rounded-2xl">
                <h4 className="text-white text-base mb-4 flex items-center">
                  <Gift className="w-5 h-5 mr-3 text-lime-400" />
                  Usage Statistics
                </h4>
                <div className="grid grid-cols-3 gap-6 text-base">
                  <div>
                    <span className="text-neutral-400 text-sm">Applied Ticket Types</span>
                    <div className="text-lime-400 text-lg font-semibold">{selectedSpecialOffer.ticketTypeIds?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-sm">Ticket Types</span>
                    <div className="text-lime-400 text-lg font-semibold">{selectedSpecialOffer.ticketTypeIds?.length || 0}</div>
                  </div>
                  <div>
                    <span className="text-neutral-400 text-sm">Total Discount</span>
                    <div className="text-lime-400 text-lg font-semibold">{selectedSpecialOffer.discountValue}%</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-3 rounded-xl flex items-center justify-center gap-3 transition-all duration-200 text-base">
                  <Calculator className="w-5 h-5" />
                  Calculate Discount
                </button>
                <button className="border border-neutral-700 text-neutral-300 hover:text-white px-4 py-3 rounded-xl text-base transition-all duration-200 hover:border-lime-500/30">
                  Duplicate Offer
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-neutral-400 py-8">
            <Gift className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
            <p className="text-base">Select a special offer to view details</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Ticketing;