import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5255/api'; // Updated to match current API URL

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiService.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: number; // Enum vrednost
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  success: boolean;
  message: string;
  token?: string;
  user?: UserDto;
}

export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  department: number;
  createdAt: string;
  isActive: boolean;
}

// Common API functions
export const api = {
  get: <T>(url: string) => apiService.get<T>(url),
  post: <T>(url: string, data?: any) => apiService.post<T>(url, data),
  put: <T>(url: string, data?: any) => apiService.put<T>(url, data),
  delete: (url: string) => apiService.delete(url),
};

// Auth API calls
export const authAPI = {
  register: async (data: RegisterDto): Promise<AuthResponseDto> => {
    const response = await apiService.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginDto): Promise<AuthResponseDto> => {
    const response = await apiService.post('/auth/login', data);
    return response.data;
  },

  getUser: async (id: string): Promise<UserDto> => {
    const response = await apiService.get(`/auth/user/${id}`);
    return response.data;
  },
};

export default apiService;