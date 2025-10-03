import { Card } from '../ui/card';
import { Gift, Edit, Trash2, Percent, Users, Clock } from 'lucide-react';
import type { SpecialOfferResponse } from '../../types';

interface SpecialOfferCardProps {
  offer: SpecialOfferResponse;
  onEdit: (offer: SpecialOfferResponse) => void;
  onDelete: (offerId: number) => void;
  getOfferStatus: (offer: SpecialOfferResponse) => { status: string; color: string };
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

const getOfferTypeIcon = (type: number) => {
  switch (type) {
    case 0: return Clock;
    case 1: return Users;
    case 2: return Users;
    case 3: return Users;
    case 4: return Users;
    case 5: return Gift;
    case 6: return Gift;
    case 7: return Percent;
    case 8: return Percent;
    default: return Gift;
  }
};

const SpecialOfferCard = ({
  offer,
  onEdit,
  onDelete,
  getOfferStatus
}: SpecialOfferCardProps) => {
  const status = getOfferStatus(offer);
  const TypeIcon = getOfferTypeIcon(offer.offerType);

  return (
    <Card
      className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200"
    >
      {/* Action Buttons - Always Visible */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(offer);
          }}
          className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
          title="Edit offer"
        >
          <Edit className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(offer.specialOfferId);
          }}
          className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
          title="Delete offer"
        >
          <Trash2 className="w-5 h-5 text-neutral-400 hover:text-red-400 transition-colors" />
        </button>
      </div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
            <TypeIcon className="w-6 h-6 text-lime-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
              {offer.name || 'Unnamed Offer'}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                {formatOfferType(offer.offerType)}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {offer.description && (
          <div className="text-neutral-300 text-sm line-clamp-2">
            {offer.description}
          </div>
        )}
        
        {/* Discount Value */}
        <div className="flex items-start gap-3">
          <Percent className="w-5 h-5 text-lime-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-lime-400 text-sm font-medium block">{offer.discountValue}% Discount</span>
            <span className="text-neutral-400 text-xs">Discount Value</span>
          </div>
        </div>
        
        {/* Ticket Limit */}
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-white text-sm font-medium block">{offer.ticketLimit.toLocaleString()} tickets</span>
            <span className="text-neutral-400 text-xs">Ticket Limit</span>
          </div>
        </div>
        
        {/* Date Range */}
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-neutral-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-white text-sm font-medium block">
              {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
            </span>
            <span className="text-neutral-400 text-xs">Valid Period</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SpecialOfferCard;