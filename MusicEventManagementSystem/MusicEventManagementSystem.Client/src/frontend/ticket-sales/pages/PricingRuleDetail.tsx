import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PricingRuleService } from '../services/pricingRuleService';
import { EventService } from '../../event-organization/services/eventService';
import { TicketTypeService } from '../services/ticketTypeService';
import type { PricingRuleResponse } from '../types';
import type { PricingRuleCreateForm, PricingRuleUpdateForm } from '../types/forms/pricingRule';
import type { EventResponse } from '../../event-organization/types/api/event';
import type { TicketTypeResponse } from '../types/api/ticketType';
import { toast } from 'react-toastify';
import { PricingCondition } from '../types/enums/TicketSales';
import { Card } from '../components/ui/card';
import { ArrowLeft, Save, Loader2, XCircle, Tag, DollarSign, TrendingUp, Target, Calendar, Filter } from 'lucide-react';

const PricingRuleDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== 'new';

  const [events, setEvents] = useState<EventResponse[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const [selectedEventIds, setSelectedEventIds] = useState<number[]>([]);
  const [selectedTicketTypesIds, setSelectedTicketTypesIds] = useState<number[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [eventsData, ticketTypesData] = await Promise.all([
        EventService.getAllEvents(),
        TicketTypeService.getAllTicketTypes()
      ]);

      setEvents(eventsData);
      setTicketTypes(ticketTypesData);

      if (isEditMode && id) {
        const rule = await PricingRuleService.getPricingRuleById(parseInt(id));
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
        setSelectedEventIds(rule.eventIds || []);
        setSelectedTicketTypesIds(rule.ticketTypesIds || []);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch data. Please try again.';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTicketTypesForSelectedEvents = () => {
    if (selectedEventIds.length === 0) return [];
    return ticketTypes.filter(ticketType => 
      selectedEventIds.includes(ticketType.eventId)
    );
  };

  const handleFieldChange = (field: keyof PricingRuleCreateForm, value: any) => {
    setRuleForm({
      ...ruleForm,
      [field]: value
    });
  };

  const handleEventSelection = (eventId: number) => {
    setSelectedEventIds(prev => {
      if (prev.includes(eventId)) {
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

  const selectAllEvents = () => {
    const allEventIds = events.map(event => event.id);
    setSelectedEventIds(allEventIds);
  };

  const clearAllEvents = () => {
    setSelectedEventIds([]);
    setSelectedTicketTypesIds([]);
  };

  const selectAllTicketTypes = () => {
    const allTicketTypeIds = getTicketTypesForSelectedEvents().map(tt => tt.ticketTypeId);
    setSelectedTicketTypesIds(allTicketTypeIds);
  };

  const clearAllTicketTypes = () => {
    setSelectedTicketTypesIds([]);
  };

  const isFormValid = () => {
    return ruleForm.name && 
           ruleForm.minimumPrice >= 0 && 
           ruleForm.maximumPrice >= ruleForm.minimumPrice && 
           ruleForm.modifier > 0;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!isFormValid()) {
        setError('Please fill all required fields with valid values');
        return;
      }

      const formData = {
        ...ruleForm,
        eventIds: selectedEventIds,
        ticketTypesIds: selectedTicketTypesIds
      };

      if (isEditMode && id) {
        await PricingRuleService.updatePricingRule(parseInt(id), formData);
        toast.success('Pricing rule updated successfully');
      } else {
        await PricingRuleService.createPricingRule(formData);
        toast.success('Pricing rule created successfully');
      }
      
      navigate('/pricing-rules');
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} pricing rule`);
      toast.error(err.message || `Failed to ${isEditMode ? 'update' : 'create'} pricing rule`);
    } finally {
      setSubmitting(false);
    }
  };

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

  const getConditionColor = (condition: number) => {
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

  const availableTicketTypes = getTicketTypesForSelectedEvents();

  if (loading) {
    return (
      <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="w-10 h-10 text-lime-400 animate-spin mb-3" />
          <p className="text-neutral-400 text-base">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/pricing-rules')}
              className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {isEditMode ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
              </h1>
              <p className="text-neutral-400 text-sm">
                {isEditMode ? 'Update pricing rule configuration' : 'Configure a new dynamic pricing rule'}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30">
                    <Tag className="w-6 h-6 text-lime-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Basic Information</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
                    <input
                      type="text"
                      value={ruleForm.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter rule name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                    <textarea
                      value={ruleForm.description}
                      onChange={(e) => handleFieldChange('description', e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter description"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Pricing Condition *</label>
                    <select
                      value={ruleForm.pricingCondition}
                      onChange={(e) => handleFieldChange('pricingCondition', parseInt(e.target.value) as PricingCondition)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                    >
                      {Object.values(PricingCondition)
                        .filter(value => typeof value === 'number')
                        .map(condition => (
                          <option key={condition} value={condition}>
                            {formatPricingCondition(condition as PricingCondition)}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Dynamic Condition</label>
                    <textarea
                      value={ruleForm.dynamicCondition}
                      onChange={(e) => handleFieldChange('dynamicCondition', e.target.value)}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter dynamic conditions"
                      rows={3}
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30">
                    <DollarSign className="w-6 h-6 text-lime-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Pricing Configuration</h2>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Minimum Price *</label>
                      <input
                        type="number"
                        value={ruleForm.minimumPrice}
                        onChange={(e) => handleFieldChange('minimumPrice', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Maximum Price *</label>
                      <input
                        type="number"
                        value={ruleForm.maximumPrice}
                        onChange={(e) => handleFieldChange('maximumPrice', parseFloat(e.target.value) || 0)}
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
                        onChange={(e) => handleFieldChange('modifier', parseFloat(e.target.value) || 1.0)}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="1.0"
                        min="0.1"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Early Bird Percentage</label>
                      <input
                        type="number"
                        value={ruleForm.earlyBirdPercentage}
                        onChange={(e) => handleFieldChange('earlyBirdPercentage', parseFloat(e.target.value) || 0)}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="10"
                        min="0"
                        max="100"
                        step="1"
                      />
                    </div>
                  </div>

                  <div className="border-t border-neutral-800 pt-4 mt-4">
                    <h3 className="text-lg font-medium mb-4 text-white">Occupancy Thresholds</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Threshold 1 (%)</label>
                        <input
                          type="number"
                          value={ruleForm.occupancyThreshold1}
                          onChange={(e) => handleFieldChange('occupancyThreshold1', parseFloat(e.target.value) || 0)}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="50"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Percentage 1 (%)</label>
                        <input
                          type="number"
                          value={ruleForm.occupancyPercentage1}
                          onChange={(e) => handleFieldChange('occupancyPercentage1', parseFloat(e.target.value) || 0)}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Threshold 2 (%)</label>
                        <input
                          type="number"
                          value={ruleForm.occupancyThreshold2}
                          onChange={(e) => handleFieldChange('occupancyThreshold2', parseFloat(e.target.value) || 0)}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="80"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Percentage 2 (%)</label>
                        <input
                          type="number"
                          value={ruleForm.occupancyPercentage2}
                          onChange={(e) => handleFieldChange('occupancyPercentage2', parseFloat(e.target.value) || 0)}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Events & Ticket Types */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30">
                    <Calendar className="w-6 h-6 text-lime-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">Apply to Events</h2>
                </div>

                <div className="flex justify-end gap-2 mb-3">
                  <button
                    type="button"
                    onClick={selectAllEvents}
                    className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllEvents}
                    className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {events.map(event => (
                    <div key={event.id} className="flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-xl transition-all">
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
                        Select All TT
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {selectedEventIds.length > 0 && (
                <Card className="p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30">
                      <Target className="w-6 h-6 text-lime-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-white">Apply to Ticket Types</h2>
                  </div>

                  <div className="flex justify-end gap-2 mb-3">
                    <button
                      type="button"
                      onClick={selectAllTicketTypes}
                      className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
                    >
                      Select All
                    </button>
                    <button
                      type="button"
                      onClick={clearAllTicketTypes}
                      className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {availableTicketTypes.map(ticketType => (
                      <div key={ticketType.ticketTypeId} className="flex items-center gap-3 p-3 hover:bg-neutral-800/50 rounded-xl transition-all">
                        <input
                          type="checkbox"
                          checked={selectedTicketTypesIds.includes(ticketType.ticketTypeId)}
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
                </Card>
              )}

              {/* Summary Card */}
              <Card className="p-6 bg-gradient-to-br from-lime-500/10 to-lime-500/5 border-lime-500/30">
                <h3 className="text-lg font-semibold text-white mb-4">Rule Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-sm">Condition:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(ruleForm.pricingCondition)}`}>
                      {formatPricingCondition(ruleForm.pricingCondition)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-sm">Price Range:</span>
                    <span className="text-white text-sm font-medium">${ruleForm.minimumPrice} - ${ruleForm.maximumPrice}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-sm">Modifier:</span>
                    <span className="text-white text-sm font-medium">{ruleForm.modifier}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-sm">Events:</span>
                    <span className="text-white text-sm font-medium">{selectedEventIds.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400 text-sm">Ticket Types:</span>
                    <span className="text-white text-sm font-medium">{selectedTicketTypesIds.length}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t border-neutral-800 mt-6">
          <button
            type="button"
            onClick={() => navigate('/pricing-rules')}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || !isFormValid()}
            className="px-6 py-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {submitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Rule' : 'Create Rule')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingRuleDetail;