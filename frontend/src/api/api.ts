import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
}

export interface Sweet {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface SweetResponse {
  sweet: Sweet;
  message: string;
}

export interface SweetsResponse {
  sweets: Sweet[];
}

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
};

// Sweets API
export const sweetsAPI = {
  getAll: () => api.get<SweetsResponse>('/sweets'),
  
  search: (params: { name?: string; category?: string; minPrice?: number; maxPrice?: number }) =>
    api.get<SweetsResponse>('/sweets/search', { params }),
  
  create: (data: { name: string; category: string; price: number; quantity: number }) =>
    api.post<SweetResponse>('/sweets', data),
  
  update: (id: string, data: Partial<{ name: string; category: string; price: number; quantity: number }>) =>
    api.put<SweetResponse>(`/sweets/${id}`, data),
  
  delete: (id: string) => api.delete(`/sweets/${id}`),
  
  purchase: (id: string, quantity: number) =>
    api.post<SweetResponse>(`/sweets/${id}/purchase`, { quantity }),
  
  restock: (id: string, quantity: number) =>
    api.post<SweetResponse>(`/sweets/${id}/restock`, { quantity }),
};

export default api;