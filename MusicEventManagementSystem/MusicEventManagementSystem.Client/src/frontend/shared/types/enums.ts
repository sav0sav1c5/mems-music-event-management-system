// TypeScript enums based on C# enums

export enum FuelType {
  None = 0,
  Diesel = 1,
  Petrol = 2,
  Electric = 3,
  Hybrid = 4
}

export enum ContractSigned {
  None = 0,
  Yes = 1,
  No = 2
}

export enum EventStatus {
  Planned = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}

export enum PerformanceResourceStatus {
  None = 0,
  Requested = 1,
  Assigned = 2,
  InUse = 3,
  Returned = 4,
  Cancelled = 5
}

export enum PerformanceStatus {
  Planned = 1,
  InProgress = 2,
  Completed = 3,
  Cancelled = 4
}

export enum PowerRequirements {
  None = 0,
  V24 = 1,
  V220 = 2,
  V240 = 3,
  Battery = 4,
  USB = 5,
  Solar = 6
}

export enum RequiredSkillLevel {
  None = 0,
  Beginner = 1,
  Experienced = 2,
  Licensed = 3
}

export enum ResourceType {
  Equipment = 1,
  Staff = 2,
  Vehicle = 3,
  Infrastructure = 4,
  Services = 5
}

export enum StaffRole {
  None = 0,
  Volunteer = 1,
  Technician = 2,
  Marshal = 3,
  Driver = 4,
  Coordinator = 5
}

export enum VehicleType {
  None = 0,
  Truck = 1,
  Van = 2,
  Car = 3,
  Bus = 4,
  Excavator = 5
}

export enum WorkTaskStatus {
  Pending = 1,
  InProcess = 2,
  Completed = 3
}

// Utility functions to convert enum values to display strings
export const getEventStatusName = (status: EventStatus): string => {
  switch (status) {
    case EventStatus.Planned: return 'PLANNED';
    case EventStatus.InProgress: return 'IN PROGRESS';
    case EventStatus.Completed: return 'COMPLETED';
    case EventStatus.Cancelled: return 'CANCELLED';
    default: return 'UNKNOWN';
  }
};

export const getPerformanceStatusName = (status: PerformanceStatus): string => {
  switch (status) {
    case PerformanceStatus.Planned: return 'PLANNED';
    case PerformanceStatus.InProgress: return 'IN PROGRESS';
    case PerformanceStatus.Completed: return 'COMPLETED';
    case PerformanceStatus.Cancelled: return 'CANCELLED';
    default: return 'UNKNOWN';
  }
};

export const getWorkTaskStatusName = (status: WorkTaskStatus): string => {
  switch (status) {
    case WorkTaskStatus.Pending: return 'PENDING';
    case WorkTaskStatus.InProcess: return 'IN PROGRESS';
    case WorkTaskStatus.Completed: return 'COMPLETED';
    default: return 'UNKNOWN';
  }
};

export const getResourceTypeName = (type: ResourceType): string => {
  switch (type) {
    case ResourceType.Equipment: return 'Equipment';
    case ResourceType.Staff: return 'Staff';
    case ResourceType.Vehicle: return 'Vehicle';
    case ResourceType.Infrastructure: return 'Infrastructure';
    case ResourceType.Services: return 'Services';
    default: return 'Unknown';
  }
};