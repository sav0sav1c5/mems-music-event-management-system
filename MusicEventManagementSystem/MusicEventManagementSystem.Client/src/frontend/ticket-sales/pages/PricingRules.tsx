import { useState, useEffect } from 'react';
import { PricingRuleService } from '../services/pricingRuleService';
import { EventService } from '../../event-organization/services/eventService';
import { TicketTypeService } from '../services/ticketTypeService';
import type { PricingRuleResponse } from '../types';
import type { PricingRuleCreateForm, PricingRuleUpdateForm } from '../types/forms/pricingRule';
import type { EventResponse } from '../../event-organization/types/api/event';
import type { TicketTypeResponse } from '../types/api/ticketType';
import { toast } from 'react-toastify';
import { PricingCondition } from '../types/enums/TicketSales';

import PricingRuleHeader from '../components/pricing-rules/PricingRuleHeader';
import PricingRuleStats from '../components/pricing-rules/PricingRuleStats';
import PricingRuleList from '../components/pricing-rules/PricingRuleList';
import PricingRuleForm from '../components/pricing-rules/PricingRuleForm';

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
    pricingCondition: PricingCondition.OccupancyBased,
    dynamicCondition: '',
    modifier: 1.0,
    eventIds: [],
    ticketTypesIds: []
  });

  // Selected events and ticket types for the form
  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [selectedTicketTypesIds, setSelectedTicketTypesIds] = useState<number[]>([]);

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

      // Create the rule with eventIds and ticketTypeIds
      const createForm: PricingRuleCreateForm = {
        ...ruleForm,
        eventIds: selectedEventIds,
        ticketTypesIds: selectedTicketTypesIds
      };

      const created = await PricingRuleService.createPricingRule(createForm);
      
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
        modifier: ruleForm.modifier,
        eventIds: selectedEventIds,
        ticketTypesIds: selectedTicketTypesIds
      };

      const updated = await PricingRuleService.updatePricingRule(
        selectedRule.pricingRuleId, 
        updateForm
      );
      
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
      pricingCondition: PricingCondition.OccupancyBased,
      dynamicCondition: '',
      modifier: 1.0,
      eventIds: [],
      ticketTypesIds: []
    });
    setSelectedEventIds([]);
    setSelectedTicketTypesIds([]);
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
      modifier: rule.modifier,
      eventIds: rule.eventIds || [],
      ticketTypesIds: rule.ticketTypesIds || []
    });
    // Set the selected events and ticket types from the rule
    setSelectedEventIds(rule.eventIds || []);
    setSelectedTicketTypesIds(rule.ticketTypesIds || []);
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
        
        setSelectedTicketTypesIds(prevTicketTypes => 
          prevTicketTypes.filter(id => !eventTicketTypes.includes(id))
        );
        return prev.filter(id => id !== eventId);
      } else {
        return [...prev, eventId];
      }
    });
  };

  const handleTicketTypeSelection = (ticketTypeId: number) => {
    setSelectedTicketTypesIds(prev => {
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
    
    setSelectedTicketTypesIds(prev => {
      const newSelection = [...prev];
      eventTicketTypes.forEach(ticketTypeId => {
        if (!newSelection.includes(ticketTypeId)) {
          newSelection.push(ticketTypeId);
        }
      });
      return newSelection;
    });
  };

  // Select all events
  const selectAllEvents = () => {
    const allEventIds = events.map(event => event.id);
    setSelectedEventIds(allEventIds);
  };

  // Clear all events
  const clearAllEvents = () => {
    setSelectedEventIds([]);
    setSelectedTicketTypesIds([]);
  };

  // Select all ticket types for selected events
  const selectAllTicketTypes = () => {
    const allTicketTypeIds = getTicketTypesForSelectedEvents().map(tt => tt.ticketTypeId);
    setSelectedTicketTypesIds(allTicketTypeIds);
  };

  // Clear all ticket types
  const clearAllTicketTypes = () => {
    setSelectedTicketTypesIds([]);
  };

  // Filter pricing rules
  const getFilteredRules = () => {
    let result = [...pricingRules];
    
    if (searchTerm) {
      result = result.filter(rule => 
        rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const filteredRules = getFilteredRules();
  const availableTicketTypes = getTicketTypesForSelectedEvents();

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Rules List */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${showPanel ? 'w-3/5' : 'w-full'}`}>
            
            <PricingRuleHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              conditionFilter={conditionFilter}
              onConditionFilterChange={setConditionFilter}
              eventFilter={eventFilter}
              onEventFilterChange={setEventFilter}
              events={events}
              onCreateNew={openCreatePanel}
              error={error}
              showPanel={showPanel}
            />

            <PricingRuleStats pricingRules={pricingRules} />

            <PricingRuleList
              loading={loading}
              rules={filteredRules}
              events={events}
              ticketTypes={ticketTypes}
              eventFilter={eventFilter}
              onEdit={openEditPanel}
              onDelete={handleDeleteRule}
            />
          </div>

          {/* Right Form Panel */}
          {showPanel && (
            <div className="w-2/5 transition-all duration-300">
              <PricingRuleForm
                panelMode={panelMode}
                ruleForm={ruleForm}
                onFormChange={setRuleForm}
                events={events}
                ticketTypes={ticketTypes}
                selectedEventIds={selectedEventIds}
                selectedTicketTypesIds={selectedTicketTypesIds}
                onEventSelection={handleEventSelection}
                onTicketTypeSelection={handleTicketTypeSelection}
                onSelectAllEvents={selectAllEvents}
                onClearAllEvents={clearAllEvents}
                onSelectAllTicketTypes={selectAllTicketTypes}
                onClearAllTicketTypes={clearAllTicketTypes}
                onSelectAllTicketTypesForEvent={selectAllTicketTypesForEvent}
                availableTicketTypes={availableTicketTypes}
                error={error}
                submitting={submitting}
                onSubmit={panelMode === 'create' ? handleCreateRule : handleUpdateRule}
                onClose={closePanel}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingRules;