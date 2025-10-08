import { KpiCard } from '../../components/ui/card';
import { DollarSign, Ticket, TrendingUp, MapPin } from 'lucide-react';

interface DashboardKPIs {
  totalRevenue: number;
  totalTicketsSold: number;
  averageTicketPrice: number;
  conversionRate: number;
  capacityUtilization: number;
  revenueGrowth: number;
}

interface AnalyticsStatsProps {
  kpis: DashboardKPIs;
  formatCurrency: (amount: number | undefined | null) => string;
  formatPercentage: (value: number) => string;
}

export const AnalyticsStats = ({ kpis, formatCurrency, formatPercentage }: AnalyticsStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <KpiCard
        icon={DollarSign}
        title="Total Revenue"
        value={formatCurrency(kpis.totalRevenue)}
        change={kpis.revenueGrowth}
        changeType="percentage"
        color="lime"
      />
      <KpiCard
        icon={Ticket}
        title="Tickets Sold"
        value={kpis.totalTicketsSold.toLocaleString()}
        change={8.7}
        changeType="percentage"
        color="lime"
      />
      <KpiCard
        icon={TrendingUp}
        title="Conversion Rate"
        value={formatPercentage(kpis.conversionRate)}
        change={2.1}
        changeType="percentage"
        color="lime"
      />
      <KpiCard
        icon={MapPin}
        title="Capacity Utilization"
        value={formatPercentage(kpis.capacityUtilization)}
        change={5.3}
        changeType="percentage"
        color="lime"
      />
    </div>
  );
};