import { api } from '../../shared/services/apiService';
import type { NegotiationPhase } from './phaseService';

// DTO interfaces matching backend
export interface NegotiationDto {
  negotiationId: number;
  proposedFee: number;
  status: string;
  startDate: Date;
  endDate: Date;
  performerId?: number;
  // Navigation properties
  performer?: any;
  communications?: any[];
  documents?: any[];
  negotiationPhases?: NegotiationPhase[];
}

export interface CreateNegotiationDto {
  proposedFee: number;
  status: string;
  startDate: Date;
  endDate: Date;
  performerId?: number;
}

const API_ENDPOINT = '/negotiation';

export const negotiationService = {
  // Get all negotiations
  getAllNegotiations: async (): Promise<NegotiationDto[]> => {
    try {
      const response = await api.get<NegotiationDto[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiations:', error);
      throw error;
    }
  },

  // Get negotiation by ID
  getNegotiationById: async (id: number): Promise<NegotiationDto> => {
    try {
      const response = await api.get<NegotiationDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiation:', error);
      throw error;
    }
  },

  // Create new negotiation
  createNegotiation: async (negotiation: CreateNegotiationDto): Promise<NegotiationDto> => {
    try {
      const response = await api.post<NegotiationDto>(API_ENDPOINT, negotiation);
      return response.data;
    } catch (error) {
      console.error('Error creating negotiation:', error);
      throw error;
    }
  },

  // Update negotiation
  updateNegotiation: async (id: number, negotiation: Partial<NegotiationDto>): Promise<NegotiationDto> => {
    try {
      const response = await api.put<NegotiationDto>(`${API_ENDPOINT}/${id}`, negotiation);
      return response.data;
    } catch (error) {
      console.error('Error updating negotiation:', error);
      throw error;
    }
  },

  // Delete negotiation
  deleteNegotiation: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting negotiation:', error);
      throw error;
    }
  },

  // Get negotiations by performer ID (new relationship)
  getNegotiationsByPerformer: async (performerId: number): Promise<NegotiationDto[]> => {
    try {
      const response = await api.get<NegotiationDto[]>(`${API_ENDPOINT}/performer/${performerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiations by performer:', error);
      throw error;
    }
  },

  // Update negotiation status
  updateNegotiationStatus: async (id: number, status: string): Promise<NegotiationDto> => {
    try {
      const response = await api.put<NegotiationDto>(`${API_ENDPOINT}/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating negotiation status:', error);
      throw error;
    }
  },

  // ============ NEW PHASE-RELATED METHODS ============

  // Get negotiation phases for a negotiation
  getNegotiationPhases: async (negotiationId: number): Promise<NegotiationPhase[]> => {
    try {
      const response = await api.get<NegotiationPhase[]>(`${API_ENDPOINT}/${negotiationId}/phases`);
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiation phases:', error);
      throw error;
    }
  },

  // Initialize phases for a negotiation (creates NegotiationPhase records from global templates)
  initializeNegotiationPhases: async (negotiationId: number): Promise<NegotiationPhase[]> => {
    try {
      const response = await api.post<NegotiationPhase[]>(`${API_ENDPOINT}/${negotiationId}/phases/initialize`);
      return response.data;
    } catch (error) {
      console.error('Error initializing negotiation phases:', error);
      throw error;
    }
  },

  // Advance to next phase
  advanceToNextPhase: async (negotiationId: number): Promise<NegotiationDto> => {
    try {
      const response = await api.post<NegotiationDto>(`${API_ENDPOINT}/${negotiationId}/phases/advance`);
      return response.data;
    } catch (error) {
      console.error('Error advancing negotiation phase:', error);
      throw error;
    }
  },

  // Set specific phase as completed
  markPhaseCompleted: async (negotiationId: number, phaseId: number): Promise<NegotiationPhase> => {
    try {
      const response = await api.put<NegotiationPhase>(`${API_ENDPOINT}/${negotiationId}/phases/${phaseId}/complete`);
      return response.data;
    } catch (error) {
      console.error('Error marking phase as completed:', error);
      throw error;
    }
  },

  // Get current active phase for negotiation
  getCurrentPhase: async (negotiationId: number): Promise<NegotiationPhase | null> => {
    try {
      const response = await api.get<NegotiationPhase>(`${API_ENDPOINT}/${negotiationId}/phases/current`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current phase:', error);
      return null; // Return null if no active phase
    }
  },

  // Get negotiation with phases included
  getNegotiationWithPhases: async (id: number): Promise<NegotiationDto> => {
    try {
      const response = await api.get<NegotiationDto>(`${API_ENDPOINT}/${id}?includePhases=true`);
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiation with phases:', error);
      throw error;
    }
  },
};
