import { api } from '../../shared/services/apiService';

// Requirement interfaces
export interface RequirementDto {
  requirementId: number;
  title: string;
  description: string;
  fulfilled: boolean;
  createdAt: string;
  phaseId: number;
  phaseName?: string;
}

export interface CreateRequirementDto {
  title: string;
  description: string;
  fulfilled: boolean;
  phaseId: number;
}

export interface UpdateRequirementDto {
  title: string;
  description: string;
  fulfilled: boolean;
  phaseId: number;
}

// Phase DTO interfaces matching backend
export interface PhaseDto {
  phaseId: number;
  phaseName: string;
  orderNumber: number;
  estimatedDuration: string; // TimeSpan as string from backend
  negotiationId: number;
  contractId?: number | null;
  requirements?: RequirementDto[];
}

export interface CreatePhaseDto {
  phaseName: string;
  orderNumber: number;
  estimatedDuration: string;
  negotiationId: number;
  contractId?: number | null;
}

export interface UpdatePhaseDto {
  phaseName: string;
  orderNumber: number;
  estimatedDuration: string;
  negotiationId: number;
  contractId?: number | null;
}

export interface PhaseWithDetailsDto extends PhaseDto {
  contract?: any; // ContractDto would be defined elsewhere
}

// Fixed phase template for initialization
export interface FixedPhaseTemplate {
  name: string;
  description: string;
  orderNumber: number;
  estimatedDuration: string;
  defaultRequirements: string[];
}

const API_ENDPOINT = '/phase';

// Fixed 5 phases template
export const FIXED_PHASES: FixedPhaseTemplate[] = [
  {
    name: "Initial Outreach",
    description: "First contact and introduction to the performer or their management team",
    orderNumber: 1,
    estimatedDuration: "3.00:00:00", // 3 days in TimeSpan format
    defaultRequirements: [
      "Contact performer's management team",
      "Send initial proposal",
      "Schedule preliminary meeting"
    ]
  },
  {
    name: "Preliminary Negotiations",
    description: "Initial discussion of terms, availability, and basic requirements",
    orderNumber: 2,
    estimatedDuration: "7.00:00:00", // 7 days
    defaultRequirements: [
      "Discuss performance date and venue",
      "Review basic technical requirements",
      "Negotiate preliminary fee structure"
    ]
  },
  {
    name: "Contract Negotiations",
    description: "Detailed negotiation of contract terms and specific requirements",
    orderNumber: 3,
    estimatedDuration: "14.00:00:00", // 14 days
    defaultRequirements: [
      "Finalize performance fee and payment terms",
      "Define technical and staging requirements",
      "Establish cancellation and force majeure clauses",
      "Review rider requirements"
    ]
  },
  {
    name: "Contract Draft",
    description: "Preparation and review of the formal contract document",
    orderNumber: 4,
    estimatedDuration: "5.00:00:00", // 5 days
    defaultRequirements: [
      "Prepare formal contract document",
      "Legal review of contract terms",
      "Send contract to performer for review",
      "Address any contract revisions"
    ]
  },
  {
    name: "Final Agreement",
    description: "Contract signing and final confirmation of all arrangements",
    orderNumber: 5,
    estimatedDuration: "3.00:00:00", // 3 days
    defaultRequirements: [
      "Obtain signed contract from all parties",
      "Confirm final logistics and timeline",
      "Set up performance coordination",
      "Archive signed contracts"
    ]
  }
];

export const phaseService = {
  // Get all phases
  getAllPhases: async (): Promise<PhaseDto[]> => {
    try {
      const response = await api.get<PhaseDto[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching phases:', error);
      throw error;
    }
  },

  // Get the 5 fixed phases (hardcoded for now, will integrate with backend later)
  getFixedPhases: (): FixedPhaseTemplate[] => {
    return FIXED_PHASES;
  },

  // Convert fixed phase template to create DTO
  createPhaseFromTemplate: (template: FixedPhaseTemplate, negotiationId: number, contractId?: number): CreatePhaseDto => {
    return {
      phaseName: template.name,
      orderNumber: template.orderNumber,
      estimatedDuration: template.estimatedDuration,
      negotiationId,
      contractId: contractId || null
    };
  },

  // Get phase by ID with requirements
  getPhaseById: async (id: number): Promise<PhaseDto> => {
    try {
      const response = await api.get<PhaseDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching phase:', error);
      throw error;
    }
  },

  // Get phase with detailed information
  getPhaseWithDetails: async (id: number): Promise<PhaseWithDetailsDto> => {
    try {
      const response = await api.get<PhaseWithDetailsDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching phase details:', error);
      throw error;
    }
  },

  // Create new phase
  createPhase: async (phase: CreatePhaseDto): Promise<PhaseDto> => {
    try {
      const response = await api.post<PhaseDto>(API_ENDPOINT, phase);
      return response.data;
    } catch (error) {
      console.error('Error creating phase:', error);
      throw error;
    }
  },

  // Update phase
  updatePhase: async (id: number, phase: UpdatePhaseDto): Promise<PhaseDto> => {
    try {
      const response = await api.put<PhaseDto>(`${API_ENDPOINT}/${id}`, phase);
      return response.data;
    } catch (error) {
      console.error('Error updating phase:', error);
      throw error;
    }
  },

  // Delete phase
  deletePhase: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting phase:', error);
      throw error;
    }
  },

  // Get phases ordered by orderNumber
  getPhasesOrdered: async (): Promise<PhaseDto[]> => {
    try {
      const response = await api.get<PhaseDto[]>(`${API_ENDPOINT}/ordered`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ordered phases:', error);
      throw error;
    }
  },

  // Requirements management
  getPhaseRequirements: async (phaseId: number): Promise<RequirementDto[]> => {
    try {
      const response = await api.get<RequirementDto[]>(`${API_ENDPOINT}/${phaseId}/requirements`);
      return response.data;
    } catch (error) {
      console.error('Error fetching phase requirements:', error);
      throw error;
    }
  },

  createRequirement: async (requirement: CreateRequirementDto): Promise<RequirementDto> => {
    try {
      const response = await api.post<RequirementDto>('/requirement', requirement);
      return response.data;
    } catch (error) {
      console.error('Error creating requirement:', error);
      throw error;
    }
  },

  updateRequirement: async (id: number, requirement: UpdateRequirementDto): Promise<RequirementDto> => {
    try {
      const response = await api.put<RequirementDto>(`/requirement/${id}`, requirement);
      return response.data;
    } catch (error) {
      console.error('Error updating requirement:', error);
      throw error;
    }
  },

  deleteRequirement: async (id: number): Promise<void> => {
    try {
      await api.delete(`/requirement/${id}`);
    } catch (error) {
      console.error('Error deleting requirement:', error);
      throw error;
    }
  }
};
