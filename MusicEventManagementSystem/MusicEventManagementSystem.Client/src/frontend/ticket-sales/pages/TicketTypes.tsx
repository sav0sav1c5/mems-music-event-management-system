import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Target, Users, CheckCircle, XCircle, Clock, TrendingUp, X, Save, Loader2
} from 'lucide-react';
import { TicketTypeService } from '../services/ticketTypeService';
import { ZoneService } from '../services/zoneService';
import { EventService } from '../../event-organization/services/eventService';
import type { TicketTypeResponse, ZoneResponse, TicketTypeStatus } from '../types';
import type { EventResponse } from '../../event-organization/types/api/event';
import type { TicketTypeCreateForm, TicketTypeUpdateForm } from '../types/forms/ticketType';
import { CustomSelect } from '../components/customSelect';
import type { CustomSelectOption } from '../components/customSelect';
import { toast } from 'react-toastify';

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

const getStatusColor = (status: TicketTypeStatus) => {
  switch (status) {
    case 0: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case 1: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    case 2: return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 3: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 4: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
};



const TicketTypes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeResponse | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'view' | 'create' | 'edit'>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  
  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [ticketTypeForm, setTicketTypeForm] = useState<TicketTypeCreateForm>({
    name: '',
    description: '',
    status: 0,
    availableQuantity: 0,
    zoneId: 0,
    eventId: 0
  });

  const [previousStats, setPreviousStats] = useState({
    activeTicketTypes: 0,
    availableTickets: 0,
    soldOut: 0,
    totalRevenue: 0
  });

  // Options for Custom Selects
  const statusOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: '0', label: 'Active' },
    { value: '1', label: 'Inactive' },
    { value: '2', label: 'Sold Out' },
    { value: '3', label: 'Coming Soon' },
    { value: '4', label: 'Suspended' }
  ];

  const eventOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Events' },
    ...events.map(event => ({
      value: event.id.toString(),
      label: event.name
    }))
  ];

  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const data = await TicketTypeService.getAllTicketTypes();
      setTicketTypes(data);
    } catch (err) {
      setError('Failed to load ticket types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSupportingData = async () => {
    try {
      const [zonesData, eventsData] = await Promise.all([
        ZoneService.getAllZones(),
        EventService.getAllEvents()
      ]);
      setZones(zonesData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load supporting data:', err);
    }
  };

  useEffect(() => {
    loadTicketTypes();
    loadSupportingData();
  }, []);

  // CRUD Operations
  const handleCreateTicketType = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!ticketTypeForm.name || ticketTypeForm.availableQuantity < 0 || 
          ticketTypeForm.zoneId === 0 || ticketTypeForm.eventId === 0) {
        setError('Please fill all required fields');
        return;
      }

      const created = await TicketTypeService.createTicketType(ticketTypeForm);
      setTicketTypes(prev => [...prev, created]);

      toast.success('Ticket type created successfully');

      closePanel();
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket type');
      toast.error(err.message || 'Failed to create ticket type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTicketType = async () => {
    if (!selectedTicketType) return;
    
    try {
      setSubmitting(true);
      setError(null);

      const updateForm: TicketTypeUpdateForm = {
        name: ticketTypeForm.name,
        description: ticketTypeForm.description,
        status: ticketTypeForm.status,
        availableQuantity: ticketTypeForm.availableQuantity,
        zoneId: ticketTypeForm.zoneId,
        eventId: ticketTypeForm.eventId
      };

      const updated = await TicketTypeService.updateTicketType(
        selectedTicketType.ticketTypeId, 
        updateForm
      );
      
      setTicketTypes(prev => 
        prev.map(type => 
          type.ticketTypeId === selectedTicketType.ticketTypeId ? updated : type
        )
      );
      setSelectedTicketType(updated);

      toast.success('Ticket type updated successfully');

      setPanelMode('view');
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket type');
      toast.error(err.message || 'Failed to update ticket type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicketType = async (ticketTypeId: number) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) return;
    
    try {
      setError(null);
      await TicketTypeService.deleteTicketType(ticketTypeId);
      setTicketTypes(prev => prev.filter(type => type.ticketTypeId !== ticketTypeId));
      
      toast.success('Ticket type deleted successfully!');

      if (selectedTicketType?.ticketTypeId === ticketTypeId) {
        closePanel();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete ticket type');
      toast.error(err.message || 'Failed to delete ticket type');
    }
  };

  const resetForm = () => {
    setTicketTypeForm({
      name: '',
      description: '',
      status: 0,
      availableQuantity: 0,
      zoneId: 0,
      eventId: 0
    });
  };

  const openCreatePanel = () => {
    resetForm();
    setSelectedTicketType(null);
    setPanelMode('create');
    setShowPanel(true);
    setError(null);
  };

  const openEditPanel = (ticketType: TicketTypeResponse) => {
    setSelectedTicketType(ticketType);
    setTicketTypeForm({
      name: ticketType.name || '',
      description: ticketType.description || '',
      status: ticketType.status,
      availableQuantity: ticketType.availableQuantity,
      zoneId: ticketType.zoneId,
      eventId: ticketType.eventId
    });
    setPanelMode('edit');
    setShowPanel(true);
    setError(null);
  };

  const openViewPanel = (ticketType: TicketTypeResponse) => {
    setSelectedTicketType(ticketType);
    setPanelMode('view');
    setShowPanel(true);
    setError("");
  };

  const closePanel = () => {
    setShowPanel(false);
    setSelectedTicketType(null);
    setPanelMode('view');
    setError("");
    resetForm();
  };

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
    
    return result;
  };

  const overviewStats = getOverviewStats();
  const filteredTicketTypes = getFilteredTicketTypes();

  const getPanelTitle = () => {
    switch (panelMode) {
      case 'create': return 'Create New Ticket Type';
      case 'edit': return 'Edit Ticket Type';
      default: return 'Ticket Type Details';
    }
  };

  return (
    <div className="relative flex gap-3">
      {/* Main Content - Left Side */}
      <div className={`bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl transition-all duration-300 ${showPanel ? 'w-2/3' : 'w-full'}`}>
        <div className="text-white flex flex-col p-4 m-1">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Ticket Types</h1>
                <p className="text-neutral-400 text-sm">Manage and configure ticket types for events</p>
              </div>
              <div className="flex gap-4 flex-wrap items-end">
                <div className="flex gap-4 flex-wrap">
                  {/* Custom Status Select */}
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    className="min-w-40"
                  />

                  {/* Custom Event Select */}
                  <CustomSelect
                    value={eventFilter}
                    onChange={setEventFilter}
                    options={eventOptions}
                    className="min-w-60"
                  />  

                  <button
                    onClick={openCreatePanel}
                    className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200"
                  >
                    <Plus className="w-4 h-4" />
                    New Ticket Type
                  </button>
                </div>
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

          {/* KPI Cards */}
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

          {/* Ticket Types List */}
          <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full text-center text-neutral-400 py-8 text-base">Loading ticket types...</div>
            ) : filteredTicketTypes.length === 0 ? (
              <div className="col-span-full text-center text-neutral-400 py-8 text-base">No ticket types found</div>
            ) : (
              filteredTicketTypes.map((type) => {
                const event = events.find(e => e.id === type.eventId);
                
                return (
                  <Card
                    key={type.ticketTypeId}
                    hover={true}
                    onClick={() => openViewPanel(type)}
                    className={`p-6 cursor-pointer transition-all duration-200 ${
                      selectedTicketType?.ticketTypeId === type.ticketTypeId && showPanel
                        ? 'bg-lime-500/20 border border-lime-500/30'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-lime-500/20 rounded-xl">
                          <Target className="w-5 h-5 text-lime-400" />
                        </div>
                        <div>
                          <h4 className="text-white font-medium text-lg">{type.name || 'Unnamed Ticket Type'}</h4>
                          {type.description && (
                            <p className="text-neutral-400 text-sm line-clamp-1">{type.description}</p>
                          )}
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-xl text-sm font-medium border flex items-center gap-2 ${getStatusColor(type.status)}`}>
                        {type.status === 0 ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : type.status === 2 ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        {formatTicketTypeStatus(type.status)}
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 text-base">Available</span>
                        <span className="text-white font-medium text-base">{type.availableQuantity}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 text-base">Event</span>
                        <span className="text-white font-medium text-sm">
                          {event?.name || `Event ${type.eventId}`}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 text-base">Zone</span>
                        <span className="text-white font-medium text-base">#{type.zoneId}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-neutral-400">
                        {type.ticketIds?.length || 0} tickets
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditPanel(type);
                          }}
                          className="p-2 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTicketType(type.ticketTypeId);
                          }}
                          className="p-2 hover:bg-red-900/50 rounded-xl transition-all duration-200 text-neutral-400 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Outside main container */}
      {showPanel && (
        <div className="w-1/3 transition-all duration-300">
          <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-max">
            <div className="p-4 m-1 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">{getPanelTitle()}</h3>
                <button
                  onClick={closePanel}
                  className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto flex-1">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {(panelMode === 'create' || panelMode === 'edit') ? (
                  /* CREATE/EDIT FORM */
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
                        <input
                          type="text"
                          value={ticketTypeForm.name}
                          onChange={(e) => setTicketTypeForm(prev => ({ ...prev, name: e.target.value }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="Enter ticket type name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Available Quantity *</label>
                        <input
                          type="number"
                          value={ticketTypeForm.availableQuantity}
                          onChange={(e) => setTicketTypeForm(prev => ({ ...prev, availableQuantity: parseInt(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                      <textarea
                        value={ticketTypeForm.description}
                        onChange={(e) => setTicketTypeForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Status *</label>
                        <select
                          value={ticketTypeForm.status}
                          onChange={(e) => setTicketTypeForm(prev => ({ ...prev, status: parseInt(e.target.value) as TicketTypeStatus }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                        >
                          <option value={0}>Active</option>
                          <option value={1}>Inactive</option>
                          <option value={3}>Coming Soon</option>
                          <option value={4}>Suspended</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Event *</label>
                        <select
                          value={ticketTypeForm.eventId}
                          onChange={(e) => setTicketTypeForm(prev => ({ ...prev, eventId: parseInt(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                        >
                          <option value={0}>Select Event</option>
                          {events.map(event => (
                            <option key={event.id} value={event.id}>
                              {event.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Zone *</label>
                      <select
                        value={ticketTypeForm.zoneId}
                        onChange={(e) => setTicketTypeForm(prev => ({ ...prev, zoneId: parseInt(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                      >
                        <option value={0}>Select Zone</option>
                        {zones.map(zone => (
                          <option key={zone.zoneId} value={zone.zoneId}>
                            {zone.name} (Capacity: {zone.capacity})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closePanel}
                        className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={panelMode === 'create' ? handleCreateTicketType : handleUpdateTicketType}
                        disabled={submitting}
                        className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-500/50 rounded-xl transition-all duration-200 text-black font-semibold flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {submitting ? (panelMode === 'create' ? 'Creating...' : 'Updating...') : (panelMode === 'create' ? 'Create' : 'Update')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  selectedTicketType && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-white font-medium text-lg mb-2">
                          {selectedTicketType.name || 'Unnamed Ticket Type'}
                        </h4>
                        {selectedTicketType.description && (
                          <p className="text-neutral-400 text-base mb-4">
                            {selectedTicketType.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Available Quantity</span>
                          <span className="text-white text-base font-medium flex items-center">
                            <Target className="w-4 h-4 mr-2 text-lime-400" />
                            {selectedTicketType.availableQuantity}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Status</span>
                          <span className="text-white text-base font-medium flex items-center">
                            {selectedTicketType.status === 0 ? (
                              <CheckCircle className="w-4 h-4 mr-2 text-emerald-400" />
                            ) : selectedTicketType.status === 2 ? (
                              <XCircle className="w-4 h-4 mr-2 text-red-400" />
                            ) : (
                              <Clock className="w-4 h-4 mr-2 text-yellow-400" />
                            )}
                            {formatTicketTypeStatus(selectedTicketType.status)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Zone ID</span>
                          <span className="text-white text-base">{selectedTicketType.zoneId}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Event</span>
                          <span className="text-white text-base">
                            {events.find(e => e.id === selectedTicketType.eventId)?.name || `Event ${selectedTicketType.eventId}`}
                          </span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-neutral-800">
                        <h5 className="text-white text-base mb-3 flex items-center">
                          <TrendingUp className="w-4 h-4 mr-2 text-lime-400" />
                          Related Data
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-neutral-800/50 rounded-xl">
                            <div className="text-lime-400 text-lg font-semibold">{selectedTicketType.ticketIds?.length || 0}</div>
                            <div className="text-neutral-400 text-xs">Tickets</div>
                          </div>
                          <div className="text-center p-3 bg-neutral-800/50 rounded-xl">
                            <div className="text-lime-400 text-lg font-semibold">{selectedTicketType.specialOfferIds?.length || 0}</div>
                            <div className="text-neutral-400 text-xs">Special Offers</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <button 
                          onClick={() => openEditPanel(selectedTicketType)}
                          className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                        <button className="border border-neutral-700 text-neutral-300 hover:text-white px-3 py-2 rounded-xl text-sm transition-all duration-200 hover:border-lime-500/30">
                          Update Qty
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketTypes;