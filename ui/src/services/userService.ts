import {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UserFilters,
  UserListResponse,
  BulkUserAction,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
  TwoFAEnableResponse,
} from "../types/user";
import { notificationService } from "./notificationService";
import apiClient, { authAPI } from "./authService";

// Prefer the same base URL env var used by authService for consistency
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api/v1";

export class UserService {
  private baseURL = `${API_BASE_URL}/users`;
  private authBaseURL = `${API_BASE_URL}/auth`;

  private normalizeAvatarUrl(url?: string): string | undefined {
    if (!url) return undefined;
    const u = String(url);
    if (u.startsWith("http://") || u.startsWith("https://")) return u;
    // Ensure leading slash
    const path = u.startsWith("/") ? u : `/${u}`;
    // If backend already returns '/api/v1/...', prefix with origin from API_BASE_URL
    try {
      const api = new URL(API_BASE_URL);
      return `${api.origin}${path}`;
    } catch {
      return `${API_BASE_URL}${path}`;
    }
  }

  // Debug helper: safely log FormData entries
  private logFormData(label: string, fd: FormData) {
    try {
      const entries: Record<string, any[]> = {};
      // @ts-ignore - entries() exists in browsers
      for (const [k, v] of (fd as any).entries()) {
        if (!entries[k]) entries[k] = [];
        if (v instanceof File) {
          entries[k].push({ fileName: v.name, type: v.type, size: v.size });
        } else {
          entries[k].push(v);
        }
      }
      // eslint-disable-next-line no-console
      console.debug(`[UserService] ${label} FormData entries:`, entries);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.debug(`[UserService] ${label} FormData log failed`, e);
    }
  }

  // Send FormData with native fetch so the browser sets the multipart boundary and no charset is added
  private async sendFormData(
    method: "POST" | "PUT",
    url: string,
    fd: FormData
  ): Promise<any> {
    const token = localStorage.getItem("authToken");
    // Debug log entries
    this.logFormData(`${method} ${url}`, fd);
    // Build headers WITHOUT Content-Type
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    console.debug("[UserService] fetch sending", {
      method,
      url,
      hasAuth: !!token,
    });
    const res = await fetch(url, {
      method,
      headers,
      body: fd,
      credentials: "include",
    });
    const text = await res.text();
    let data: any = undefined;
    try {
      data = text ? JSON.parse(text) : undefined;
    } catch {
      data = text;
    }
    if (!res.ok) {
      console.error("[UserService] fetch error", { status: res.status, data });
      const err: any = new Error("FormData request failed");
      err.response = { status: res.status, data };
      throw err;
    }
    console.debug("[UserService] fetch ok", { status: res.status, data });
    return data;
  }

  async uploadAvatar(
    file: File,
    profileData?: {
      firstName?: string;
      lastName?: string;
      email?: string;
      username?: string;
    }
  ): Promise<UserProfile> {
    try {
      const formData = new FormData();
      // Send under multiple common keys to match backend expectations
      formData.append("file", file);
      formData.append("avatar", file);
      formData.append("profileImage", file);

      // Add profile fields if provided
      if (profileData?.firstName)
        formData.append("firstName", profileData.firstName);
      if (profileData?.lastName)
        formData.append("lastName", profileData.lastName);
      if (profileData?.email) formData.append("email", profileData.email);
      if (profileData?.username)
        formData.append("username", profileData.username);

      const data = await this.sendFormData(
        "POST",
        `${this.baseURL}/profile/avatar`,
        formData
      );
      notificationService.success("Profile updated successfully");
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture: data.avatarUrl || data.profilePicture,
      };
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      const message =
        error.response?.data?.message || "Failed to update profile";
      notificationService.error(message);
      throw error;
    }
  }

  async removeAvatar(): Promise<UserProfile> {
    try {
      const { data } = await apiClient.delete(`${this.baseURL}/profile/avatar`);
      notificationService.success("Profile image removed successfully");
      return {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture: data.avatarUrl || data.profilePicture,
      };
    } catch (error: any) {
      console.error("Error removing avatar:", error);
      const message =
        error.response?.data?.message || "Failed to remove profile image";
      notificationService.error(message);
      throw error;
    }
  }

  async selfDelete(): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/profile`);
      notificationService.success("Your account has been deleted");
      await authAPI.logout();
    } catch (error: any) {
      console.error("Error deleting account:", error);
      const message =
        error.response?.data?.message || "Failed to delete account";
      notificationService.error(message);
      throw error;
    }
  }

  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.role) params.append("role", filters.role);
      if (filters.status) params.append("status", filters.status);
      if (filters.page !== undefined)
        params.append("page", filters.page.toString());
      if (filters.size !== undefined)
        params.append("size", filters.size.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortDirection)
        params.append("sortDirection", filters.sortDirection);

      const response = await apiClient.get(
        `${this.baseURL}?${params.toString()}`
      );
      const page = response.data;
      const users: User[] = (page.content || []).map((u: any) => {
        const primaryRole = Array.isArray(u.roles)
          ? u.roles[0]?.name || u.roles[0] || "USER"
          : u.role || "USER";
        const normalizedImage = this.normalizeAvatarUrl(
          u.imageUrl || u.avatarUrl || u.profilePicture
        );
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: primaryRole,
          status: u.status,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          lastLogin: u.lastLogin,
          profilePicture: normalizedImage,
          avatarUrl: normalizedImage,
          imageUrl: normalizedImage,
        } as User;
      });
      const result: UserListResponse = {
        users,
        totalElements: page.totalElements ?? users.length,
        totalPages: page.totalPages ?? 1,
        currentPage: page.number ?? 0,
        pageSize: page.size ?? users.length,
      };
      return result;
    } catch (error: any) {
      console.error("Error fetching users:", error);
      notificationService.error("Failed to fetch users");
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await apiClient.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Error fetching user:", error);
      notificationService.error("Failed to fetch user details");
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await apiClient.post(this.baseURL, userData);
      notificationService.success("User created successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error creating user:", error);
      const message = error.response?.data?.message || "Failed to create user";
      notificationService.error(message);
      throw error;
    }
  }

  async createUserWithAvatar(
    userData: CreateUserRequest,
    file: File
  ): Promise<User> {
    try {
      const formData = new FormData();
      formData.append("email", userData.email);
      formData.append("username", userData.username);
      formData.append("firstName", userData.firstName);
      formData.append("lastName", userData.lastName);
      formData.append("password", userData.password);
      formData.append("role", String(userData.role));
      formData.append("status", String(userData.status));
      formData.append("file", file);

      const data = await this.sendFormData("POST", this.baseURL, formData);
      notificationService.success("User created successfully");
      return data;
    } catch (error: any) {
      console.error("Error creating user with avatar:", error);
      const message = error.response?.data?.message || "Failed to create user";
      notificationService.error(message);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await apiClient.put(`${this.baseURL}/${id}`, userData);
      notificationService.success("User updated successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error updating user:", error);
      const message = error.response?.data?.message || "Failed to update user";
      notificationService.error(message);
      throw error;
    }
  }

  async updateUserWithAvatar(
    id: string,
    userData: UpdateUserRequest,
    file: File
  ): Promise<User> {
    try {
      const formData = new FormData();
      if (userData.email !== undefined)
        formData.append("email", String(userData.email));
      if (userData.username !== undefined)
        formData.append("username", String(userData.username));
      if (userData.firstName !== undefined)
        formData.append("firstName", String(userData.firstName));
      if (userData.lastName !== undefined)
        formData.append("lastName", String(userData.lastName));
      if (userData.role !== undefined)
        formData.append("role", String(userData.role));
      if (userData.status !== undefined)
        formData.append("status", String(userData.status));
      // Send under multiple common keys to match backend expectations
      formData.append("file", file);
      formData.append("avatar", file);
      formData.append("profileImage", file);
      // Use the dedicated avatar endpoint which accepts multipart/form-data
      const data = await this.sendFormData(
        "PUT",
        `${this.baseURL}/${id}/avatar`,
        formData
      );
      notificationService.success("User updated successfully");
      return data;
    } catch (error: any) {
      console.error("Error updating user with avatar:", error);
      const message = error.response?.data?.message || "Failed to update user";
      notificationService.error(message);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await apiClient.delete(`${this.baseURL}/${id}`);
      notificationService.success("User deleted successfully");
    } catch (error: any) {
      console.error("Error deleting user:", error);
      const message = error.response?.data?.message || "Failed to delete user";
      notificationService.error(message);
      throw error;
    }
  }

  async bulkAction(action: BulkUserAction): Promise<void> {
    try {
      await apiClient.post(`${this.baseURL}/bulk-action`, action);

      const actionMessages = {
        delete: "Users deleted successfully",
        activate: "Users activated successfully",
        deactivate: "Users deactivated successfully",
        suspend: "Users suspended successfully",
      };

      notificationService.success(actionMessages[action.action]);
    } catch (error: any) {
      console.error("Error performing bulk action:", error);
      const message =
        error.response?.data?.message || "Failed to perform bulk action";
      notificationService.error(message);
      throw error;
    }
  }

  async exportUsers(filters: UserFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.role) params.append("role", filters.role);
      if (filters.status) params.append("status", filters.status);

      const response = await apiClient.get(
        `${this.baseURL}/export/csv?${params.toString()}`,
        {
          responseType: "blob",
        }
      );

      notificationService.success("Users exported successfully");
      return response.data;
    } catch (error: any) {
      console.error("Error exporting users:", error);
      notificationService.error("Failed to export users");
      throw error;
    }
  }

  // ===== Profile endpoints =====
  async getProfile(): Promise<UserProfile> {
    try {
      const { data } = await apiClient.get(`${this.baseURL}/profile`);
      // Normalize backend field names (avatarUrl -> profilePicture)
      const normalized: UserProfile = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture: data.profilePicture || data.avatarUrl || undefined,
      };
      return normalized;
    } catch (error: any) {
      console.error("Error fetching profile:", error);
      notificationService.error("Failed to load profile");
      throw error;
    }
  }

  async updateProfile(req: UpdateProfileRequest): Promise<UserProfile> {
    try {
      const { data } = await apiClient.put(`${this.baseURL}/profile`, req);
      notificationService.success("Profile updated");
      const normalized: UserProfile = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        profilePicture:
          data.profilePicture || data.avatarUrl || req.profilePicture,
      };
      return normalized;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      const message =
        error.response?.data?.message || "Failed to update profile";
      notificationService.error(message);
      throw error;
    }
  }

  async changePassword(req: ChangePasswordRequest): Promise<void> {
    try {
      await apiClient.post(`${this.baseURL}/change-password`, req);
      notificationService.success("Password changed successfully");
    } catch (error: any) {
      console.error("Error changing password:", error);
      const message =
        error.response?.data?.message || "Failed to change password";
      notificationService.error(message);
      throw error;
    }
  }

  async enable2FA(): Promise<TwoFAEnableResponse> {
    try {
      const { data } = await apiClient.post(`${this.authBaseURL}/2fa/enable`);
      notificationService.success("2FA enabled");
      return data;
    } catch (error: any) {
      console.error("Error enabling 2FA:", error);
      const message = error.response?.data?.message || "Failed to enable 2FA";
      notificationService.error(message);
      throw error;
    }
  }

  async getUsersForTeams(): Promise<User[]> {
    try {
      const response = await apiClient.get(`${this.baseURL}/for-teams`);
      const users: User[] = (response.data || []).map((u: any) => {
        const primaryRole = Array.isArray(u.roles)
          ? u.roles[0]?.name || u.roles[0] || "USER"
          : u.role || "USER";
        const normalizedImage = this.normalizeAvatarUrl(
          u.imageUrl || u.avatarUrl || u.profilePicture
        );
        return {
          id: u.id,
          username: u.username,
          email: u.email,
          firstName: u.firstName,
          lastName: u.lastName,
          role: primaryRole,
          status: u.status,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
          lastLogin: u.lastLogin,
          profilePicture: normalizedImage,
          avatarUrl: normalizedImage,
          imageUrl: normalizedImage,
        } as User;
      });
      return users;
    } catch (error: any) {
      console.error("Error fetching users for teams:", error);
      notificationService.error("Failed to fetch users for team assignment");
      throw error;
    }
  }
}

export const userService = new UserService();
