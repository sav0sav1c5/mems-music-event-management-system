import { Card } from '../../components/ui/card';
import { Gift, Users, DollarSign, TrendingUp } from 'lucide-react';

interface SpecialOffersProps {
  offerPerformance: any[];
  formatCurrency: (amount: number | undefined | null) => string;
  formatPercentage: (value: number) => string;
}

export const SpecialOffers = ({ offerPerformance, formatCurrency, formatPercentage }: SpecialOffersProps) => {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-white mb-4">Special Offers Performance</h3>
      <div className="space-y-4">
        {offerPerformance.map((offer) => (
          <div key={offer.offerId} className="p-6 bg-neutral-800/30 border border-neutral-700 rounded-xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
                  <Gift className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{offer.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {offer.type}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400 border-green-500/30">
                      ROI: {formatPercentage(offer.roi / 100)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400" />
                <span>Usage: {offer.usageCount.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-lime-400" />
                <span className="text-lime-400">Revenue: {formatCurrency(offer.revenueImpact)}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-red-400" />
                <span className="text-red-400">Discount: -{formatCurrency(offer.discountGiven)}</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-lime-400" />
                <span className="text-lime-400">Net: {formatCurrency(offer.revenueImpact - offer.discountGiven)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};