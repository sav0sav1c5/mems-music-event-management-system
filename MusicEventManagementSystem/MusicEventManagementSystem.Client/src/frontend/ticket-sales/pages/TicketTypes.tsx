import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Target, Users, CheckCircle, XCircle, Clock, AlertTriangle, ArrowUp, ArrowDown, Filter, TrendingUp, Calculator, Settings } from 'lucide-react';
import { TicketTypeService } from '../types/services/ticketTypeService';
import { EventService } from '../../event-organization/services/eventService';
import { ZoneService } from '../types/services/zoneService';
import { PricingRuleService } from '../types/services/pricingRuleService';
import type { 
  TicketTypeResponse,
  TicketTypeCreateForm,
  TicketTypeUpdateForm,
  ZoneResponse,
  TicketTypeStatus,
  CalculatePriceRequest
} from '../types';
import type { EventResponse } from '../../event-organization/types/api/event';

// Utility function to format ticket type status
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
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ticket Types state
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeResponse | null>(null);
  const [ticketTypeSearchTerm, setTicketTypeSearchTerm] = useState('');
  const [showTicketTypeDialog, setShowTicketTypeDialog] = useState(false);
  const [editingTicketType, setEditingTicketType] = useState<TicketTypeResponse | null>(null);

  // Supporting data
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);

  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Pricing simulator state
  const [simulatorTicketType, setSimulatorTicketType] = useState<TicketTypeResponse | null>(null);
  const [simulatorQuantity, setSimulatorQuantity] = useState(1);
  const [simulatorOccupancy, setSimulatorOccupancy] = useState(50);
  const [simulatorEarlyBird, setSimulatorEarlyBird] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any[]>([]);

  // Filtered and sorted data
  const getFilteredTicketTypes = () => {
    let result = [...ticketTypes];
    
    // Apply search filter
    if (ticketTypeSearchTerm) {
      result = result.filter(type => 
        type.name?.toLowerCase().includes(ticketTypeSearchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(ticketTypeSearchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(type => type.status.toString() === statusFilter);
    }
    
    // Apply event filter
    if (eventFilter !== 'all') {
      result = result.filter(type => type.eventId.toString() === eventFilter);
    }
    
    // Apply sorting
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
        case 'event':
          aValue = a.eventId;
          bValue = b.eventId;
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

  const filteredTicketTypes = getFilteredTicketTypes();

  // Load data functions
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
      const [eventsData, zonesData] = await Promise.all([
        EventService.getAllEvents(),
        ZoneService.getAllZones()
      ]);
      setEvents(eventsData);
      setZones(zonesData);
    } catch (err) {
      console.error('Failed to load supporting data:', err);
    }
  };

  // CRUD operations
  const handleCreateTicketType = async (formData: TicketTypeCreateForm) => {
    try {
      const newTicketType = await TicketTypeService.createTicketType(formData);
      setTicketTypes(prev => [newTicketType, ...prev]);
      setShowTicketTypeDialog(false);
      setEditingTicketType(null);
    } catch (err) {
      setError('Failed to create ticket type');
      console.error(err);
    }
  };

  const handleUpdateTicketType = async (id: number, formData: TicketTypeUpdateForm) => {
    try {
      const updatedTicketType = await TicketTypeService.updateTicketType(id, formData);
      setTicketTypes(prev => prev.map(tt => tt.ticketTypeId === id ? updatedTicketType : tt));
      if (selectedTicketType?.ticketTypeId === id) {
        setSelectedTicketType(updatedTicketType);
      }
      setEditingTicketType(null);
      setShowTicketTypeDialog(false);
    } catch (err) {
      setError('Failed to update ticket type');
      console.error(err);
    }
  };

  const handleDeleteTicketType = async (id: number) => {
    try {
      await TicketTypeService.deleteTicketType(id);
      setTicketTypes(prev => prev.filter(tt => tt.ticketTypeId !== id));
      if (selectedTicketType?.ticketTypeId === id) {
        setSelectedTicketType(ticketTypes[0] || null);
      }
    } catch (err) {
      setError('Failed to delete ticket type');
      console.error(err);
    }
  };

  // Pricing simulator
  const runPricingSimulation = async () => {
    if (!simulatorTicketType) return;
    
    try {
      setLoading(true);
      const results = [];
      
      // Get pricing rules for this ticket type
      const rules = await PricingRuleService.getPricingRulesByTicketType(simulatorTicketType.ticketTypeId);
      
      for (const rule of rules) {
        try {
          const calculateRequest: CalculatePriceRequest = {
            basePrice: simulatorTicketType.zoneId ? zones.find(z => z.zoneId === simulatorTicketType.zoneId)?.basePrice || 0 : 0,
            occupancyRate: simulatorOccupancy / 100,
            isEarlyBird: simulatorEarlyBird
          };
          
          const calculatedPrice = await PricingRuleService.calculatePrice(rule.pricingRuleId, calculateRequest);
          
          results.push({
            rule,
            originalPrice: calculateRequest.basePrice * simulatorQuantity,
            calculatedPrice: calculatedPrice * simulatorQuantity,
            savings: (calculateRequest.basePrice - calculatedPrice) * simulatorQuantity
          });
        } catch (err) {
          console.error('Error calculating price for rule:', rule.name, err);
        }
      }
      
      setSimulationResults(results);
    } catch (err) {
      setError('Failed to run pricing simulation');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const getActiveTicketTypes = () => ticketTypes.filter(type => type.status === 0);
  const getInactiveTicketTypes = () => ticketTypes.filter(type => type.status === 1);
  const getSoldOutTicketTypes = () => ticketTypes.filter(type => type.status === 2);
  const getTotalAvailableTickets = () => ticketTypes.reduce((sum, type) => sum + type.availableQuantity, 0);

  const stats = [
    {
      title: "Total Types",
      value: ticketTypes.length.toString(),
      change: "+3 this week",
      trend: "up",
      icon: Target,
      color: "lime"
    },
    {
      title: "Active Types",
      value: getActiveTicketTypes().length.toString(),
      change: `${getSoldOutTicketTypes().length} sold out`,
      trend: getActiveTicketTypes().length > 0 ? "up" : "down",
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Total Available",
      value: getTotalAvailableTickets().toString(),
      change: "-125 today",
      trend: "down",
      icon: Users,
      color: "blue"
    },
    {
      title: "Inactive Types",
      value: getInactiveTicketTypes().length.toString(),
      change: "+1 this week",
      trend: "up",
      icon: XCircle,
      color: "red"
    },
  ];

  // Load data on component mount
  useEffect(() => {
    loadTicketTypes();
    loadSupportingData();
  }, []);

  // Run simulation when parameters change
  useEffect(() => {
    if (simulatorTicketType) {
      runPricingSimulation();
    }
  }, [simulatorTicketType, simulatorQuantity, simulatorOccupancy, simulatorEarlyBird]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2">Ticket Types</h1>
          <p className="text-neutral-400">Manage ticket types, quantities, and configurations</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingTicketType(null);
              setShowTicketTypeDialog(true);
            }}
            className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
          >
            <Plus size={16} />
            New Ticket Type
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 hover:border-lime-400/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                  stat.color === 'green' ? 'bg-green-400/20 text-green-400' :
                  stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                  'bg-red-400/20 text-red-400'
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ticket Types List */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Ticket Types</h3>
            <div className="bg-lime-400/20 text-lime-400 px-2 py-1 rounded-full text-sm">
              {filteredTicketTypes.length}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                placeholder="Search ticket types..."
                value={ticketTypeSearchTerm}
                onChange={(e) => setTicketTypeSearchTerm(e.target.value)}
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
              <span>Showing {filteredTicketTypes.length} of {ticketTypes.length} ticket types</span>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center text-neutral-400 py-8">Loading ticket types...</div>
            ) : filteredTicketTypes.length === 0 ? (
              <div className="text-center text-neutral-400 py-8">No ticket types found</div>
            ) : (
              filteredTicketTypes.map((type) => (
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

        {/* Ticket Type Editor */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
          {selectedTicketType ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white">{selectedTicketType.name || 'Unnamed Ticket Type'}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingTicketType(selectedTicketType)}
                    className="border border-neutral-700 text-neutral-300 hover:text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-all duration-200 hover:border-lime-400/30"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this ticket type?')) {
                        handleDeleteTicketType(selectedTicketType.ticketTypeId);
                      }
                    }}
                    className="border border-red-700 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1 rounded-lg text-sm transition-all duration-200"
                  >
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
                  <button
                    onClick={() => setSimulatorTicketType(selectedTicketType)}
                    className="flex-1 bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
                  >
                    <Calculator className="w-4 h-4" />
                    Test Pricing
                  </button>
                  <button
                    onClick={async () => {
                      const newQuantity = prompt('Enter new available quantity:');
                      if (newQuantity && !isNaN(Number(newQuantity))) {
                        try {
                          await TicketTypeService.updateAvailableQuantity(
                            selectedTicketType.ticketTypeId, 
                            Number(newQuantity)
                          );
                          loadTicketTypes(); // Refresh the list
                        } catch (err) {
                          setError('Failed to update quantity');
                        }
                      }
                    }}
                    className="border border-neutral-700 text-neutral-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:border-lime-400/30"
                  >
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

        {/* Pricing Simulator */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="text-lime-400" size={20} />
            <h3 className="text-white">Pricing Simulator</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-neutral-300 text-sm block mb-2">Ticket Type</label>
              <select 
                value={simulatorTicketType?.ticketTypeId.toString() || ''} 
                onChange={(value) => {
                  const ticketType = ticketTypes.find(tt => tt.ticketTypeId.toString() === value.target.value);
                  setSimulatorTicketType(ticketType || null);
                }}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              >
                <option value="">Select ticket type</option>
                {ticketTypes.map((type) => (
                  <option key={type.ticketTypeId} value={type.ticketTypeId.toString()}>
                    {type.name || `Ticket Type ${type.ticketTypeId}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-neutral-300 text-sm block mb-2">Quantity</label>
              <input
                type="number"
                min="1"
                value={simulatorQuantity}
                onChange={(e) => setSimulatorQuantity(Number(e.target.value) || 1)}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              />
            </div>

            <div>
              <label className="text-neutral-300 text-sm block mb-2">Occupancy Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={simulatorOccupancy}
                onChange={(e) => setSimulatorOccupancy(Number(e.target.value) || 0)}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="early-bird"
                checked={simulatorEarlyBird}
                onChange={(e) => setSimulatorEarlyBird(e.target.checked)}
                className="w-4 h-4 text-lime-400 bg-neutral-800 border-neutral-700 rounded focus:ring-lime-400"
              />
              <label htmlFor="early-bird" className="text-neutral-300 text-sm">Early Bird Discount</label>
            </div>

            <button
              onClick={runPricingSimulation}
              disabled={!simulatorTicketType || loading}
              className="w-full bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calculator className="w-4 h-4" />
              Run Simulation
            </button>

            {simulationResults.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-white text-sm flex items-center">
                  <TrendingUp className="w-4 h-4 mr-2 text-lime-400" />
                  Simulation Results
                </h4>
                
                {simulationResults.map((result, index) => (
                  <div key={index} className="p-3 bg-neutral-800/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-neutral-300 text-sm">{result.rule.name}</span>
                      <div className="bg-lime-400/20 text-lime-400 text-xs px-2 py-1 rounded-full">
                        Rule {result.rule.pricingRuleId}
                      </div>
                    </div>
                    
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Original</span>
                        <span className="text-white">${result.originalPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Final</span>
                        <span className="text-lime-400">${result.calculatedPrice.toFixed(2)}</span>
                      </div>
                      {result.savings !== 0 && (
                        <div className="flex justify-between">
                          <span className="text-neutral-400">
                            {result.savings > 0 ? 'Savings' : 'Surcharge'}
                          </span>
                          <span className={result.savings > 0 ? 'text-green-400' : 'text-red-400'}>
                            ${Math.abs(result.savings).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {simulatorTicketType && simulationResults.length === 0 && !loading && (
              <div className="text-center text-neutral-400 py-4">
                <Calculator className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                <p className="text-sm">No pricing rules found for this ticket type</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {showTicketTypeDialog && (
        <TicketTypeDialog
          ticketType={editingTicketType}
          events={events}
          zones={zones}
          onSave={(formData) => {
            if (editingTicketType) {
              handleUpdateTicketType(editingTicketType.ticketTypeId, formData as TicketTypeUpdateForm);
            } else {
              handleCreateTicketType(formData as TicketTypeCreateForm);
            }
          }}
          onCancel={() => {
            setShowTicketTypeDialog(false);
            setEditingTicketType(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Component
interface TicketTypeDialogProps {
  ticketType?: TicketTypeResponse | null;
  events: EventResponse[];
  zones: ZoneResponse[];
  onSave: (formData: TicketTypeCreateForm | TicketTypeUpdateForm) => void;
  onCancel: () => void;
}

const TicketTypeDialog = ({ ticketType, events, zones, onSave, onCancel }: TicketTypeDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 0 as TicketTypeStatus,
    availableQuantity: 0,
    zoneId: 0,
    eventId: 0
  });

  useEffect(() => {
    if (ticketType) {
      setFormData({
        name: ticketType.name || '',
        description: ticketType.description || '',
        status: ticketType.status,
        availableQuantity: ticketType.availableQuantity,
        zoneId: ticketType.zoneId,
        eventId: ticketType.eventId
      });
    } else {
      setFormData({
        name: '',
        description: '',
        status: 0,
        availableQuantity: 0,
        zoneId: zones[0]?.zoneId || 0,
        eventId: events[0]?.id || 0
      });
    }
  }, [ticketType, events, zones]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {ticketType ? 'Edit Ticket Type' : 'Create New Ticket Type'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              placeholder="Enter ticket type name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all h-20 resize-none"
              placeholder="Describe this ticket type"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Event</label>
              <select 
                value={formData.eventId.toString()} 
                onChange={(e) => setFormData(prev => ({ ...prev, eventId: Number(e.target.value) }))}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                required
              >
                <option value="">Select Event</option>
                {events.map(event => (
                  <option key={event.id} value={event.id.toString()}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Zone</label>
              <select 
                value={formData.zoneId.toString()} 
                onChange={(e) => setFormData(prev => ({ ...prev, zoneId: Number(e.target.value) }))}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                required
              >
                <option value="">Select Zone</option>
                {zones.map(zone => (
                  <option key={zone.zoneId} value={zone.zoneId.toString()}>
                    {zone.name || `Zone ${zone.zoneId}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Available Quantity</label>
              <input
                type="number"
                min="0"
                value={formData.availableQuantity}
                onChange={(e) => setFormData(prev => ({ ...prev, availableQuantity: Number(e.target.value) }))}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                placeholder="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Status</label>
              <select 
                value={formData.status.toString()} 
                onChange={(e) => setFormData(prev => ({ ...prev, status: Number(e.target.value) as TicketTypeStatus }))}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                required
              >
                <option value="0">Active</option>
                <option value="1">Inactive</option>
                <option value="2">Sold Out</option>
                <option value="3">Coming Soon</option>
                <option value="4">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 rounded-xl transition-all duration-200"
            >
              {ticketType ? 'Update Type' : 'Create Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketTypes;