import axios from 'axios';
import type { CreateListingRequest, VehicleResponse } from '../models/types/listing';
import { getToken } from '../store/authStore';

const api = axios.create({ baseURL: '/api/listing' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getAvailableVehicles(): Promise<VehicleResponse[]> {
  return api.get<VehicleResponse[]>('/available').then((r) => r.data);
}

export async function getMyVehicles(): Promise<VehicleResponse[]> {
  return api.get<VehicleResponse[]>('/my-listings').then((r) => r.data);
}

export async function createVehicle(data: CreateListingRequest): Promise<VehicleResponse> {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('address', data.address);
  formData.append('hourlyRate', String(data.hourlyRate));
  formData.append('photo', data.photo);
  formData.append('vehicleType', data.vehicleType);
  formData.append('region', data.region);
  return api.post<VehicleResponse>('/create', formData).then((r) => r.data);
}
