// SpecialOffer.tsx
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, Tag, Calendar, Percent, Clock, Gift, ArrowUp, ArrowDown, Search, Filter } from "lucide-react";
import { specialOfferService } from "../services/specialOfferService";
import type { SpecialOffer, CreateSpecialOfferDto } from "../services/specialOfferService";

const SpecialOffers = () => {
  const [specialOffers, setSpecialOffers] = useState<SpecialOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<SpecialOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOffer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("startDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const [formData, setFormData] = useState<CreateSpecialOfferDto>({
    name: '',
    description: '',
    offerType: '',
    startDate: new Date(),
    endDate: new Date(),
    applicationCondition: '',
    discountValue: 0,
    ticketLimit: 0,
  });

  useEffect(() => {
    fetchSpecialOffers();
  }, []);

  useEffect(() => {
    filterAndSortOffers();
  }, [specialOffers, searchTerm, statusFilter, typeFilter, sortBy, sortOrder]);

  const fetchSpecialOffers = async () => {
    try {
      setLoading(true);
      const data = await specialOfferService.getAllSpecialOffers();
      setSpecialOffers(data);
    } catch (err) {
      setError('Failed to fetch special offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOffers = () => {
    let result = [...specialOffers];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(offer => 
        offer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        offer.offerType?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(offer => {
        const status = getOfferStatus(offer).status;
        return status === statusFilter;
      });
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      result = result.filter(offer => offer.offerType === typeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case "name":
          aValue = a.name || "";
          bValue = b.name || "";
          break;
        case "discount":
          aValue = a.discountValue;
          bValue = b.discountValue;
          break;
        case "startDate":
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
          break;
        case "endDate":
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        default:
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    setFilteredOffers(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingOffer) {
        const updated = await specialOfferService.updateSpecialOffer(
          editingOffer.specialOfferId,
          { ...formData, specialOfferId: editingOffer.specialOfferId }
        );
        setSpecialOffers(prev => 
          prev.map(item => item.specialOfferId === updated.specialOfferId ? updated : item)
        );
      } else {
        const created = await specialOfferService.createSpecialOffer(formData);
        setSpecialOffers(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save special offer');
      console.error(err);
    }
  };

  const handleEdit = (offer: SpecialOffer) => {
    setEditingOffer(offer);
    setFormData({
      name: offer.name || '',
      description: offer.description || '',
      offerType: offer.offerType || '',
      startDate: new Date(offer.startDate),
      endDate: new Date(offer.endDate),
      applicationCondition: offer.applicationCondition || '',
      discountValue: offer.discountValue,
      ticketLimit: offer.ticketLimit,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this special offer?')) {
      try {
        await specialOfferService.deleteSpecialOffer(id);
        setSpecialOffers(prev => prev.filter(item => item.specialOfferId !== id));
      } catch (err) {
        setError('Failed to delete special offer');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      offerType: '',
      startDate: new Date(),
      endDate: new Date(),
      applicationCondition: '',
      discountValue: 0,
      ticketLimit: 0,
    });
    setEditingOffer(null);
    setIsModalOpen(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };



  const getOfferStatus = (offer: SpecialOffer) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-950/50 text-blue-400 border-blue-900/50' };
    if (now > endDate) return { status: 'expired', color: 'bg-red-950/50 text-red-400 border-red-900/50' };
    return { status: 'active', color: 'bg-lime-950/50 text-lime-400 border-lime-900/50' };
  };

  const getOfferTypeIcon = (type: string | undefined) => {
    switch (type?.toLowerCase()) {
      case 'percentage':
        return <Percent className="w-4 h-4" />;
      case 'fixed':
        return <Tag className="w-4 h-4" />;
      case 'early bird':
        return <Clock className="w-4 h-4" />;
      case 'bulk':
        return <Gift className="w-4 h-4" />;
      default:
        return <Tag className="w-4 h-4" />;
    }
  };

  const getTotalDiscount = () => {
    return specialOffers.reduce((sum, offer) => sum + offer.discountValue, 0);
  };

  const getActiveOffers = () => {
    const now = new Date();
    return specialOffers.filter(offer => {
      const startDate = new Date(offer.startDate);
      const endDate = new Date(offer.endDate);
      return now >= startDate && now <= endDate;
    });
  };

  const getUpcomingOffers = () => {
    const now = new Date();
    return specialOffers.filter(offer => {
      const startDate = new Date(offer.startDate);
      return now < startDate;
    });
  };

  const getExpiredOffers = () => {
    const now = new Date();
    return specialOffers.filter(offer => {
      const endDate = new Date(offer.endDate);
      return now > endDate;
    });
  };

  const stats = [
    {
      title: "Total Offers",
      value: specialOffers.length.toString(),
      change: `+${getUpcomingOffers().length} upcoming`,
      trend: "up",
      icon: <Tag className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Active Offers",
      value: getActiveOffers().length.toString(),
      change: `-${getExpiredOffers().length} expired`,
      trend: getActiveOffers().length > 0 ? "up" : "down",
      icon: <Gift className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Avg. Discount",
      value: `${specialOffers.length > 0 ? (getTotalDiscount() / specialOffers.length).toFixed(1) : '0'}%`,
      change: specialOffers.length > 0 ? "+1.2%" : "0%",
      trend: "up",
      icon: <Percent className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "Total Ticket Limit",
      value: specialOffers.reduce((sum, offer) => sum + offer.ticketLimit, 0).toString(),
      change: "+15%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Special Offers</h1>
        <p className="text-neutral-400 text-sm">
          Create and manage promotional offers and discounts.
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
                placeholder="Search offers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
              />
            </div>
            
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm"
              >
                <option value="all">All Types</option>
                <option value="Percentage">Percentage</option>
                <option value="Fixed">Fixed</option>
                <option value="Early Bird">Early Bird</option>
                <option value="Bulk">Bulk</option>
                <option value="Student">Student</option>
                <option value="VIP">VIP</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all text-sm"
            >
              <option value="startDate">Start Date</option>
              <option value="endDate">End Date</option>
              <option value="name">Name</option>
              <option value="discount">Discount</option>
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
              Add Offer
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3 text-xs text-neutral-400">
          <Filter className="w-3 h-3" />
          <span>Showing {filteredOffers.length} of {specialOffers.length} offers</span>
        </div>
      </div>

      {/* Offers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 min-h-0 overflow-y-auto">
        {filteredOffers.map((offer) => {
          const { status, color } = getOfferStatus(offer);
          return (
            <div key={offer.specialOfferId} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-4 hover:border-lime-400/30 transition-all duration-200 group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-lime-400/20 rounded-lg text-lime-400">
                    {getOfferTypeIcon(offer.offerType)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white group-hover:text-lime-400 transition-colors mb-1">
                      {offer.name || `Offer #${offer.specialOfferId}`}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border capitalize ${color}`}>
                      {status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(offer)}
                    className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(offer.specialOfferId)}
                    className="p-1.5 hover:bg-red-900/50 rounded-lg transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Discount:</span>
                  <span className="text-lime-400 font-semibold text-sm">
                    {offer.discountValue}%
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Type:</span>
                  <span className="text-blue-400 font-semibold text-sm capitalize">
                    {offer.offerType || 'General'}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-neutral-400 text-sm">Ticket Limit:</span>
                  <span className="text-purple-400 font-semibold text-sm">
                    {offer.ticketLimit || 'Unlimited'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-700 space-y-1">
                <div className="flex items-center gap-2 text-neutral-400 text-xs">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                  </span>
                </div>
                
                {offer.description && (
                  <p className="text-neutral-500 text-xs line-clamp-2">
                    {offer.description}
                  </p>
                )}
                
                {offer.applicationCondition && (
                  <p className="text-neutral-500 text-xs line-clamp-2">
                    Condition: {offer.applicationCondition}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredOffers.length === 0 && !loading && (
        <div className="text-center py-12 text-neutral-400">
          <Tag className="w-16 h-16 mx-auto mb-4 text-neutral-600" />
          <p className="text-lg mb-2">No special offers found</p>
          <p className="text-sm">Create your first promotional offer to get started!</p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-2xl border border-neutral-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingOffer ? 'Edit Special Offer' : 'Create New Special Offer'}
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
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Offer Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="Enter offer name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Offer Type *</label>
                  <select
                    value={formData.offerType}
                    onChange={(e) => setFormData(prev => ({ ...prev, offerType: e.target.value }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                    required
                  >
                    <option value="">Select offer type</option>
                    <option value="Percentage">Percentage Discount</option>
                    <option value="Fixed">Fixed Amount</option>
                    <option value="Early Bird">Early Bird</option>
                    <option value="Bulk">Bulk Purchase</option>
                    <option value="Student">Student Discount</option>
                    <option value="VIP">VIP Promotion</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all h-20 resize-none"
                  placeholder="Describe this special offer"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Start Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">End Date *</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate.toISOString().slice(0, 16)}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Discount Value (%) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0.00"
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Ticket Limit</label>
                  <input
                    type="number"
                    value={formData.ticketLimit}
                    onChange={(e) => setFormData(prev => ({ ...prev, ticketLimit: parseInt(e.target.value) || 0 }))}
                    className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                    placeholder="0 (unlimited)"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Application Condition</label>
                <input
                  type="text"
                  value={formData.applicationCondition}
                  onChange={(e) => setFormData(prev => ({ ...prev, applicationCondition: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="e.g., minimum 2 tickets, valid ID required"
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
                  {editingOffer ? 'Update Offer' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpecialOffers;