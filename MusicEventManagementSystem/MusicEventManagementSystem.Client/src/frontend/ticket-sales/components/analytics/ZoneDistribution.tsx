import { Card } from '../../components/ui/card';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface ZoneDistributionProps {
  zonePerformance: any[];
  formatCurrency: (amount: number | undefined | null) => string;
}

export const ZoneDistribution = ({ zonePerformance, formatCurrency }: ZoneDistributionProps) => {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-white mb-4">Zone Revenue Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={zonePerformance.slice(0, 5)}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={120}
            paddingAngle={5}
            dataKey="revenue"
            nameKey="zoneName"
          >
            {zonePerformance.slice(0, 5).map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#171717', border: '1px solid #404040', borderRadius: '12px' }}
            formatter={(value: number) => [formatCurrency(value), 'Revenue']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-4 mt-4">
        {zonePerformance.slice(0, 5).map((item) => (
          <div key={item.zoneName} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-neutral-400 text-sm truncate">{item.zoneName}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};