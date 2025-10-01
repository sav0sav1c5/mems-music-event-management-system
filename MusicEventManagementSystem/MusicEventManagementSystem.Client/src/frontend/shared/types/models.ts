// TypeScript interfaces based on C# models
import { 
  EventStatus, 
  PerformanceStatus, 
  WorkTaskStatus, 
  ResourceType, 
  PerformanceResourceStatus,
  FuelType,
  VehicleType,
  StaffRole,
  RequiredSkillLevel,
  ContractSigned,
  PowerRequirements
} from './enums';



// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
}

// Form types for creating/updating
export interface CreateEventRequest {
  name: string;
  description: string;
  interval: string;
  status: EventStatus;
  locationId: number;
}

export interface UpdateEventRequest extends CreateEventRequest {
  id: number;
}

export interface CreatePerformanceRequest {
  eventId: number;
  performerId: number;
  venueId: number;
  startTime: string;
  endTime: string;
  setupTime: number;
  soundcheckTime: number;
  status: PerformanceStatus;
}

export interface UpdatePerformanceRequest extends CreatePerformanceRequest {
  id: number;
}

export interface CreateWorkTaskRequest {
  performanceId: number;
  name: string;
  description: string;
  status: WorkTaskStatus;
  start: string;
  end: string;
}

export interface UpdateWorkTaskRequest extends CreateWorkTaskRequest {
  id: number;
}

export interface CreateResourceRequest {
  name: string;
  type: ResourceType;
  description: string;
  quantity: number;
  isAvailable: boolean;
}

export interface UpdateResourceRequest extends CreateResourceRequest {
  id: number;
}

export interface CreatePerformanceResourceRequest {
  performanceId: number;
  resourceId: number;
  quantityNeeded: number;
  status: PerformanceResourceStatus;
}

export interface UpdatePerformanceResourceRequest extends CreatePerformanceResourceRequest {
  id: number;
}