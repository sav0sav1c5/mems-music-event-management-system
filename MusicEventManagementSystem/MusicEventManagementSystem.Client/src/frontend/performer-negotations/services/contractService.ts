import { api } from '../../shared/services/apiService';

// Utility functions for date conversion
const formatDateForApi = (date: string | Date | null | undefined): string | null => {
  if (!date) return null;
  
  // If it's already a string in the correct format, return it
  if (typeof date === 'string') {
    // Check if it's already in ISO format
    if (date.includes('T') && date.includes('Z')) {
      return date;
    }
    // Otherwise parse and format it
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate.toISOString();
  }
  
  // If it's a Date object
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date.toISOString();
  }
  
  return null;
};

// Process UpdateContractDto to ensure proper date formatting
const processUpdateDto = (dto: UpdateContractDto): UpdateContractDto => {
  const processed = { ...dto };
  
  // Convert date fields to proper ISO strings or undefined
  if (dto.signedAt !== undefined) {
    const formatted = formatDateForApi(dto.signedAt);
    processed.signedAt = formatted || undefined;
  }
  if (dto.finalVersionDate !== undefined) {
    const formatted = formatDateForApi(dto.finalVersionDate);
    processed.finalVersionDate = formatted || undefined;
  }
  if (dto.depositDueDate !== undefined) {
    const formatted = formatDateForApi(dto.depositDueDate);
    processed.depositDueDate = formatted || undefined;
  }
  if (dto.finalPaymentDueDate !== undefined) {
    const formatted = formatDateForApi(dto.finalPaymentDueDate);
    processed.finalPaymentDueDate = formatted || undefined;
  }
  if (dto.stakeholderReviewDate !== undefined) {
    const formatted = formatDateForApi(dto.stakeholderReviewDate);
    processed.stakeholderReviewDate = formatted || undefined;
  }
  
  return processed;
};

// Process CreateContractDto to ensure proper date formatting
const processCreateDto = (dto: CreateContractDto): CreateContractDto => {
  const processed = { ...dto };
  
  // Convert date fields to proper ISO strings if they exist
  if (dto.depositDueDate) {
    const formatted = formatDateForApi(dto.depositDueDate);
    processed.depositDueDate = formatted || undefined;
  }
  if (dto.finalPaymentDueDate) {
    const formatted = formatDateForApi(dto.finalPaymentDueDate);
    processed.finalPaymentDueDate = formatted || undefined;
  }
  
  return processed;
};

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
  contractFilePath: string;
  finalVersionDate?: string;

  // Requirements
  technicalRequirements: string;
  accommodationRequirements: string;

  // Payment Information
  depositAmount?: number;
  finalPaymentAmount?: number;
  depositDueDate?: string;
  finalPaymentDueDate?: string;
  paymentMethod: string;
  isDepositPaid: boolean;
  isFinalPaymentPaid: boolean;

  // Banking Information
  bankName: string;
  bankAccountNumber: string;
  bankRoutingNumber: string;
  bankAccountHolderName: string;
  bankIBAN: string;
  bankSWIFT: string;

  // Review Information
  reviewedByStakeholders: boolean;
  stakeholderReviewDate?: string;

  // Notes
  notes: string;

  // Related entities
  performerId: number;
  performerName?: string;
  eventId?: number;
  eventTitle?: string;
  eventLocation?: string;
  eventDate?: string;
}

export interface UpdateContractDto {
  title?: string;
  contractType?: string;
  price?: number;
  version?: string;
  status?: string;
  signedAt?: string;

  // Contract Document Information
  contractFilePath?: string;
  finalVersionDate?: string;

  // Requirements
  technicalRequirements?: string;
  accommodationRequirements?: string;

  // Payment Information
  depositAmount?: number;
  finalPaymentAmount?: number;
  depositDueDate?: string;
  finalPaymentDueDate?: string;
  paymentMethod?: string;
  isDepositPaid?: boolean;
  isFinalPaymentPaid?: boolean;

  // Banking Information
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankAccountHolderName?: string;
  bankIBAN?: string;
  bankSWIFT?: string;

  // Review Information
  reviewedByStakeholders?: boolean;
  stakeholderReviewDate?: string;

  // Notes
  notes?: string;
}

export interface CreateContractDto {
  title: string;
  contractType: string;
  price: number;
  version: string;
  status: string;

  // Contract Document Information
  contractFilePath?: string;

  // Requirements
  technicalRequirements?: string;
  accommodationRequirements?: string;

  // Payment Information
  depositAmount?: number;
  finalPaymentAmount?: number;
  depositDueDate?: string;
  finalPaymentDueDate?: string;
  paymentMethod?: string;

  // Banking Information
  bankName?: string;
  bankAccountNumber?: string;
  bankRoutingNumber?: string;
  bankAccountHolderName?: string;
  bankIBAN?: string;
  bankSWIFT?: string;

  // Notes
  notes?: string;

  // Foreign Keys
  performerId: number;
  eventId?: number;
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
      // Process the contract data to ensure proper date formatting
      const processedContract = processCreateDto(contract);
      const response = await api.post<ContractDto>(API_ENDPOINT, processedContract);
      return response.data;
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  },

  // Update contract (simplified - no workflow stages)
  updateContract: async (id: number, contract: UpdateContractDto): Promise<ContractDto> => {
    try {
      // Process the contract data to ensure proper date formatting
      const processedContract = processUpdateDto(contract);
      const response = await api.put<ContractDto>(`${API_ENDPOINT}/${id}`, processedContract);
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
  },

  // Get contracts by negotiation ID
  getContractsByNegotiation: async (negotiationId: number): Promise<ContractDto[]> => {
    try {
      const response = await api.get<ContractDto[]>(`${API_ENDPOINT}/negotiation/${negotiationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contracts by negotiation:', error);
      throw error;
    }
  }
};