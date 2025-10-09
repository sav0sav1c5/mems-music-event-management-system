import { Filter } from "lucide-react";

interface EventsHeaderProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export const EventsHeader = ({ showFilters, setShowFilters }: EventsHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Browse Events</h1>
          <p className="text-neutral-400 text-sm">Discover amazing events near you</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base ${
              showFilters 
                ? "bg-orange-400 text-black hover:bg-orange-500" 
                : "bg-neutral-800 text-white hover:bg-neutral-700"
            }`}
          >
            <Filter size={20} />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>
        </div>
      </div>
    </div>
  );
};