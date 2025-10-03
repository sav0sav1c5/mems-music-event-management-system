import { Card, KpiCard } from '../components/card';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Gift, Percent, Tag, Clock, Users, Target, CheckCircle, XCircle, X, Save, Loader2, Search, Filter, RefreshCw } from 'lucide-react';
import { SpecialOfferService } from '../services/specialOfferService';
import type { SpecialOfferResponse, OfferType } from '../types';
import type { SpecialOfferCreateForm, SpecialOfferUpdateForm } from '../types/forms/specialOffer';
import { CustomSelect } from '../components/customSelect';
import type { CustomSelectOption } from '../components/customSelect';
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
  
  // Panel state
  const [selectedOffer, setSelectedOffer] = useState<SpecialOfferResponse | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [panelMode, setPanelMode] = useState<'create' | 'edit'>('create');
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [offerForm, setOfferForm] = useState<SpecialOfferCreateForm>({
    name: '',
    description: '',
    offerType: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
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

    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (now > endDate) return { status: 'expired', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    return { status: 'active', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
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

      toast.success('Special offer updated successfully');
      closePanel();
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

  const closePanel = () => {
    setShowPanel(false);
    setSelectedOffer(null);
    setPanelMode('create');
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

  // Statistics
  const activeCount = specialOffers.filter(offer => getOfferStatus(offer).status === 'active').length;
  const upcomingCount = specialOffers.filter(offer => getOfferStatus(offer).status === 'upcoming').length;
  const expiredCount = specialOffers.filter(offer => getOfferStatus(offer).status === 'expired').length;

  const getPanelTitle = () => {
    return panelMode === 'create' ? 'Create New Special Offer' : 'Edit Special Offer';
  };

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        {/* Main Content Area with Right Panel */}
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Offers List */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${showPanel ? 'w-3/5' : 'w-full'}`}>
            {/* Header */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Special Offers Management</h1>
                  <p className="text-neutral-400 text-sm">Manage discount offers and promotions</p>
                </div>
                
                {/* Search and Filter */}
                <div className="flex items-center gap-3 flex-1 justify-end">
                  <div className="min-w-0 flex-1 max-w-80">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search offers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-neutral-900/90 text-white pl-12 pr-4 py-3 rounded-2xl border border-neutral-800 focus:border-lime-500 focus:outline-none focus:ring-1 focus:ring-lime-500 transition-all text-base"
                      />
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1 max-w-40">
                    <CustomSelect
                      value={statusFilter}
                      onChange={setStatusFilter}
                      options={statusOptions}
                      placeholder="All Status"
                      icon={<Filter className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>

                  <div className="min-w-0 flex-1 max-w-60">
                    <CustomSelect
                      value={typeFilter}
                      onChange={setTypeFilter}
                      options={typeOptions}
                      placeholder="All Types"
                      icon={<Filter className="w-5 h-5 text-neutral-400" />}
                    />
                  </div>

                  <button 
                    onClick={openCreatePanel}
                    className="px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 text-base bg-lime-500 text-black hover:bg-lime-400"
                  >
                    <Plus size={20} />
                    New Offer
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && !showPanel && (
              <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm mb-6">
                <div className="p-2 bg-red-500/20 rounded-xl">
                  <XCircle size={20} className="text-red-400" />
                </div>
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
              <KpiCard
                icon={Gift}
                title="Total Offers"
                value={specialOffers.length}
                change={8.2}
                changeType="percentage"
                color="lime"
              />
              
              <KpiCard
                icon={CheckCircle}
                title="Active Offers"
                value={activeCount}
                change={12.5}
                changeType="percentage"
                color="lime"
              />
              
              <KpiCard
                icon={Clock}
                title="Upcoming"
                value={upcomingCount}
                change={15.3}
                changeType="percentage"
                color="sky"
              />
              
              <KpiCard
                icon={XCircle}
                title="Expired"
                value={expiredCount}
                change={-3.2}
                changeType="percentage"
                color="orange"
              />
            </div>

            {/* Offers List */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <Card className="overflow-hidden h-full">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                  <h3 className="text-xl font-semibold text-white">Special Offers</h3>
                  <div className="flex items-center gap-4">
                    <p className="text-neutral-400 text-sm">{filteredOffers.length} offer(s) found</p>
                  </div>
                </div>
                
                <div className="mt-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 400px)' }}>
                  {loading ? (
                    <div className="flex flex-col items-center justify-center h-64">
                      <RefreshCw className="w-10 h-10 text-lime-400 animate-spin mb-3" />
                      <p className="text-neutral-400 text-base">Loading special offers...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredOffers.map((offer) => {
                        const status = getOfferStatus(offer);
                        const TypeIcon = getOfferTypeIcon(offer.offerType);
                        
                        return (
                          <Card
                            key={offer.specialOfferId}
                            className="group p-6 relative border border-neutral-800 hover:border-lime-500/50 transition-all duration-200"
                          >
                            {/* Action Buttons - Always Visible */}
                            <div className="absolute top-4 right-4 flex gap-2 opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditPanel(offer);
                                }}
                                className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-lime-500/20 hover:border-lime-500/50 transition-all duration-200"
                                title="Edit offer"
                              >
                                <Edit className="w-5 h-5 text-neutral-400 hover:text-lime-400 transition-colors" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteOffer(offer.specialOfferId);
                                }}
                                className="p-2 rounded-xl bg-neutral-800/60 border border-neutral-700 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200"
                                title="Delete offer"
                              >
                                <Trash2 className="w-5 h-5 text-neutral-400 hover:text-red-400 transition-colors" />
                              </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="bg-lime-500/20 p-3 rounded-xl border border-lime-500/30 mr-4">
                                  <TypeIcon className="w-6 h-6 text-lime-400" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-lg group-hover:text-lime-400 transition-colors">
                                    {offer.name || 'Unnamed Offer'}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${status.color}`}>
                                      {status.status.charAt(0).toUpperCase() + status.status.slice(1)}
                                    </span>
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                                      {formatOfferType(offer.offerType)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-3">
                              {offer.description && (
                                <div className="text-neutral-300 text-sm line-clamp-2">
                                  {offer.description}
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Percent className="w-5 h-5 mr-2 text-neutral-400" />
                                <span className="text-base">Discount: <span className="text-lime-400 font-medium">{offer.discountValue}%</span></span>
                              </div>
                              
                              <div className="flex items-center">
                                <Users className="w-5 h-5 mr-2 text-neutral-400" />
                                <span className="text-base">Ticket Limit: {offer.ticketLimit.toLocaleString()}</span>
                              </div>
                              
                              <div className="flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-neutral-400" />
                                <span className="text-base">
                                  {new Date(offer.startDate).toLocaleDateString()} - {new Date(offer.endDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  )}

                  {filteredOffers.length === 0 && !loading && (
                    <div className="text-center py-16 text-neutral-400">
                      <Gift size={64} className="mx-auto mb-4 opacity-50" />
                      <h4 className="text-xl mb-2">No special offers found</h4>
                      <p className="text-base">
                        {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                          ? 'Try adjusting your search criteria or filters' 
                          : 'No special offers available in the system'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Form Panel */}
          {showPanel && (
            <div className="w-2/5 transition-all duration-300">
              <Card className="overflow-hidden border border-neutral-800 shadow-xl bg-neutral-900/60 backdrop-blur-sm h-full">
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-neutral-800">
                  <h2 className="text-xl font-bold text-lime-400">
                    {getPanelTitle()}
                  </h2>
                  <button
                    onClick={closePanel}
                    className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 overflow-y-auto px-1">
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                      <div className="flex items-center gap-2">
                        <XCircle className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
                    <input
                      type="text"
                      value={offerForm.name}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter offer name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                    <textarea
                      value={offerForm.description}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Discount Value *</label>
                      <input
                        type="number"
                        value={offerForm.discountValue}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, discountValue: parseFloat(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="0"
                        min="0"
                        step="1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Ticket Limit *</label>
                      <input
                        type="number"
                        value={offerForm.ticketLimit}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, ticketLimit: parseInt(e.target.value) || 0 }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">Start Date *</label>
                      <input
                        type="datetime-local"
                        value={offerForm.startDate.toISOString().slice(0, 16)}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-neutral-300">End Date *</label>
                      <input
                        type="datetime-local"
                        value={offerForm.endDate.toISOString().slice(0, 16)}
                        onChange={(e) => setOfferForm(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                        className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Offer Type *</label>
                    <select
                      value={offerForm.offerType}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, offerType: parseInt(e.target.value) as OfferType }))}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(type => (
                        <option key={type} value={type}>
                          {formatOfferType(type as OfferType)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Application Condition</label>
                    <textarea
                      value={offerForm.applicationCondition}
                      onChange={(e) => setOfferForm(prev => ({ ...prev, applicationCondition: e.target.value }))}
                      className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                      placeholder="Enter application conditions"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-4 border-t border-neutral-800">
                    <button
                      type="button"
                      onClick={closePanel}
                      className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={panelMode === 'create' ? handleCreateOffer : handleUpdateOffer}
                      disabled={submitting || !offerForm.name || offerForm.discountValue < 0 || offerForm.ticketLimit < 0}
                      className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed rounded-xl transition-all duration-200 text-black font-semibold flex items-center justify-center gap-2"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {submitting ? (panelMode === 'create' ? 'Creating...' : 'Updating...') : (panelMode === 'create' ? 'Create' : 'Update')}
                    </button>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpecialOffers;