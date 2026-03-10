import axios from 'axios';
import type { LoginRequest, RegisterRequest, AuthResponse } from '../models/types/auth';

const api = axios.create({ baseURL: '/api' });

export function login(data: LoginRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/login', data).then((r) => r.data);
}

export function register(data: RegisterRequest): Promise<AuthResponse> {
  return api.post<AuthResponse>('/auth/register', data).then((r) => r.data);
}

