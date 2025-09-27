import { api } from '../../shared/services/apiService';
import type { Phase } from './phaseService';

// DTO interfaces matching backend
export interface RequirementDto {
  requirementId: number;
  title: string;
  description: string;
  isRequired: boolean; // Updated to match backend
  createdAt: Date;
  updatedAt?: Date;
  phaseId: number; // Now required
  // Navigation properties
  phase?: Phase;
}

export interface CreateRequirementDto {
  title: string;
  description: string;
  isRequired: boolean; // Updated to match backend
  phaseId: number; // Now required
}

const API_ENDPOINT = '/requirement';

export const requirementService = {
  // Get all requirements
  getAllRequirements: async (): Promise<RequirementDto[]> => {
    try {
      const response = await api.get<RequirementDto[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching requirements:', error);
      throw error;
    }
  },

  // Get requirement by ID
  getRequirementById: async (id: number): Promise<RequirementDto> => {
    try {
      const response = await api.get<RequirementDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching requirement:', error);
      throw error;
    }
  },

  // Create new requirement
  createRequirement: async (requirement: CreateRequirementDto): Promise<RequirementDto> => {
    try {
      const response = await api.post<RequirementDto>(API_ENDPOINT, requirement);
      return response.data;
    } catch (error) {
      console.error('Error creating requirement:', error);
      throw error;
    }
  },

  // Update requirement
  updateRequirement: async (id: number, requirement: Partial<RequirementDto>): Promise<RequirementDto> => {
    try {
      const response = await api.put<RequirementDto>(`${API_ENDPOINT}/${id}`, requirement);
      return response.data;
    } catch (error) {
      console.error('Error updating requirement:', error);
      throw error;
    }
  },

  // Delete requirement
  deleteRequirement: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting requirement:', error);
      throw error;
    }
  },

  // Get requirements by phase ID (new relationship)
  getRequirementsByPhase: async (phaseId: number): Promise<RequirementDto[]> => {
    try {
      const response = await api.get<RequirementDto[]>(`${API_ENDPOINT}/phase/${phaseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching requirements by phase:', error);
      throw error;
    }
  },

  // Mark requirement as fulfilled
  markFulfilled: async (id: number): Promise<RequirementDto> => {
    try {
      const response = await api.put<RequirementDto>(`${API_ENDPOINT}/${id}/fulfill`);
      return response.data;
    } catch (error) {
      console.error('Error marking requirement as fulfilled:', error);
      throw error;
    }
  },

  // Get unfulfilled requirements
  getUnfulfilledRequirements: async (): Promise<RequirementDto[]> => {
    try {
      const response = await api.get<RequirementDto[]>(`${API_ENDPOINT}/unfulfilled`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unfulfilled requirements:', error);
      throw error;
    }
  },
};
