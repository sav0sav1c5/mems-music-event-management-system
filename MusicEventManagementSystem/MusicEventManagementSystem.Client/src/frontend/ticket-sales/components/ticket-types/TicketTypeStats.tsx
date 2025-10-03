import { KpiCard } from '../ui/card';
import { Target, Users, XCircle, CheckCircle } from 'lucide-react';
import type { TicketTypeResponse } from '../../types';

interface TicketTypeStatsProps {
  ticketTypes: TicketTypeResponse[];
  previousStats: {
    activeTicketTypes: number;
    availableTickets: number;
    soldOut: number;
    totalRevenue: number;
  };
}

const TicketTypeStats = ({ ticketTypes, previousStats }: TicketTypeStatsProps) => {
  const getOverviewStats = () => {
    const activeTicketTypes = ticketTypes.filter(type => type.status === 0);
    const totalAvailableTickets = ticketTypes.reduce((sum, type) => sum + type.availableQuantity, 0);
    const soldOutTypes = ticketTypes.filter(type => type.status === 2);

    const calculateChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const activeChange = calculateChange(activeTicketTypes.length, previousStats.activeTicketTypes);
    const availableChange = calculateChange(totalAvailableTickets, previousStats.availableTickets);
    const soldOutChange = calculateChange(soldOutTypes.length, previousStats.soldOut);

    return [
      {
        title: "Active Types",
        value: activeTicketTypes.length.toString(),
        change: activeChange,
        trend: activeChange >= 0 ? "up" as const : "down" as const,
        icon: Target,
        color: "lime" as const
      },
      {
        title: "Available Tickets",
        value: totalAvailableTickets.toString(),
        change: availableChange,
        trend: availableChange >= 0 ? "up" as const : "down" as const,
        icon: Users,
        color: "lime" as const
      },
      {
        title: "Sold Out",
        value: soldOutTypes.length.toString(),
        change: soldOutChange,
        trend: soldOutChange >= 0 ? "down" as const : "up" as const,
        icon: XCircle,
        color: "orange" as const
      },
      {
        title: "Total Types",
        value: ticketTypes.length.toString(),
        change: 0,
        trend: "up" as const,
        icon: CheckCircle,
        color: "sky" as const
      }
    ];
  };

  const overviewStats = getOverviewStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      {overviewStats.map((stat, index) => (
        <KpiCard
          key={index}
          icon={stat.icon}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType="percentage"
          color={stat.color}
        />
      ))}
    </div>
  );
};

export default TicketTypeStats;