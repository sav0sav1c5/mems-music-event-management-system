import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, X, Tag, Calendar, Percent, Clock, Gift, ArrowUp, ArrowDown, Filter, Users, Target, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { SpecialOfferService } from '../types/services/specialOfferService';
import { TicketTypeService } from '../types/services/ticketTypeService';
import type { 
  SpecialOfferResponse,
  SpecialOfferCreateForm,
  SpecialOfferUpdateForm,
  TicketTypeResponse,
  OfferType
} from '../types';

// Utility function to format offer type
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

const SpecialOffers = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Special Offers state
  const [specialOffers, setSpecialOffers] = useState<SpecialOfferResponse[]>([]);
  const [selectedSpecialOffer, setSelectedSpecialOffer] = useState<SpecialOfferResponse | null>(null);
  const [offerSearchTerm, setOfferSearchTerm] = useState('');
  const [showOfferDialog, setShowOfferDialog] = useState(false);
  const [editingOffer, setEditingOffer] = useState<SpecialOfferResponse | null>(null);

  // Supporting data
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);

  // Filters and sorting
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filtered and sorted data
  const getFilteredOffers = () => {
    let result = [...specialOffers];
    
    // Apply search filter
    if (offerSearchTerm) {
      result = result.filter(offer => 
        offer.name?.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
        offer.description?.toLowerCase().includes(offerSearchTerm.toLowerCase()) ||
        formatOfferType(offer.offerType).toLowerCase().includes(offerSearchTerm.toLowerCase())
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(offer => {
        const status = getOfferStatus(offer).status;
        return status === statusFilter;
      });
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(offer => offer.offerType.toString() === typeFilter);
    }
    
    // Apply sorting
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
        case 'endDate':
          aValue = new Date(a.endDate).getTime();
          bValue = new Date(b.endDate).getTime();
          break;
        default:
          aValue = new Date(a.startDate).getTime();
          bValue = new Date(b.startDate).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return result;
  };

  const filteredSpecialOffers = getFilteredOffers();

  // Load data functions
  const loadSpecialOffers = async () => {
    try {
      setLoading(true);
      const data = await SpecialOfferService.getAllSpecialOffers();
      setSpecialOffers(data);
      if (data.length > 0 && !selectedSpecialOffer) {
        setSelectedSpecialOffer(data[0]);
      }
    } catch (err) {
      setError('Failed to load special offers');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSupportingData = async () => {
    try {
      const ticketTypesData = await TicketTypeService.getAllTicketTypes();
      setTicketTypes(ticketTypesData);
    } catch (err) {
      console.error('Failed to load supporting data:', err);
    }
  };

  // CRUD operations
  const handleCreateSpecialOffer = async (formData: SpecialOfferCreateForm) => {
    try {
      const newOffer = await SpecialOfferService.createSpecialOffer(formData);
      setSpecialOffers(prev => [newOffer, ...prev]);
      setShowOfferDialog(false);
      setEditingOffer(null);
    } catch (err) {
      setError('Failed to create special offer');
      console.error(err);
    }
  };

  const handleUpdateSpecialOffer = async (id: number, formData: SpecialOfferUpdateForm) => {
    try {
      const updatedOffer = await SpecialOfferService.updateSpecialOffer(id, formData);
      setSpecialOffers(prev => prev.map(so => so.specialOfferId === id ? updatedOffer : so));
      if (selectedSpecialOffer?.specialOfferId === id) {
        setSelectedSpecialOffer(updatedOffer);
      }
      setEditingOffer(null);
      setShowOfferDialog(false);
    } catch (err) {
      setError('Failed to update special offer');
      console.error(err);
    }
  };

  const handleDeleteSpecialOffer = async (id: number) => {
    try {
      await SpecialOfferService.deleteSpecialOffer(id);
      setSpecialOffers(prev => prev.filter(so => so.specialOfferId !== id));
      if (selectedSpecialOffer?.specialOfferId === id) {
        setSelectedSpecialOffer(specialOffers[0] || null);
      }
    } catch (err) {
      setError('Failed to delete special offer');
      console.error(err);
    }
  };

  // Utility functions
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getOfferStatus = (offer: SpecialOfferResponse) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-400/20 text-blue-400', icon: Clock };
    if (now > endDate) return { status: 'expired', color: 'bg-red-400/20 text-red-400', icon: XCircle };
    return { status: 'active', color: 'bg-green-400/20 text-green-400', icon: CheckCircle };
  };

  const getOfferTypeIcon = (type: OfferType) => {
    switch (type) {
      case 0: return Clock; // Early Bird
      case 1: return Users; // Student Discount
      case 2: return Users; // Group Discount
      case 3: return Users; // Senior Discount
      case 4: return Target; // Loyalty Discount
      case 5: return Gift; // Season Pass
      case 6: return Gift; // Buy One Get One
      case 7: return Percent; // Percentage Off
      case 8: return Tag; // Fixed Amount Off
      default: return Tag;
    }
  };

  // Statistics
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

  const getTotalDiscount = () => {
    return specialOffers.reduce((sum, offer) => sum + offer.discountValue, 0);
  };

  const stats = [
    {
      title: "Total Offers",
      value: specialOffers.length.toString(),
      change: `+${getUpcomingOffers().length} upcoming`,
      trend: "up",
      icon: Tag,
      color: "lime"
    },
    {
      title: "Active Offers",
      value: getActiveOffers().length.toString(),
      change: `-${getExpiredOffers().length} expired`,
      trend: getActiveOffers().length > 0 ? "up" : "down",
      icon: Gift,
      color: "blue"
    },
    {
      title: "Avg. Discount",
      value: `${specialOffers.length > 0 ? (getTotalDiscount() / specialOffers.length).toFixed(1) : '0'}%`,
      change: "+1.2%",
      trend: "up",
      icon: Percent,
      color: "purple"
    },
    {
      title: "Total Ticket Limit",
      value: specialOffers.reduce((sum, offer) => sum + offer.ticketLimit, 0).toString(),
      change: "+15%",
      trend: "up",
      icon: Target,
      color: "orange"
    },
  ];

  // Load data on component mount
  useEffect(() => {
    loadSpecialOffers();
    loadSupportingData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white mb-2">Special Offers</h1>
          <p className="text-neutral-400">Create and manage promotional offers and discounts</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              setEditingOffer(null);
              setShowOfferDialog(true);
            }}
            className="bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
          >
            <Plus size={16} />
            New Offer
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <span className="text-red-400">{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <div key={index} className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-4 hover:border-lime-400/30 transition-all duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${
                  stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                  stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                  stat.color === 'purple' ? 'bg-purple-400/20 text-purple-400' :
                  'bg-orange-400/20 text-orange-400'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${
                  stat.trend === 'up' ? 'text-lime-400' : 'text-red-400'
                }`}>
                  {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-neutral-400 text-xs mb-1">{stat.title}</p>
                <h3 className="text-lg font-bold text-white">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Special Offers List */}
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white">Special Offers</h3>
            <div className="bg-lime-400/20 text-lime-400 px-2 py-1 rounded-full text-sm">
              {filteredSpecialOffers.length}
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
              <input
                placeholder="Search special offers..."
                value={offerSearchTerm}
                onChange={(e) => setOfferSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:ring-2 focus:ring-lime-400 focus:border-lime-400 transition-all"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="upcoming">Upcoming</option>
                <option value="expired">Expired</option>
              </select>
              
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              >
                <option value="all">All Types</option>
                <option value="0">Early Bird</option>
                <option value="1">Student</option>
                <option value="2">Group</option>
                <option value="3">Senior</option>
                <option value="4">Loyalty</option>
                <option value="5">Season Pass</option>
                <option value="6">BOGO</option>
                <option value="7">Percentage</option>
                <option value="8">Fixed Amount</option>
              </select>
            </div>

            <div className="flex gap-2 items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-white text-sm focus:ring-2 focus:ring-lime-400 focus:border-lime-400"
              >
                <option value="startDate">Start Date</option>
                <option value="endDate">End Date</option>
                <option value="name">Name</option>
                <option value="discount">Discount</option>
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-lime-400/30"
              >
                {sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Filter className="w-3 h-3" />
              <span>Showing {filteredSpecialOffers.length} of {specialOffers.length} offers</span>
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center text-neutral-400 py-8">Loading special offers...</div>
            ) : filteredSpecialOffers.length === 0 ? (
              <div className="text-center text-neutral-400 py-8">No special offers found</div>
            ) : (
              filteredSpecialOffers.map((offer) => {
                const { status, color, icon: StatusIcon } = getOfferStatus(offer);
                const OfferIcon = getOfferTypeIcon(offer.offerType);
                
                return (
                  <div
                    key={offer.specialOfferId}
                    onClick={() => setSelectedSpecialOffer(offer)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedSpecialOffer?.specialOfferId === offer.specialOfferId
                        ? 'bg-lime-400/20 border border-lime-400/30'
                        : 'bg-neutral-800/50 hover:bg-neutral-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <OfferIcon className="w-4 h-4 text-lime-400" />
                          <h4 className="text-white font-medium">
                            {offer.name || `Offer ${offer.specialOfferId}`}
                          </h4>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${color} border`}>
                            <StatusIcon className="w-3 h-3 inline mr-1" />
                            {status}
                          </div>
                          <div className="bg-lime-400/20 text-lime-400 px-2 py-1 rounded-full text-xs">
                            {offer.discountValue}% off
                          </div>
                        </div>
                        
                        <p className="text-neutral-400 text-sm mb-2 line-clamp-2">
                          {offer.description}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(offer.startDate)} - {formatDate(offer.endDate)}
                          </span>
                          <span>Limit: {offer.ticketLimit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Special Offer Details */}
        <div className="lg:col-span-2 bg-neutral-900/80 border border-neutral-800 rounded-xl p-6">
          {selectedSpecialOffer ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white">{selectedSpecialOffer.name || `Offer ${selectedSpecialOffer.specialOfferId}`}</h3>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setEditingOffer(selectedSpecialOffer)}
                    className="border border-neutral-700 text-neutral-300 hover:text-white px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-all duration-200 hover:border-lime-400/30"
                  >
                    <Edit size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this special offer?')) {
                        handleDeleteSpecialOffer(selectedSpecialOffer.specialOfferId);
                      }
                    }}
                    className="border border-red-700 text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1 rounded-lg text-sm transition-all duration-200"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {selectedSpecialOffer.description && (
                  <div>
                    <label className="text-neutral-300 text-sm block mb-2">Description</label>
                    <div className="text-white bg-neutral-800/50 p-3 rounded-lg">
                      {selectedSpecialOffer.description}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-neutral-300 text-sm block mb-2">Offer Type</label>
                    <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                      {(() => {
                        const OfferIcon = getOfferTypeIcon(selectedSpecialOffer.offerType);
                        return <OfferIcon className="w-4 h-4 mr-2 text-lime-400" />;
                      })()}
                      {formatOfferType(selectedSpecialOffer.offerType)}
                    </div>
                  </div>
                  <div>
                    <label className="text-neutral-300 text-sm block mb-2">Discount Value</label>
                    <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                      <Percent className="w-4 h-4 mr-2 text-lime-400" />
                      {selectedSpecialOffer.discountValue}%
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-neutral-300 text-sm block mb-2">Start Date</label>
                    <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-lime-400" />
                      {formatDate(selectedSpecialOffer.startDate)}
                    </div>
                  </div>
                  <div>
                    <label className="text-neutral-300 text-sm block mb-2">End Date</label>
                    <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-lime-400" />
                      {formatDate(selectedSpecialOffer.endDate)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-neutral-300 text-sm block mb-2">Ticket Limit</label>
                    <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                      <Target className="w-4 h-4 mr-2 text-lime-400" />
                      {selectedSpecialOffer.ticketLimit}
                    </div>
                  </div>
                  <div>
                    <label className="text-neutral-300 text-sm block mb-2">Status</label>
                    <div className="text-white bg-neutral-800/50 p-3 rounded-lg flex items-center">
                      {(() => {
                        const { icon: StatusIcon } = getOfferStatus(selectedSpecialOffer);
                        return <StatusIcon className="w-4 h-4 mr-2 text-lime-400" />;
                      })()}
                      {getOfferStatus(selectedSpecialOffer).status}
                    </div>
                  </div>
                </div>

                {selectedSpecialOffer.applicationCondition && (
                  <div>
                    <label className="text-neutral-300 text-sm block mb-2">Application Condition</label>
                    <div className="text-white bg-neutral-800/50 p-3 rounded-lg">
                      {selectedSpecialOffer.applicationCondition}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-neutral-800/50 rounded-lg">
                  <h4 className="text-white text-sm mb-3 flex items-center">
                    <Gift className="w-4 h-4 mr-2 text-lime-400" />
                    Related Data
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400">Ticket Types</span>
                      <div className="text-lime-400">{selectedSpecialOffer.ticketTypeIds?.length || 0}</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Usage Count</span>
                      <div className="text-lime-400">-</div>
                    </div>
                    <div>
                      <span className="text-neutral-400">Remaining</span>
                      <div className="text-lime-400">{selectedSpecialOffer.ticketLimit}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center text-neutral-400 py-8">
              <Percent className="w-12 h-12 mx-auto mb-4 text-neutral-600" />
              <p>Select a special offer to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showOfferDialog && (
        <SpecialOfferDialog
          offer={editingOffer}
          ticketTypes={ticketTypes}
          onSave={(formData) => {
            if (editingOffer) {
              handleUpdateSpecialOffer(editingOffer.specialOfferId, formData as SpecialOfferUpdateForm);
            } else {
              handleCreateSpecialOffer(formData as SpecialOfferCreateForm);
            }
          }}
          onCancel={() => {
            setShowOfferDialog(false);
            setEditingOffer(null);
          }}
        />
      )}
    </div>
  );
};

// Modal Component
interface SpecialOfferDialogProps {
  offer?: SpecialOfferResponse | null;
  ticketTypes: TicketTypeResponse[];
  onSave: (formData: SpecialOfferCreateForm | SpecialOfferUpdateForm) => void;
  onCancel: () => void;
}

const SpecialOfferDialog = ({ offer, ticketTypes, onSave, onCancel }: SpecialOfferDialogProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    offerType: 0 as OfferType,
    startDate: new Date(),
    endDate: new Date(),
    applicationCondition: '',
    discountValue: 0,
    ticketLimit: 0
  });

  useEffect(() => {
    if (offer) {
      setFormData({
        name: offer.name || '',
        description: offer.description || '',
        offerType: offer.offerType,
        startDate: new Date(offer.startDate),
        endDate: new Date(offer.endDate),
        applicationCondition: offer.applicationCondition || '',
        discountValue: offer.discountValue,
        ticketLimit: offer.ticketLimit
      });
    } else {
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      setFormData({
        name: '',
        description: '',
        offerType: 0,
        startDate: now,
        endDate: nextWeek,
        applicationCondition: '',
        discountValue: 10,
        ticketLimit: 100
      });
    }
  }, [offer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {offer ? 'Edit Special Offer' : 'Create New Special Offer'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all h-20 resize-none"
              placeholder="Describe this special offer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-neutral-300">Offer Type</label>
            <select
              value={formData.offerType.toString()}
              onChange={(e) => setFormData(prev => ({ ...prev, offerType: Number(e.target.value) as OfferType }))}
              className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
              required
            >
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Start Date</label>
              <input
                type="date"
                value={formData.startDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">End Date</label>
              <input
                type="date"
                value={formData.endDate.toISOString().split('T')[0]}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Discount Value (%)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: Number(e.target.value) }))}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-neutral-300">Ticket Limit</label>
              <input
                type="number"
                min="0"
                value={formData.ticketLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, ticketLimit: Number(e.target.value) }))}
                className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                placeholder="0 (unlimited)"
                required
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
              onClick={onCancel}
              className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 p-3 bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 rounded-xl transition-all duration-200"
            >
              {offer ? 'Update Offer' : 'Create Offer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SpecialOffers;