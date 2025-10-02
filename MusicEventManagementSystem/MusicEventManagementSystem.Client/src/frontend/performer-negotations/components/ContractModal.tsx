import React, { useState, useEffect } from 'react';
import { X, Save, Edit, FileText, CreditCard, Settings, MessageSquare, Building, Download } from 'lucide-react';
import { contractService } from '../services/contractService';
import type { ContractDto, UpdateContractDto } from '../services/contractService';
import { generateContractPDF } from '../services/contractPDFService';

interface ContractModalProps {
  contractId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (contract: ContractDto) => void;
  mode: 'view' | 'edit';
  currentPhase?: { phaseId: number; phaseName: string }; // To check if editing is allowed
}

const ContractModal: React.FC<ContractModalProps> = ({
  contractId,
  isOpen,
  onClose,
  onSave,
  mode: initialMode,
  currentPhase
}) => {
  const [contract, setContract] = useState<ContractDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode);
  const [editedContract, setEditedContract] = useState<UpdateContractDto>({});
  
  // Tab state for horizontal navigation
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'banking', label: 'Banking', icon: Building },
    { id: 'requirements', label: 'Requirements', icon: Settings },
    { id: 'notes', label: 'Notes', icon: MessageSquare }
  ];

  useEffect(() => {
    if (isOpen && contractId) {
      fetchContractDetails();
    }
  }, [isOpen, contractId]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const fetchContractDetails = async () => {
    if (!contractId) return;

    try {
      setLoading(true);
      setError(null);
      const contractDetails = await contractService.getContractWithDetails(contractId);
      setContract(contractDetails);
      
      // Initialize editedContract with current values
      setEditedContract({
        title: contractDetails.title,
        contractType: contractDetails.contractType,
        price: contractDetails.price,
        version: contractDetails.version,
        status: contractDetails.status,
        signedAt: contractDetails.signedAt,
        contractFilePath: contractDetails.contractFilePath,
        finalVersionDate: contractDetails.finalVersionDate,
        technicalRequirements: contractDetails.technicalRequirements,
        accommodationRequirements: contractDetails.accommodationRequirements,
        depositAmount: contractDetails.depositAmount,
        finalPaymentAmount: contractDetails.finalPaymentAmount,
        depositDueDate: contractDetails.depositDueDate,
        finalPaymentDueDate: contractDetails.finalPaymentDueDate,
        paymentMethod: contractDetails.paymentMethod,
        isDepositPaid: contractDetails.isDepositPaid,
        isFinalPaymentPaid: contractDetails.isFinalPaymentPaid,
        bankName: contractDetails.bankName,
        bankAccountNumber: contractDetails.bankAccountNumber,
        bankRoutingNumber: contractDetails.bankRoutingNumber,
        bankAccountHolderName: contractDetails.bankAccountHolderName,
        bankIBAN: contractDetails.bankIBAN,
        bankSWIFT: contractDetails.bankSWIFT,
        reviewedByStakeholders: contractDetails.reviewedByStakeholders,
        stakeholderReviewDate: contractDetails.stakeholderReviewDate,
        notes: contractDetails.notes
      });
    } catch (err) {
      setError('Failed to load contract details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contract || !contractId) return;

    try {
      setLoading(true);
      setError(null);
      const updatedContract = await contractService.updateContract(contractId, editedContract);
      setContract(updatedContract);
      setMode('view');
      onSave?.(updatedContract);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save contract');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (contract) {
      // Reset to original values
      setEditedContract({
        title: contract.title,
        contractType: contract.contractType,
        price: contract.price,
        version: contract.version,
        status: contract.status,
        signedAt: contract.signedAt,
        contractFilePath: contract.contractFilePath,
        finalVersionDate: contract.finalVersionDate,
        technicalRequirements: contract.technicalRequirements,
        accommodationRequirements: contract.accommodationRequirements,
        depositAmount: contract.depositAmount,
        finalPaymentAmount: contract.finalPaymentAmount,
        depositDueDate: contract.depositDueDate,
        finalPaymentDueDate: contract.finalPaymentDueDate,
        paymentMethod: contract.paymentMethod,
        isDepositPaid: contract.isDepositPaid,
        isFinalPaymentPaid: contract.isFinalPaymentPaid,
        bankName: contract.bankName,
        bankAccountNumber: contract.bankAccountNumber,
        bankRoutingNumber: contract.bankRoutingNumber,
        bankAccountHolderName: contract.bankAccountHolderName,
        bankIBAN: contract.bankIBAN,
        bankSWIFT: contract.bankSWIFT,
        reviewedByStakeholders: contract.reviewedByStakeholders,
        stakeholderReviewDate: contract.stakeholderReviewDate,
        notes: contract.notes
      });
    }
    setMode('view');
  };

  const handleExportToPDF = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      await generateContractPDF(contract);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError('Failed to generate PDF. Please make sure jsPDF is installed: npm install jspdf');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateContractDto, value: string | number | boolean | Date | null) => {
    setEditedContract(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if editing is allowed based on current negotiation phase
  const isEditingAllowed = currentPhase && [3, 4, 5].includes(currentPhase.phaseId);

  if (!isOpen) return null;

  // Render tab content based on active tab
  const renderTabContent = () => {
    const isEditable = mode === 'edit' && isEditingAllowed;

    switch (activeTab) {
      case 'basic':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Contract Number
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.title || '') : (contract?.title || '')}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Contract Type
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.contractType || '') : (contract?.contractType || '')}
                  onChange={(e) => handleInputChange('contractType', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Total Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={isEditable ? (editedContract.price || 0) : (contract?.price || 0)}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Version
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.version || '') : (contract?.version || '')}
                  onChange={(e) => handleInputChange('version', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Status
                </label>
                <select
                  value={isEditable ? (editedContract.status || '') : (contract?.status || '')}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                >
                  <option value="">Select Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Review">Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Signed">Signed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Event Location
                </label>
                <input
                  type="text"
                  value={contract?.eventLocation || 'Not specified'}
                  disabled
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-neutral-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Contract File Path
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.contractFilePath || '') : (contract?.contractFilePath || '')}
                  onChange={(e) => handleInputChange('contractFilePath', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter contract file path..."
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isEditable ? Boolean(editedContract.reviewedByStakeholders) : Boolean(contract?.reviewedByStakeholders)}
                    onChange={(e) => handleInputChange('reviewedByStakeholders', e.target.checked)}
                    disabled={!isEditable}
                    className="mr-2 h-4 w-4 text-purple-600 rounded border-neutral-600 bg-neutral-800 focus:ring-purple-500"
                  />
                  <span className="text-neutral-300">Reviewed by Stakeholders</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Deposit Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={isEditable ? (editedContract.depositAmount || 0) : (contract?.depositAmount || 0)}
                  onChange={(e) => handleInputChange('depositAmount', parseFloat(e.target.value) || 0)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Final Payment Amount
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={isEditable ? (editedContract.finalPaymentAmount || 0) : (contract?.finalPaymentAmount || 0)}
                  onChange={(e) => handleInputChange('finalPaymentAmount', parseFloat(e.target.value) || 0)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Deposit Due Date
                </label>
                <input
                  type="date"
                  value={isEditable 
                    ? (editedContract.depositDueDate ? new Date(editedContract.depositDueDate).toISOString().split('T')[0] : '')
                    : (contract?.depositDueDate ? new Date(contract.depositDueDate).toISOString().split('T')[0] : '')
                  }
                  onChange={(e) => handleInputChange('depositDueDate', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Final Payment Due Date
                </label>
                <input
                  type="date"
                  value={isEditable 
                    ? (editedContract.finalPaymentDueDate ? new Date(editedContract.finalPaymentDueDate).toISOString().split('T')[0] : '')
                    : (contract?.finalPaymentDueDate ? new Date(contract.finalPaymentDueDate).toISOString().split('T')[0] : '')
                  }
                  onChange={(e) => handleInputChange('finalPaymentDueDate', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Payment Method
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.paymentMethod || '') : (contract?.paymentMethod || '')}
                  onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="e.g., Bank Transfer, Check, etc."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isEditable ? Boolean(editedContract.isDepositPaid) : Boolean(contract?.isDepositPaid)}
                    onChange={(e) => handleInputChange('isDepositPaid', e.target.checked)}
                    disabled={!isEditable}
                    className="mr-2 h-4 w-4 text-purple-600 rounded border-neutral-600 bg-neutral-800 focus:ring-purple-500"
                  />
                  <span className="text-neutral-300">Deposit Paid</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isEditable ? Boolean(editedContract.isFinalPaymentPaid) : Boolean(contract?.isFinalPaymentPaid)}
                    onChange={(e) => handleInputChange('isFinalPaymentPaid', e.target.checked)}
                    disabled={!isEditable}
                    className="mr-2 h-4 w-4 text-purple-600 rounded border-neutral-600 bg-neutral-800 focus:ring-purple-500"
                  />
                  <span className="text-neutral-300">Final Payment Paid</span>
                </label>
              </div>
            </div>
          </div>
        );

      case 'banking':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.bankName || '') : (contract?.bankName || '')}
                  onChange={(e) => handleInputChange('bankName', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter bank name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.bankAccountHolderName || '') : (contract?.bankAccountHolderName || '')}
                  onChange={(e) => handleInputChange('bankAccountHolderName', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter account holder name..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.bankAccountNumber || '') : (contract?.bankAccountNumber || '')}
                  onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter account number..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Routing Number
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.bankRoutingNumber || '') : (contract?.bankRoutingNumber || '')}
                  onChange={(e) => handleInputChange('bankRoutingNumber', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter routing number..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.bankIBAN || '') : (contract?.bankIBAN || '')}
                  onChange={(e) => handleInputChange('bankIBAN', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter IBAN..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  SWIFT/BIC Code
                </label>
                <input
                  type="text"
                  value={isEditable ? (editedContract.bankSWIFT || '') : (contract?.bankSWIFT || '')}
                  onChange={(e) => handleInputChange('bankSWIFT', e.target.value)}
                  disabled={!isEditable}
                  className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter SWIFT/BIC code..."
                />
              </div>
            </div>
          </div>
        );

      case 'requirements':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Technical Requirements
              </label>
              <textarea
                value={isEditable ? (editedContract.technicalRequirements || '') : (contract?.technicalRequirements || '')}
                onChange={(e) => handleInputChange('technicalRequirements', e.target.value)}
                disabled={!isEditable}
                rows={6}
                className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                placeholder="Enter technical requirements (sound, lighting, stage setup, etc.)..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Accommodation Requirements
              </label>
              <textarea
                value={isEditable ? (editedContract.accommodationRequirements || '') : (contract?.accommodationRequirements || '')}
                onChange={(e) => handleInputChange('accommodationRequirements', e.target.value)}
                disabled={!isEditable}
                rows={6}
                className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                placeholder="Enter accommodation requirements (hotel, transportation, catering, etc.)..."
              />
            </div>
          </div>
        );

      case 'notes':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Contract Notes
              </label>
              <textarea
                value={isEditable ? (editedContract.notes || '') : (contract?.notes || '')}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                disabled={!isEditable}
                rows={10}
                className="w-full p-3 bg-neutral-800 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
                placeholder="Enter any additional notes or comments about the contract..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-neutral-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 p-6 border-b border-neutral-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-6 h-6 text-purple-400" />
              <h2 className="text-xl font-semibold text-white">
                {mode === 'edit' ? 'Edit Contract' : 'Contract Details'}
              </h2>
              {contract?.title && (
                <span className="text-neutral-400">- {contract.title}</span>
              )}
              {currentPhase && (
                <span className="ml-4 px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">
                  Phase {currentPhase.phaseId}: {currentPhase.phaseName}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {mode === 'view' && (
                <button
                  onClick={handleExportToPDF}
                  disabled={loading}
                  className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 mr-1" />
                  {loading ? 'Generating...' : 'Export PDF'}
                </button>
              )}
              {mode === 'view' && isEditingAllowed && (
                <button
                  onClick={() => setMode('edit')}
                  className="flex items-center px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
              {mode === 'edit' && (
                <>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center px-3 py-1 bg-neutral-600 hover:bg-neutral-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-1 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Phase restriction notice */}
          {!isEditingAllowed && (
            <div className="mt-3 p-2 bg-yellow-500/20 border border-yellow-500/30 rounded-lg text-yellow-400 text-xs">
              Contract can only be edited during phases 3 (Contract Negotiations), 4 (Contract Draft), or 5 (Final Agreement).
              {currentPhase && ` Currently in phase ${currentPhase.phaseId}: ${currentPhase.phaseName}`}
            </div>
          )}

          {/* Horizontal Tabs */}
          <div className="mt-4 flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-neutral-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {contract && renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ContractModal;