import { useState } from 'react';
import { CustomSelect } from '../customSelect';
import ZoneService from '../../services/zoneService';
import type { ZoneResponse } from '../../types/api/zone';
import type { SegmentResponse } from '../../types/api/segment';
import type { ZoneCreateForm as ZoneFormType } from '../../types/forms/zone';
import { ZonePosition } from '../../types/enums/TicketSales';
import { toast } from 'react-toastify';

interface ZoneCreateFormProps {
  segments: SegmentResponse[];
  onZoneCreated: (zone: ZoneResponse) => void;
}

const ZoneCreateForm = ({ segments, onZoneCreated }: ZoneCreateFormProps) => {
  const [zoneForm, setZoneForm] = useState<ZoneFormType>({
    name: '',
    description: '',
    capacity: 0,
    basePrice: 0,
    position: ZonePosition.Center,
    segmentId: 0
  });

  const getRemainingCapacity = (segmentId: number) => {
    const segment = segments.find(s => s.segmentId === segmentId);
    return segment ? segment.capacity : 0;
  };

  const handleCreateZone = async () => {
    try {
      if (!zoneForm.name || zoneForm.capacity <= 0 || zoneForm.basePrice < 0 || zoneForm.segmentId === 0) {
        toast.error('Please fill in all required fields with valid values');
        return;
      }

      const created = await ZoneService.createZone(zoneForm);
      onZoneCreated(created);
      setZoneForm({
        name: '',
        description: '',
        capacity: 0,
        basePrice: 0,
        position: ZonePosition.Center,
        segmentId: 0
      });

      toast.success('Zone created successfully');
    } catch (error) {
      console.error('Failed to create zone:', error);
      toast.error('Failed to create zone');
    }
  };

  const handleSegmentChange = (segmentId: number) => {
    setZoneForm(prev => ({
      ...prev,
      segmentId: segmentId,
      capacity: 0
    }));
  };

  const segmentOptions = [
    { value: '0', label: 'Select Segment' },
    ...segments.map(segment => ({
      value: segment.segmentId.toString(),
      label: segment.name || 'Unnamed Segment'
    }))
  ];

  const positionOptions = [
    { value: ZonePosition.Front.toString(), label: 'Front' },
    { value: ZonePosition.Center.toString(), label: 'Center' },
    { value: ZonePosition.Back.toString(), label: 'Back' },
    { value: ZonePosition.Left.toString(), label: 'Left' },
    { value: ZonePosition.Right.toString(), label: 'Right' },
    { value: ZonePosition.Upper.toString(), label: 'Upper' },
    { value: ZonePosition.Lower.toString(), label: 'Lower' },
    { value: ZonePosition.Balcony.toString(), label: 'Balcony' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
        <input
          type="text"
          placeholder="Front Row"
          value={zoneForm.name}
          onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
        <textarea
          placeholder="Zone description..."
          value={zoneForm.description || ''}
          onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm resize-none"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Segment *</label>
          <CustomSelect
            value={zoneForm.segmentId.toString()}
            onChange={(value) => handleSegmentChange(parseInt(value))}
            options={segmentOptions}
            placeholder="Select Segment"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Position *</label>
          <CustomSelect
            value={zoneForm.position.toString()}
            onChange={(value) => setZoneForm({ ...zoneForm, position: parseInt(value) as ZonePosition })}
            options={positionOptions}
            placeholder="Select Position"
            className="w-full"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Capacity *</label>
          <input
            type="number"
            placeholder="50"
            value={zoneForm.capacity}
            onChange={(e) => setZoneForm({ ...zoneForm, capacity: parseInt(e.target.value) || 0 })}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
            min="1"
            max={zoneForm.segmentId ? getRemainingCapacity(zoneForm.segmentId) : undefined}
          />
          {zoneForm.segmentId > 0 && (
            <p className="text-xs text-neutral-500 mt-1">
              Available in segment: {getRemainingCapacity(zoneForm.segmentId)}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-neutral-300">Base Price ($) *</label>
          <input
            type="number"
            placeholder="100.00"
            value={zoneForm.basePrice}
            onChange={(e) => setZoneForm({ ...zoneForm, basePrice: parseFloat(e.target.value) || 0 })}
            className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-sm"
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <button
        onClick={handleCreateZone}
        disabled={!zoneForm.name || zoneForm.capacity <= 0 || zoneForm.basePrice < 0 || zoneForm.segmentId === 0}
        className="w-full p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold text-sm"
      >
        Create Zone
      </button>
    </div>
  );
};

export default ZoneCreateForm;