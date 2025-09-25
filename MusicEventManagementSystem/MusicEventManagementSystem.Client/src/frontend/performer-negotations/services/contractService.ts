import { api } from '../../shared/services/apiService';

// Types matching backend DTOs
export interface ContractDto {
  contractId: number;
  title: string;
  contractType: string;
  price: number;
  version: string;
  status: string;
  createdAt: string; // DateTime from backend as ISO string
  signedAt?: string;
  performerId: number; // Foreign key from new relationships
  phase?: PhaseDto; // Optional navigation property
}

export interface CreateContractDto {
  title: string;
  contractType: string;
  price: number;
  version: string;
  status: string;
  performerId: number;
}

export interface PhaseDto {
  phaseId: number;
  name: string;
  status: string;
  startDate: string;
  endDate?: string;
  negotiationId: number;
  contractId?: number;
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

  // Update contract
  updateContract: async (id: number, contract: Partial<ContractDto>): Promise<ContractDto> => {
    try {
      const response = await api.put<ContractDto>(`${API_ENDPOINT}/${id}`, contract);
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

  // Get contracts by performer ID (new relationship)
  getContractsByPerformer: async (performerId: number): Promise<ContractDto[]> => {
    try {
      const response = await api.get<ContractDto[]>(`${API_ENDPOINT}/performer/${performerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contracts by performer:', error);
      throw error;
    }
  },

  // Sign contract
  signContract: async (id: number): Promise<ContractDto> => {
    try {
      const response = await api.put<ContractDto>(`${API_ENDPOINT}/${id}/sign`);
      return response.data;
    } catch (error) {
      console.error('Error signing contract:', error);
      throw error;
    }
  },

  // Get contract with phase details
  getContractWithPhase: async (id: number): Promise<ContractDto> => {
    try {
      const response = await api.get<ContractDto>(`${API_ENDPOINT}/${id}/with-phase`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contract with phase:', error);
      throw error;
    }
  },
};
