import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, DollarSign, Percent, Settings, TrendingUp, ArrowUp, ArrowDown, Search, Filter } from "lucide-react";
import { pricingRuleService } from "../services/pricingRuleService";
import type { PricingRule, CreatePricingRuleDto } from "../services/pricingRuleService";

const PricingRules = () => {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
  const [filteredRules, setFilteredRules] = useState<PricingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<PricingRule | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [formData, setFormData] = useState<CreatePricingRuleDto>({
    name: '',
    description: '',
    minimumPrice: 0,
    maximumPrice: 0,
    occupancyPercentage1: 0,
    occupancyPercentage2: 0,
    occupancyThreshold1: 0,
    occupancyThreshold2: 0,
    earlyBirdPercentage: 0,
    dynamicCondition: '',
    modifier: 0,
  });

  useEffect(() => {
    fetchPricingRules();
  }, []);

  useEffect(() => {
    filterAndSortRules();
  }, [pricingRules, searchTerm, sortBy, sortOrder]);

  const fetchPricingRules = async () => {
    try {
      setLoading(true);
      const data = await pricingRuleService.getAllPricingRules();
      setPricingRules(data);
    } catch (err) {
      setError('Failed to fetch pricing rules');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRules = () => {
    let result = [...pricingRules];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(rule => 
        rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.dynamicCondition?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply sorting
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
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredRules(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRule) {
        const updated = await pricingRuleService.updatePricingRule(
          editingRule.pricingRuleId,
          { ...formData, pricingRuleId: editingRule.pricingRuleId }
        );
        setPricingRules(prev => 
          prev.map(item => item.pricingRuleId === updated.pricingRuleId ? updated : item)
        );
      } else {
        const created = await pricingRuleService.createPricingRule(formData);
        setPricingRules(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save pricing rule');
      console.error(err);
    }
  };

  const handleEdit = (rule: PricingRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name || '',
      description: rule.description || '',
      minimumPrice: rule.minimumPrice,
      maximumPrice: rule.maximumPrice,
      occupancyPercentage1: rule.occupancyPercentage1,
      occupancyPercentage2: rule.occupancyPercentage2,
      occupancyThreshold1: rule.occupancyThreshold1,
      occupancyThreshold2: rule.occupancyThreshold2,
      earlyBirdPercentage: rule.earlyBirdPercentage,
      dynamicCondition: rule.dynamicCondition || '',
      modifier: rule.modifier,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this pricing rule?')) {
      try {
        await pricingRuleService.deletePricingRule(id);
        setPricingRules(prev => prev.filter(item => item.pricingRuleId !== id));
      } catch (err) {
        setError('Failed to delete pricing rule');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minimumPrice: 0,
      maximumPrice: 0,
      occupancyPercentage1: 0,
      occupancyPercentage2: 0,
      occupancyThreshold1: 0,
      occupancyThreshold2: 0,
      earlyBirdPercentage: 0,
      dynamicCondition: '',
      modifier: 0,
    });
    setEditingRule(null);
    setIsModalOpen(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };



  const getRulesWithModifier = () => {
    return pricingRules.filter(rule => rule.modifier !== 0).length;
  };

  const getRulesWithConditions = () => {
    return pricingRules.filter(rule => rule.dynamicCondition && rule.dynamicCondition.length > 0).length;
  };

  const stats = [
    {
      title: "Total Rules",
      value: pricingRules.length.toString(),
      change: `+${getRulesWithConditions()} with conditions`,
      trend: "up",
      icon: <Settings className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Avg. Min Price",
      value: formatPrice(pricingRules.reduce((sum, rule) => sum + rule.minimumPrice, 0) / (pricingRules.length || 1)),
      change: "+5.2%",
      trend: "up",
      icon: <DollarSign className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Avg. Max Price",
      value: formatPrice(pricingRules.reduce((sum, rule) => sum + rule.maximumPrice, 0) / (pricingRules.length || 1)),
      change: "+8.1%",
      trend: "up",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "Rules with Modifier",
      value: getRulesWithModifier().toString(),
      change: `${Math.round((getRulesWithModifier() / (pricingRules.length || 1)) * 100)}% of total`,
      trend: "up",
      icon: <Percent className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Pricing Rules</h1>
        <p className="text-neutral-400 text-sm">
          Configure dynamic pricing rules and strategies.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-3 hover:border-lime-400/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                                                stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                                                stat.color === 'purple' ? 'bg-purple-400/20 text-purple-400' :
                                                'bg-orange-400/20 text-orange-400'}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${stat.trend === 'up' ? 'text-lime-400' : 'text-red-400'}`}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-xs mb-1">{stat.title}</p>
              <h3 className="text-lg font-bold text-white group-hover:text-lime-400 transition-colors">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Controls */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search rules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm"
            >
              <option value="name">Name</option>
              <option value="minPrice">Min Price</option>
              <option value="maxPrice">Max Price</option>
              <option value="modifier">Modifier</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-400/30"
            >
              {sortOrder === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
            >
              <Plus className="w-4 h-4" />
              Add Rule
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
          <Filter className="w-3 h-3" />
          <span>Showing {filteredRules.length} of {pricingRules.length} rules</span>
        </div>
      </div>

      {/* Rules Table */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-sm">
            <thead className="bg-neutral-800/80 text-neutral-400 text-left sticky top-0">
              <tr>
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Price Range</th>
                <th className="p-4 font-medium">Occupancy</th>
                <th className="p-4 font-medium">Early Bird</th>
                <th className="p-4 font-medium">Modifier</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {filteredRules.map((rule) => (
                <tr key={rule.pricingRuleId} className="hover:bg-neutral-800/30 transition-colors group">
                  <td className="p-4">
                    <div>
                      <h3 className="font-medium text-white group-hover:text-lime-400 transition-colors">
                        {rule.name || `Rule #${rule.pricingRuleId}`}
                      </h3>
                      {rule.description && (
                        <p className="text-neutral-500 text-xs mt-1 line-clamp-1">
                          {rule.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-lime-400 font-medium">
                      {formatPrice(rule.minimumPrice)} - {formatPrice(rule.maximumPrice)}
                    </div>
                  </td>
                  <td className="p-4">
                    {rule.occupancyThreshold1 > 0 && (
                      <div className="text-xs text-neutral-400">
                        {rule.occupancyThreshold1}% → {rule.occupancyPercentage1}%
                      </div>
                    )}
                    {rule.occupancyThreshold2 > 0 && (
                      <div className="text-xs text-neutral-400">
                        {rule.occupancyThreshold2}% → {rule.occupancyPercentage2}%
                      </div>
                    )}
                    {rule.occupancyThreshold1 === 0 && rule.occupancyThreshold2 === 0 && (
                      <div className="text-xs text-neutral-500">Not set</div>
                    )}
                  </td>
                  <td className="p-4">
                    {rule.earlyBirdPercentage > 0 ? (
                      <div className="text-blue-400 font-medium">
                        {rule.earlyBirdPercentage}%
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500">Not set</div>
                    )}
                  </td>
                  <td className="p-4">
                    {rule.modifier !== 0 ? (
                      <div className={`font-medium ${rule.modifier > 0 ? 'text-lime-400' : 'text-red-400'}`}>
                        {rule.modifier > 0 ? '+' : ''}{rule.modifier}%
                      </div>
                    ) : (
                      <div className="text-xs text-neutral-500">None</div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(rule.pricingRuleId)}
                        className="p-1.5 hover:bg-red-900/50 rounded-lg transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRules.length === 0 && !loading && (
          <div className="text-center py-12 text-neutral-400 flex-1 flex items-center justify-center">
            <div>
              <Settings className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
              <p className="text-lg mb-2">No pricing rules found</p>
              <p className="text-sm">Create your first pricing rule to get started!</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-4xl border border-neutral-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingRule ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Rule Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="Enter rule name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Modifier (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.modifier}
                    onChange={(e) => setFormData(prev => ({ ...prev, modifier: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Positive values increase prices, negative values decrease</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all h-20 resize-none"
                  placeholder="Describe this pricing rule"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Minimum Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimumPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimumPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Maximum Price *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.maximumPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, maximumPrice: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Early Bird Discount (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.earlyBirdPercentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, earlyBirdPercentage: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy Threshold 1 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.occupancyThreshold1}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupancyThreshold1: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy Percentage 1 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.occupancyPercentage1}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupancyPercentage1: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy Threshold 2 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.occupancyThreshold2}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupancyThreshold2: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy Percentage 2 (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.occupancyPercentage2}
                    onChange={(e) => setFormData(prev => ({ ...prev, occupancyPercentage2: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Dynamic Condition</label>
                <input
                  type="text"
                  value={formData.dynamicCondition}
                  onChange={(e) => setFormData(prev => ({ ...prev, dynamicCondition: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="e.g., day_of_week = 'Monday' AND time_of_day > '18:00'"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
                >
                  {editingRule ? 'Update Rule' : 'Create Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingRules;