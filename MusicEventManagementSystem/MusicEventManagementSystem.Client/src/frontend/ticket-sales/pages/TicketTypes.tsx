import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Target, Filter, Users, ArrowUp, ArrowDown, CheckCircle, XCircle, Clock, TrendingUp, Calculator } from 'lucide-react';
import { TicketTypeService } from '../services/ticketTypeService';
import { ZoneService } from '../services/zoneService';
import type { TicketTypeResponse, ZoneResponse, TicketTypeStatus } from '../types';

interface EventResponse {
  id: number;
  name: string;
}

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

const TicketTypes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const [previousStats, setPreviousStats] = useState({
    activeTicketTypes: 0,
    availableTickets: 0,
    soldOut: 0,
    totalRevenue: 0
  });

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

  const loadSupportingData = async () => {
    try {
      const zonesData = await ZoneService.getAllZones();
      setZones(zonesData);
    } catch (err) {
      console.error('Failed to load supporting data:', err);
    }
  };

  useEffect(() => {
    loadTicketTypes();
    loadSupportingData();
  }, []);

  const getOverviewStats = () => {
    const activeTicketTypes = ticketTypes.filter(type => type.status === 0);
    const totalAvailableTickets = ticketTypes.reduce((sum, type) => sum + type.availableQuantity, 0);
    const soldOutTypes = ticketTypes.filter(type => type.status === 2);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const activeChange = calculateChange(activeTicketTypes.length, previousStats.activeTicketTypes);
    const availableChange = calculateChange(totalAvailableTickets, previousStats.availableTickets);
    const soldOutChange = calculateChange(soldOutTypes.length, previousStats.soldOut);

    return [
      {
        title: "Active Types",
        value: activeTicketTypes.length.toString(),
        change: activeChange,
        trend: activeChange >= 0 ? "up" as const : "down" as const,
        icon: Target,
      },
      {
        title: "Available Tickets",
        value: totalAvailableTickets.toString(),
        change: availableChange,
        trend: availableChange >= 0 ? "up" as const : "down" as const,
        icon: Users,
      },
      {
        title: "Sold Out",
        value: soldOutTypes.length.toString(),
        change: soldOutChange,
        trend: soldOutChange >= 0 ? "down" as const : "up" as const,
        icon: XCircle,
      },
      {
        title: "Total Types",
        value: ticketTypes.length.toString(),
        change: 0,
        trend: "up" as const,
        icon: CheckCircle,
      }
    ];
  };

  useEffect(() => {
    if (ticketTypes.length > 0) {
      const activeTicketTypes = ticketTypes.filter(type => type.status === 0);
      const totalAvailableTickets = ticketTypes.reduce((sum, type) => sum + type.availableQuantity, 0);
      const soldOutTypes = ticketTypes.filter(type => type.status === 2);

      setPreviousStats({
        activeTicketTypes: activeTicketTypes.length,
        availableTickets: totalAvailableTickets,
        soldOut: soldOutTypes.length,
        totalRevenue: 0
      });
    }
  }, [ticketTypes.length]);

  const getFilteredTicketTypes = () => {
    let result = [...ticketTypes];
    
    if (searchTerm) {
      result = result.filter(type => 
        type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const overviewStats = getOverviewStats();
  const filteredTicketTypes = getFilteredTicketTypes();

  return (
    <div className="text-white h-full flex flex-col p-2">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Ticket Types</h1>
            <p className="text-neutral-400 text-sm">Manage and configure ticket types for events</p>
          </div>
        </div>
      </div>

      {error && (
        <Card className="bg-red-500/20 border border-red-500/30 mb-4">
          <div className="flex items-center gap-2 p-4">
            <XCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-400 text-base">{error}</span>
          </div>
        </Card>
      )}

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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">All Ticket Types</h3>
            <div className="flex gap-2">
              <div className="bg-lime-500/20 text-lime-400 px-3 py-1 rounded-xl text-base">
                {filteredTicketTypes.length}
              </div>
              <button className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold text-base">
                <Plus size={18} />
                New
              </button>
            </div>
          </div>

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
              <span>Showing {filteredTicketTypes.length} ticket types</span>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="text-center text-neutral-400 py-8 text-base">Loading ticket types...</div>
            ) : filteredTicketTypes.length === 0 ? (
              <div className="text-center text-neutral-400 py-8 text-base">No ticket types found</div>
            ) : (
              filteredTicketTypes.map((type) => (
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
                        type.status === 0
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : type.status === 2
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
    </div>
  );
};

export default TicketTypes;