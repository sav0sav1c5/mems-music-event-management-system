import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, DollarSign, TrendingUp, XCircle, X, Save, Loader2, Target, Users, Clock} from 'lucide-react';
import { PricingRuleService } from '../services/pricingRuleService';
import type { PricingRuleResponse, PricingCondition } from '../types';
import type { PricingRuleCreateForm, PricingRuleUpdateForm } from '../types/forms/pricingRule';
import { CustomSelect } from '../components/customSelect';
import { toast } from 'react-toastify';

const formatPricingCondition = (condition: PricingCondition): string => {
  switch (condition) {
    case 0: return 'Time Based Early Bird';
    case 1: return 'Occupancy Based';
    case 2: return 'Date Proximity';
    case 3: return 'Weather Dependent';
    case 4: return 'Day of Week';
    case 5: return 'Seasonal Discount';
    case 6: return 'VIP Upgrade';
    case 7: return 'Last Minute';
    default: return 'Unknown';
  }
};

const getConditionIcon = (condition: PricingCondition) => {
  switch (condition) {
    case 0: return Clock;
    case 1: return Users;
    case 2: return Clock;
    case 3: return TrendingUp;
    case 4: return Calendar;
    case 5: return TrendingUp;
    case 6: return Target;
    case 7: return Clock;
    default: return Tag;
  }
};

// Simple Calendar icon component since it's not in lucide-react
const Calendar = ({ size = 16, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    className={className}
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const PricingRules = () => {
  const [pricingRules, setPricingRules] = useState<PricingRuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Panel state
  const [selectedRule, setSelectedRule] = useState<PricingRuleResponse | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'view' | 'create' | 'edit'>('view');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [ruleForm, setRuleForm] = useState<PricingRuleCreateForm>({
    name: '',
    description: '',
    minimumPrice: 0,
    maximumPrice: 100,
    occupancyPercentage1: 0,
    occupancyPercentage2: 0,
    occupancyThreshold1: 50,
    occupancyThreshold2: 80,
    earlyBirdPercentage: 10,
    pricingCondition: 0,
    dynamicCondition: '',
    modifier: 1.0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const rulesData = await PricingRuleService.getAllPricingRules();
      setPricingRules(rulesData);
    } catch (error) {
      console.error('Error loading pricing rules:', error);
      setError('Failed to load pricing rules');
    } finally {
      setLoading(false);
    }
  };

  // CRUD Operations
  const handleCreateRule = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!ruleForm.name || ruleForm.minimumPrice < 0 || ruleForm.maximumPrice < ruleForm.minimumPrice) {
        setError('Please fill all required fields with valid values');
        return;
      }

      if (ruleForm.modifier <= 0) {
        setError('Modifier must be greater than 0');
        return;
      }

      const created = await PricingRuleService.createPricingRule(ruleForm);
      setPricingRules(prev => [...prev, created]);

      toast.success('Pricing rule created successfully');

      closePanel();
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to create pricing rule');
      toast.error(err.message || 'Failed to create pricing rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRule = async () => {
    if (!selectedRule) return;
    
    try {
      setSubmitting(true);
      setError(null);

      const updateForm: PricingRuleUpdateForm = {
        name: ruleForm.name,
        description: ruleForm.description,
        minimumPrice: ruleForm.minimumPrice,
        maximumPrice: ruleForm.maximumPrice,
        occupancyPercentage1: ruleForm.occupancyPercentage1,
        occupancyPercentage2: ruleForm.occupancyPercentage2,
        occupancyThreshold1: ruleForm.occupancyThreshold1,
        occupancyThreshold2: ruleForm.occupancyThreshold2,
        earlyBirdPercentage: ruleForm.earlyBirdPercentage,
        pricingCondition: ruleForm.pricingCondition,
        dynamicCondition: ruleForm.dynamicCondition,
        modifier: ruleForm.modifier
      };

      const updated = await PricingRuleService.updatePricingRule(
        selectedRule.pricingRuleId, 
        updateForm
      );
      
      setPricingRules(prev => 
        prev.map(rule => 
          rule.pricingRuleId === selectedRule.pricingRuleId ? updated : rule
        )
      );
      setSelectedRule(updated);

      toast.success('Pricing rule updated successfully');

      setPanelMode('view');
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to update pricing rule');
      toast.error(err.message || 'Failed to update pricing rule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;
    
    try {
      setError(null);
      await PricingRuleService.deletePricingRule(ruleId);
      setPricingRules(prev => prev.filter(rule => rule.pricingRuleId !== ruleId));
      
      toast.success('Pricing rule deleted successfully!');

      if (selectedRule?.pricingRuleId === ruleId) {
        closePanel();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete pricing rule');
      toast.error(err.message || 'Failed to delete pricing rule');
    }
  };

  const resetForm = () => {
    setRuleForm({
      name: '',
      description: '',
      minimumPrice: 0,
      maximumPrice: 100,
      occupancyPercentage1: 0,
      occupancyPercentage2: 0,
      occupancyThreshold1: 50,
      occupancyThreshold2: 80,
      earlyBirdPercentage: 10,
      pricingCondition: 0,
      dynamicCondition: '',
      modifier: 1.0
    });
  };

  const openCreatePanel = () => {
    resetForm();
    setSelectedRule(null);
    setPanelMode('create');
    setShowPanel(true);
    setError(null);
  };

  const openEditPanel = (rule: PricingRuleResponse) => {
    setSelectedRule(rule);
    setRuleForm({
      name: rule.name || '',
      description: rule.description || '',
      minimumPrice: rule.minimumPrice,
      maximumPrice: rule.maximumPrice,
      occupancyPercentage1: rule.occupancyPercentage1,
      occupancyPercentage2: rule.occupancyPercentage2,
      occupancyThreshold1: rule.occupancyThreshold1,
      occupancyThreshold2: rule.occupancyThreshold2,
      earlyBirdPercentage: rule.earlyBirdPercentage,
      pricingCondition: rule.pricingCondition,
      dynamicCondition: rule.dynamicCondition || '',
      modifier: rule.modifier
    });
    setPanelMode('edit');
    setShowPanel(true);
    setError(null);
  };

  const openViewPanel = (rule: PricingRuleResponse) => {
    setSelectedRule(rule);
    setPanelMode('view');
    setShowPanel(true);
    setError(null);
  };

  const closePanel = () => {
    setShowPanel(false);
    setSelectedRule(null);
    setPanelMode('view');
    setError(null);
    resetForm();
  };

  const getFilteredRules = () => {
    let result = [...pricingRules];
    
    if (searchTerm) {
      result = result.filter(rule => 
        rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatPricingCondition(rule.pricingCondition).toLowerCase().includes(searchTerm.toLowerCase())
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

  const getPanelTitle = () => {
    switch (panelMode) {
      case 'create': return 'Create New Pricing Rule';
      case 'edit': return 'Edit Pricing Rule';
      default: return 'Pricing Rule Details';
    }
  };

  return (
    <div className="relative flex gap-3">
      {/* Main Content - Left Side */}
      <div className={`bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl transition-all duration-300 ${showPanel ? 'w-2/3' : 'w-full'}`}>
        <div className="text-white h-full flex flex-col p-4 m-1">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Pricing Rules</h1>
                <p className="text-neutral-400 text-sm">Manage dynamic pricing rules and modifiers</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="flex gap-4 flex-wrap">
                  <CustomSelect
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                      { value: 'name', label: 'Name' },
                      { value: 'minPrice', label: 'Min Price' },
                      { value: 'maxPrice', label: 'Max Price' },
                      { value: 'modifier', label: 'Modifier' }
                    ]}
                    className="min-w-32"
                  />
                </div>
                <button 
                  onClick={openCreatePanel}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  New Rule
                </button>
              </div>
            </div>
          </div>

          {error && (
            <Card className="bg-red-500/20 border border-red-500/30 mb-4">
              <div className="flex items-center gap-2 p-4">
                <XCircle className="h-5 w-5 text-red-400" />
                <span className="text-red-400 text-base">{error}</span>
              </div>
            </Card>
          )}

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
          {/* <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  placeholder="Search rules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setSortBy('name')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  sortBy === 'name'
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Name
              </button>
              <button
                onClick={() => setSortBy('minPrice')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  sortBy === 'minPrice'
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Min Price
              </button>
              <button
                onClick={() => setSortBy('maxPrice')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  sortBy === 'maxPrice'
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Max Price
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setSortOrder('asc')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  sortOrder === 'asc'
                    ? "bg-blue-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Asc
              </button>
              <button
                onClick={() => setSortOrder('desc')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  sortOrder === 'desc'
                    ? "bg-blue-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Desc
              </button>
            </div>
          </div> */}

          {/* Rules Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full text-center text-neutral-400 py-8 text-base">
                Loading pricing rules...
              </div>
            ) : filteredRules.length === 0 ? (
              <div className="col-span-full text-center text-neutral-400 py-8 text-base">
                No pricing rules found
              </div>
            ) : (
              filteredRules.map((rule) => {
                const ConditionIcon = getConditionIcon(rule.pricingCondition);
                
                return (
                  <Card 
                    key={rule.pricingRuleId} 
                    hover={true}
                    onClick={() => openViewPanel(rule)}
                    className={`p-6 cursor-pointer transition-all duration-200 ${
                      selectedRule?.pricingRuleId === rule.pricingRuleId && showPanel
                        ? 'bg-lime-500/20 border border-lime-500/30'
                        : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-lime-500/20 rounded-xl">
                          <ConditionIcon className="w-5 h-5 text-lime-400" />
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
                      <div className="flex justify-between items-center">
                        <span className="text-neutral-400 text-base">Condition</span>
                        <span className="text-white font-medium text-sm">
                          {formatPricingCondition(rule.pricingCondition)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="text-neutral-400">
                        {rule.ticketTypesIds?.length || 0} ticket types
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditPanel(rule);
                          }}
                          className="p-2 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRule(rule.pricingRuleId);
                          }}
                          className="p-2 hover:bg-red-900/50 rounded-xl transition-all duration-200 text-neutral-400 hover:text-red-400"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Right Panel - Outside main container */}
      {showPanel && (
        <div className="w-1/3 transition-all duration-300">
          <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-max">
            <div className="p-4 m-1 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">{getPanelTitle()}</h3>
                <button
                  onClick={closePanel}
                  className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto flex-1">
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      <span className="text-red-400 text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {(panelMode === 'create' || panelMode === 'edit') ? (
                  /* CREATE/EDIT FORM */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
                      <input
                        type="text"
                        value={ruleForm.name}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="Enter rule name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                      <textarea
                        value={ruleForm.description}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Min Price *</label>
                        <input
                          type="number"
                          value={ruleForm.minimumPrice}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, minimumPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Max Price *</label>
                        <input
                          type="number"
                          value={ruleForm.maximumPrice}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, maximumPrice: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="100"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Modifier *</label>
                        <input
                          type="number"
                          value={ruleForm.modifier}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, modifier: parseFloat(e.target.value) || 1.0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="1.0"
                          min="0.1"
                          step="0.1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Early Bird %</label>
                        <input
                          type="number"
                          value={ruleForm.earlyBirdPercentage}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, earlyBirdPercentage: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="10"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Pricing Condition *</label>
                      <select
                        value={ruleForm.pricingCondition}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, pricingCondition: parseInt(e.target.value) as PricingCondition }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                      >
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(condition => (
                          <option key={condition} value={condition}>
                            {formatPricingCondition(condition as PricingCondition)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy Threshold 1</label>
                        <input
                          type="number"
                          value={ruleForm.occupancyThreshold1}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, occupancyThreshold1: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="50"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy % 1</label>
                        <input
                          type="number"
                          value={ruleForm.occupancyPercentage1}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, occupancyPercentage1: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy Threshold 2</label>
                        <input
                          type="number"
                          value={ruleForm.occupancyThreshold2}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, occupancyThreshold2: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="80"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2 text-neutral-300">Occupancy % 2</label>
                        <input
                          type="number"
                          value={ruleForm.occupancyPercentage2}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, occupancyPercentage2: parseFloat(e.target.value) || 0 }))}
                          className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                          placeholder="0"
                          min="0"
                          max="100"
                          step="1"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Dynamic Condition</label>
                      <textarea
                        value={ruleForm.dynamicCondition}
                        onChange={(e) => setRuleForm(prev => ({ ...prev, dynamicCondition: e.target.value }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="Enter dynamic conditions"
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closePanel}
                        className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={panelMode === 'create' ? handleCreateRule : handleUpdateRule}
                        disabled={submitting}
                        className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-lime-500/50 rounded-xl transition-all duration-200 text-black font-semibold flex items-center justify-center gap-2"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {submitting ? (panelMode === 'create' ? 'Creating...' : 'Updating...') : (panelMode === 'create' ? 'Create' : 'Update')}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* VIEW MODE */
                  selectedRule && (
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-white font-medium text-lg mb-2">
                          {selectedRule.name || 'Unnamed Rule'}
                        </h4>
                        {selectedRule.description && (
                          <p className="text-neutral-400 text-base mb-4">
                            {selectedRule.description}
                          </p>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Minimum Price</span>
                          <span className="text-white text-base font-medium">
                            ${selectedRule.minimumPrice}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Maximum Price</span>
                          <span className="text-white text-base font-medium">
                            ${selectedRule.maximumPrice}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Modifier</span>
                          <span className="text-lime-400 text-base font-medium">
                            {selectedRule.modifier}x
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Pricing Condition</span>
                          <span className="text-white text-base font-medium flex items-center">
                            {(() => {
                              const Icon = getConditionIcon(selectedRule.pricingCondition);
                              return <Icon className="w-4 h-4 mr-2 text-lime-400" />;
                            })()}
                            {formatPricingCondition(selectedRule.pricingCondition)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-neutral-300 text-base">Early Bird %</span>
                          <span className="text-white text-base font-medium">
                            {selectedRule.earlyBirdPercentage}%
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-neutral-800/50 rounded-xl">
                            <div className="text-lime-400 text-lg font-semibold">
                              {selectedRule.occupancyThreshold1}%
                            </div>
                            <div className="text-neutral-400 text-xs">Threshold 1</div>
                          </div>
                          <div className="text-center p-3 bg-neutral-800/50 rounded-xl">
                            <div className="text-lime-400 text-lg font-semibold">
                              {selectedRule.occupancyPercentage1}%
                            </div>
                            <div className="text-neutral-400 text-xs">Percentage 1</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-neutral-800/50 rounded-xl">
                            <div className="text-lime-400 text-lg font-semibold">
                              {selectedRule.occupancyThreshold2}%
                            </div>
                            <div className="text-neutral-400 text-xs">Threshold 2</div>
                          </div>
                          <div className="text-center p-3 bg-neutral-800/50 rounded-xl">
                            <div className="text-lime-400 text-lg font-semibold">
                              {selectedRule.occupancyPercentage2}%
                            </div>
                            <div className="text-neutral-400 text-xs">Percentage 2</div>
                          </div>
                        </div>

                        {selectedRule.dynamicCondition && (
                          <div className="flex items-center justify-between">
                            <span className="text-neutral-300 text-base">Dynamic Condition</span>
                            <span className="text-white text-base text-right max-w-xs">
                              {selectedRule.dynamicCondition}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 border-t border-neutral-800">
                        <h5 className="text-white text-base mb-3 flex items-center">
                          <Users className="w-4 h-4 mr-2 text-lime-400" />
                          Related Data
                        </h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="text-center p-3 bg-neutral-800/50 rounded-xl">
                            <div className="text-lime-400 text-lg font-semibold">
                              {selectedRule.eventIds?.length || 0}
                            </div>
                            <div className="text-neutral-400 text-xs">Events</div>
                          </div>
                          <div className="text-center p-3 bg-neutral-800/50 rounded-xl">
                            <div className="text-lime-400 text-lg font-semibold">
                              {selectedRule.ticketTypesIds?.length || 0}
                            </div>
                            <div className="text-neutral-400 text-xs">Ticket Types</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4">
                        <button 
                          onClick={() => openEditPanel(selectedRule)}
                          className="flex-1 bg-lime-500 hover:bg-lime-600 text-black font-semibold px-3 py-2 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingRules;