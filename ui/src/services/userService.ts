import axios from 'axios';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, UserListResponse, BulkUserAction } from '../types/user';
import { notificationService } from './notificationService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export class UserService {
  private baseURL = `${API_BASE_URL}/api/v1/users`;

  async getUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.page !== undefined) params.append('page', filters.page.toString());
      if (filters.size !== undefined) params.append('size', filters.size.toString());
      if (filters.sortBy) params.append('sortBy', filters.sortBy);
      if (filters.sortDirection) params.append('sortDirection', filters.sortDirection);

      const response = await axios.get(`${this.baseURL}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching users:', error);
      notificationService.error('Failed to fetch users');
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    try {
      const response = await axios.get(`${this.baseURL}/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error);
      notificationService.error('Failed to fetch user details');
      throw error;
    }
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await axios.post(this.baseURL, userData);
      notificationService.success('User created successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error);
      const message = error.response?.data?.message || 'Failed to create user';
      notificationService.error(message);
      throw error;
    }
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
    try {
      const response = await axios.put(`${this.baseURL}/${id}`, userData);
      notificationService.success('User updated successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error updating user:', error);
      const message = error.response?.data?.message || 'Failed to update user';
      notificationService.error(message);
      throw error;
    }
  }

  async deleteUser(id: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/${id}`);
      notificationService.success('User deleted successfully');
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const message = error.response?.data?.message || 'Failed to delete user';
      notificationService.error(message);
      throw error;
    }
  }

  async bulkAction(action: BulkUserAction): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/bulk-action`, action);
      
      const actionMessages = {
        delete: 'Users deleted successfully',
        activate: 'Users activated successfully',
        deactivate: 'Users deactivated successfully',
        suspend: 'Users suspended successfully'
      };
      
      notificationService.success(actionMessages[action.action]);
    } catch (error: any) {
      console.error('Error performing bulk action:', error);
      const message = error.response?.data?.message || 'Failed to perform bulk action';
      notificationService.error(message);
      throw error;
    }
  }

  async exportUsers(filters: UserFilters = {}): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);

      const response = await axios.get(`${this.baseURL}/export?${params.toString()}`, {
        responseType: 'blob'
      });
      
      notificationService.success('Users exported successfully');
      return response.data;
    } catch (error: any) {
      console.error('Error exporting users:', error);
      notificationService.error('Failed to export users');
      throw error;
    }
  }
}

export const userService = new UserService();
