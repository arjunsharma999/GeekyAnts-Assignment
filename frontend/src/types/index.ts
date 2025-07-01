export interface User {
  id: number;
  email: string;
  name: string;
  role: 'engineer' | 'manager';
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  maxCapacity?: number;
  department?: string;
  availablePercentage?: number;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  requiredSkills?: string[];
  teamSize?: number;
  status: 'planning' | 'active' | 'completed';
  managerId?: number;
  manager?: User;
}

export interface Assignment {
  id: number;
  engineerId: number;
  projectId: number;
  allocationPercentage?: number;
  startDate?: string;
  endDate?: string;
  role?: string;
  engineer?: User;
  project?: Project;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  role: 'engineer' | 'manager';
  password: string;
  skills?: string[];
  seniority?: 'junior' | 'mid' | 'senior';
  maxCapacity?: number;
  department?: string;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  requiredSkills?: string[];
  teamSize?: number;
  status?: 'planning' | 'active' | 'completed';
}

export interface CreateAssignmentRequest {
  engineerId: number;
  projectId: number;
  allocationPercentage?: number;
  startDate?: string;
  endDate?: string;
  role?: string;
} 