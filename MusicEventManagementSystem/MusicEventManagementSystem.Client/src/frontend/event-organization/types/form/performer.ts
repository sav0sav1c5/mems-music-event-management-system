export interface PerformerCreateForm {
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

export interface PerformerUpdateForm {
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