import { Card } from '../../components/ui/card';
import { AnalyticsStats } from './AnalyticsStats';
import { RevenueTrendChart } from './RevenueTrendChart';
import { ZonePerformance } from './ZonePerformance';
import { ZoneDistribution } from './ZoneDistribution';
import { SpecialOffers } from './SpecialOffers';

interface OverviewTabProps {
  kpis: any;
  revenueData: any[];
  zonePerformance: any[];
  offerPerformance: any[];
  formatCurrency: (amount: number | undefined | null) => string;
  formatPercentage: (value: number) => string;
}

export const OverviewTab = ({
  kpis,
  revenueData,
  zonePerformance,
  offerPerformance,
  formatCurrency,
  formatPercentage
}: OverviewTabProps) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <AnalyticsStats 
        kpis={kpis} 
        formatCurrency={formatCurrency}
        formatPercentage={formatPercentage}
      />

      {/* Revenue Trend Chart */}
      <Card>
        <h3 className="text-xl font-semibold text-white mb-4">Revenue Trend</h3>
        <RevenueTrendChart revenueData={revenueData} formatCurrency={formatCurrency} />
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ZonePerformance 
          zonePerformance={zonePerformance}
          formatCurrency={formatCurrency}
          formatPercentage={formatPercentage}
        />
        
        <ZoneDistribution 
          zonePerformance={zonePerformance}
          formatCurrency={formatCurrency}
        />
      </div>

      {/* Special Offers */}
      <SpecialOffers 
        offerPerformance={offerPerformance}
        formatCurrency={formatCurrency}
        formatPercentage={formatPercentage}
      />
    </div>
  );
};