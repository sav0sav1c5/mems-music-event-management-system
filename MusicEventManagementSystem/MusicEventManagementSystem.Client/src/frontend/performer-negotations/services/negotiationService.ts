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
  eventId?: number;
  eventName?: string;
  performerName?: string;
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
  performerId: number;
  eventId: number;
}

export interface NegotiationPhaseDto {
  negotiationId: number;
  phaseId: number;
  phaseName: string;
  phaseDescription?: string;
  orderNumber: number;
  status: string;
  startDate?: Date;
  completedDate?: Date;
  isActive: boolean;
  completionPercentage: number;
  fulfilledRequirementsCount: number;
  totalRequirementsCount: number;
  requirementFulfillments?: NegotiationRequirementFulfillmentDto[];
}

export interface NegotiationRequirementFulfillmentDto {
  fulfillmentId: number;
  negotiationId: number;
  phaseId: number;
  requirementId: number;
  requirementTitle: string;
  requirementDescription: string;
  isRequired: boolean;
  isFulfilled: boolean;
  evidence?: string;
  notes?: string;
  fulfilledDate?: Date;
  fulfilledBy?: string;
}

export interface NegotiationWorkflowDto {
  negotiationId: number;
  proposedFee: number;
  status: string;
  startDate: Date;
  endDate: Date;
  currentPhaseOrder: number;
  
  // Related entities
  eventId: number;
  eventName?: string;
  performerId: number;
  performerName?: string;
  
  // Workflow data
  phases: NegotiationPhaseDto[];
  currentPhase?: NegotiationPhaseDto;
  communication?: CommunicationDto;
  canAdvanceToNextPhase: boolean;
  overallCompletionPercentage: number;
}

export interface CommunicationDto {
  communicationId: number;
  type: string;
  direction: string;
  content: string;
  sentAt: Date;
  repliedAt?: Date;
  negotiationId: number;
}

export interface FulfillRequirementDto {
  isFulfilled: boolean;
  fulfilledBy?: string;
  notes?: string;
  evidence?: string;
}

export interface AddCommunicationDto {
  type: string;
  direction: string;
  content: string;
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

  // ============ NEW WORKFLOW METHODS ============

  // Get complete negotiation workflow
  getNegotiationWorkflow: async (negotiationId: number): Promise<NegotiationWorkflowDto> => {
    try {
      const response = await api.get<NegotiationWorkflowDto>(`${API_ENDPOINT}/${negotiationId}/workflow`);
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiation workflow:', error);
      throw error;
    }
  },

  // Get requirements by phase
  getRequirementsByPhase: async (negotiationId: number, phaseId: number): Promise<NegotiationRequirementFulfillmentDto[]> => {
    try {
      const response = await api.get<NegotiationRequirementFulfillmentDto[]>(`${API_ENDPOINT}/${negotiationId}/requirements/phase/${phaseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching requirements by phase:', error);
      throw error;
    }
  },

  // Fulfill/unfulfill a requirement
  fulfillRequirement: async (negotiationId: number, requirementId: number, fulfillDto: FulfillRequirementDto): Promise<void> => {
    try {
      await api.put(`${API_ENDPOINT}/${negotiationId}/requirements/${requirementId}/fulfill`, fulfillDto);
    } catch (error) {
      console.error('Error fulfilling requirement:', error);
      throw error;
    }
  },

  // Add communication
  addCommunication: async (negotiationId: number, communicationDto: AddCommunicationDto): Promise<void> => {
    try {
      await api.post(`${API_ENDPOINT}/${negotiationId}/communications`, communicationDto);
    } catch (error) {
      console.error('Error adding communication:', error);
      throw error;
    }
  },

  // Get communication for negotiation
  getNegotiationCommunication: async (negotiationId: number): Promise<CommunicationDto | null> => {
    try {
      const response = await api.get<CommunicationDto>(`${API_ENDPOINT}/${negotiationId}/communications`);
      return response.data;
    } catch (error) {
      console.error('Error fetching communication:', error);
      return null;
    }
  },

  // Check if can advance to next phase
  canAdvanceToNextPhase: async (negotiationId: number): Promise<boolean> => {
    try {
      const response = await api.get<{ canAdvanceToNextPhase: boolean }>(`${API_ENDPOINT}/${negotiationId}/can-advance`);
      return response.data.canAdvanceToNextPhase;
    } catch (error) {
      console.error('Error checking if can advance:', error);
      return false;
    }
  },

  // Advance negotiation phase
  advanceNegotiationPhase: async (negotiationId: number): Promise<void> => {
    try {
      await api.post(`${API_ENDPOINT}/${negotiationId}/advance-phase`);
    } catch (error) {
      console.error('Error advancing negotiation phase:', error);
      throw error;
    }
  },

  // Complete negotiation
  completeNegotiation: async (negotiationId: number): Promise<void> => {
    try {
      await api.post(`${API_ENDPOINT}/${negotiationId}/complete`);
    } catch (error) {
      console.error('Error completing negotiation:', error);
      throw error;
    }
  },
};
