import { Card } from '../../components/ui/card';
import { MapPin } from 'lucide-react';

interface ZonePerformanceProps {
  zonePerformance: any[];
  formatCurrency: (amount: number | undefined | null) => string;
  formatPercentage: (value: number) => string;
}

export const ZonePerformance = ({ zonePerformance, formatCurrency, formatPercentage }: ZonePerformanceProps) => {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-white mb-4">Top Zones Performance</h3>
      <div className="space-y-4">
        {zonePerformance.slice(0, 5).map((zone) => (
          <div key={zone.zoneName} className="p-4 bg-neutral-800/30 border border-neutral-700 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="bg-lime-500/20 p-2 rounded-xl border border-lime-500/30">
                  <MapPin className="w-4 h-4 text-lime-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{zone.zoneName}</h4>
                  <p className="text-neutral-400 text-sm">Tickets: {zone.ticketsSold}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                zone.occupancyRate >= 80 ? 'bg-green-500/20 text-green-400' :
                zone.occupancyRate >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              } border`}>
                {formatPercentage(zone.occupancyRate)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-neutral-400">Revenue</span>
                <div className="text-lime-400 font-medium">{formatCurrency(zone.revenue)}</div>
              </div>
              <div>
                <span className="text-neutral-400">Avg Price</span>
                <div className="text-white font-medium">{formatCurrency(zone.avgPrice)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};