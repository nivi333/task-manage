import axios from "axios";
import { notificationService } from "./notificationService";

// Create axios instance with base configuration
// Prefer environment variable for backend base URL. Example for CRA:
//   REACT_APP_API_BASE_URL=https://your-api.example.com/api/v1
// Falls back to localhost if not provided.
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // If sending FormData, let the browser set the Content-Type (with boundary)
    // Remove any existing header to avoid charset or incorrect boundary issues
    if (config.data instanceof FormData) {
      // Normalize headers object (Axios may nest per-method or common)
      const hdrs: any = config.headers || {};
      // Delete case-insensitive direct keys
      delete hdrs["Content-Type"]; delete hdrs["content-type"]; delete hdrs["CONTENT-TYPE"];
      // Delete nested defaults if present
      if (hdrs.common) { delete hdrs.common["Content-Type"]; delete hdrs.common["content-type"]; }
      if (hdrs.post) { delete hdrs.post["Content-Type"]; delete hdrs.post["content-type"]; }
      if (hdrs.put) { delete hdrs.put["Content-Type"]; delete hdrs.put["content-type"]; }
      config.headers = hdrs;
      if (process.env.REACT_APP_DEBUG_AUTH === "true") {
        // eslint-disable-next-line no-console
        console.log(`[apiClient] ${config.method?.toUpperCase()} ${config.url} - FormData detected, stripped Content-Type`);
      }
    }
    // Debug: log auth header presence (toggle via env var)
    if (process.env.REACT_APP_DEBUG_AUTH === "true") {
      // Avoid logging full token
      const hasAuth = !!config.headers.Authorization;
      // eslint-disable-next-line no-console
      console.log(
        `[apiClient] ${config.method?.toUpperCase()} ${config.url} auth=${hasAuth}`
      );
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    // Show notification popup for API success if message exists
    if (response.data && response.data.message) {
      console.log("[NOTIFICATION] Success:", response.data.message);
      notificationService.success(response.data.message);
    }
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    if (status === 401) {
      // Token expired or invalid
      localStorage.removeItem("authToken");
      localStorage.removeItem("rememberMe");
      // DO NOT redirect to login here. Let the app handle navigation if needed.
    } else {
      // Suppress noisy 404 popups for unimplemented analytics/settings endpoints
      const suppress404 =
        status === 404 && (url.includes("/analytics") || url.includes("/settings"));
      if (!suppress404) {
        const message =
          error.response?.data?.message ||
          error.message ||
          "Request failed. Please try again.";
        console.log("[NOTIFICATION] Error:", message);
        notificationService.error(message);
      }
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
  // Optional profile image for registration (File object)
  profileImage?: File;
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
const authAPI = {
  // Login user
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  // Verify 2FA code
  verify2FA: async (data: TwoFactorRequest): Promise<LoginResponse> => {
    const response = await apiClient.post("/auth/2fa", data);
    return response.data;
  },

  // Register new user
  register: async (data: RegisterRequest): Promise<any> => {
    let payload: any = data;
    if (data.profileImage) {
      // Use FormData for multipart upload if profileImage is present
      const formData = new FormData();
      formData.append("username", data.username);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("acceptTerms", String(data.acceptTerms));
      formData.append("profileImage", data.profileImage);
      payload = formData;
    }
    const response = await apiClient.post("/auth/register", payload);
    return response.data;
  },

  // Forgot password
  forgotPassword: async (data: ForgotPasswordRequest): Promise<any> => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return response.data;
  },

  // Reset password
  resetPassword: async (data: ResetPasswordRequest): Promise<any> => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        // Backend expects refreshToken as a query param with @RequestParam
        await apiClient.post(
          `/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage regardless of API call success
      localStorage.removeItem("authToken");
      localStorage.removeItem("rememberMe");
      localStorage.removeItem("refreshToken");
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<any> => {
    const response = await apiClient.get("/users/profile");
    return response.data;
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("authToken");
    return !!token;
  },

  // Get user roles from JWT token
  getUserRoles: (): string[] => {
    const token = localStorage.getItem("authToken");
    if (!token) return [];
    try {
      // Decode base64url payload safely
      const base64Url = (token.split(".")[1] || "").replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64Url + "===".slice((base64Url.length + 3) % 4);
      const json = atob(padded);
      const payload = JSON.parse(json) || {};

      // Collect roles from various common JWT fields
      let candidates: any = [];
      if (Array.isArray(payload.roles)) candidates = candidates.concat(payload.roles);
      if (Array.isArray(payload.authorities)) candidates = candidates.concat(payload.authorities);
      if (payload.realm_access?.roles) candidates = candidates.concat(payload.realm_access.roles);
      // Merge any resource_access roles
      if (payload.resource_access && typeof payload.resource_access === "object") {
        Object.values(payload.resource_access).forEach((ra: any) => {
          if (Array.isArray((ra as any)?.roles)) candidates = candidates.concat((ra as any).roles);
        });
      }
      // Scope as space-delimited string
      if (typeof payload.scope === "string") candidates = candidates.concat(payload.scope.split(" "));
      if (Array.isArray(payload.permissions)) candidates = candidates.concat(payload.permissions);

      // Normalize to unique uppercased role names without ROLE_ prefix
      const normalized = (candidates as any[])
        .map((r) => {
          if (!r) return null;
          // Support objects like { name: 'ADMIN' }
          const val = typeof r === "string" ? r : (r as any).name ?? String(r);
          const up = val.toString().toUpperCase();
          return up.startsWith("ROLE_") ? up.substring(5) : up;
        })
        .filter((x): x is string => !!x);

      return Array.from(new Set(normalized));
    } catch (e) {
      return [];
    }
  },

  // Get auth token
  getToken: (): string | null => {
    return localStorage.getItem("authToken");
  },

  // Enable 2FA
  enable2FA: async (data: { code: string }): Promise<any> => {
    const response = await apiClient.post("/auth/2fa/enable", data);
    return response.data;
  },

  // Disable 2FA
  disable2FA: async (data: { password: string }): Promise<any> => {
    const response = await apiClient.post("/auth/2fa/disable", data);
    return response.data;
  },

  // Generate 2FA backup codes
  generateBackupCodes: async (): Promise<any> => {
    const response = await apiClient.post("/auth/2fa/backup");
    return response.data;
  },
};

// Export the API client as default
export { authAPI };
export default apiClient;
