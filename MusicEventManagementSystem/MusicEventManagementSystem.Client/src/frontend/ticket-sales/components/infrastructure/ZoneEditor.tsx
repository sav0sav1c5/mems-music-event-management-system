import { useState } from 'react';
import { Plus, Edit, X, MapPin } from 'lucide-react';
import { Card } from '../card';
import { CustomSelect } from '../customSelect';
import ZoneService from '../../services/zoneService';
import type { ZoneResponse } from '../../types/api/zone';
import type { SegmentResponse } from '../../types/api/segment';
import type { ZoneCreateForm } from '../../types/forms/zone';
import { ZonePosition } from '../../types/enums/TicketSales';
import { toast } from 'react-toastify';

interface ZoneEditorProps {
  zones: ZoneResponse[];
  segments: SegmentResponse[];
  onZonesUpdate: (zones: ZoneResponse[]) => void;
}

const ZoneEditor = ({ zones, segments, onZonesUpdate }: ZoneEditorProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneResponse | null>(null);
  const [zoneForm, setZoneForm] = useState<ZoneCreateForm>({
    name: '',
    description: '',
    capacity: 0,
    basePrice: 0,
    position: ZonePosition.Center,
    segmentId: 0
  });

  // Računanje preostalog kapaciteta za selektovani segment
  const getRemainingCapacity = (segmentId: number, excludeZoneId?: number) => {
    const segment = segments.find(s => s.segmentId === segmentId);
    if (!segment) return 0;

    const usedCapacity = zones
      .filter(zone => zone.segmentId === segmentId && zone.zoneId !== excludeZoneId)
      .reduce((total, zone) => total + zone.capacity, 0);

    return segment.capacity - usedCapacity;
  };

  const handleCreateZone = async () => {
    try {
      if (!zoneForm.name || zoneForm.capacity <= 0 || zoneForm.basePrice < 0 || zoneForm.segmentId === 0) {
        toast.error('Please fill in all required fields with valid values');
        return;
      }

      const remainingCapacity = getRemainingCapacity(zoneForm.segmentId);
      if (zoneForm.capacity > remainingCapacity) {
        toast.error(`Capacity exceeds available space in segment. Maximum available: ${remainingCapacity}`);
        return;
      }

      const created = await ZoneService.createZone(zoneForm);
      onZonesUpdate([...zones, created]);
      setShowCreateForm(false);
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

  const handleEditZone = (zone: ZoneResponse) => {
    setEditingZone(zone);
    setZoneForm({
      name: zone.name || '',
      description: zone.description || '',
      capacity: zone.capacity,
      basePrice: zone.basePrice,
      position: zone.position,
      segmentId: zone.segmentId
    });
    setShowCreateForm(false);
  };

  const handleUpdateZone = async () => {
    if (!editingZone) return;

    try {
      const updateData = {
        name: zoneForm.name,
        description: zoneForm.description,
        capacity: zoneForm.capacity,
        basePrice: zoneForm.basePrice,
        position: zoneForm.position,
        segmentId: zoneForm.segmentId
      };

      const remainingCapacity = getRemainingCapacity(zoneForm.segmentId, editingZone.zoneId);
      if (zoneForm.capacity > remainingCapacity) {
        toast.error(`Capacity exceeds available space in segment. Maximum available: ${remainingCapacity}`);
        return;
      }

      const updated = await ZoneService.updateZone(editingZone.zoneId, updateData);
      onZonesUpdate(zones.map(z => z.zoneId === editingZone.zoneId ? updated : z));
      setEditingZone(null);
      setZoneForm({
        name: '',
        description: '',
        capacity: 0,
        basePrice: 0,
        position: ZonePosition.Center,
        segmentId: 0
      });
      
      toast.success('Zone updated successfully');
    } catch (error) {
      console.error('Failed to update zone:', error);
      toast.error('Failed to update zone');
    }
  };

  const handleDeleteZone = async (zoneId: number) => {
    if (!confirm('Are you sure you want to delete this zone? This action cannot be undone.')) {
      return;
    }

    try {
      await ZoneService.deleteZone(zoneId);
      onZonesUpdate(zones.filter(z => z.zoneId !== zoneId));
      toast.success('Zone deleted successfully');
    } catch (error) {
      console.error('Failed to delete zone:', error);
      toast.error('Failed to delete zone');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingZone(null);
    setZoneForm({
      name: '',
      description: '',
      capacity: 0,
      basePrice: 0,
      position: ZonePosition.Center,
      segmentId: 0
    });
  };

  const handleSegmentChange = (segmentId: number) => {
    setZoneForm(prev => ({
      ...prev,
      segmentId: segmentId,
      capacity: editingZone ? prev.capacity : 0 // Ne resetuj capacity ako editujemo
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Zones Configuration</h3>
          <p className="text-neutral-400 text-sm">Manage zones within segments</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} />
          Add Zone
        </button>
      </div>

      {(showCreateForm || editingZone) && (
        <Card className="p-4">
          <h4 className="font-semibold text-white mb-3">
            {editingZone ? 'Edit Zone' : 'Create New Zone'}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Name *</label>
              <input
                type="text"
                placeholder="Front Row"
                value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Description</label>
              <textarea
                placeholder="Zone description..."
                value={zoneForm.description || ''}
                onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Segment *</label>
                <CustomSelect
                  value={zoneForm.segmentId.toString()}
                  onChange={(value) => handleSegmentChange(parseInt(value))}
                  options={segmentOptions}
                  placeholder="Select Segment"
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Position *</label>
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
                <label className="text-xs text-neutral-400 mb-1 block">Capacity *</label>
                <input
                  type="number"
                  placeholder="50"
                  value={zoneForm.capacity}
                  onChange={(e) => setZoneForm({ ...zoneForm, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  min="1"
                  max={zoneForm.segmentId ? getRemainingCapacity(zoneForm.segmentId, editingZone?.zoneId) : undefined}
                />
                {zoneForm.segmentId > 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Available in segment: {getRemainingCapacity(zoneForm.segmentId, editingZone?.zoneId)}
                  </p>
                )}
              </div>
              
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Base Price ($) *</label>
                <input
                  type="number"
                  placeholder="100.00"
                  value={zoneForm.basePrice}
                  onChange={(e) => setZoneForm({ ...zoneForm, basePrice: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={editingZone ? handleUpdateZone : handleCreateZone}
              disabled={!zoneForm.name || zoneForm.capacity <= 0 || zoneForm.basePrice < 0 || zoneForm.segmentId === 0}
              className="px-4 py-2 rounded-xl bg-lime-500 text-black font-medium hover:bg-lime-400 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all text-sm"
            >
              {editingZone ? 'Update Zone' : 'Create Zone'}
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-neutral-800/60 border border-neutral-700 text-white hover:bg-neutral-700/60 transition-all text-sm"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {zones.map((zone) => {
          const segment = segments.find(s => s.segmentId === zone.segmentId);
          return (
            <Card key={zone.zoneId} hover={true} className="p-3">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded bg-blue-500 mr-2"></div>
                    <h4 className="font-semibold text-white text-sm">{zone.name}</h4>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEditZone(zone)}
                      className="text-neutral-400 hover:text-lime-400 transition-colors p-1"
                      title="Edit zone"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteZone(zone.zoneId)}
                      className="text-neutral-400 hover:text-red-400 transition-colors p-1"
                      title="Delete zone"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-2">
                  <p className="text-neutral-400 text-xs">
                    Base Price: <span className="font-medium text-lime-400">${zone.basePrice}</span>
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Capacity: <span className="font-medium">{zone.capacity}</span>
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Segment: <span className="font-medium">{segment?.name || 'Unknown'}</span>
                  </p>
                  <p className="text-neutral-400 text-xs">
                    Position: <span className="font-medium">
                      {Object.keys(ZonePosition).find(key => ZonePosition[key as keyof typeof ZonePosition] === zone.position)}
                    </span>
                  </p>
                  {zone.description && (
                    <p className="text-neutral-500 text-xs line-clamp-2">{zone.description}</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {zones.length === 0 && (
        <div className="text-center py-8 text-neutral-400">
          <MapPin size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-base">No zones configured</p>
          <p className="text-sm">Create zones to organize seating within segments</p>
        </div>
      )}
    </div>
  );
};

export default ZoneEditor;