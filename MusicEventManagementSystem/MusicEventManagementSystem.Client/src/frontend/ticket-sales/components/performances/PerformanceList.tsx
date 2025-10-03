import { Card } from "../../components/ui/card";
import { RefreshCw, Music } from "lucide-react";
import PerformanceCard from "./PerformanceCard";
import type { PerformanceWithDetails } from "../../pages/Performances";

interface PerformanceListProps {
  performances: PerformanceWithDetails[];
  loading: boolean;
  onVenueAssign: (performance: PerformanceWithDetails) => void;
  onPerformerView: (performance: PerformanceWithDetails) => void;
  getGenreColor: (genre: string) => string;
  formatDateTime: (date: Date) => string;
  formatDuration: (start: Date, end: Date) => string;
}

const PerformanceList = ({
  performances,
  loading,
  onVenueAssign,
  onPerformerView,
  getGenreColor,
  formatDateTime,
  formatDuration
}: PerformanceListProps) => {
  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <Card className="overflow-hidden h-full">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h3 className="text-xl font-semibold text-white">Performances</h3>
          <div className="flex items-center gap-4">
            <p className="text-neutral-400 text-sm">{performances.length} performance(s) found</p>
          </div>
        </div>
        
        <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <RefreshCw className="w-10 h-10 text-lime-400 animate-spin mb-3" />
              <p className="text-neutral-400 text-base">Loading performances...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {performances.map((performance) => (
                <PerformanceCard
                  key={performance.id}
                  performance={performance}
                  onVenueAssign={onVenueAssign}
                  onPerformerView={onPerformerView}
                  getGenreColor={getGenreColor}
                  formatDateTime={formatDateTime}
                  formatDuration={formatDuration}
                />
              ))}
            </div>
          )}

          {performances.length === 0 && !loading && (
            <div className="text-center py-16 text-neutral-400">
              <Music size={64} className="mx-auto mb-4 opacity-50" />
              <h4 className="text-xl mb-2">No performances found</h4>
              <p className="text-base">
                {performances.length === 0 
                  ? 'Try adjusting your search criteria or filters' 
                  : 'No performances available in the system'
                }
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PerformanceList;