import { Card } from '../ui/card';
import { RefreshCw, Gift } from 'lucide-react';
import SpecialOfferCard from './SpecialOfferCard';
import type { SpecialOfferResponse } from '../../types';

interface SpecialOfferListProps {
  loading: boolean;
  offers: SpecialOfferResponse[];
  onEdit: (offer: SpecialOfferResponse) => void;
  onDelete: (offerId: number) => void;
  getOfferStatus: (offer: SpecialOfferResponse) => { status: string; color: string };
}

const SpecialOfferList = ({
  loading,
  offers,
  onEdit,
  onDelete,
  getOfferStatus
}: SpecialOfferListProps) => {
  return (
    <div className="flex-1 overflow-y-auto">
      <Card className="overflow-hidden h-full">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <h3 className="text-xl font-semibold text-white">Special Offers</h3>
          <div className="flex items-center gap-4">
            <p className="text-neutral-400 text-sm">{offers.length} offer(s) found</p>
          </div>
        </div>
        
        <div className="mt-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <RefreshCw className="w-10 h-10 text-lime-400 animate-spin mb-3" />
              <p className="text-neutral-400 text-base">Loading special offers...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {offers.map((offer) => (
                <SpecialOfferCard
                  key={offer.specialOfferId}
                  offer={offer}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  getOfferStatus={getOfferStatus}
                />
              ))}
            </div>
          )}

          {offers.length === 0 && !loading && (
            <div className="text-center py-16 text-neutral-400">
              <Gift size={64} className="mx-auto mb-4 opacity-50" />
              <h4 className="text-xl mb-2">No special offers found</h4>
              <p className="text-base">
                No special offers available in the system
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SpecialOfferList;