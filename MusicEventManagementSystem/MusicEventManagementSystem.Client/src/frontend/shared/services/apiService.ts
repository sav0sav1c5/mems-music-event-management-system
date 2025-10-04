import axios, { AxiosError } from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = 'https://localhost:7001/api';

// Create an Axios instance
const apiService = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
//    Method thats called before every API call and adds JWT 
//    token to the header if it exists
apiService.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Take token from local storage
    const token = localStorage.getItem('token');

    // If token exists, add it to the header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // If there's an error while creating the request
    return Promise.reject(error);
  }
);

// RESPONSE INTERCEPTOR
//    Method thats called after every API call and checks for 
//    errors (401 Unauthorized, 403 Forbidden, itd.)
apiService.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  (error: AxiosError) => {
    // If there's an error...

    // 401 = Token is expired or invalid
    if (error.response?.status === 401) {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login (only if we're not already on the login page)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // 403 = Forbidden (you do not have permission to access this resource)
    if (error.response?.status === 403) {
      console.error('Access denied: You do not have permission to access this resource');
    }
    
    return Promise.reject(error);
  }
);

// OPTIONAL: Token Refresh Logic
// let isRefreshing = false;
// let refreshSubscribers: ((token: string) => void)[] = [];

// const onRefreshed = (token: string) => {
//   refreshSubscribers.forEach(callback => callback(token));
//   refreshSubscribers = [];
// };

// apiService.interceptors.response.use(
//   response => response,
//   async (error) => {
//     const originalRequest = error.config;
    
//     if (error.response?.status === 401 && !originalRequest._retry) {
//       if (isRefreshing) {
//         // Čekaj dok se token refreshuje
//         return new Promise(resolve => {
//           refreshSubscribers.push((token: string) => {
//             originalRequest.headers.Authorization = `Bearer ${token}`;
//             resolve(apiService(originalRequest));
//           });
//         });
//       }
      
//       originalRequest._retry = true;
//       isRefreshing = true;
      
//       try {
//         // Pozovi refresh endpoint
//         const response = await apiService.post('/auth/refresh');
//         const newToken = response.data.token;
        
//         localStorage.setItem('token', newToken);
//         onRefreshed(newToken);
//         isRefreshing = false;
        
//         originalRequest.headers.Authorization = `Bearer ${newToken}`;
//         return apiService(originalRequest);
//       } catch (err) {
//         isRefreshing = false;
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         window.location.href = '/login';
//         return Promise.reject(err);
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// Types
export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  department: number;
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
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export default apiService;