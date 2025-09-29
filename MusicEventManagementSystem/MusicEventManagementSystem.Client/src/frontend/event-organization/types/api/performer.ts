export interface PerformerResponse {
  performerId: number;
  name: string;
  email: string;
  contact: string;
  genre: string;
  popularity: number;
  technicalRequirements: string;
  minPrice: number;
  maxPrice: number;
  averageResponseTime: string; // TimeSpan kao string
  status: string;
}