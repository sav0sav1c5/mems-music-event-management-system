import { Card } from '../ui/card';
import { X, Save, Loader2, XCircle } from 'lucide-react';
import type { PricingRuleCreateForm } from '../../types/forms/pricingRule';
import type { EventResponse } from '../../../event-organization/types/api/event';
import type { TicketTypeResponse } from '../../types/api/ticketType';
import { PricingCondition } from '../../types/enums/TicketSales';

interface PricingRuleFormProps {
  panelMode: 'create' | 'edit';
  ruleForm: PricingRuleCreateForm;
  onFormChange: (form: PricingRuleCreateForm) => void;
  events: EventResponse[];
  ticketTypes: TicketTypeResponse[];
  selectedEventIds: number[];
  selectedTicketTypesIds: number[];
  onEventSelection: (eventId: number) => void;
  onTicketTypeSelection: (ticketTypeId: number) => void;
  onSelectAllEvents: () => void;
  onClearAllEvents: () => void;
  onSelectAllTicketTypes: () => void;
  onClearAllTicketTypes: () => void;
  onSelectAllTicketTypesForEvent: (eventId: number) => void;
  availableTicketTypes: TicketTypeResponse[];
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

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

const PricingRuleForm = ({
  panelMode,
  ruleForm,
  onFormChange,
  events,
  ticketTypes,
  selectedEventIds,
  selectedTicketTypesIds,
  onEventSelection,
  onTicketTypeSelection,
  onSelectAllEvents,
  onClearAllEvents,
  onSelectAllTicketTypes,
  onClearAllTicketTypes,
  onSelectAllTicketTypesForEvent,
  availableTicketTypes,
  error,
  submitting,
  onSubmit,
  onClose
}: PricingRuleFormProps) => {
  const getPanelTitle = () => {
    return panelMode === 'create' ? 'Create New Pricing Rule' : 'Edit Pricing Rule';
  };

  const handleFieldChange = (field: keyof PricingRuleCreateForm, value: any) => {
    onFormChange({
      ...ruleForm,
      [field]: value
    });
  };

  const isFormValid = () => {
    return ruleForm.name && 
           ruleForm.minimumPrice >= 0 && 
           ruleForm.maximumPrice >= ruleForm.minimumPrice && 
           ruleForm.modifier > 0;
  };

  return (
    <Card className="overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900/60 backdrop-blur-sm h-full">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-lime-400">
          {getPanelTitle()}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Min Price *</label>
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
            <label className="block text-sm font-medium mb-2 text-neutral-300">Max Price *</label>
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
            <label className="block text-sm font-medium mb-2 text-neutral-300">Early Bird %</label>
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

        {/* Event Selection */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <label className="block text-sm font-medium text-neutral-300">
              Apply to Events
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSelectAllEvents}
                className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={onClearAllEvents}
                className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {events.map(event => (
              <div key={event.id} className="flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-xl transition-all">
                <input
                  type="checkbox"
                  checked={selectedEventIds.includes(event.id)}
                  onChange={() => onEventSelection(event.id)}
                  className="w-4 h-4 text-lime-500 bg-neutral-800 border-neutral-700 rounded focus:ring-lime-400 focus:ring-2"
                />
                <span className="text-white text-sm flex-1">{event.name}</span>
                <button
                  type="button"
                  onClick={() => onSelectAllTicketTypesForEvent(event.id)}
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
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-neutral-300">
                Apply to Ticket Types
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={onSelectAllTicketTypes}
                  className="text-xs text-lime-400 hover:text-lime-300 transition-colors"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={onClearAllTicketTypes}
                  className="text-xs text-neutral-400 hover:text-neutral-300 transition-colors"
                >
                  Clear All
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableTicketTypes.map(ticketType => (
                <div key={ticketType.ticketTypeId} className="flex items-center gap-3 p-2 hover:bg-neutral-800/50 rounded-xl transition-all">
                  <input
                    type="checkbox"
                    checked={selectedTicketTypesIds.includes(ticketType.ticketTypeId)}
                    onChange={() => onTicketTypeSelection(ticketType.ticketTypeId)}
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
              onChange={(e) => handleFieldChange('occupancyThreshold1', parseFloat(e.target.value) || 0)}
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
              onChange={(e) => handleFieldChange('occupancyPercentage1', parseFloat(e.target.value) || 0)}
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
              onChange={(e) => handleFieldChange('occupancyThreshold2', parseFloat(e.target.value) || 0)}
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
              onChange={(e) => handleFieldChange('occupancyPercentage2', parseFloat(e.target.value) || 0)}
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
            onChange={(e) => handleFieldChange('dynamicCondition', e.target.value)}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter dynamic conditions"
            rows={2}
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting || !isFormValid()}
            className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {submitting ? (panelMode === 'create' ? 'Creating...' : 'Updating...') : (panelMode === 'create' ? 'Create' : 'Update')}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default PricingRuleForm;