import { Card } from "../../components/ui/card";
import { MapPin, Eye, Music, Calendar, AlertCircle } from "lucide-react";
import type { PerformanceWithDetails } from "../../pages/Performances";

const PerformanceStatus = {
  1: { label: "Planned", color: "text-blue-400 bg-blue-500/20 border-blue-500/30" },
  2: { label: "In Progress", color: "text-yellow-400 bg-yellow-500/20 border-yellow-500/30" },
  3: { label: "Completed", color: "text-green-400 bg-green-500/20 border-green-500/30" },
  4: { label: "Cancelled", color: "text-red-400 bg-red-500/20 border-red-500/30" }
};

interface PerformanceCardProps {
  performance: PerformanceWithDetails;
  onVenueAssign: (performance: PerformanceWithDetails) => void;
  onPerformerView: (performance: PerformanceWithDetails) => void;
  getGenreColor: (genre: string) => string;
  formatDateTime: (date: Date) => string;
  formatDuration: (start: Date, end: Date) => string;
}

const PerformanceCard = ({
  performance,
  onVenueAssign,
  onPerformerView,
  getGenreColor,
  formatDateTime,
  formatDuration
}: PerformanceCardProps) => {
  return (
    <Card
      className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200"
    >
      {/* Action Buttons - Always Visible */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPerformerView(performance);
          }}
          className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-blue-500/20 hover:border-blue-500/50 transition-all duration-200"
          title="View performer details"
        >
          <Eye className="w-5 h-5 text-neutral-400 hover:text-blue-400 transition-colors" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onVenueAssign(performance);
          }}
          className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
          title="Assign venue"
        >
          <MapPin className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
        </button>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
            <Music className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
              {performance.performer?.name || 'Unknown Performer'}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getGenreColor(performance.performer?.genre || '')}`}>
                {performance.performer?.genre || "N/A"}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.color}`}>
                {PerformanceStatus[performance.status as keyof typeof PerformanceStatus]?.label}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {/* Event Information */}
        {performance.event && (
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-white text-sm font-medium block">{performance.event.name}</span>
              <span className="text-neutral-400 text-xs">
                {formatDateTime(performance.startTime)} - {formatDateTime(performance.endTime)}
              </span>
            </div>
          </div>
        )}
        
        {/* Venue Information */}
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
          {performance.venue ? (
            <div>
              <span className="text-lime-400 text-sm font-medium block">{performance.venue.name}</span>
              <span className="text-neutral-400 text-xs">
                {performance.venue.city} • {performance.venue.capacity.toLocaleString()} capacity
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-400" />
              <span className="text-orange-400 text-sm font-medium">Venue Not Assigned</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PerformanceCard;