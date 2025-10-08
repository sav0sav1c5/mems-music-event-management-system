import { Card } from '../../components/ui/card';
import { DollarSign } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface PricingRuleData {
  ruleId: number;
  name: string;
  ticketsAffected: number;
  revenue: number;
  avgPriceChangePct: number;
  revenuePerTicket: number;
}

interface PricingRulesTabProps {
  pricingRules: PricingRuleData[];
  formatCurrency: (amount: number | undefined | null) => string;
}

export const PricingRulesTab = ({ pricingRules, formatCurrency }: PricingRulesTabProps) => {
  return (
    <Card>
      <h3 className="text-xl font-semibold text-white mb-6">Pricing Rules Effectiveness</h3>
      
      {pricingRules.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          <DollarSign size={48} className="mx-auto mb-4 opacity-50" />
          <p>No pricing rules data available</p>
        </div>
      )}

      <div className="space-y-4">
        {pricingRules.map((rule) => (
          <div key={rule.ruleId} className="p-6 bg-neutral-800/30 border border-neutral-700 rounded-xl hover:border-lime-500/50 transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${
                  rule.avgPriceChangePct > 0 
                    ? 'bg-green-500/20 border-green-500/30' 
                    : 'bg-red-500/20 border-red-500/30'
                }`}>
                  <DollarSign className={`w-6 h-6 ${
                    rule.avgPriceChangePct > 0 ? 'text-green-400' : 'text-red-400'
                  }`} />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{rule.name}</h4>
                  <p className="text-neutral-400 text-sm mt-1">Rule ID: {rule.ruleId}</p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  rule.avgPriceChangePct > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {rule.avgPriceChangePct > 0 ? '+' : ''}{rule.avgPriceChangePct.toFixed(1)}%
                </div>
                <p className="text-neutral-400 text-sm">Price Impact</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <span className="text-neutral-400 text-sm">Tickets Affected</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {rule.ticketsAffected.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 text-sm">Total Revenue</span>
                <div className="text-2xl font-bold text-lime-400 mt-1">
                  {formatCurrency(rule.revenue)}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 text-sm">Revenue Per Ticket</span>
                <div className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(rule.revenuePerTicket)}
                </div>
              </div>
              <div>
                <span className="text-neutral-400 text-sm">Effectiveness</span>
                <div className={`text-2xl font-bold mt-1 ${
                  rule.revenuePerTicket > 1000 ? 'text-green-400' : 
                  rule.revenuePerTicket > 500 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {rule.revenuePerTicket > 1000 ? 'High' : 
                   rule.revenuePerTicket > 500 ? 'Medium' : 'Low'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Comparison Chart */}
      {pricingRules.length > 0 && (
        <div className="mt-8">
          <h4 className="text-lg font-semibold text-white mb-4">Revenue by Pricing Rule</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pricingRules}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis 
                dataKey="name" 
                stroke="#9ca3af"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="#9ca3af" 
                label={{ value: 'Revenue', angle: -90, position: 'insideLeft' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#171717', 
                  border: '1px solid #404040',
                  borderRadius: '12px'
                }}
                formatter={(value: number) => [formatCurrency(value), 'Revenue']}
              />
              <Bar dataKey="revenue" fill="#a3e635" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
};