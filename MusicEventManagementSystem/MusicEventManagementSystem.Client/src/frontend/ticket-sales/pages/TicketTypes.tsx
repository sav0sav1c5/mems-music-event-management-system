import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Target, Users, CheckCircle, XCircle, Clock, TrendingUp, X, Save, Loader2, Search, Filter, RefreshCw, Eye } from 'lucide-react';
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
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
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
      closeForm();
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

      toast.success('Ticket type updated successfully');
      closeForm();
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

  const openCreateForm = () => {
    resetForm();
    setSelectedTicketType(null);
    setFormMode('create');
    setShowForm(true);
    setError(null);
  };

  const openEditForm = (ticketType: TicketTypeResponse) => {
    setSelectedTicketType(ticketType);
    setTicketTypeForm({
      name: ticketType.name || '',
      description: ticketType.description || '',
      status: ticketType.status,
      availableQuantity: ticketType.availableQuantity,
      zoneId: ticketType.zoneId,
      eventId: ticketType.eventId
    });
    setFormMode('edit');
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedTicketType(null);
    setFormMode('create');
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
        color: "lime" as const
      },
      {
        title: "Available Tickets",
        value: totalAvailableTickets.toString(),
        change: availableChange,
        trend: availableChange >= 0 ? "up" as const : "down" as const,
        icon: Users,
        color: "lime" as const
      },
      {
        title: "Sold Out",
        value: soldOutTypes.length.toString(),
        change: soldOutChange,
        trend: soldOutChange >= 0 ? "down" as const : "up" as const,
        icon: XCircle,
        color: "orange" as const
      },
      {
        title: "Total Types",
        value: ticketTypes.length.toString(),
        change: 0,
        trend: "up" as const,
        icon: CheckCircle,
        color: "sky" as const
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

  const getFormTitle = () => {
    return formMode === 'create' ? 'Create New Ticket Type' : 'Edit Ticket Type';
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Main Content Area with Right Panel - EXACTLY LIKE PERFORMANCES */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Ticket Types List - ALL MOVES TOGETHER */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${showForm ? 'w-3/5' : 'w-full'}`}>
            {/* Header - MOVES WITH THE CONTENT */}
            <div className="">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Ticket Types Management</h1>
                  <p className="text-neutral-400 text-sm">Manage and configure ticket types for events</p>
                </div>
                
                {/* Search and Filter - INTEGRATED IN HEADER LIKE PERFORMANCES */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="min-w-0 flex-1 max-w-80">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search ticket types by name or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1 max-w-40">
                    <CustomSelect
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={statusOptions}
                      placeholder="All Status"
                      icon={<Filter className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>

                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomSelect
                      value={eventFilter}
                      onChange={setEventFilter}
                      options={eventOptions}
                      placeholder="All Events"
                      icon={<Filter className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>

                  <button 
                    onClick={openCreateForm}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400"
                  >
                    <Plus size={20} />
                    New Ticket Type
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message - MOVES WITH THE CONTENT */}
            {error && !showForm && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <XCircle size={20} className="text-red-400" />
                </div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Statistics - MOVES WITH THE CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              {overviewStats.map((stat, index) => (
                <KpiCard
                  key={index}
                  icon={stat.icon}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  changeType="percentage"
                  color={stat.color}
                />
              ))}
            </div>

            {/* Ticket Types List - MOVES WITH THE CONTENT */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <Card className="overflow-hidden h-full">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold text-white">Ticket Types</h3>
                  <div className="flex items-center gap-4">
                    {eventFilter !== 'all' && (
                      <span className="text-neutral-400 text-sm">
                        Filtered by: {events.find(e => e.id.toString() === eventFilter)?.name}
                      </span>
                    )}
                    <p className="text-neutral-400 text-sm">{filteredTicketTypes.length} type(s) found</p>
                  </div>
                </div>
                
                <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <RefreshCw className="w-10 h-10 text-lime-400 animate-spin mb-3" />
                      <p className="text-neutral-400 text-base">Loading ticket types...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredTicketTypes.map((type) => {
                        const event = events.find(e => e.id === type.eventId);
                        const zone = zones.find(z => z.zoneId === type.zoneId);
                        
                        return (
                          <Card
                            key={type.ticketTypeId}
                            className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200"
                          >
                            {/* Action Buttons - Always Visible */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditForm(type);
                                }}
                                className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                                title="Edit ticket type"
                              >
                                <Edit className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTicketType(type.ticketTypeId);
                                }}
                                className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
                                title="Delete ticket type"
                              >
                                <Trash2 className="w-5 h-5 text-neutral-400 hover:text-red-400 transition-colors" />
                              </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
                                  <Target className="w-6 h-6 text-lime-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                                    {type.name || 'Unnamed Ticket Type'}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(type.status)}`}>
                                      {formatTicketTypeStatus(type.status)}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                                      Event: {event?.name || `Event ${type.eventId}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              <div className="flex items-center">
                                <Users className="w-5 h-5 mr-2 text-neutral-400" />
                                <span className="text-base">Available: {type.availableQuantity.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Target className="w-5 h-5 mr-2 text-neutral-400" />
                                <span className="text-base">Zone: {zone?.name || `Zone ${type.zoneId}`}</span>
                              </div>
                              {/* {type.description && (
                                <div className="text-neutral-300 text-sm line-clamp-2">
                                  {type.description}
                                </div>
                              )} */}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {filteredTicketTypes.length === 0 && !loading && (
                    <div className="text-center py-16 text-neutral-400">
                      <Target size={64} className="mx-auto mb-4 opacity-50" />
                      <h4 className="text-xl mb-2">No ticket types found</h4>
                      <p className="text-base">
                        {searchTerm || statusFilter !== 'all' || eventFilter !== 'all' 
                          ? 'Try adjusting your search criteria or filters' 
                          : 'No ticket types available in the system'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Form Panel - Desno od CELOG SADRŽAJA (kao u Performances) */}
          {showForm && (
            <div className="w-2/5 transition-all duration-300">
              <Card className="overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900/60 backdrop-blur-sm">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
                  <h2 className="text-xl font-bold text-lime-400">
                    {getFormTitle()}
                  </h2>
                  <button
                    onClick={closeForm}
                    className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto px-1">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    </div>
                  )}

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

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Status *</label>
                      <CustomSelect
                        value={ticketTypeForm.status.toString()}
                        onChange={(value) => setTicketTypeForm(prev => ({ ...prev, status: parseInt(value) as TicketTypeStatus }))}
                        options={[
                          { value: '0', label: 'Active' },
                          { value: '1', label: 'Inactive' },
                          { value: '3', label: 'Coming Soon' },
                          { value: '4', label: 'Suspended' }
                        ]}
                        placeholder="Select Status"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Event *</label>
                      <CustomSelect
                        value={ticketTypeForm.eventId.toString()}
                        onChange={(value) => setTicketTypeForm(prev => ({ ...prev, eventId: parseInt(value) || 0 }))}
                        options={[
                          { value: '0', label: 'Select Event' },
                          ...events.map(event => ({
                            value: event.id.toString(),
                            label: event.name
                          }))
                        ]}
                        placeholder="Select Event"
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Zone *</label>
                      <CustomSelect
                        value={ticketTypeForm.zoneId.toString()}
                        onChange={(value) => setTicketTypeForm(prev => ({ ...prev, zoneId: parseInt(value) || 0 }))}
                        options={[
                          { value: '0', label: 'Select Zone' },
                          ...zones.map(zone => ({
                            value: zone.zoneId.toString(),
                            label: `${zone.name} (${zone.capacity})`
                          }))
                        ]}
                        placeholder="Select Zone"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={closeForm}
                      className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={formMode === 'create' ? handleCreateTicketType : handleUpdateTicketType}
                      disabled={submitting || !ticketTypeForm.name || ticketTypeForm.availableQuantity < 0 || ticketTypeForm.zoneId === 0 || ticketTypeForm.eventId === 0}
                      className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {submitting ? (formMode === 'create' ? 'Creating...' : 'Updating...') : (formMode === 'create' ? 'Create' : 'Update')}
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketTypes;