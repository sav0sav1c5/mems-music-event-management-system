import { useState } from "react";
import { Search, X, Calendar, MapPin } from "lucide-react";
import { EventsService } from "../../../shared/services/client/eventsService";
import { Card } from "../../../ticket-sales/components/ui/card";
import { CustomSelect } from "../../../ticket-sales/components/ui/customSelect";

interface SearchFilters {
  keyword: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  city: string;
  status: string;
}

interface EventsFiltersProps {
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  showFilters: boolean;
  onSearch: () => void;
  onClear: () => void;
}

export const EventsFilters = ({
  searchFilters,
  setSearchFilters,
  showFilters,
  onSearch,
  onClear
}: EventsFiltersProps) => {
  const [quickFilterLoading, setQuickFilterLoading] = useState(false);

  const handleQuickFilter = async (filterType: string, value?: string) => {
    setQuickFilterLoading(true);
    try {
      let events;
      switch (filterType) {
        case 'featured':
          events = await EventsService.getFeaturedEvents();
          break;
        case 'city':
          events = await EventsService.getEventsByCity(value || 'Belgrade');
          break;
        default:
          events = await EventsService.getUpcomingEvents();
      }
      // This would be handled by parent component in real implementation
      console.log('Filtered events:', events);
    } catch (error) {
      console.error('Error applying quick filter:', error);
    } finally {
      setQuickFilterLoading(false);
    }
  };

  const formatDate = (date: Date | undefined): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

    const handleKeywordChange = (keyword: string) => {
    setSearchFilters({
      ...searchFilters,
      keyword
    });
  };

  const handleStartDateChange = (startDate: Date | undefined) => {
    setSearchFilters({
      ...searchFilters,
      startDate
    });
  };

  const handleEndDateChange = (endDate: Date | undefined) => {
    setSearchFilters({
      ...searchFilters,
      endDate
    });
  };

  const handleCityChange = (city: string) => {
    setSearchFilters({
      ...searchFilters,
      city
    });
  };

  const handleStatusChange = (status: string) => {
    setSearchFilters({
      ...searchFilters,
      status
    });
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search events, performers, venues..."
              value={searchFilters.keyword}
              onChange={(e) => handleKeywordChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 text-base"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={onSearch}
              className="px-6 py-3 rounded-xl bg-orange-400 text-black font-medium hover:bg-orange-500 transition-all duration-200 shadow-lg flex items-center gap-2 min-w-[120px] justify-center"
            >
              <Search size={18} />
              Search
            </button>
            <button
              onClick={onClear}
              className="px-6 py-3 rounded-xl bg-neutral-700 text-white font-medium hover:bg-neutral-600 transition-all duration-200 flex items-center gap-2 min-w-[120px] justify-center"
            >
              <X size={18} />
              Clear
            </button>
          </div>
        </div>
      </Card>

      {/* Advanced Filters */}
      {showFilters && (
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Start Date
                </div>
              </label>
              <input
                type="date"
                value={formatDate(searchFilters.startDate)}
                onChange={(e) => handleStartDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  End Date
                </div>
              </label>
              <input
                type="date"
                value={formatDate(searchFilters.endDate)}
                onChange={(e) => handleEndDateChange(e.target.value ? new Date(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  City
                </div>
              </label>
              <input
                type="text"
                value={searchFilters.city}
                onChange={(e) => handleCityChange(e.target.value)}
                placeholder="Enter city..."
                className="w-full px-3 py-2.5 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Status</label>
              <CustomSelect
                value={searchFilters.status}
                onChange={handleStatusChange}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'soldout', label: 'Sold Out' }
                ]}
                placeholder="Select Status"
                className="w-full"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Quick Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-2">
          <span className="text-neutral-400 text-sm mr-2 self-center">Quick filters:</span>
          <button
            onClick={() => handleQuickFilter('featured')}
            disabled={quickFilterLoading}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-orange-400 hover:text-black transition-all duration-200 text-sm font-medium disabled:opacity-50"
          >
            Featured
          </button>
          <button
            onClick={() => handleQuickFilter('city', 'Belgrade')}
            disabled={quickFilterLoading}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-orange-400 hover:text-black transition-all duration-200 text-sm font-medium disabled:opacity-50"
          >
            Belgrade
          </button>
          <button
            onClick={() => handleQuickFilter('city', 'Novi Sad')}
            disabled={quickFilterLoading}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-orange-400 hover:text-black transition-all duration-200 text-sm font-medium disabled:opacity-50"
          >
            Novi Sad
          </button>
          <button
            onClick={() => handleQuickFilter('upcoming')}
            disabled={quickFilterLoading}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-neutral-300 hover:bg-orange-400 hover:text-black transition-all duration-200 text-sm font-medium disabled:opacity-50"
          >
            Upcoming
          </button>
        </div>
      </Card>
    </div>
  );
};