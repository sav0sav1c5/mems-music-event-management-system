import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Gift, Percent, Tag, Clock, Users, Target, CheckCircle, XCircle } from 'lucide-react';
import { SpecialOfferService } from '../services/specialOfferService';
import type { SpecialOfferResponse, OfferType } from '../types';
import type { SpecialOfferCreateForm, SpecialOfferUpdateForm } from '../types/forms/specialOffer';
import { CustomSelect } from '../components/customSelect';
import type { CustomSelectOption } from '../components/customSelect';
import FormPanel from '../components/formPanel';
import type { FormField } from '../components/formPanel';
import { toast } from 'react-toastify';

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

const specialOfferFields: FormField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Enter offer name' },
  { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Enter description' },
  { 
    name: 'offerType', 
    label: 'Offer Type', 
    type: 'select', 
    required: true,
    options: [0, 1, 2, 3, 4, 5, 6, 7, 8].map(type => ({
      value: type,
      label: formatOfferType(type as OfferType)
    }))
  },
  { name: 'discountValue', label: 'Discount Value', type: 'number', required: true, placeholder: '0' },
  { name: 'ticketLimit', label: 'Ticket Limit', type: 'number', required: true, placeholder: '0' },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date', type: 'date', required: true },
  { name: 'applicationCondition', label: 'Application Condition', type: 'textarea', placeholder: 'Enter application conditions' }
];

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

const SpecialOffers = () => {
  const [specialOffers, setSpecialOffers] = useState<SpecialOfferResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  
  // Panel state
  const [selectedOffer, setSelectedOffer] = useState<SpecialOfferResponse | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'view' | 'create' | 'edit'>('view');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [offerForm, setOfferForm] = useState<SpecialOfferCreateForm>({
    name: '',
    description: '',
    offerType: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days from now
    applicationCondition: '',
    discountValue: 0,
    ticketLimit: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const offersData = await SpecialOfferService.getAllSpecialOffers();
      setSpecialOffers(offersData);
    } catch (error) {
      console.error('Error loading special offers:', error);
      setError('Failed to load special offers');
    } finally {
      setLoading(false);
    }
  };

  const getOfferStatus = (offer: SpecialOfferResponse) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-400/20 text-blue-400 border-blue-400/30', icon: Clock };
    if (now > endDate) return { status: 'expired', color: 'bg-red-400/20 text-red-400 border-red-400/30', icon: XCircle };
    return { status: 'active', color: 'bg-green-400/20 text-green-400 border-green-400/30', icon: CheckCircle };
  };

  // CRUD Operations
  const handleCreateOffer = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!offerForm.name || offerForm.discountValue < 0 || offerForm.ticketLimit < 0) {
        setError('Please fill all required fields with valid values');
        return;
      }

      if (offerForm.startDate >= offerForm.endDate) {
        setError('End date must be after start date');
        return;
      }

      const created = await SpecialOfferService.createSpecialOffer(offerForm);
      setSpecialOffers(prev => [...prev, created]);

      toast.success('Special offer created successfully');

      closePanel();
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to create special offer');
      toast.error(err.message || 'Failed to create special offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateOffer = async () => {
    if (!selectedOffer) return;
    
    try {
      setSubmitting(true);
      setError(null);

      const updateForm: SpecialOfferUpdateForm = {
        name: offerForm.name,
        description: offerForm.description,
        offerType: offerForm.offerType,
        startDate: offerForm.startDate,
        endDate: offerForm.endDate,
        applicationCondition: offerForm.applicationCondition,
        discountValue: offerForm.discountValue,
        ticketLimit: offerForm.ticketLimit
      };

      const updated = await SpecialOfferService.updateSpecialOffer(
        selectedOffer.specialOfferId, 
        updateForm
      );
      
      setSpecialOffers(prev => 
        prev.map(offer => 
          offer.specialOfferId === selectedOffer.specialOfferId ? updated : offer
        )
      );
      setSelectedOffer(updated);

      toast.success('Special offer updated successfully');

      setPanelMode('view');
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to update special offer');
      toast.error(err.message || 'Failed to update special offer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    if (!confirm('Are you sure you want to delete this special offer?')) return;
    
    try {
      setError(null);
      await SpecialOfferService.deleteSpecialOffer(offerId);
      setSpecialOffers(prev => prev.filter(offer => offer.specialOfferId !== offerId));
      
      toast.success('Special offer deleted successfully!');

      if (selectedOffer?.specialOfferId === offerId) {
        closePanel();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete special offer');
      toast.error(err.message || 'Failed to delete special offer');
    }
  };

  const resetForm = () => {
    setOfferForm({
      name: '',
      description: '',
      offerType: 0,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      applicationCondition: '',
      discountValue: 0,
      ticketLimit: 0
    });
  };

  const openCreatePanel = () => {
    resetForm();
    setSelectedOffer(null);
    setPanelMode('create');
    setShowPanel(true);
    setError(null);
  };

  const openEditPanel = (offer: SpecialOfferResponse) => {
    setSelectedOffer(offer);
    setOfferForm({
      name: offer.name || '',
      description: offer.description || '',
      offerType: offer.offerType,
      startDate: new Date(offer.startDate),
      endDate: new Date(offer.endDate),
      applicationCondition: offer.applicationCondition || '',
      discountValue: offer.discountValue,
      ticketLimit: offer.ticketLimit
    });
    setPanelMode('edit');
    setShowPanel(true);
    setError(null);
  };

  const openViewPanel = (offer: SpecialOfferResponse) => {
    setSelectedOffer(offer);
    setPanelMode('view');
    setShowPanel(true);
    setError(null);
  };

  const closePanel = () => {
    setShowPanel(false);
    setSelectedOffer(null);
    setPanelMode('view');
    setError(null);
    resetForm();
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

  const statusOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'expired', label: 'Expired' }
  ];

    const typeOptions: CustomSelectOption[] = [
    { value: 'all', label: 'All Types' },
    ...([0, 1, 2, 3, 4, 5, 6, 7, 8].map(type => ({
      value: type.toString(),
      label: formatOfferType(type as OfferType)
    })))
  ];

  const filteredOffers = getFilteredOffers();

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
      title: "Upcoming",
      value: specialOffers.filter(offer => getOfferStatus(offer).status === 'upcoming').length.toString(),
      change: 15.3,
      trend: "up" as const,
      icon: Clock,
    },
    {
      title: "Expired",
      value: specialOffers.filter(offer => getOfferStatus(offer).status === 'expired').length.toString(),
      change: -3.2,
      trend: "down" as const,
      icon: XCircle,
    },
  ];

  const getPanelTitle = () => {
    switch (panelMode) {
      case 'create': return 'Create New Special Offer';
      case 'edit': return 'Edit Special Offer';
      default: return 'Special Offer Details';
    }
  };

  return (
    <div className="relative flex gap-3">
      {/* Main Content - Left Side */}
      <div className={`bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl transition-all duration-300 ${showPanel ? 'w-2/3' : 'w-full'}`}>
        <div className="text-white flex flex-col p-4 m-1">
          {/* Header */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">Special Offers</h1>
                <p className="text-neutral-400 text-sm">Manage discount offers and promotions</p>
              </div>
              <div className="flex gap-4 flex-wrap">
                <div className="flex gap-4 flex-wrap">
                  <CustomSelect
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    className="min-w-40"
                  />

                  <CustomSelect
                    value={typeFilter}
                    onChange={setTypeFilter}
                    options={typeOptions}
                    className="min-w-50"
                  />
                </div>
                <button 
                  onClick={openCreatePanel}
                  className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  New Offer
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

          {/* Search and Filters
          <div className="flex gap-4 mb-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  placeholder="Search offers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  statusFilter === 'all'
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                All Status
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  statusFilter === 'active'
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  statusFilter === 'upcoming'
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-4 py-3 rounded-xl text-sm transition-all duration-200 ${
                  statusFilter === 'expired'
                    ? "bg-lime-500 text-black"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                }`}
              >
                Expired
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-3 bg-neutral-800 text-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700"
              >
                <option value="all">All Types</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(type => (
                  <option key={type} value={type}>
                    {formatOfferType(type as OfferType)}
                  </option>
                ))}
              </select>

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

          {/* Offers Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-1 2xl:grid-cols-2 gap-4">
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
                  <Card 
                    key={offer.specialOfferId} 
                    hover={true}
                    onClick={() => openViewPanel(offer)}
                    className={`p-6 cursor-pointer transition-all duration-200 ${
                      selectedOffer?.specialOfferId === offer.specialOfferId && showPanel
                        ? 'bg-lime-500/20 border border-lime-500/30'
                        : ''
                    }`}
                  >
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
                        {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
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
                        <span className="text-neutral-400 text-base">Ticket Limit</span>
                        <span className="text-white font-medium text-base">{offer.ticketLimit}</span>
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
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditPanel(offer);
                          }}
                          className="p-2 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOffer(offer.specialOfferId);
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

      {/* Right Panel */}
      <FormPanel
        isOpen={showPanel}
        onClose={closePanel}
        mode={panelMode}
        title={getPanelTitle()}
        entity={selectedOffer}
        fields={specialOfferFields}
        onSubmit={panelMode === 'create' ? handleCreateOffer : handleUpdateOffer}
        loading={submitting}
      >
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          </div>
        )}
      </FormPanel>
    </div>
  );
};

export default SpecialOffers;