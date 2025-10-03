import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Card } from '../card';
import { CustomSelect } from '../customSelect';
import VenueService from '../../services/venueService';
import type { VenueResponse } from '../../types/api/venue';
import type { EventResponse } from '../../../event-organization/types/api/event';
import type { VenueCreateForm, VenueUpdateForm } from '../../types/forms/venue';
import { VenueType } from '../../types/enums/TicketSales';
import { showToast } from '../toast';

interface VenueFormProps {
  venue?: VenueResponse | null;
  events: EventResponse[];
  isEdit?: boolean;
  onVenueCreated: (venue: VenueResponse) => void;
  onVenueUpdated: (venue: VenueResponse) => void;
  onCancel: () => void;
}

const VenueForm = ({ 
  venue, 
  events, 
  isEdit = false, 
  onVenueCreated, 
  onVenueUpdated, 
  onCancel 
}: VenueFormProps) => {
  const [venueForm, setVenueForm] = useState<VenueCreateForm | VenueUpdateForm>({
    name: '',
    address: '',
    city: '',
    capacity: 0,
    eventId: 0,
    venueType: VenueType.Indoor
  });

  useEffect(() => {
    if (isEdit && venue) {
      setVenueForm({
        name: venue.name || '',
        address: venue.address || '',
        city: venue.city || '',
        capacity: venue.capacity || 0,
        eventId: venue.eventId || 0,
        venueType: venue.venueType || VenueType.Indoor
      });
    } else {
      setVenueForm({
        name: '',
        address: '',
        city: '',
        capacity: 0,
        eventId: events[0]?.id || 0,
        venueType: VenueType.Indoor
      });
    }
  }, [isEdit, venue, events]);

  const handleSubmit = async () => {
    try {
      if (isEdit && venue) {
        const updated = await VenueService.updateVenue(venue.venueId, venueForm);
        onVenueUpdated(updated);
        showToast.success('Venue updated successfully');
      } else {
        const created = await VenueService.createVenue(venueForm as VenueCreateForm);
        onVenueCreated(created);
        showToast.success('Venue created successfully');
      }
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} venue:`, error);
      showToast.error(`Failed to ${isEdit ? 'update' : 'create'} venue`);
    }
  };

  const isFormValid = isEdit 
    ? !!venueForm.name
    : !!venueForm.name && !!venueForm.address && !!venueForm.city && venueForm.eventId !== 0;

  return (
    <Card className="overflow-hidden border border-neutral-800 shadow-2xl bg-neutral-900/60 backdrop-blur-sm">
      <div className="flex justify-between items-center mb-3 pb-3 border-b border-neutral-800">
        <h2 className="text-xl font-bold text-lime-400">
          {isEdit ? 'Edit Venue' : 'Create New Venue'}
        </h2>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4 overflow-y-auto px-1">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Venue Name</label>
          <input
            type="text"
            value={venueForm.name || ''}
            onChange={(e) => setVenueForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter venue name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Address</label>
          <input
            type="text"
            value={venueForm.address || ''}
            onChange={(e) => setVenueForm(prev => ({ ...prev, address: e.target.value }))}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter venue address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">City</label>
          <input
            type="text"
            value={venueForm.city || ''}
            onChange={(e) => setVenueForm(prev => ({ ...prev, city: e.target.value }))}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Capacity</label>
          <input
            type="number"
            value={venueForm.capacity || 0}
            onChange={(e) => setVenueForm(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
            placeholder="Enter capacity"
            min="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Event</label>
            <CustomSelect
              value={venueForm.eventId?.toString() || '0'}
              onChange={(value) => setVenueForm(prev => ({ ...prev, eventId: parseInt(value) }))}
              options={[
                { value: '0', label: 'Select Event' },
                ...events.map(event => ({
                  value: event.id.toString(),
                  label: event.name
                }))
              ]}
              placeholder="Select Event"
              className='w-full'
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Venue Type</label>
            <CustomSelect
              value={venueForm.venueType?.toString() || VenueType.Indoor.toString()}
              onChange={(value) => setVenueForm(prev => ({ ...prev, venueType: parseInt(value) as VenueType }))}
              options={[
                { value: VenueType.Indoor.toString(), label: 'Indoor' },
                { value: VenueType.Outdoor.toString(), label: 'Outdoor' },
                { value: VenueType.Stadium.toString(), label: 'Stadium' },
                { value: VenueType.Arena.toString(), label: 'Arena' },
                { value: VenueType.Theater.toString(), label: 'Theater' },
                { value: VenueType.Club.toString(), label: 'Club' },
                { value: VenueType.Festival.toString(), label: 'Festival' }
              ]}
              placeholder="Select Venue Type"
              className='w-full'
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t border-neutral-800">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold"
          >
            {isEdit ? 'Update Venue' : 'Create Venue'}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default VenueForm;