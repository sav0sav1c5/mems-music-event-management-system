import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { 
  Search, Plus, Edit, Trash2, Gift, Percent, Tag, Clock, 
  Users, Target, CheckCircle, XCircle, Filter, ArrowUp, ArrowDown 
} from 'lucide-react';
import { SpecialOfferService } from '../services/specialOfferService';
import { PricingRuleService } from '../services/pricingRuleService';
import type { SpecialOfferResponse, PricingRuleResponse, OfferType } from '../types';

const formatOfferType = (offerType: OfferType): string => {
  switch (offerType) {
    case 0: return 'Early Bird';
    case 1: return 'Student Discount';
    case 2: return 'Group Discount';
    case 3: return 'Senior Discount';
    case 4: return 'Loyalty Discount';
    case 5: return 'Season Pass';
    case 6: return 'Buy One Get One';
    case 7: return 'Percentage Off';
    case 8: return 'Fixed Amount Off';
    default: return 'Unknown';
  }
};

const getOfferTypeIcon = (type: OfferType) => {
  switch (type) {
    case 0: return Clock;
    case 1: return Users;
    case 2: return Users;
    case 3: return Users;
    case 4: return Target;
    case 5: return Gift;
    case 6: return Gift;
    case 7: return Percent;
    case 8: return Tag;
    default: return Tag;
  }
};

const PricingOffers = () => {
  const [activeTab, setActiveTab] = useState('offers');
  const [specialOffers, setSpecialOffers] = useState<SpecialOfferResponse[]>([]);
  const [pricingRules, setPricingRules] = useState<PricingRuleResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offersData, rulesData] = await Promise.all([
        SpecialOfferService.getAllSpecialOffers(),
        PricingRuleService.getAllPricingRules()
      ]);
      setSpecialOffers(offersData);
      setPricingRules(rulesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOfferStatus = (offer: SpecialOfferResponse) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-400/20 text-blue-400', icon: Clock };
    if (now > endDate) return { status: 'expired', color: 'bg-red-400/20 text-red-400', icon: XCircle };
    return { status: 'active', color: 'bg-green-400/20 text-green-400', icon: CheckCircle };
  };

  const getFilteredOffers = () => {
    let result = [...specialOffers];
    
    if (searchTerm) {
      result = result.filter(offer => 
        offer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatOfferType(offer.offerType).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(offer => {
        const status = getOfferStatus(offer).status;
        return status === statusFilter;
      });
    }
    
    if (typeFilter !== 'all') {
      result = result.filter(offer => offer.offerType.toString() === typeFilter);
    }
    
    result.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'discount':
          aValue = a.discountValue;
          bValue = b.discountValue;
          break;
        case 'startDate':
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        default:
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
      }
      
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    
    return result;
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
        default:
          aValue = a.name || "";
          bValue = b.name || "";
      }
      
      return sortOrder === "asc" ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
    
    return result;
  };

  const filteredOffers = getFilteredOffers();
  const filteredRules = getFilteredRules();

  const stats = [
    {
      title: "Active Offers",
      value: specialOffers.filter(offer => getOfferStatus(offer).status === 'active').length.toString(),
      change: 12.5,
      trend: "up" as const,
      icon: Gift,
    },
    {
      title: "Total Offers",
      value: specialOffers.length.toString(),
      change: 8.2,
      trend: "up" as const,
      icon: Percent,
    },
    {
      title: "Pricing Rules",
      value: pricingRules.length.toString(),
      change: 5.1,
      trend: "up" as const,
      icon: Tag,
    },
    {
      title: "Upcoming",
      value: specialOffers.filter(offer => getOfferStatus(offer).status === 'upcoming').length.toString(),
      change: 15.3,
      trend: "up" as const,
      icon: Clock,
    },
  ];

  const tabs = [
    { id: 'offers', label: 'Special Offers', count: specialOffers.length },
    { id: 'pricing', label: 'Pricing Rules', count: pricingRules.length }
  ];

  return (
    <div className="text-white h-full flex flex-col p-4 m-1">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Pricing & Offers</h1>
            <p className="text-neutral-400 text-sm">Manage pricing rules and special offers</p>
          </div>
          <button className="bg-lime-400 hover:bg-lime-500 px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold shadow-lg">
            <Plus size={16} />
            New {activeTab === 'offers' ? 'Offer' : 'Rule'}
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

      {/* Tabs */}
      <div className="space-y-4 mb-4">
        <div className="flex space-x-1 rounded-2xl bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 p-1 shadow-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-3 text-sm rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-lime-400 text-black shadow-lg font-medium'
                  : 'text-neutral-400 hover:text-neutral-300 hover:bg-neutral-800/50'
              }`}
            >
              {tab.label}
              <div className={`inline-block ml-2 px-2 py-1 rounded-lg text-xs ${
                activeTab === tab.id 
                  ? 'bg-black/20 text-black' 
                  : 'bg-neutral-800 text-neutral-400'
              }`}>
                {tab.count}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="mb-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                placeholder={`Search ${activeTab === 'offers' ? 'offers' : 'rules'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent transition-all text-base"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === 'offers' && (
              <>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="expired">Expired</option>
                </select>
                
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
                >
                  <option value="all">All Types</option>
                  <option value="0">Early Bird</option>
                  <option value="1">Student Discount</option>
                  <option value="2">Group Discount</option>
                  <option value="3">Senior Discount</option>
                  <option value="4">Loyalty Discount</option>
                  <option value="5">Season Pass</option>
                  <option value="6">Buy One Get One</option>
                  <option value="7">Percentage Off</option>
                  <option value="8">Fixed Amount Off</option>
                </select>
              </>
            )}
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-2xl text-white text-base focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
            >
              <option value="name">Name</option>
              {activeTab === 'offers' ? (
                <>
                  <option value="discount">Discount</option>
                  <option value="startDate">Start Date</option>
                </>
              ) : (
                <option value="minPrice">Min Price</option>
              )}
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

      {/* Content */}
      {activeTab === 'offers' ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full text-center text-neutral-400 py-8 text-base">
              Loading special offers...
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="col-span-full text-center text-neutral-400 py-8 text-base">
              No special offers found
            </div>
          ) : (
            filteredOffers.map((offer) => {
              const status = getOfferStatus(offer);
              const StatusIcon = status.icon;
              const TypeIcon = getOfferTypeIcon(offer.offerType);

              return (
                <Card key={offer.specialOfferId} hover={true} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-lime-500/20 rounded-xl">
                        <TypeIcon className="w-5 h-5 text-lime-400" />
                      </div>
                      <div>
                        <h4 className="text-white font-medium text-lg">{offer.name || 'Unnamed Offer'}</h4>
                        <p className="text-neutral-400 text-sm">{formatOfferType(offer.offerType)}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-xl text-sm font-medium border flex items-center gap-2 ${status.color}`}>
                      <StatusIcon className="w-4 h-4" />
                      {status.status}
                    </div>
                  </div>
                  
                  {offer.description && (
                    <p className="text-neutral-400 text-base mb-4 line-clamp-2">{offer.description}</p>
                  )}
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-base">Discount</span>
                      <span className="text-lime-400 font-medium text-base">{offer.discountValue}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-400 text-base">Period</span>
                      <span className="text-white font-medium text-sm">
                        {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-neutral-400">
                      {offer.ticketTypeIds?.length || 0} ticket types
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
              );
            })
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
};

export default PricingOffers;