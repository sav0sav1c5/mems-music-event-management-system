import { Plus, XCircle, Search, Filter, Calendar } from 'lucide-react';
import { CustomSelect } from '../ui/customSelect';
import type { CustomSelectOption } from '../ui/customSelect';
import type { EventResponse } from '../../../event-organization/types/api/event';
import { PricingCondition } from '../../types/enums/TicketSales';

interface PricingRuleHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  conditionFilter: string;
  onConditionFilterChange: (value: string) => void;
  eventFilter: string;
  onEventFilterChange: (value: string) => void;
  events: EventResponse[];
  onCreateNew: () => void;
  error: string | null;
}

const formatPricingCondition = (condition: PricingCondition): string => {
  switch (condition) {
    case 0: return 'Time Based Early Bird';
    case 1: return 'Occupancy Based';
    case 2: return 'Date Proximity';
    case 3: return 'Weather Dependent';
    case 4: return 'Day of Week';
    case 5: return 'Seasonal Discount';
    case 6: return 'VIP Upgrade';
    case 7: return 'Last Minute';
    default: return 'Unknown';
  }
};

const PricingRuleHeader = ({
  searchTerm,
  onSearchChange,
  conditionFilter,
  onConditionFilterChange,
  eventFilter,
  onEventFilterChange,
  events,
  onCreateNew,
  error
}: PricingRuleHeaderProps) => {
  const conditionOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Conditions' },
    ...(Object.values(PricingCondition)
      .filter(value => typeof value === 'number')
      .map(condition => ({
        value: condition.toString(),
        label: formatPricingCondition(condition as PricingCondition)
      })))
  ];

  const eventOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Events' },
    ...events.map(event => ({
      value: event.id.toString(),
      label: event.name
    }))
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Pricing Rules Management</h1>
          <p className="text-neutral-400 text-sm">Manage dynamic pricing rules and modifiers</p>
        </div>
        
        {/* Search and Filter - Integrated in Header */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="min-w-0 flex-1 max-w-80">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search pricing rules..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
              />
            </div>
          </div>
          
          <div className="min-w-0 flex-1 max-w-60">
            <CustomSelect
              value={conditionFilter}
              onChange={onConditionFilterChange}
              options={conditionOptions}
              placeholder="All Conditions"
              icon={<Filter className="w-5 h-5 text-neutral-400" />}
            />
          </div>

          <div className="min-w-0 flex-1 max-w-60">
            <CustomSelect
              value={eventFilter}
              onChange={onEventFilterChange}
              options={eventOptions}
              placeholder="All Events"
              icon={<Calendar className="w-5 h-5 text-neutral-400" />}
            />
          </div>

          <button 
            onClick={onCreateNew}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400"
          >
            <Plus size={20} />
            New Rule
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mt-4">
          <div className="p-2 bg-red-500/20 rounded-xl">
            <XCircle size={20} className="text-red-400" />
          </div>
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default PricingRuleHeader;