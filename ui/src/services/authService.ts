import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
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
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('rememberMe');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API interfaces
export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      firstName: string;
      lastName: string;
      roles: string[];
      is2faEnabled: boolean;
    };
    token?: string;
    requires2FA?: boolean;
    tempToken?: string;
  };
}

export interface TwoFactorRequest {
  tempToken: string;
  code: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Auth service methods
export const authAPI = {
  // Login user
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // Verify 2FA code
  verify2FA: async (data: TwoFactorRequest): Promise<LoginResponse> => {
    const response = await apiClient.post('/auth/2fa', data);
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<any> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<any> => {
    const response = await apiClient.post('/auth/forgot-password', data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<any> => {
    const response = await apiClient.post('/auth/reset-password', data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem('authToken');
      localStorage.removeItem('rememberMe');
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<any> => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken');
    return !!token;
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  // Enable 2FA
  enable2FA: async (data: { code: string }): Promise<any> => {
    const response = await apiClient.post('/auth/2fa/enable', data);
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (data: { password: string }): Promise<any> => {
    const response = await apiClient.post('/auth/2fa/disable', data);
    return response.data;
  },

  // Generate 2FA backup codes
  generateBackupCodes: async (): Promise<any> => {
    const response = await apiClient.post('/auth/2fa/backup');
    return response.data;
  }
};

export default apiClient;
