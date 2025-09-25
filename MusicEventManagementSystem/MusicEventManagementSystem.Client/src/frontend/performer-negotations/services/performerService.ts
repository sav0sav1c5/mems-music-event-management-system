import { api } from '../../shared/services/apiService';

// Types matching backend DTOs
export interface PerformerDto {
  performerId: number;
  name: string;
  email: string;
  contact: string;
  genre: string;
  popularity: number;
  technicalRequirements: string;
  minPrice: number;
  maxPrice: number;
  averageResponseTime: string; // TimeSpan from backend as string
  status: string;
  updatedAt?: string;
  contracts?: ContractDto[];
}

export interface CreatePerformerDto {
  name: string;
  email: string;
  contact: string;
  genre: string;
  popularity: number;
  technicalRequirements: string;
  minPrice: number;
  maxPrice: number;
  averageResponseTime: string;
  status: string;
}

export interface UpdatePerformerDto {
  name?: string;
  email?: string;
  contact?: string;
  genre?: string;
  popularity?: number;
  technicalRequirements?: string;
  minPrice?: number;
  maxPrice?: number;
  averageResponseTime?: string;
  status?: string;
}

export interface PerformerWithDetailsDto extends PerformerDto {
  negotiation?: NegotiationDto;
}

export interface ContractDto {
  contractId: number;
  title: string;
  contractType: string;
  price: number;
  version: string;
  status: string;
  createdAt: string;
  signedAt?: string;
}

export interface NegotiationDto {
  negotiationId: number;
  performerId: number;
  eventId: number;
  initialOffer: number;
  finalOffer?: number;
  status: string;
  startDate: string;
  endDate?: string;
  notes?: string;
}

// UI-specific types
export interface PerformerFormData extends Omit<CreatePerformerDto, 'averageResponseTime'> {
  averageResponseTime: string;
}

export interface PerformerListItem extends PerformerDto {
  contractsCount?: number;
  hasActiveNegotiation?: boolean;
}

// Validation error interface
export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

const API_ENDPOINT = '/performer'; // Changed from /performers to match PerformerController.cs (singular)

export const performerService = {
  // Get all performers
  getAllPerformers: async (): Promise<PerformerDto[]> => {
    try {
      const response = await api.get<PerformerDto[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching performers:', error);
      throw error;
    }
  },

  // Get performer by ID
  getPerformerById: async (id: number): Promise<PerformerDto> => {
    try {
      const response = await api.get<PerformerDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching performer:', error);
      throw error;
    }
  },

  // Create new performer
  createPerformer: async (performer: CreatePerformerDto): Promise<PerformerDto> => {
    try {
      const response = await api.post<PerformerDto>(API_ENDPOINT, performer);
      return response.data;
    } catch (error) {
      console.error('Error creating performer:', error);
      throw error;
    }
  },

  // Update performer
  updatePerformer: async (id: number, performer: UpdatePerformerDto): Promise<PerformerDto> => {
    try {
      const response = await api.put<PerformerDto>(`${API_ENDPOINT}/${id}`, performer);
      return response.data;
    } catch (error) {
      console.error('Error updating performer:', error);
      throw error;
    }
  },

  // Delete performer
  deletePerformer: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting performer:', error);
      throw error;
    }
  },

  // Client-side search implementation (backend doesn't provide search endpoints)
  searchPerformers: async (searchTerm: string): Promise<PerformerDto[]> => {
    try {
      const allPerformers = await performerService.getAllPerformers();
      if (!searchTerm.trim()) return allPerformers;
      
      const term = searchTerm.toLowerCase();
      return allPerformers.filter(performer => 
        performer.name.toLowerCase().includes(term) ||
        performer.email.toLowerCase().includes(term) ||
        performer.genre.toLowerCase().includes(term) ||
        performer.contact.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching performers:', error);
      throw error;
    }
  },

  // Client-side filtering by status (backend doesn't provide filter endpoints)
  getPerformersByStatus: async (status: string): Promise<PerformerDto[]> => {
    try {
      const allPerformers = await performerService.getAllPerformers();
      if (!status) return allPerformers;
      
      return allPerformers.filter(performer => 
        performer.status.toLowerCase() === status.toLowerCase()
      );
    } catch (error) {
      console.error('Error filtering performers by status:', error);
      throw error;
    }
  },

  // Client-side filtering by genre
  getPerformersByGenre: async (genre: string): Promise<PerformerDto[]> => {
    try {
      const allPerformers = await performerService.getAllPerformers();
      if (!genre) return allPerformers;
      
      return allPerformers.filter(performer => 
        performer.genre.toLowerCase() === genre.toLowerCase()
      );
    } catch (error) {
      console.error('Error filtering performers by genre:', error);
      throw error;
    }
  },

  // Client-side filtering by price range
  getPerformersByPriceRange: async (minPrice?: number, maxPrice?: number): Promise<PerformerDto[]> => {
    try {
      const allPerformers = await performerService.getAllPerformers();
      return allPerformers.filter(performer => {
        const performerMin = performer.minPrice;
        const performerMax = performer.maxPrice;
        
        if (minPrice !== undefined && performerMax < minPrice) return false;
        if (maxPrice !== undefined && performerMin > maxPrice) return false;
        
        return true;
      });
    } catch (error) {
      console.error('Error filtering performers by price range:', error);
      throw error;
    }
  },

  // Advanced client-side search with multiple criteria
  searchPerformersAdvanced: async (criteria: {
    searchTerm?: string;
    status?: string;
    genre?: string;
    minPrice?: number;
    maxPrice?: number;
    minPopularity?: number;
  }): Promise<PerformerDto[]> => {
    try {
      const allPerformers = await performerService.getAllPerformers();
      
      return allPerformers.filter(performer => {
        // Text search
        if (criteria.searchTerm) {
          const term = criteria.searchTerm.toLowerCase();
          const matchesSearch = 
            performer.name.toLowerCase().includes(term) ||
            performer.email.toLowerCase().includes(term) ||
            performer.genre.toLowerCase().includes(term) ||
            performer.contact.toLowerCase().includes(term);
          if (!matchesSearch) return false;
        }
        
        // Status filter
        if (criteria.status && performer.status.toLowerCase() !== criteria.status.toLowerCase()) {
          return false;
        }
        
        // Genre filter
        if (criteria.genre && performer.genre.toLowerCase() !== criteria.genre.toLowerCase()) {
          return false;
        }
        
        // Price range filter
        if (criteria.minPrice !== undefined && performer.maxPrice < criteria.minPrice) {
          return false;
        }
        if (criteria.maxPrice !== undefined && performer.minPrice > criteria.maxPrice) {
          return false;
        }
        
        // Popularity filter
        if (criteria.minPopularity !== undefined && performer.popularity < criteria.minPopularity) {
          return false;
        }
        
        return true;
      });
    } catch (error) {
      console.error('Error performing advanced search:', error);
      throw error;
    }
  },
};