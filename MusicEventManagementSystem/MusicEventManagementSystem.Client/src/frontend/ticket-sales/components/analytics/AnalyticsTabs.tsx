import { TrendingUp, Database, Activity, DollarSign } from 'lucide-react';

interface AnalyticsTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const AnalyticsTabs = ({ activeTab, setActiveTab }: AnalyticsTabsProps) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'audit', label: 'Audit Log', icon: Database },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'pricing', label: 'Pricing Rules', icon: DollarSign }
  ];

  return (
    <div className="flex items-center mb-4 bg-neutral-800/50 p-1 rounded-xl border border-neutral-700">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-all flex-1 ${
            activeTab === tab.id
              ? 'bg-lime-500 text-black'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
          }`}
        >
          <tab.icon size={18} />
          {tab.label}
        </button>
      ))}
    </div>
  );
};