import axios from 'axios';

const API_BASE_URL = 'https://localhost:7001/api'; // Promeni na svoj API URL

const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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