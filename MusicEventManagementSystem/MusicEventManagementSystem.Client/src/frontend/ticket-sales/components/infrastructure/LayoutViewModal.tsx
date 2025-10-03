import { X } from 'lucide-react';
import type { VenueResponse } from '../../types/api/venue';
import type { SegmentResponse } from '../../types/api/segment';
import type { ZoneResponse } from '../../types/api/zone';
import VenueLayoutPreview from './VenueLayoutPreview';

interface LayoutViewModalProps {
  venue: VenueResponse;
  segments: SegmentResponse[];
  zones: ZoneResponse[];
  onClose: () => void;
}

const LayoutViewModal = ({ venue, segments, zones, onClose }: LayoutViewModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-neutral-800">
          <h2 className="text-2xl font-bold text-white">
            {venue.name} - Layout View
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <VenueLayoutPreview venue={venue} segments={segments} zones={zones} />
        </div>
      </div>
    </div>
  );
};

export default LayoutViewModal;