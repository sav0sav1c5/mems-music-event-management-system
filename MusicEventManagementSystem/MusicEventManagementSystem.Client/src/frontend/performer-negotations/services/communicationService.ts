import { api } from '../../shared/services/apiService';

// Types matching backend DTOs
export interface CommunicationDto {
  communicationId: number;
  type: string;
  direction: string;
  content: string;
  sentAt: string; // DateTime from backend as ISO string
  repliedAt?: string;
  negotiationId: number; // Foreign key from new relationships
}

export interface CreateCommunicationDto {
  type: string;
  direction: string;
  content: string;
  negotiationId: number;
}

const API_ENDPOINT = '/communication';

export const communicationService = {
  // Get all communications
  getAllCommunications: async (): Promise<CommunicationDto[]> => {
    try {
      const response = await api.get<CommunicationDto[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching communications:', error);
      throw error;
    }
  },

  // Get communication by ID
  getCommunicationById: async (id: number): Promise<CommunicationDto> => {
    try {
      const response = await api.get<CommunicationDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching communication:', error);
      throw error;
    }
  },

  // Create new communication
  createCommunication: async (communication: CreateCommunicationDto): Promise<CommunicationDto> => {
    try {
      const response = await api.post<CommunicationDto>(API_ENDPOINT, communication);
      return response.data;
    } catch (error) {
      console.error('Error creating communication:', error);
      throw error;
    }
  },

  // Update communication
  updateCommunication: async (id: number, communication: Partial<CommunicationDto>): Promise<CommunicationDto> => {
    try {
      const response = await api.put<CommunicationDto>(`${API_ENDPOINT}/${id}`, communication);
      return response.data;
    } catch (error) {
      console.error('Error updating communication:', error);
      throw error;
    }
  },

  // Delete communication
  deleteCommunication: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting communication:', error);
      throw error;
    }
  },

  // Get communications by negotiation ID (new relationship)
  getCommunicationsByNegotiation: async (negotiationId: number): Promise<CommunicationDto[]> => {
    try {
      const response = await api.get<CommunicationDto[]>(`${API_ENDPOINT}/negotiation/${negotiationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching communications by negotiation:', error);
      throw error;
    }
  },

  // Mark communication as replied
  markAsReplied: async (id: number): Promise<CommunicationDto> => {
    try {
      const response = await api.put<CommunicationDto>(`${API_ENDPOINT}/${id}/reply`);
      return response.data;
    } catch (error) {
      console.error('Error marking communication as replied:', error);
      throw error;
    }
  },
};
