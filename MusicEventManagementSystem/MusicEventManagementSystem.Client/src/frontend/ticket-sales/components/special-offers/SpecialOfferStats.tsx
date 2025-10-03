import { KpiCard } from '../ui/card';
import { Gift, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { SpecialOfferResponse } from '../../types';

interface SpecialOfferStatsProps {
  specialOffers: SpecialOfferResponse[];
}

const SpecialOfferStats = ({ specialOffers }: SpecialOfferStatsProps) => {
  const getOfferStatus = (offer: SpecialOfferResponse) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'expired';
    return 'active';
  };

  const activeCount = specialOffers.filter(offer => getOfferStatus(offer) === 'active').length;
  const upcomingCount = specialOffers.filter(offer => getOfferStatus(offer) === 'upcoming').length;
  const expiredCount = specialOffers.filter(offer => getOfferStatus(offer) === 'expired').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      <KpiCard
        icon={Gift}
        title="Total Offers"
        value={specialOffers.length.toString()}
        change={8.2}
        changeType="percentage"
        color="lime"
      />
      
      <KpiCard
        icon={CheckCircle}
        title="Active Offers"
        value={activeCount.toString()}
        change={12.5}
        changeType="percentage"
        color="lime"
      />
      
      <KpiCard
        icon={Clock}
        title="Upcoming"
        value={upcomingCount.toString()}
        change={15.3}
        changeType="percentage"
        color="sky"
      />
      
      <KpiCard
        icon={XCircle}
        title="Expired"
        value={expiredCount.toString()}
        change={-3.2}
        changeType="percentage"
        color="orange"
      />
    </div>
  );
};

export default SpecialOfferStats;