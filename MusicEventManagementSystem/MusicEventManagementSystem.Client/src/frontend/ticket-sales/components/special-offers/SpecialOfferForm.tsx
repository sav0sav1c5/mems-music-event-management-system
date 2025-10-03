import { Card } from '../ui/card';
import { X, Save, Loader2, XCircle } from 'lucide-react';
import type { SpecialOfferCreateForm } from '../../types/forms/specialOffer';
import type { OfferType } from '../../types';

interface SpecialOfferFormProps {
  panelMode: 'create' | 'edit';
  offerForm: SpecialOfferCreateForm;
  onFormChange: (form: SpecialOfferCreateForm) => void;
  error: string | null;
  submitting: boolean;
  onSubmit: () => void;
  onClose: () => void;
}

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

const SpecialOfferForm = ({
  panelMode,
  offerForm,
  onFormChange,
  error,
  submitting,
  onSubmit,
  onClose
}: SpecialOfferFormProps) => {
  const getPanelTitle = () => {
    return panelMode === 'create' ? 'Create New Special Offer' : 'Edit Special Offer';
  };

  const handleFieldChange = (field: keyof SpecialOfferCreateForm, value: any) => {
    onFormChange({
      ...offerForm,
      [field]: value
    });
  };

  const isFormValid = () => {
    return offerForm.name && 
           offerForm.discountValue >= 0 && 
           offerForm.ticketLimit >= 0 &&
           offerForm.startDate < offerForm.endDate;
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
            value={offerForm.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter offer name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
          <textarea
            value={offerForm.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Discount Value *</label>
            <input
              type="number"
              value={offerForm.discountValue}
              onChange={(e) => handleFieldChange('discountValue', parseFloat(e.target.value) || 0)}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              placeholder="0"
              min="0"
              step="1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Ticket Limit *</label>
            <input
              type="number"
              value={offerForm.ticketLimit}
              onChange={(e) => handleFieldChange('ticketLimit', parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              placeholder="0"
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Start Date *</label>
            <input
              type="datetime-local"
              value={offerForm.startDate.toISOString().slice(0, 16)}
              onChange={(e) => handleFieldChange('startDate', new Date(e.target.value))}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">End Date *</label>
            <input
              type="datetime-local"
              value={offerForm.endDate.toISOString().slice(0, 16)}
              onChange={(e) => handleFieldChange('endDate', new Date(e.target.value))}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Offer Type *</label>
          <select
            value={offerForm.offerType}
            onChange={(e) => handleFieldChange('offerType', parseInt(e.target.value) as OfferType)}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
          >
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(type => (
              <option key={type} value={type}>
                {formatOfferType(type as OfferType)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Application Condition</label>
          <textarea
            value={offerForm.applicationCondition}
            onChange={(e) => handleFieldChange('applicationCondition', e.target.value)}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter application conditions"
            rows={3}
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

export default SpecialOfferForm;