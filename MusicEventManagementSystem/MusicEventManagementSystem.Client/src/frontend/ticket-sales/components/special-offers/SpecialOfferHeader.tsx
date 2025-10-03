import { Plus, XCircle, Search, Filter } from 'lucide-react';
import { CustomSelect } from '../ui/customSelect';
import type { CustomSelectOption } from '../ui/customSelect';

interface SpecialOfferHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  onCreateNew: () => void;
  error: string | null;
  showPanel: boolean;
}

const formatOfferType = (offerType: number): string => {
  switch (offerType) {
    case 0: return 'Early Bird';
    case 1: return 'Student Discount';
    case 2: return 'Group Discount';
    case 3: return 'Senior Discount';
    case 4: return 'Loyalty Discount';
    case 5: return 'Season Pass';
    case 6: return 'Buy One Get One';
    case 7: return 'Percentage Off';
    case 8: return 'Fixed Amount Off';
    default: return 'Unknown';
  }
};

const SpecialOfferHeader = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onCreateNew,
  error,
  showPanel
}: SpecialOfferHeaderProps) => {
  const statusOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'expired', label: 'Expired' }
  ];

  const typeOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Types' },
    ...([0, 1, 2, 3, 4, 5, 6, 7, 8].map(type => ({
      value: type.toString(),
      label: formatOfferType(type)
    })))
  ];

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Special Offers Management</h1>
          <p className="text-neutral-400 text-sm">Manage discount offers and promotions</p>
        </div>
        
        {/* Filters integrated directly in header */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="min-w-0 flex-1 max-w-80">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
              />
            </div>
          </div>
          
          <div className="min-w-0 flex-1 max-w-40">
            <CustomSelect
              value={statusFilter}
              onChange={onStatusFilterChange}
              options={statusOptions}
              placeholder="All Status"
              icon={<Filter className="w-5 h-5 text-neutral-400" />}
            />
          </div>

          <div className="min-w-0 flex-1 max-w-60">
            <CustomSelect
              value={typeFilter}
              onChange={onTypeFilterChange}
              options={typeOptions}
              placeholder="All Types"
              icon={<Filter className="w-5 h-5 text-neutral-400" />}
            />
          </div>

          <button 
            onClick={onCreateNew}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400"
          >
            <Plus size={20} />
            New Offer
          </button>
        </div>
      </div>

      {error && !showPanel && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
          <div className="p-2 bg-red-500/20 rounded-xl">
            <XCircle size={20} className="text-red-400" />
          </div>
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default SpecialOfferHeader;