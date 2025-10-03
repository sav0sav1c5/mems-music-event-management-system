import { KpiCard } from "../../components/ui/card";
import { Music, MapPin, AlertCircle, Calendar } from "lucide-react";
import type { PerformanceWithDetails } from "../../pages/Performances";

interface PerformanceStatsProps {
  performances: PerformanceWithDetails[];
}

const PerformanceStats = ({ performances }: PerformanceStatsProps) => {
  const totalPerformances = performances.length;
  const unassignedCount = performances.filter(p => p.venueId === 0).length;
  const assignedCount = performances.filter(p => p.venueId !== 0).length;
  const upcomingCount = performances.filter(p => p.status === 1).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      <KpiCard
        icon={Music}
        title="Total Performances"
        value={totalPerformances}
        change={12.5}
        changeType="percentage"
        color="lime"
      />
      
      <KpiCard
        icon={MapPin}
        title="Assigned to Venue"
        value={assignedCount}
        change={8.2}
        changeType="percentage"
        color="lime"
      />
      
      <KpiCard
        icon={AlertCircle}
        title="Unassigned"
        value={unassignedCount}
        change={-5.0}
        changeType="percentage"
        color="orange"
      />
      
      <KpiCard
        icon={Calendar}
        title="Upcoming"
        value={upcomingCount}
        change={15.3}
        changeType="percentage"
        color="sky"
      />
    </div>
  );
};

export default PerformanceStats;