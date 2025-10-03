import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, DollarSign, TrendingUp, XCircle, X, Save, Loader2, Target, Users, Clock, Search, Filter, RefreshCw, Calendar } from 'lucide-react';
import { PricingRuleService } from '../services/pricingRuleService';
import { EventService } from '../../event-organization/services/eventService';
import { TicketTypeService } from '../services/ticketTypeService';
import type { PricingRuleResponse, PricingCondition } from '../types';
import type { PricingRuleCreateForm, PricingRuleUpdateForm } from '../types/forms/pricingRule';
import type { EventResponse } from '../../event-organization/types/api/event';
import type { TicketTypeResponse } from '../types/api/ticketType';
import { CustomSelect } from '../components/customSelect';
import type { CustomSelectOption } from '../components/customSelect';
import { toast } from 'react-toastify';

const formatPricingCondition = (condition: PricingCondition): string => {
  switch (condition) {
    case 0: return 'Time Based Early Bird';
    case 1: return 'Occupancy Based';
    case 2: return 'Date Proximity';
    case 3: return 'Weather Dependent';
    case 4: return 'Day of Week';
    case 5: return 'Seasonal Discount';
    case 6: return 'VIP Upgrade';
    case 7: return 'Last Minute';
    default: return 'Unknown';
  }
};

const getConditionColor = (condition: PricingCondition) => {
  const colors: Record<string, string> = {
    '0': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    '1': 'text-green-400 bg-green-500/20 border-green-500/30',
    '2': 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    '3': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    '4': 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    '5': 'text-pink-400 bg-pink-500/20 border-pink-500/30',
    '6': 'text-red-400 bg-red-500/20 border-red-500/30',
    '7': 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30'
  };
  return colors[condition.toString()] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
};

const PricingRules = () => {
  const [pricingRules, setPricingRules] = useState<PricingRuleResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  
  // Panel state
  const [selectedRule, setSelectedRule] = useState<PricingRuleResponse | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [ruleForm, setRuleForm] = useState<PricingRuleCreateForm>({
    name: '',
    description: '',
    minimumPrice: 0,
    maximumPrice: 100,
    occupancyPercentage1: 0,
    occupancyPercentage2: 0,
    occupancyThreshold1: 50,
    occupancyThreshold2: 80,
    earlyBirdPercentage: 10,
    pricingCondition: 0,
    dynamicCondition: '',
    modifier: 1.0
  });

  // Selected events and ticket types for the form
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [selectedTicketTypeIds, setSelectedTicketTypeIds] = useState<number[]>([]);

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rulesData, eventsData, ticketTypesData] = await Promise.all([
        PricingRuleService.getAllPricingRules(),
        EventService.getAllEvents(),
        TicketTypeService.getAllTicketTypes()
      ]);

      setPricingRules(rulesData);
      setEvents(eventsData);
      setTicketTypes(ticketTypesData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch data. Please try again.';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Get ticket types for selected events
  const getTicketTypesForSelectedEvents = () => {
    if (selectedEventIds.length === 0) return [];
    return ticketTypes.filter(ticketType => 
      selectedEventIds.includes(ticketType.eventId)
    );
  };

  // CRUD Operations
  const handleCreateRule = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!ruleForm.name || ruleForm.minimumPrice < 0 || ruleForm.maximumPrice < ruleForm.minimumPrice) {
        setError('Please fill all required fields with valid values');
        return;
      }

      if (ruleForm.modifier <= 0) {
        setError('Modifier must be greater than 0');
        return;
      }

      // Create the rule first
      const created = await PricingRuleService.createPricingRule(ruleForm);
      
      // TODO: Here you would need to call additional API endpoints to associate
      // the pricing rule with selected events and ticket types
      // This would require additional service methods like:
      // PricingRuleService.associateWithEvents(created.pricingRuleId, selectedEventIds)
      // PricingRuleService.associateWithTicketTypes(created.pricingRuleId, selectedTicketTypeIds)
      
      // For now, we'll just add the created rule to the list
      // In a real implementation, you'd want to refresh the data to get the associations
      setPricingRules(prev => [...prev, created]);

      toast.success('Pricing rule created successfully');
      closePanel();
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to create pricing rule');
      toast.error(err.message || 'Failed to create pricing rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRule = async () => {
    if (!selectedRule) return;
    
    try {
      setSubmitting(true);
      setError(null);

      const updateForm: PricingRuleUpdateForm = {
        name: ruleForm.name,
        description: ruleForm.description,
        minimumPrice: ruleForm.minimumPrice,
        maximumPrice: ruleForm.maximumPrice,
        occupancyPercentage1: ruleForm.occupancyPercentage1,
        occupancyPercentage2: ruleForm.occupancyPercentage2,
        occupancyThreshold1: ruleForm.occupancyThreshold1,
        occupancyThreshold2: ruleForm.occupancyThreshold2,
        earlyBirdPercentage: ruleForm.earlyBirdPercentage,
        pricingCondition: ruleForm.pricingCondition,
        dynamicCondition: ruleForm.dynamicCondition,
        modifier: ruleForm.modifier
      };

      const updated = await PricingRuleService.updatePricingRule(
        selectedRule.pricingRuleId, 
        updateForm
      );
      
      // TODO: Update associations with events and ticket types
      // PricingRuleService.updateAssociations(selectedRule.pricingRuleId, selectedEventIds, selectedTicketTypeIds)
      
      setPricingRules(prev => 
        prev.map(rule => 
          rule.pricingRuleId === selectedRule.pricingRuleId ? updated : rule
        )
      );

      toast.success('Pricing rule updated successfully');
      closePanel();
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to update pricing rule');
      toast.error(err.message || 'Failed to update pricing rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;
    
    try {
      setError(null);
      await PricingRuleService.deletePricingRule(ruleId);
      setPricingRules(prev => prev.filter(rule => rule.pricingRuleId !== ruleId));
      
      toast.success('Pricing rule deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete pricing rule');
      toast.error(err.message || 'Failed to delete pricing rule');
    }
  };

  const resetForm = () => {
    setRuleForm({
      name: '',
      description: '',
      minimumPrice: 0,
      maximumPrice: 100,
      occupancyPercentage1: 0,
      occupancyPercentage2: 0,
      occupancyThreshold1: 50,
      occupancyThreshold2: 80,
      earlyBirdPercentage: 10,
      pricingCondition: 0,
      dynamicCondition: '',
      modifier: 1.0
    });
    setSelectedEventIds([]);
    setSelectedTicketTypeIds([]);
  };

  const openCreatePanel = () => {
    resetForm();
    setSelectedRule(null);
    setPanelMode('create');
    setShowPanel(true);
    setError(null);
  };

  const openEditPanel = (rule: PricingRuleResponse) => {
    setSelectedRule(rule);
    setRuleForm({
      name: rule.name || '',
      description: rule.description || '',
      minimumPrice: rule.minimumPrice,
      maximumPrice: rule.maximumPrice,
      occupancyPercentage1: rule.occupancyPercentage1,
      occupancyPercentage2: rule.occupancyPercentage2,
      occupancyThreshold1: rule.occupancyThreshold1,
      occupancyThreshold2: rule.occupancyThreshold2,
      earlyBirdPercentage: rule.earlyBirdPercentage,
      pricingCondition: rule.pricingCondition,
      dynamicCondition: rule.dynamicCondition || '',
      modifier: rule.modifier
    });
    // Set the selected events and ticket types from the rule
    setSelectedEventIds(rule.eventIds || []);
    setSelectedTicketTypeIds(rule.ticketTypesIds || []);
    setPanelMode('edit');
    setShowPanel(true);
    setError(null);
  };

  const closePanel = () => {
    setShowPanel(false);
    setSelectedRule(null);
    setPanelMode('create');
    setError(null);
    resetForm();
  };

  // Event selection handlers
  const handleEventSelection = (eventId: number) => {
    setSelectedEventIds(prev => {
      if (prev.includes(eventId)) {
        // Remove event and its ticket types
        const eventTicketTypes = ticketTypes
          .filter(tt => tt.eventId === eventId)
          .map(tt => tt.ticketTypeId);
        
        setSelectedTicketTypeIds(prevTicketTypes => 
          prevTicketTypes.filter(id => !eventTicketTypes.includes(id))
        );
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const handleTicketTypeSelection = (ticketTypeId: number) => {
    setSelectedTicketTypeIds(prev => {
      if (prev.includes(ticketTypeId)) {
        return prev.filter(id => id !== ticketTypeId);
      } else {
        return [...prev, ticketTypeId];
      }
    });
  };

  // Select all ticket types for an event
  const selectAllTicketTypesForEvent = (eventId: number) => {
    const eventTicketTypes = ticketTypes
      .filter(tt => tt.eventId === eventId)
      .map(tt => tt.ticketTypeId);
    
    setSelectedTicketTypeIds(prev => {
      const newSelection = [...prev];
      eventTicketTypes.forEach(ticketTypeId => {
        if (!newSelection.includes(ticketTypeId)) {
          newSelection.push(ticketTypeId);
        }
      });
      return newSelection;
    });
  };

  // Filter pricing rules
  const getFilteredRules = () => {
    let result = [...pricingRules];
    
    if (searchTerm) {
      result = result.filter(rule => 
        rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatPricingCondition(rule.pricingCondition).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (conditionFilter !== 'all') {
      result = result.filter(rule => rule.pricingCondition.toString() === conditionFilter);
    }
    
    if (eventFilter !== 'all') {
      result = result.filter(rule => 
        rule.eventIds?.includes(parseInt(eventFilter))
      );
    }
    
    return result;
  };

  // Options for Custom Selects
  const conditionOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Conditions' },
    ...([0, 1, 2, 3, 4, 5, 6, 7].map(condition => ({
      value: condition.toString(),
      label: formatPricingCondition(condition as PricingCondition)
    })))
  ];

  const eventOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Events' },
    ...events.map(event => ({
      value: event.id.toString(),
      label: event.name
    }))
  ];

  const filteredRules = getFilteredRules();

  // Statistics
  const totalRules = pricingRules.length;
  const activeRules = pricingRules.filter(rule => rule.modifier > 1).length;
  const discountRules = pricingRules.filter(rule => rule.modifier < 1).length;
  const avgModifier = pricingRules.length > 0 
    ? (pricingRules.reduce((sum, rule) => sum + rule.modifier, 0) / pricingRules.length).toFixed(2)
    : '0.00';

  const getPanelTitle = () => {
    return panelMode === 'create' ? 'Create New Pricing Rule' : 'Edit Pricing Rule';
  };

  const availableTicketTypes = getTicketTypesForSelectedEvents();

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Main Content Area with Right Panel */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Rules List */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${showPanel ? 'w-3/5' : 'w-full'}`}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Pricing Rules Management</h1>
                  <p className="text-neutral-400 text-sm">Manage dynamic pricing rules and modifiers</p>
                </div>
                
                {/* Search and Filter */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="min-w-0 flex-1 max-w-80">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search pricing rules..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomSelect
                      value={conditionFilter}
                      onChange={setConditionFilter}
                      options={conditionOptions}
                      placeholder="All Conditions"
                      icon={<Filter className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>

                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomSelect
                      value={eventFilter}
                      onChange={setEventFilter}
                      options={eventOptions}
                      placeholder="All Events"
                      icon={<Calendar className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>

                  <button 
                    onClick={openCreatePanel}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400"
                  >
                    <Plus size={20} />
                    New Rule
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && !showPanel && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <XCircle size={20} className="text-red-400" />
                </div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <KpiCard
                icon={Tag}
                title="Total Rules"
                value={totalRules}
                change={5.1}
                changeType="percentage"
                color="lime"
              />
              
              <KpiCard
                icon={TrendingUp}
                title="Active Rules"
                value={activeRules}
                change={3.2}
                changeType="percentage"
                color="lime"
              />
              
              <KpiCard
                icon={DollarSign}
                title="Discount Rules"
                value={discountRules}
                change={4.5}
                changeType="percentage"
                color="sky"
              />
              
              <KpiCard
                icon={Target}
                title="Avg Modifier"
                value={`${avgModifier}x`}
                change={2.1}
                changeType="percentage"
                color="orange"
              />
            </div>

            {/* Rules List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <Card className="overflow-hidden h-full">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold text-white">Pricing Rules</h3>
                  <div className="flex items-center gap-4">
                    {eventFilter !== 'all' && (
                      <span className="text-neutral-400 text-sm">
                        Filtered by: {events.find(e => e.id.toString() === eventFilter)?.name}
                      </span>
                    )}
                    <p className="text-neutral-400 text-sm">{filteredRules.length} rule(s) found</p>
                  </div>
                </div>
                
                <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <RefreshCw className="w-10 h-10 text-lime-400 animate-spin mb-3" />
                      <p className="text-neutral-400 text-base">Loading pricing rules...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredRules.map((rule) => {
                        const relatedEvents = events.filter(event => 
                          rule.eventIds?.includes(event.id)
                        );
                        const relatedTicketTypes = ticketTypes.filter(ticketType => 
                          rule.ticketTypesIds?.includes(ticketType.ticketTypeId)
                        );
                        
                        return (
                          <Card
                            key={rule.pricingRuleId}
                            className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200"
                          >
                            {/* Action Buttons - Always Visible */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditPanel(rule);
                                }}
                                className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                                title="Edit pricing rule"
                              >
                                <Edit className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteRule(rule.pricingRuleId);
                                }}
                                className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
                                title="Delete pricing rule"
                              >
                                <Trash2 className="w-5 h-5 text-neutral-400 hover:text-red-400 transition-colors" />
                              </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
                                  <Tag className="w-6 h-6 text-lime-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                                    {rule.name || 'Unnamed Rule'}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(rule.pricingCondition)}`}>
                                      {formatPricingCondition(rule.pricingCondition)}
                                    </span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                      rule.modifier > 1 
                                        ? 'text-green-400 bg-green-500/20 border-green-500/30'
                                        : rule.modifier < 1
                                        ? 'text-blue-400 bg-blue-500/20 border-blue-500/30'
                                        : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
                                    }`}>
                                      {rule.modifier}x Modifier
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {rule.description && (
                                <div className="text-neutral-300 text-sm line-clamp-2">
                                  {rule.description}
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <DollarSign className="w-5 h-5 mr-2 text-neutral-400" />
                                <span className="text-base">
                                  Price Range: <span className="text-lime-400 font-medium">${rule.minimumPrice}</span> - <span className="text-lime-400 font-medium">${rule.maximumPrice}</span>
                                </span>
                              </div>
                              
                              <div className="flex items-center">
                                <Target className="w-5 h-5 mr-2 text-neutral-400" />
                                <span className="text-base">
                                  Early Bird: <span className="text-lime-400 font-medium">{rule.earlyBirdPercentage}%</span>
                                </span>
                              </div>

                              {(relatedEvents.length > 0 || relatedTicketTypes.length > 0) && (
                                <div className="flex items-center gap-4 text-sm">
                                  {relatedEvents.length > 0 && (
                                    <span className="text-neutral-400">
                                      {relatedEvents.length} event(s)
                                    </span>
                                  )}
                                  {relatedTicketTypes.length > 0 && (
                                    <span className="text-neutral-400">
                                      {relatedTicketTypes.length} ticket type(s)
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {filteredRules.length === 0 && !loading && (
                    <div className="text-center py-16 text-neutral-400">
                      <Tag size={64} className="mx-auto mb-4 opacity-50" />
                      <h4 className="text-xl mb-2">No pricing rules found</h4>
                      <p className="text-base">
                        {searchTerm || conditionFilter !== 'all' || eventFilter !== 'all' 
                          ? 'Try adjusting your search criteria or filters' 
                          : 'No pricing rules available in the system'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Form Panel */}
          {showPanel && (
            <div className="w-2/5 transition-all duration-300">
              <Card className="overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900/60 backdrop-blur-sm h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
                  <h2 className="text-xl font-bold text-lime-400">
                    {getPanelTitle()}
                  </h2>
                  <button
                    onClick={closePanel}
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
                      value={ruleForm.name}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter rule name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                    <textarea
                      value={ruleForm.description}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Min Price *</label>
                      <input
                        type="number"
                        value={ruleForm.minimumPrice}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, minimumPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Max Price *</label>
                      <input
                        type="number"
                        value={ruleForm.maximumPrice}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, maximumPrice: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="100"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Modifier *</label>
                      <input
                        type="number"
                        value={ruleForm.modifier}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, modifier: parseFloat(e.target.value) || 1.0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="1.0"
                        min="0.1"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Early Bird %</label>
                      <input
                        type="number"
                        value={ruleForm.earlyBirdPercentage}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, earlyBirdPercentage: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="10"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Pricing Condition *</label>
                    <select
                      value={ruleForm.pricingCondition}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, pricingCondition: parseInt(e.target.value) as PricingCondition }))}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7].map(condition => (
                        <option key={condition} value={condition}>
                          {formatPricingCondition(condition as PricingCondition)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Event Selection */}
                  <div>
                    <label className="block text-sm font-medium mb-3 text-neutral-300">
                      Apply to Events
                    </label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {events.map(event => (
                        <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-xl transition-all">
                          <input
                            type="checkbox"
                            checked={selectedEventIds.includes(event.id)}
                            onChange={() => handleEventSelection(event.id)}
                            className="w-4 h-4 text-lime-500 bg-neutral-800 border-neutral-700 rounded focus:ring-lime-400 focus:ring-2"
                          />
                          <span className="text-white text-sm flex-1">{event.name}</span>
                          <button
                            type="button"
                            onClick={() => selectAllTicketTypesForEvent(event.id)}
                            className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
                          >
                            Select All
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ticket Type Selection */}
                  {selectedEventIds.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-3 text-neutral-300">
                        Apply to Ticket Types
                      </label>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {availableTicketTypes.map(ticketType => (
                          <div key={ticketType.ticketTypeId} className="flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-xl transition-all">
                            <input
                              type="checkbox"
                              checked={selectedTicketTypeIds.includes(ticketType.ticketTypeId)}
                              onChange={() => handleTicketTypeSelection(ticketType.ticketTypeId)}
                              className="w-4 h-4 text-lime-500 bg-neutral-800 border-neutral-700 rounded focus:ring-lime-400 focus:ring-2"
                            />
                            <div className="flex-1">
                              <span className="text-white text-sm block">{ticketType.name || `Ticket Type ${ticketType.ticketTypeId}`}</span>
                              <span className="text-neutral-400 text-xs">
                                Event: {events.find(e => e.id === ticketType.eventId)?.name}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy Threshold 1</label>
                      <input
                        type="number"
                        value={ruleForm.occupancyThreshold1}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, occupancyThreshold1: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="50"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy % 1</label>
                      <input
                        type="number"
                        value={ruleForm.occupancyPercentage1}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, occupancyPercentage1: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy Threshold 2</label>
                      <input
                        type="number"
                        value={ruleForm.occupancyThreshold2}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, occupancyThreshold2: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="80"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy % 2</label>
                      <input
                        type="number"
                        value={ruleForm.occupancyPercentage2}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, occupancyPercentage2: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="0"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Dynamic Condition</label>
                    <textarea
                      value={ruleForm.dynamicCondition}
                      onChange={(e) => setRuleForm(prev => ({ ...prev, dynamicCondition: e.target.value }))}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter dynamic conditions"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={closePanel}
                      className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={panelMode === 'create' ? handleCreateRule : handleUpdateRule}
                      disabled={submitting || !ruleForm.name || ruleForm.minimumPrice < 0 || ruleForm.maximumPrice < ruleForm.minimumPrice || ruleForm.modifier <= 0}
                      className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {submitting ? (panelMode === 'create' ? 'Creating...' : 'Updating...') : (panelMode === 'create' ? 'Create' : 'Update')}
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

export default PricingRules;