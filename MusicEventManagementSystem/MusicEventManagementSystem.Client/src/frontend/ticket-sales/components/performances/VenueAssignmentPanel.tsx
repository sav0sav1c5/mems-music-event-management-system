import { Card } from "../../components/ui/card";
import { X, AlertCircle } from "lucide-react";
import { CustomSelect } from "../../components/ui/customSelect";
import type { PerformanceWithDetails } from "../../pages/Performances";
import type { VenueResponse } from "../../types/api/venue";

const PerformanceStatus = {
  1: { label: "Planned", color: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
  2: { label: "In Progress", color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30" },
  3: { label: "Completed", color: "text-green-400 bg-green-500/20 border-green-500/30" },
  4: { label: "Cancelled", color: "text-red-400 bg-red-500/20 border-red-500/30" }
};

interface VenueAssignmentPanelProps {
  performance: PerformanceWithDetails;
  venues: VenueResponse[];
  selectedVenueId: number;
  onVenueChange: (venueId: number) => void;
  onSubmit: () => void;
  onCancel: () => void;
  submitting: boolean;
  error: string;
  getGenreColor: (genre: string) => string;
  formatDateTime: (date: Date) => string;
  formatDuration: (start: Date, end: Date) => string;
}

const VenueAssignmentPanel = ({
  performance,
  venues,
  selectedVenueId,
  onVenueChange,
  onSubmit,
  onCancel,
  submitting,
  error,
  getGenreColor,
  formatDateTime,
  formatDuration
}: VenueAssignmentPanelProps) => {
  return (
    <div className="w-2/5 transition-all duration-300">
      <Card className="overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900/60 backdrop-blur-sm h-full">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
          <h2 className="text-xl font-bold text-lime-400">Assign Venue</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 overflow-y-auto px-1">
          {/* Performance Summary */}
          <div className="bg-neutral-800/30 rounded-xl p-4 border border-neutral-700">
            <h4 className="text-white font-semibold text-lg mb-3">Performance Details</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Performer:</span>
                <span className="text-white font-medium">{performance.performer?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Genre:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getGenreColor(performance.performer?.genre || '')}`}>
                  {performance.performer?.genre || "N/A"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Start Time:</span>
                <span className="text-white font-medium">{formatDateTime(performance.startTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Duration:</span>
                <span className="text-white font-medium">{formatDuration(performance.startTime, performance.endTime)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">Status:</span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.color}`}>
                  {PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.label}
                </span>
              </div>
            </div>
          </div>

          {/* Venue Selection Form */}
          <div>
            <label className="block text-sm font-medium mb-3 text-neutral-300">Select Venue *</label>
            <CustomSelect
              value={selectedVenueId.toString()}
              onChange={(value) => onVenueChange(parseInt(value))}
              options={[
                { value: '0', label: 'Select Venue' },
                ...venues.map(v => ({ 
                  value: v.venueId.toString(), 
                  label: `${v.name} (${v.city} • ${v.capacity.toLocaleString()} capacity)` 
                }))
              ]}
              placeholder="Select Venue"
              className="w-full"
            />
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            </div>
          )}

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
              onClick={onSubmit}
              disabled={submitting || selectedVenueId === 0}
              className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold"
            >
              {submitting ? 'Assigning...' : 'Assign Venue'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VenueAssignmentPanel;