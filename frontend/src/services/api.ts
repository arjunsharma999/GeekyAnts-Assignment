import axios from 'axios';
import { 
  User, 
  Project, 
  Assignment, 
  LoginCredentials, 
  AuthResponse, 
  CreateUserRequest, 
  CreateProjectRequest, 
  CreateAssignmentRequest 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);
    
    const response = await api.post('/users/token', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  register: async (userData: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/users/');
    return response.data;
  },

  getUserById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
};

// Projects API
export const projectsAPI = {
  getAllProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects/');
    return response.data;
  },

  getProjectById: async (id: number): Promise<Project> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (projectData: CreateProjectRequest): Promise<Project> => {
    const response = await api.post('/projects/', projectData);
    return response.data;
  },

  updateProject: async (id: number, projectData: Partial<CreateProjectRequest>): Promise<Project> => {
    const response = await api.put(`/projects/${id}`, projectData);
    return response.data;
  },

  deleteProject: async (id: number): Promise<void> => {
    await api.delete(`/projects/${id}`);
  },
};

// Assignments API
export const assignmentsAPI = {
  getAllAssignments: async (): Promise<Assignment[]> => {
    const response = await api.get('/assignments/');
    return response.data;
  },

  getAssignmentById: async (id: number): Promise<Assignment> => {
    const response = await api.get(`/assignments/${id}`);
    return response.data;
  },

  createAssignment: async (assignmentData: CreateAssignmentRequest): Promise<Assignment> => {
    const response = await api.post('/assignments/', assignmentData);
    return response.data;
  },

  updateAssignment: async (id: number, assignmentData: Partial<CreateAssignmentRequest>): Promise<Assignment> => {
    const response = await api.put(`/assignments/${id}`, assignmentData);
    return response.data;
  },

  deleteAssignment: async (id: number): Promise<void> => {
    await api.delete(`/assignments/${id}`);
  },
};

export default api; 