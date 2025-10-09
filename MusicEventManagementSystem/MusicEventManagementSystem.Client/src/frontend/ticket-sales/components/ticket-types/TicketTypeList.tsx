import { Card } from '../ui/card';
import { RefreshCw, Target } from 'lucide-react';
import TicketTypeCard from './TicketTypeCard';
import type { TicketTypeResponse, ZoneResponse } from '../../types';
import type { EventResponse } from '../../../event-organization/types/api/event';

interface TicketTypeListProps {
  loading: boolean;
  ticketTypes: TicketTypeResponse[];
  events: EventResponse[];
  zones: ZoneResponse[];
  eventFilter: string;
  onEdit: (ticketType: TicketTypeResponse) => void;
  onDelete: (ticketTypeId: number, ticketTypeName?: string) => void;
}

const TicketTypeList = ({
  loading,
  ticketTypes,
  events,
  zones,
  eventFilter,
  onEdit,
  onDelete
}: TicketTypeListProps) => {
  return (
    <div className="flex-1 overflow-y-auto min-h-0">
      <Card className="overflow-hidden h-full">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h3 className="text-xl font-semibold text-white">Ticket Types</h3>
          <div className="flex items-center gap-4">
            {eventFilter !== 'all' && (
              <span className="text-neutral-400 text-sm">
                Filtered by: {events.find(e => e.id.toString() === eventFilter)?.name}
              </span>
            )}
            <p className="text-neutral-400 text-sm">{ticketTypes.length} type(s) found</p>
          </div>
        </div>
        
        <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <RefreshCw className="w-10 h-10 text-lime-400 animate-spin mb-3" />
              <p className="text-neutral-400 text-base">Loading ticket types...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {ticketTypes.map((type) => (
                <TicketTypeCard
                  key={type.ticketTypeId}
                  ticketType={type}
                  events={events}
                  zones={zones}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {ticketTypes.length === 0 && !loading && (
            <div className="text-center py-16 text-neutral-400">
              <Target size={64} className="mx-auto mb-4 opacity-50" />
              <h4 className="text-xl mb-2">No ticket types found</h4>
              <p className="text-base">
                No ticket types available in the system
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default TicketTypeList;