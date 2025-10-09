import { Card } from '../ui/card';
import { Edit, Trash2, Tag, DollarSign, TrendingUp, Target, Calendar, Ticket } from 'lucide-react';
import type { PricingRuleResponse, TicketTypeResponse } from '../../types';
import type { EventResponse } from '../../../event-organization/types/api/event';

interface PricingRuleCardProps {
  rule: PricingRuleResponse;
  events: EventResponse[];
  ticketTypes: TicketTypeResponse[];
  onEdit: (rule: PricingRuleResponse) => void;
  onDelete: (id: number, name?: string) => void;
  onView: (rule: PricingRuleResponse) => void;
}

const formatPricingCondition = (condition: number): string => {
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

const getConditionColor = (condition: number) => {
  const colors: Record<string, string> = {
    '0': 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    '1': 'text-green-400 bg-green-500/20 border-green-500/30',
    '2': 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    '3': 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
    '4': 'text-orange-400 bg-orange-500/20 border-orange-500/30',
    '5': 'text-pink-400 bg-pink-500/20 border-pink-500/30',
    '6': 'text-red-400 bg-red-500/20 border-red-500/30',
    '7': 'text-indigo-400 bg-indigo-500/20 border-indigo-500/30'
  };
  return colors[condition.toString()] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';
};

const PricingRuleCard = ({
  rule,
  events,
  ticketTypes,
  onEdit,
  onDelete,
  onView
}: PricingRuleCardProps) => {
  const relatedEvents = events.filter(event => 
    rule.eventIds?.includes(event.id)
  );
  const relatedTicketTypes = ticketTypes.filter(ticketType => 
    rule.ticketTypesIds?.includes(ticketType.ticketTypeId)
  );

  return (
    <Card
      className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200 cursor-pointer"
      onClick={() => onView(rule)}
    >
      {/* Action Buttons - Always Visible */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(rule);
          }}
          className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
          title="Edit pricing rule"
        >
          <Edit className="w-4 h-4 text-neutral-400 hover:text-lime-400 transition-colors" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(rule.pricingRuleId, rule.name);
          }}
          className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
          title="Delete pricing rule"
        >
          <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-400 transition-colors" />
        </button>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
            <Tag className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
              {rule.name || 'Unnamed Rule'}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(rule.pricingCondition)}`}>
                {formatPricingCondition(rule.pricingCondition)}
              </span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                rule.modifier > 1 
                  ? 'text-green-400 bg-green-500/20 border-green-500/30'
                  : rule.modifier < 1
                  ? 'text-blue-400 bg-blue-500/20 border-blue-500/30'
                  : 'text-gray-400 bg-gray-500/20 border-gray-500/30'
              }`}>
                {rule.modifier}x Modifier
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {rule.description && (
          <div className="text-neutral-300 text-sm">
            {rule.description}
          </div>
        )}
        
        {/* Price Range and Early Bird in one row */}
        <div className="grid grid-cols-2 gap-6">
          {/* Price Range */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-lime-400 flex-shrink-0" />
              <span className="text-lime-400 text-sm font-medium">
                ${rule.minimumPrice} - ${rule.maximumPrice}
              </span>
            </div>
            <span className="text-neutral-400 text-xs block">Price Range</span>
          </div>
          
          {/* Early Bird Discount */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">
                {rule.earlyBirdPercentage}% Early Bird
              </span>
            </div>
            <span className="text-neutral-400 text-xs block">Early Bird Discount</span>
          </div>
        </div>

        {/* Applied To - Events and Ticket Types in separate rows */}
        <div className="grid grid-cols-2 gap-6">
          {/* Events Row */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">
                Applied to {relatedEvents.length} event(s)
              </span>
            </div>
          </div>

          {/* Ticket Types Row */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 text-purple-400 flex-shrink-0" />
              <span className="text-white text-sm font-medium">
                Applied to {relatedTicketTypes.length} ticket type(s)
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PricingRuleCard;