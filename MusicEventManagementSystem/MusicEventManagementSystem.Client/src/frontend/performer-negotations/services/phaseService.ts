import { api } from '../../shared/services/apiService';

// Global Phase interfaces (matching backend models)
export interface Phase {
  phaseId: number;
  phaseName: string;
  description?: string;
  orderNumber: number;
  estimatedDuration: number; // Duration in days
  isGlobal: boolean;
  requirements?: Requirement[];
  negotiationPhases?: NegotiationPhase[];
}

export interface Requirement {
  requirementId: number;
  title: string;
  description: string;
  isRequired: boolean;
  createdAt: string;
  updatedAt?: string;
  phaseId: number;
  phase?: Phase;
}

export interface NegotiationPhase {
  negotiationId: number;
  phaseId: number;
  status: string;
  startDate?: string;
  completedDate?: string;
  isActive: boolean;
  negotiation?: any;
  phase?: Phase;
}

export interface NegotiationRequirementFulfillment {
  fulfillmentId: number;
  negotiationId: number;
  phaseId: number;
  requirementId: number;
  isFulfilled: boolean;
  evidence?: string;
  notes?: string;
  fulfilledDate?: string;
  fulfilledBy?: string;
}

// Create DTOs
export interface CreatePhaseDto {
  phaseName: string;
  description?: string;
  orderNumber: number;
  estimatedDuration: number;
  isGlobal: boolean;
}

export interface UpdatePhaseDto {
  phaseName: string;
  description?: string;
  orderNumber: number;
  estimatedDuration: number;
  isGlobal: boolean;
}

// Legacy interface for backward compatibility with existing components
export interface FixedPhaseTemplate {
  name: string;
  description: string;
  orderNumber: number;
  estimatedDuration: string;
  defaultRequirements: string[];
}

const API_ENDPOINT = '/phase';

export const phaseService = {
  // Global Phase Management
  getAllPhases: async (): Promise<Phase[]> => {
    try {
      const response = await api.get<Phase[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching phases:', error);
      throw error;
    }
  },

  getGlobalPhaseTemplates: async (): Promise<Phase[]> => {
    try {
      const response = await api.get<Phase[]>(`${API_ENDPOINT}/global`);
      return response.data;
    } catch (error) {
      console.error('Error fetching global phase templates:', error);
      throw error;
    }
  },

  getPhaseById: async (id: number): Promise<Phase> => {
    try {
      const response = await api.get<Phase>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching phase:', error);
      throw error;
    }
  },

  getPhaseByOrder: async (orderNumber: number): Promise<Phase> => {
    try {
      const response = await api.get<Phase>(`${API_ENDPOINT}/by-order/${orderNumber}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching phase by order:', error);
      throw error;
    }
  },

  createPhase: async (phase: CreatePhaseDto): Promise<Phase> => {
    try {
      const response = await api.post<Phase>(API_ENDPOINT, phase);
      return response.data;
    } catch (error) {
      console.error('Error creating phase:', error);
      throw error;
    }
  },

  updatePhase: async (id: number, phase: UpdatePhaseDto): Promise<Phase> => {
    try {
      const response = await api.put<Phase>(`${API_ENDPOINT}/${id}`, phase);
      return response.data;
    } catch (error) {
      console.error('Error updating phase:', error);
      throw error;
    }
  },

  deletePhase: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting phase:', error);
      throw error;
    }
  },

  initializeGlobalPhases: async (): Promise<void> => {
    try {
      await api.post(`${API_ENDPOINT}/initialize-global`);
    } catch (error) {
      console.error('Error initializing global phases:', error);
      throw error;
    }
  },

  // Negotiation Phase Management
  getNegotiationPhases: async (negotiationId: number): Promise<NegotiationPhase[]> => {
    try {
      const response = await api.get<NegotiationPhase[]>(`${API_ENDPOINT}/negotiation/${negotiationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching negotiation phases:', error);
      throw error;
    }
  },

  getCurrentNegotiationPhase: async (negotiationId: number): Promise<NegotiationPhase> => {
    try {
      const response = await api.get<NegotiationPhase>(`${API_ENDPOINT}/negotiation/${negotiationId}/current`);
      return response.data;
    } catch (error) {
      console.error('Error fetching current negotiation phase:', error);
      throw error;
    }
  },

  initializeNegotiationPhases: async (negotiationId: number): Promise<void> => {
    try {
      await api.post(`${API_ENDPOINT}/negotiation/${negotiationId}/initialize`);
    } catch (error) {
      console.error('Error initializing negotiation phases:', error);
      throw error;
    }
  },

  advanceToNextPhase: async (negotiationId: number): Promise<void> => {
    try {
      await api.post(`${API_ENDPOINT}/negotiation/${negotiationId}/advance`);
    } catch (error) {
      console.error('Error advancing to next phase:', error);
      throw error;
    }
  },

  completePhase: async (negotiationId: number, phaseId: number): Promise<void> => {
    try {
      await api.post(`${API_ENDPOINT}/negotiation/${negotiationId}/phase/${phaseId}/complete`);
    } catch (error) {
      console.error('Error completing phase:', error);
      throw error;
    }
  },

  canAdvanceToNextPhase: async (negotiationId: number): Promise<boolean> => {
    try {
      const response = await api.get<{canAdvance: boolean}>(`${API_ENDPOINT}/negotiation/${negotiationId}/can-advance`);
      return response.data.canAdvance;
    } catch (error) {
      console.error('Error checking if can advance to next phase:', error);
      throw error;
    }
  },

  // Helper function to convert database phases to legacy format for backward compatibility
  convertToLegacyFormat: (phases: Phase[]): FixedPhaseTemplate[] => {
    return phases.map(phase => ({
      name: phase.phaseName,
      description: phase.description || '',
      orderNumber: phase.orderNumber,
      estimatedDuration: `${phase.estimatedDuration}.00:00:00`, // Convert days to TimeSpan format
      defaultRequirements: phase.requirements?.map(req => req.title) || []
    }));
  },

  // Backward compatibility - returns phases in legacy format
  getFixedPhases: async (): Promise<FixedPhaseTemplate[]> => {
    try {
      const phases = await phaseService.getGlobalPhaseTemplates();
      return phaseService.convertToLegacyFormat(phases);
    } catch (error) {
      console.error('Error fetching fixed phases:', error);
      // Fallback to hardcoded phases if API fails
      return [
        {
          name: "Initial Contact",
          description: "First contact and initial negotiations",
          orderNumber: 1,
          estimatedDuration: "3.00:00:00",
          defaultRequirements: [
            "Contact performer's management team",
            "Send initial proposal",
            "Schedule preliminary meeting"
          ]
        },
        {
          name: "Proposal Review",
          description: "Review and evaluation of proposals",
          orderNumber: 2,
          estimatedDuration: "5.00:00:00",
          defaultRequirements: [
            "Discuss performance date and venue",
            "Review basic technical requirements",
            "Negotiate initial fee structure"
          ]
        },
        {
          name: "Contract Negotiation",
          description: "Contract terms and conditions negotiation",
          orderNumber: 3,
          estimatedDuration: "7.00:00:00",
          defaultRequirements: [
            "Draft contract terms",
            "Review technical riders",
            "Finalize payment schedule"
          ]
        },
        {
          name: "Final Approval",
          description: "Final approval and sign-off",
          orderNumber: 4,
          estimatedDuration: "3.00:00:00",
          defaultRequirements: [
            "Obtain final approvals",
            "Sign contracts",
            "Process initial payment"
          ]
        },
        {
          name: "Event Preparation",
          description: "Final preparations before the event",
          orderNumber: 5,
          estimatedDuration: "10.00:00:00",
          defaultRequirements: [
            "Coordinate event logistics",
            "Confirm technical setup",
            "Final sound check"
          ]
        }
      ];
    }
  }
};

// Export FIXED_PHASES for backward compatibility
export const FIXED_PHASES: FixedPhaseTemplate[] = [
  {
    name: "Initial Contact",
    description: "First contact and initial negotiations",
    orderNumber: 1,
    estimatedDuration: "3.00:00:00",
    defaultRequirements: [
      "Contact performer's management team",
      "Send initial proposal",
      "Schedule preliminary meeting"
    ]
  },
  {
    name: "Proposal Review",
    description: "Review and evaluation of proposals",
    orderNumber: 2,
    estimatedDuration: "5.00:00:00",
    defaultRequirements: [
      "Discuss performance date and venue",
      "Review basic technical requirements",
      "Negotiate initial fee structure"
    ]
  },
  {
    name: "Contract Negotiation",
    description: "Contract terms and conditions negotiation",
    orderNumber: 3,
    estimatedDuration: "7.00:00:00",
    defaultRequirements: [
      "Draft contract terms",
      "Review technical riders",
      "Finalize payment schedule"
    ]
  },
  {
    name: "Final Approval",
    description: "Final approval and sign-off",
    orderNumber: 4,
    estimatedDuration: "3.00:00:00",
    defaultRequirements: [
      "Obtain final approvals",
      "Sign contracts",
      "Process initial payment"
    ]
  },
  {
    name: "Event Preparation",
    description: "Final preparations before the event",
    orderNumber: 5,
    estimatedDuration: "10.00:00:00",
    defaultRequirements: [
      "Coordinate event logistics",
      "Confirm technical setup",
      "Final sound check"
    ]
  }
];