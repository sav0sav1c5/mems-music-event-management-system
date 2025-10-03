import { useState } from 'react';
import { CustomSelect } from '../ui/customSelect';
import SegmentService from '../../services/segmentService';
import type { SegmentResponse } from '../../types/api/segment';
import type { SegmentCreateForm as SegmentFormType } from '../../types/forms/segment';
import { SegmentType } from '../../types/enums/TicketSales';
import { toast } from 'react-toastify';

interface SegmentCreateFormProps {
  venueId: number;
  segments: SegmentResponse[];
  onSegmentCreated: (segment: SegmentResponse) => void;
}

const SegmentCreateForm = ({ venueId, segments, onSegmentCreated }: SegmentCreateFormProps) => {
  const [segmentForm, setSegmentForm] = useState<SegmentFormType>({
    name: '',
    description: '',
    capacity: 0,
    segmentType: SegmentType.Standard,
    venueId: venueId
  });

  const segmentTypeOptions = [
    { value: SegmentType.Standard.toString(), label: 'Standard' },
    { value: SegmentType.VIP.toString(), label: 'VIP' },
    { value: SegmentType.Premium.toString(), label: 'Premium' },
    { value: SegmentType.Standing.toString(), label: 'Standing' },
    { value: SegmentType.Seated.toString(), label: 'Seated' }
  ];

  const handleCreateSegment = async () => {
    try {
      if (!segmentForm.name || segmentForm.capacity <= 0) {
        toast.error('Please fill in all required fields with valid values');
        return;
      }

      const created = await SegmentService.createSegment(segmentForm);
      onSegmentCreated(created);
      setSegmentForm({
        name: '',
        description: '',
        capacity: 0,
        segmentType: SegmentType.Standard,
        venueId: venueId
      });

      toast.success('Segment created successfully');
    } catch (error) {
      console.error('Failed to create segment:', error);
      toast.error('Failed to create segment');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
        <input
          type="text"
          placeholder="VIP Section"
          value={segmentForm.name}
          onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
        <textarea
          placeholder="Segment description..."
          value={segmentForm.description || ''}
          onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Capacity *</label>
          <input
            type="number"
            placeholder="100"
            value={segmentForm.capacity}
            onChange={(e) => setSegmentForm({ ...segmentForm, capacity: parseInt(e.target.value) || 0 })}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
            min="1"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Segment Type *</label>
          <CustomSelect
            value={segmentForm.segmentType.toString()}
            onChange={(value) => setSegmentForm({ ...segmentForm, segmentType: parseInt(value) as SegmentType })}
            options={segmentTypeOptions}
            placeholder="Select Type"
            className="w-full"
          />
        </div>
      </div>

      <button
        onClick={handleCreateSegment}
        disabled={!segmentForm.name || segmentForm.capacity <= 0}
        className="w-full p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold text-sm"
      >
        Create Segment
      </button>
    </div>
  );
};

export default SegmentCreateForm;