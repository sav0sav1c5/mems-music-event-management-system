import { useState, useEffect } from 'react';
import { SpecialOfferService } from '../services/specialOfferService';
import type { SpecialOfferResponse } from '../types';
import type { SpecialOfferCreateForm, SpecialOfferUpdateForm } from '../types/forms/specialOffer';
import { toast } from 'react-toastify';

import SpecialOfferHeader from '../components/special-offers/SpecialOfferHeader';
import SpecialOfferStats from '../components/special-offers/SpecialOfferStats';
import SpecialOfferList from '../components/special-offers/SpecialOfferList';
import SpecialOfferForm from '../components/special-offers/SpecialOfferForm';
import DeleteConfirmationModal from '../components/ui/DeleteConfirmationModal';

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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);
  const [offerName, setOfferName] = useState<string>('');

  // Form state
  const [offerForm, setOfferForm] = useState<SpecialOfferCreateForm>({
    name: '',
    description: '',
    offerType: 0,
    startDate: new Date(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    applicationCondition: '',
    discountValue: 0,
    ticketLimit: 0,
    ticketTypeIds: []
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
    const offer = specialOffers.find(o => o.specialOfferId === offerId);
    if (offer) {
      setOfferToDelete(offerId);
      setOfferName(offer.name || 'Unnamed Offer');
      setDeleteModalOpen(true);
    }
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    
    try {
      setError(null);
      await SpecialOfferService.deleteSpecialOffer(offerToDelete);
      setSpecialOffers(prev => prev.filter(offer => offer.specialOfferId !== offerToDelete));
      
      toast.success('Special offer deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete special offer');
      toast.error(err.message || 'Failed to delete special offer');
    } finally {
      setDeleteModalOpen(false);
      setOfferToDelete(null);
      setOfferName('');
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
      ticketLimit: 0,
      ticketTypeIds: []
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
      ticketLimit: offer.ticketLimit,
      ticketTypeIds : offer.ticketTypeIds || []
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
        offer.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const getOfferStatus = (offer: SpecialOfferResponse) => {
    const now = new Date();
    const startDate = new Date(offer.startDate);
    const endDate = new Date(offer.endDate);

    if (now < startDate) return { status: 'upcoming', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    if (now > endDate) return { status: 'expired', color: 'bg-red-500/20 text-red-400 border-red-500/30' };
    return { status: 'active', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
  };

  const filteredOffers = getFilteredOffers();

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Offers List */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${showPanel ? 'w-3/5' : 'w-full'}`}>
            
            <SpecialOfferHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              typeFilter={typeFilter}
              onTypeFilterChange={setTypeFilter}
              onCreateNew={openCreatePanel}
              error={error}
              showPanel={showPanel}
            />

            <SpecialOfferStats specialOffers={specialOffers} />

            <div className="flex-1 min-h-0">
              <SpecialOfferList
                loading={loading}
                offers={filteredOffers}
                onEdit={openEditPanel}
                onDelete={handleDeleteOffer}
                getOfferStatus={getOfferStatus}
              />
            </div>
          </div>

          {/* Right Form Panel */}
          {showPanel && (
            <div className="w-2/5 transition-all duration-300">
              <SpecialOfferForm
                panelMode={panelMode}
                offerForm={offerForm}
                onFormChange={setOfferForm}
                error={error}
                submitting={submitting}
                onSubmit={panelMode === 'create' ? handleCreateOffer : handleUpdateOffer}
                onClose={closePanel}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setOfferToDelete(null);
          setOfferName('');
        }}
        onConfirm={confirmDelete}
        title="Delete Special Offer"
        message="Are you sure you want to delete this special offer?"
        itemName={offerName}
        confirmText="Delete Offer"
        cancelText="Cancel"
      />
    </div>
  );
};

export default SpecialOffers;