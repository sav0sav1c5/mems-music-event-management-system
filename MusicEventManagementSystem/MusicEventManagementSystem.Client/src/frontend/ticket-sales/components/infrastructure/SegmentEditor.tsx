import { useState } from 'react';
import { Plus, Edit, X, Users } from 'lucide-react';
import { Card } from '../ui/card';
import { CustomSelect } from '../ui/customSelect';
import SegmentService from '../../services/segmentService';
import type { SegmentResponse } from '../../types/api/segment';
import type { SegmentCreateForm } from '../../types/forms/segment';
import { SegmentType } from '../../types/enums/TicketSales';
import { toast } from 'react-toastify';
import { getSegmentTypeName } from '../../utils/venueUtils';

interface SegmentEditorProps {
  segments: SegmentResponse[];
  venueId: number;
  onSegmentsUpdate: (segments: SegmentResponse[]) => void;
}

const SegmentEditor = ({ segments, venueId, onSegmentsUpdate }: SegmentEditorProps) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SegmentResponse | null>(null);
  const [segmentForm, setSegmentForm] = useState<SegmentCreateForm>({
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
      onSegmentsUpdate([...segments, created]);
      setShowCreateForm(false);
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

  const handleEditSegment = (segment: SegmentResponse) => {
    setEditingSegment(segment);
    setSegmentForm({
      name: segment.name || '',
      description: segment.description || '',
      capacity: segment.capacity,
      segmentType: segment.segmentType,
      venueId: venueId
    });
    setShowCreateForm(false);
  };

  const handleUpdateSegment = async () => {
    if (!editingSegment) return;

    try {
      const updateData = {
        name: segmentForm.name,
        description: segmentForm.description,
        capacity: segmentForm.capacity,
        segmentType: segmentForm.segmentType
      };

      const updated = await SegmentService.updateSegment(editingSegment.segmentId, updateData);
      onSegmentsUpdate(segments.map(s => s.segmentId === editingSegment.segmentId ? updated : s));
      setEditingSegment(null);
      setSegmentForm({
        name: '',
        description: '',
        capacity: 0,
        segmentType: SegmentType.Standard,
        venueId: venueId
      });
      
      toast.success('Segment updated successfully');
    } catch (error) {
      console.error('Failed to update segment:', error);
      toast.error('Failed to update segment');
    }
  };

  const handleDeleteSegment = async (segmentId: number) => {
    if (!confirm('Are you sure you want to delete this segment? This action cannot be undone.')) {
      return;
    }

    try {
      await SegmentService.deleteSegment(segmentId);
      onSegmentsUpdate(segments.filter(s => s.segmentId !== segmentId));
      toast.success('Segment deleted successfully');
    } catch (error) {
      console.error('Failed to delete segment:', error);
      toast.error('Failed to delete segment');
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingSegment(null);
    setSegmentForm({
      name: '',
      description: '',
      capacity: 0,
      segmentType: SegmentType.Standard,
      venueId: venueId
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Segments Configuration</h3>
          <p className="text-neutral-400 text-sm">Manage seating segments</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
        >
          <Plus size={18} />
          Add Segment
        </button>
      </div>

      {(showCreateForm || editingSegment) && (
        <Card className="p-4">
          <h4 className="font-semibold text-white mb-3">
            {editingSegment ? 'Edit Segment' : 'Create New Segment'}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Name *</label>
              <input
                type="text"
                placeholder="VIP Section"
                value={segmentForm.name}
                onChange={(e) => setSegmentForm({ ...segmentForm, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
              />
            </div>
            
            <div>
              <label className="text-xs text-neutral-400 mb-1 block">Description</label>
              <textarea
                placeholder="Segment description..."
                value={segmentForm.description || ''}
                onChange={(e) => setSegmentForm({ ...segmentForm, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Capacity *</label>
                <input
                  type="number"
                  placeholder="100"
                  value={segmentForm.capacity}
                  onChange={(e) => setSegmentForm({ ...segmentForm, capacity: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 text-sm"
                  min="1"
                />
              </div>
              
              <div>
                <label className="text-xs text-neutral-400 mb-1 block">Segment Type *</label>
                <CustomSelect
                  value={segmentForm.segmentType.toString()}
                  onChange={(value) => setSegmentForm({ ...segmentForm, segmentType: parseInt(value) as SegmentType })}
                  options={segmentTypeOptions}
                  placeholder="Select Type"
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={editingSegment ? handleUpdateSegment : handleCreateSegment}
              disabled={!segmentForm.name || segmentForm.capacity <= 0}
              className="px-4 py-2 rounded-xl bg-lime-500 text-black font-medium hover:bg-lime-400 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed transition-all text-sm"
            >
              {editingSegment ? 'Update Segment' : 'Create Segment'}
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
        {segments.map((segment) => (
          <Card key={segment.segmentId} hover={true} className="p-3">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded bg-lime-500 mr-2"></div>
                  <h4 className="font-semibold text-white text-sm">{segment.name}</h4>
                </div>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEditSegment(segment)}
                    className="text-neutral-400 hover:text-lime-400 transition-colors p-1"
                    title="Edit segment"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteSegment(segment.segmentId)}
                    className="text-neutral-400 hover:text-red-400 transition-colors p-1"
                    title="Delete segment"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <p className="text-neutral-400 text-xs">
                  Capacity: <span className="font-medium">{segment.capacity}</span>
                </p>
                <p className="text-neutral-400 text-xs">
                  Type: <span className="font-medium">{getSegmentTypeName(segment.segmentType)}</span>
                </p>
                {segment.description && (
                  <p className="text-neutral-400 text-xs font-medium line-clamp-2">Description: {segment.description}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {segments.length === 0 && (
        <div className="text-center py-8 text-neutral-400">
          <Users size={48} className="mx-auto mb-3 opacity-50" />
          <p className="text-base">No segments configured</p>
          <p className="text-sm">Create your first segment to get started</p>
        </div>
      )}
    </div>
  );
};

export default SegmentEditor;