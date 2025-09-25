// Validation utility for performer forms
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface PerformerFormValidation {
  name: string | null;
  email: string | null;
  contact: string | null;
  genre: string | null;
  popularity: string | null;
  minPrice: string | null;
  maxPrice: string | null;
  status: string | null;
  averageResponseTime: string | null;
}

export const validatePerformerForm = (data: any): ValidationResult => {
  const errors: ValidationError[] = [];

  // Name validation
  if (!data.name || data.name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Name is required' });
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters long' });
  } else if (data.name.trim().length > 100) {
    errors.push({ field: 'name', message: 'Name must not exceed 100 characters' });
  }

  // Email validation
  if (!data.email || data.email.trim().length === 0) {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email.trim())) {
      errors.push({ field: 'email', message: 'Please enter a valid email address' });
    }
  }

  // Contact validation
  if (!data.contact || data.contact.trim().length === 0) {
    errors.push({ field: 'contact', message: 'Contact information is required' });
  } else if (data.contact.trim().length < 5) {
    errors.push({ field: 'contact', message: 'Contact must be at least 5 characters long' });
  }

  // Genre validation
  if (!data.genre || data.genre.trim().length === 0) {
    errors.push({ field: 'genre', message: 'Genre is required' });
  } else if (data.genre.trim().length < 2) {
    errors.push({ field: 'genre', message: 'Genre must be at least 2 characters long' });
  }

  // Popularity validation
  if (data.popularity === null || data.popularity === undefined || data.popularity === '') {
    errors.push({ field: 'popularity', message: 'Popularity is required' });
  } else {
    const popularity = Number(data.popularity);
    if (isNaN(popularity)) {
      errors.push({ field: 'popularity', message: 'Popularity must be a number' });
    } else if (popularity < 0 || popularity > 100) {
      errors.push({ field: 'popularity', message: 'Popularity must be between 0 and 100' });
    }
  }

  // Price validation
  if (data.minPrice === null || data.minPrice === undefined || data.minPrice === '') {
    errors.push({ field: 'minPrice', message: 'Minimum price is required' });
  } else {
    const minPrice = Number(data.minPrice);
    if (isNaN(minPrice)) {
      errors.push({ field: 'minPrice', message: 'Minimum price must be a number' });
    } else if (minPrice < 0) {
      errors.push({ field: 'minPrice', message: 'Minimum price must be positive' });
    }
  }

  if (data.maxPrice === null || data.maxPrice === undefined || data.maxPrice === '') {
    errors.push({ field: 'maxPrice', message: 'Maximum price is required' });
  } else {
    const maxPrice = Number(data.maxPrice);
    if (isNaN(maxPrice)) {
      errors.push({ field: 'maxPrice', message: 'Maximum price must be a number' });
    } else if (maxPrice < 0) {
      errors.push({ field: 'maxPrice', message: 'Maximum price must be positive' });
    }
  }

  // Cross-field validation: minPrice <= maxPrice
  if (data.minPrice && data.maxPrice) {
    const minPrice = Number(data.minPrice);
    const maxPrice = Number(data.maxPrice);
    if (!isNaN(minPrice) && !isNaN(maxPrice) && minPrice > maxPrice) {
      errors.push({ field: 'minPrice', message: 'Minimum price cannot be greater than maximum price' });
    }
  }

  // Status validation
  if (!data.status || data.status.trim().length === 0) {
    errors.push({ field: 'status', message: 'Status is required' });
  } else {
    const validStatuses = ['Active', 'Pending', 'Inactive'];
    if (!validStatuses.includes(data.status)) {
      errors.push({ field: 'status', message: 'Please select a valid status' });
    }
  }

  // Average response time validation (optional field)
  if (data.averageResponseTime && data.averageResponseTime.trim().length > 0) {
    // Basic time format validation (HH:mm:ss)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timeRegex.test(data.averageResponseTime.trim())) {
      errors.push({ 
        field: 'averageResponseTime', 
        message: 'Average response time must be in HH:mm:ss format (e.g., 02:30:00)' 
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const getFieldError = (errors: ValidationError[], fieldName: string): string | null => {
  const error = errors.find(err => err.field === fieldName);
  return error ? error.message : null;
};

export const hasFieldError = (errors: ValidationError[], fieldName: string): boolean => {
  return errors.some(err => err.field === fieldName);
};

// Backend error parsing utility
export const parseBackendErrors = (errorResponse: any): ValidationError[] => {
  const errors: ValidationError[] = [];
  
  if (errorResponse?.response?.data?.errors) {
    // Handle validation errors from ASP.NET Core
    const backendErrors = errorResponse.response.data.errors;
    Object.keys(backendErrors).forEach(field => {
      const fieldErrors = backendErrors[field];
      if (Array.isArray(fieldErrors)) {
        fieldErrors.forEach(message => {
          errors.push({ 
            field: field.toLowerCase(), 
            message: message 
          });
        });
      }
    });
  } else if (errorResponse?.response?.data?.message) {
    // Handle general error messages
    errors.push({
      field: 'general',
      message: errorResponse.response.data.message
    });
  }

  return errors;
};