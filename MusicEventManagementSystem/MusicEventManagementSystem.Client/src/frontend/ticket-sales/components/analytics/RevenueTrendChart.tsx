import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface RevenueDataPoint {
  date: string;
  revenue: number;
  tickets: number;
}

interface RevenueTrendChartProps {
  revenueData: RevenueDataPoint[];
  formatCurrency: (amount: number | undefined | null) => string;
}

export const RevenueTrendChart = ({ revenueData, formatCurrency }: RevenueTrendChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={revenueData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
        <XAxis 
          dataKey="date" 
          stroke="#9ca3af" 
          tickFormatter={(value) => new Date(value).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit' })}
        />
        <YAxis stroke="#9ca3af" tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#171717', 
            border: '1px solid #404040',
            borderRadius: '12px'
          }}
          formatter={(value: number) => [formatCurrency(value), 'Revenue']}
        />
        <Area type="monotone" dataKey="revenue" stroke="#a3e635" fill="#a3e635" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer>
  );
};