import { Card } from '../ui/card';
import { X, Save, Loader2 } from 'lucide-react';
import { CustomSelect } from '../ui/customSelect';
import type { TicketTypeCreateForm } from '../../types/forms/ticketType';
import type { EventResponse } from '../../../event-organization/types/api/event';
import type { ZoneResponse, TicketTypeStatus } from '../../types';

interface TicketTypeFormProps {
  formMode: 'create' | 'edit';
  ticketTypeForm: TicketTypeCreateForm;
  onFormChange: (form: TicketTypeCreateForm) => void;
  events: EventResponse[];
  zones: ZoneResponse[];
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

const TicketTypeForm = ({
  formMode,
  ticketTypeForm,
  onFormChange,
  events,
  zones,
  error,
  submitting,
  onSubmit,
  onClose
}: TicketTypeFormProps) => {
  const getFormTitle = () => {
    return formMode === 'create' ? 'Create New Ticket Type' : 'Edit Ticket Type';
  };

  const handleFieldChange = (field: keyof TicketTypeCreateForm, value: any) => {
    onFormChange({
      ...ticketTypeForm,
      [field]: value
    });
  };

  const isFormValid = () => {
    return ticketTypeForm.name && 
           ticketTypeForm.availableQuantity >= 0 && 
           ticketTypeForm.zoneId !== 0 && 
           ticketTypeForm.eventId !== 0;
  };

  return (
    <Card className="overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900/60 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-lime-400">
          {getFormTitle()}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-1">
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
          <input
            type="text"
            value={ticketTypeForm.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter ticket type name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
          <textarea
            value={ticketTypeForm.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
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
              onChange={(e) => handleFieldChange('availableQuantity', parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              placeholder="0"
              min="0"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Status *</label>
            <CustomSelect
              value={ticketTypeForm.status.toString()}
              onChange={(value) => handleFieldChange('status', parseInt(value) as TicketTypeStatus)}
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
              onChange={(value) => handleFieldChange('eventId', parseInt(value) || 0)}
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
              onChange={(value) => handleFieldChange('zoneId', parseInt(value) || 0)}
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
            {submitting ? (formMode === 'create' ? 'Creating...' : 'Updating...') : (formMode === 'create' ? 'Create' : 'Update')}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default TicketTypeForm;