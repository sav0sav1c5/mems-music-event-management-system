import { KpiCard } from '../ui/card';
import { Tag, TrendingUp, DollarSign, Target } from 'lucide-react';
import type { PricingRuleResponse } from '../../types';

interface PricingRuleStatsProps {
  pricingRules: PricingRuleResponse[];
}

const PricingRuleStats = ({ pricingRules }: PricingRuleStatsProps) => {
  const totalRules = pricingRules.length;
  const activeRules = pricingRules.filter(rule => rule.modifier > 1).length;
  const discountRules = pricingRules.filter(rule => rule.modifier < 1).length;
  const avgModifier = pricingRules.length > 0 
    ? (pricingRules.reduce((sum, rule) => sum + rule.modifier, 0) / pricingRules.length).toFixed(2)
    : '0.00';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
      <KpiCard
        icon={Tag}
        title="Total Rules"
        value={totalRules.toString()}
        change={5.1}
        changeType="percentage"
        color="lime"
      />
      
      <KpiCard
        icon={TrendingUp}
        title="Active Rules"
        value={activeRules.toString()}
        change={3.2}
        changeType="percentage"
        color="lime"
      />
      
      <KpiCard
        icon={DollarSign}
        title="Discount Rules"
        value={discountRules.toString()}
        change={4.5}
        changeType="percentage"
        color="sky"
      />
      
      <KpiCard
        icon={Target}
        title="Avg Modifier"
        value={`${avgModifier}x`}
        change={2.1}
        changeType="percentage"
        color="orange"
      />
    </div>
  );
};

export default PricingRuleStats;