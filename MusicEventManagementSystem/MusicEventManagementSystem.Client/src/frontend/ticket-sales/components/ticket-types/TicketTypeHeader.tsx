import { Plus, Search, XCircle } from 'lucide-react';
import { CustomSelect } from '../ui/customSelect';
import type { CustomSelectOption } from '../ui/customSelect';
import type { EventResponse } from '../../../event-organization/types/api/event';

interface TicketTypeHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  eventFilter: string;
  onEventFilterChange: (value: string) => void;
  events: EventResponse[];
  onCreateNew: () => void;
  error: string | null;
  showForm: boolean;
}

const TicketTypeHeader = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  eventFilter,
  onEventFilterChange,
  events,
  onCreateNew,
  error,
  showForm
}: TicketTypeHeaderProps) => {
  const statusOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: '0', label: 'Active' },
    { value: '1', label: 'Inactive' },
    { value: '2', label: 'Sold Out' },
    { value: '3', label: 'Coming Soon' },
    { value: '4', label: 'Suspended' }
  ];

  const eventOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Events' },
    ...events.map(event => ({
      value: event.id.toString(),
      label: event.name
    }))
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Ticket Types Management</h1>
          <p className="text-neutral-400 text-sm">Manage and configure ticket types for events</p>
        </div>
        
        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="min-w-0 flex-1 max-w-80">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search ticket types by name or description..."
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
              icon={<Search className="w-5 h-5 text-neutral-400" />}
            />
          </div>

          <div className="min-w-0 flex-1 max-w-60">
            <CustomSelect
              value={eventFilter}
              onChange={onEventFilterChange}
              options={eventOptions}
              placeholder="All Events"
              icon={<Search className="w-5 h-5 text-neutral-400" />}
            />
          </div>

          <button 
            onClick={onCreateNew}
            className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400"
          >
            <Plus size={20} />
            New Ticket Type
          </button>
        </div>
      </div>

      {error && !showForm && (
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

export default TicketTypeHeader;