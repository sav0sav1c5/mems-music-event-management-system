import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Tag, DollarSign, 
  TrendingUp, ArrowUp, ArrowDown 
} from 'lucide-react';
import { PricingRuleService } from '../services/pricingRuleService';
import type { PricingRuleResponse } from '../types';

const PricingRules = () => {
  const [pricingRules, setPricingRules] = useState<PricingRuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const rulesData = await PricingRuleService.getAllPricingRules();
      setPricingRules(rulesData);
    } catch (error) {
      console.error('Error loading pricing rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRules = () => {
    let result = [...pricingRules];
    
    if (searchTerm) {
      result = result.filter(rule => 
        rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    result.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "minPrice":
          aValue = a.minimumPrice;
          bValue = b.minimumPrice;
          break;
        case "maxPrice":
          aValue = a.maximumPrice;
          bValue = b.maximumPrice;
          break;
        case "modifier":
          aValue = a.modifier;
          bValue = b.modifier;
          break;
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }
      
      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    
    return result;
  };

  const filteredRules = getFilteredRules();

  const calculateStats = () => {
    const avgMinPrice = pricingRules.length > 0 
      ? (pricingRules.reduce((sum, rule) => sum + rule.minimumPrice, 0) / pricingRules.length).toFixed(0)
      : '0';
    
    const avgMaxPrice = pricingRules.length > 0 
      ? (pricingRules.reduce((sum, rule) => sum + rule.maximumPrice, 0) / pricingRules.length).toFixed(0)
      : '0';
    
    const avgModifier = pricingRules.length > 0 
      ? (pricingRules.reduce((sum, rule) => sum + rule.modifier, 0) / pricingRules.length).toFixed(2)
      : '0';

    return { avgMinPrice, avgMaxPrice, avgModifier };
  };

  const { avgMinPrice, avgMaxPrice, avgModifier } = calculateStats();

  const stats = [
    {
      title: "Total Rules",
      value: pricingRules.length.toString(),
      change: 5.1,
      trend: "up" as const,
      icon: Tag,
    },
    {
      title: "Avg Min Price",
      value: `$${avgMinPrice}`,
      change: 3.2,
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Avg Max Price",
      value: `$${avgMaxPrice}`,
      change: 4.5,
      trend: "up" as const,
      icon: DollarSign,
    },
    {
      title: "Avg Modifier",
      value: `${avgModifier}x`,
      change: 2.1,
      trend: "up" as const,
      icon: TrendingUp,
    },
  ];

  return (
    <div className="text-white h-full flex flex-col p-4 m-1">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Pricing Rules</h1>
            <p className="text-neutral-400 text-sm">Manage dynamic pricing rules and modifiers</p>
          </div>
          <button className="bg-lime-400 hover:bg-lime-500 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold shadow-lg">
            <Plus size={16} />
            New Rule
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {stats.map((stat, index) => (
          <KpiCard
            key={index}
            icon={stat.icon}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType="percentage"
          />
        ))}
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              placeholder="Search rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-base"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="name">Name</option>
              <option value="minPrice">Min Price</option>
              <option value="maxPrice">Max Price</option>
              <option value="modifier">Modifier</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-3 bg-neutral-800 hover:bg-neutral-700 rounded-2xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-500/30"
            >
              {sortOrder === 'asc' ? <ArrowUp className="w-5 h-5" /> : <ArrowDown className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </Card>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center text-neutral-400 py-8 text-base">
            Loading pricing rules...
          </div>
        ) : filteredRules.length === 0 ? (
          <div className="col-span-full text-center text-neutral-400 py-8 text-base">
            No pricing rules found
          </div>
        ) : (
          filteredRules.map((rule) => (
            <Card key={rule.pricingRuleId} hover={true} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-lime-500/20 rounded-xl">
                    <Tag className="w-5 h-5 text-lime-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-lg">{rule.name || 'Unnamed Rule'}</h4>
                    {rule.description && (
                      <p className="text-neutral-400 text-sm line-clamp-1">{rule.description}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-base">Min Price</span>
                  <span className="text-white font-medium text-base">${rule.minimumPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-base">Max Price</span>
                  <span className="text-white font-medium text-base">${rule.maximumPrice}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-base">Modifier</span>
                  <span className="text-lime-400 font-medium text-base">{rule.modifier}x</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-neutral-400">
                  {rule.ticketTypesIds?.length || 0} ticket types
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400">
                    <Edit size={16} />
                  </button>
                  <button className="p-2 hover:bg-red-900/50 rounded-xl transition-all duration-200 text-neutral-400 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default PricingRules;