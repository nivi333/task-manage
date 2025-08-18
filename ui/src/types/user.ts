export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  profilePicture?: string;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface CreateUserRequest {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  status: UserStatus;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole;
  status?: UserStatus;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  page?: number;
  size?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface UserListResponse {
  users: User[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface BulkUserAction {
  userIds: string[];
  action: 'delete' | 'activate' | 'deactivate' | 'suspend';
}
