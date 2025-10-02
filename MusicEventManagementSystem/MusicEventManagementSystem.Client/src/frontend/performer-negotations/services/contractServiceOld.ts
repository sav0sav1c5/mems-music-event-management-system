import { api } from '../../shared/services/apiService';

// Simplified types matching new backend DTOs
export interface ContractDto {
  contractId: number;
  title: string;
  contractType: string;
  price: number;
  version: string;
  status: string;
  createdAt: string;
  signedAt?: string;

  // Contract Document Information
  draftContractDocument: string;
  finalContractDocument: string;
  contractFilePath: string;
  draftPreparedDate?: string;
  finalVersionDate?: string;

  // Rider and Special Requirements
  riderRequirements: string;
  technicalRequirements: string;
  hospitalityRequirements: string;
  transportationRequirements: string;
  accommodationRequirements: string;

  // Payment Information
  depositAmount?: number;
  finalPaymentAmount?: number;
  depositDueDate?: string;
  finalPaymentDueDate?: string;
  paymentTerms: string;
  paymentMethod: string;
  isDepositPaid: boolean;
  isFinalPaymentPaid: boolean;

  // Legal and Review Information
  legalReviewNotes: string;
  legalReviewedBy: string;
  legalReviewDate?: string;
  stakeholderReviewNotes: string;
  reviewedByStakeholders: string;
  stakeholderReviewDate?: string;

  // Revision History
  revisionNotes: string;
  revisionCount: number;
  lastRevisionDate?: string;
  revisedBy: string;

  // Additional Information
  notes: string;
  internalNotes: string;
  lastUpdated?: string;
  updatedBy: string;

  // Related entities (populated from navigation properties)
  performerId: number;
  performerName?: string;
  performerEmail?: string;
  performerPhone?: string;
  eventId?: number;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}

export interface CreateContractDto {
  title: string;
  contractType: string;
  price: number;
  version: string;
  status: string;
  performerId: number;
  eventId?: number;
  
  // Requirements
  riderRequirements?: string;
  technicalRequirements?: string;
  hospitalityRequirements?: string;
  transportationRequirements?: string;
  accommodationRequirements?: string;
  
  // Payment Information
  depositAmount?: number;
  finalPaymentAmount?: number;
  depositDueDate?: string;
  finalPaymentDueDate?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  
  // Notes
  notes?: string;
}

export interface UpdateContractDto {
  title?: string;
  contractType?: string;
  price?: number;
  version?: string;
  status?: string;

  // Document Updates
  draftContractDocument?: string;
  finalContractDocument?: string;
  contractFilePath?: string;

  // Requirements Updates
  riderRequirements?: string;
  technicalRequirements?: string;
  hospitalityRequirements?: string;
  transportationRequirements?: string;
  accommodationRequirements?: string;

  // Payment Updates
  depositAmount?: number;
  finalPaymentAmount?: number;
  depositDueDate?: string;
  finalPaymentDueDate?: string;
  paymentTerms?: string;
  paymentMethod?: string;
  isDepositPaid?: boolean;
  isFinalPaymentPaid?: boolean;

  // Review Information Updates
  legalReviewNotes?: string;
  legalReviewedBy?: string;
  legalReviewDate?: string;
  stakeholderReviewNotes?: string;
  reviewedByStakeholders?: string;
  stakeholderReviewDate?: string;

  // Revision Updates
  revisionNotes?: string;
  revisedBy?: string;

  // General Updates
  notes?: string;
  internalNotes?: string;
  updatedBy?: string;
}

const API_ENDPOINT = '/contract';

export const contractService = {
  // Get all contracts
  getAllContracts: async (): Promise<ContractDto[]> => {
    try {
      const response = await api.get<ContractDto[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw error;
    }
  },

  // Get contract by ID
  getContractById: async (id: number): Promise<ContractDto> => {
    try {
      const response = await api.get<ContractDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw error;
    }
  },

  // Create new contract
  createContract: async (contract: CreateContractDto): Promise<ContractDto> => {
    try {
      const response = await api.post<ContractDto>(API_ENDPOINT, contract);
      return response.data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  // Update contract (simplified - no workflow stages)
  updateContract: async (id: number, contract: UpdateContractDto): Promise<ContractDto> => {
    try {
      const response = await api.put<ContractDto>(`${API_ENDPOINT}/${id}/update`, contract);
      return response.data;
    } catch (error) {
      console.error('Error updating contract:', error);
      throw error;
    }
  },

  // Delete contract
  deleteContract: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting contract:', error);
      throw error;
    }
  },

  // Create contract draft from negotiation (only available in phases 3, 4, 5)
  createContractDraft: async (negotiationId: number): Promise<ContractDto> => {
    try {
      const response = await api.post<ContractDto>(`${API_ENDPOINT}/draft/${negotiationId}`);
      return response.data;
    } catch (error) {
      console.error('Error creating contract draft:', error);
      throw error;
    }
  },

  // Get contract with details including performer and event data
  getContractWithDetails: async (contractId: number): Promise<ContractDto> => {
    try {
      const response = await api.get<ContractDto>(`${API_ENDPOINT}/${contractId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract details:', error);
      throw error;
    }
  }
};
