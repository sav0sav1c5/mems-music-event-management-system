import { Card } from '../ui/card';
import { FileText, DollarSign, MapPin, TrendingUp, Gift, Settings, Users, Activity } from 'lucide-react';

interface SalesAnalysisResult {
  metricName: string;
  metricValue: number;
  metricUnit: string;
  additionalInfo?: any;
}

interface ReportSection {
  [key: string]: SalesAnalysisResult[];
}

interface ComprehensiveReportProps {
  reportData: ReportSection;
  formatCurrency: (amount: number | undefined | null) => string;
  formatPercentage: (value: number) => string;
}

export const ComprehensiveReport = ({ 
  reportData, 
  formatCurrency, 
  formatPercentage 
}: ComprehensiveReportProps) => {
  
  const getSectionIcon = (sectionName: string) => {
    switch (sectionName) {
      case 'BASIC_METRICS': return <DollarSign className="w-5 h-5" />;
      case 'ZONE_ANALYSIS': return <MapPin className="w-5 h-5" />;
      case 'PRICING_RULES_EFFICIENCY': return <Settings className="w-5 h-5" />;
      case 'SPECIAL_OFFERS_PERFORMANCE': return <Gift className="w-5 h-5" />;
      case 'TREND_ANALYSIS': return <TrendingUp className="w-5 h-5" />;
      case 'EVENT_COMPARISON': return <Users className="w-5 h-5" />;
      case 'REVENUE_OPTIMIZATION': return <Activity className="w-5 h-5" />;
      case 'CURSOR_STATISTICS': return <FileText className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const formatSectionName = (sectionName: string) => {
    return sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const renderMetricValue = (metric: SalesAnalysisResult) => {
    if (metric.metricUnit === 'RSD') {
      return formatCurrency(metric.metricValue);
    } else if (metric.metricUnit.includes('%') || metric.metricName.toLowerCase().includes('rate')) {
      return formatPercentage(metric.metricValue);
    } else {
      return `${metric.metricValue.toLocaleString()} ${metric.metricUnit}`;
    }
  };

  const getReadableLabel = (key: string): string | null => {
    const labelMap: { [key: string]: string } = {
      'avg_price': 'Average Price',
      'base_price': 'Base Price',
      'tickets_sold': 'Tickets Sold',
      'occupancy_rate': 'Occupancy',
      'price_variance': 'Price Variance',
      'zone_name': 'Zone',
      'revenue': 'Revenue',
      'transaction_status': 'Status',
      'period_start': 'Period Start',
      'period_end': 'Period End',
      'status_filter': 'Filter',
      'calculation': 'Calculation Method'
    };
    
    // Skip technical fields
    const skipFields = ['zone_id', 'position', 'zone_rank', 'id'];
    if (skipFields.includes(key.toLowerCase())) return null;
    
    return labelMap[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatValue = (key: string, value: any): string => {
    if (value === null || value === undefined) return 'N/A';
    
    if (typeof value === 'number') {
      if (key.includes('price') || key.includes('revenue')) {
        return formatCurrency(value);
      }
      if (key.includes('rate') || key.includes('pct')) {
        return formatPercentage(value);
      }
      return value.toLocaleString();
    }
    
    return String(value);
  };

  const renderAdditionalInfo = (info: any) => {
    if (!info) return null;

    try {
      const parsedInfo = typeof info === 'string' ? JSON.parse(info) : info;
      const entries = Object.entries(parsedInfo)
        .map(([key, value]) => ({ key, value, label: getReadableLabel(key) }))
        .filter(item => item.label !== null);
      
      if (entries.length === 0) return null;
      
      return (
        <div className="mt-4 pt-4 border-t border-neutral-700">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
            {entries.map(({ key, value, label }) => (
              <div key={key} className="flex justify-between items-baseline">
                <span className="text-neutral-400 text-sm">
                  {label}
                </span>
                <span className="text-white font-medium text-sm ml-3">
                  {formatValue(key, value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    } catch {
      return null;
    }
  };

  const sectionOrder = [
    'BASIC_METRICS',
    'ZONE_ANALYSIS', 
    'PRICING_RULES_EFFICIENCY',
    'SPECIAL_OFFERS_PERFORMANCE',
    'TREND_ANALYSIS',
    'EVENT_COMPARISON',
    'REVENUE_OPTIMIZATION',
    'CURSOR_STATISTICS'
  ];

  const orderedSections = sectionOrder
    .filter(section => reportData[section])
    .map(section => ({ name: section, data: reportData[section] }));

  return (
    <Card>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white mb-2">Comprehensive Sales Report</h3>
        <p className="text-neutral-400 text-sm">
          Detailed analysis and insights from the sales data
        </p>
      </div>

      {orderedSections.length === 0 ? (
        <div className="text-center py-12 text-neutral-400">
          <FileText size={48} className="mx-auto mb-4 opacity-50" />
          <p>No report data available</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orderedSections.map(({ name, data }) => (
            <div key={name} className="border border-neutral-700/50 rounded-xl overflow-hidden bg-neutral-900/40">
              {/* Section Header */}
              <div className="bg-neutral-800/60 px-6 py-4 border-b border-neutral-700/50">
                <div className="flex items-center gap-3">
                  <div className="bg-lime-500/15 p-2.5 rounded-lg border border-lime-500/25">
                    {getSectionIcon(name)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white text-base">
                      {formatSectionName(name)}
                    </h4>
                    <p className="text-neutral-400 text-xs mt-0.5">
                      {data.length} metric{data.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section Content */}
              <div className="p-6 bg-neutral-900/30">
                <div className="grid gap-4">
                  {data.map((metric, index) => (
                    <div 
                      key={index} 
                      className="p-5 bg-neutral-900/70 rounded-lg border border-neutral-700/50 hover:border-lime-500/40 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-neutral-300 text-sm mb-2">
                            {metric.metricName}
                          </h5>
                          <div className="text-lime-400 text-2xl font-semibold tracking-tight">
                            {renderMetricValue(metric)}
                          </div>
                        </div>
                      </div>
                      
                      {metric.additionalInfo && renderAdditionalInfo(metric.additionalInfo)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};