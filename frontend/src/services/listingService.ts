import axios from 'axios';
import type { VehicleResponse } from '../models/types/listing';
import { getToken } from '../store/authStore';

const api = axios.create({ baseURL: '/api/listing' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getAvailableVehicles(): Promise<VehicleResponse[]> {
  return api.get<VehicleResponse[]>('/available').then((r) => r.data);
}

