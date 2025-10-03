import { Filter, MapPin, Calendar } from "lucide-react";
import { CustomSelect } from "../../components/ui/customSelect";

interface PerformanceHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterVenue: string;
  onFilterVenueChange: (value: string) => void;
  filterStatus: number | null;
  onFilterStatusChange: (value: number | null) => void;
}

const PerformanceHeader = ({
  searchTerm,
  onSearchChange,
  filterVenue,
  onFilterVenueChange,
  filterStatus,
  onFilterStatusChange
}: PerformanceHeaderProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Performance Management</h1>
          <p className="text-neutral-400 text-sm">Manage performances and assign venues</p>
        </div>
        
        {/* Search and Filter - Now included in header */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="min-w-0 flex-1 max-w-80">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search performances..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
              />
            </div>
          </div>
          
          <div className="min-w-0 flex-1 max-w-40">
            <CustomSelect
              value={filterVenue}
              onChange={onFilterVenueChange}
              options={[
                { value: 'all', label: 'All Venues' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'unassigned', label: 'Unassigned' }
              ]}
              placeholder="Venue Status"
              icon={<MapPin className="w-5 h-5 text-neutral-400" />}
            />
          </div>

          <div className="min-w-0 flex-1 max-w-40">
            <CustomSelect
              value={filterStatus === null ? "all" : filterStatus.toString()}
              onChange={(value) => onFilterStatusChange(value === "all" ? null : parseInt(value))}
              options={[
                { value: 'all', label: 'All Status' },
                { value: '1', label: 'Planned' },
                { value: '2', label: 'In Progress' },
                { value: '3', label: 'Completed' },
                { value: '4', label: 'Cancelled' }
              ]}
              placeholder="Performance Status"
              icon={<Calendar className="w-5 h-5 text-neutral-400" />}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceHeader;