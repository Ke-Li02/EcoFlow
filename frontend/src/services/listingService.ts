import axios from 'axios';
import type { CreateListingRequest, VehicleResponse, ListingCommand, ListingBatchResponse, UpdateListingRequest } from '../models/types/listing';
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

export async function getMyVehicleById(vehicleId: number): Promise<VehicleResponse> {
  return api.get<VehicleResponse>(`/${vehicleId}`).then((r) => r.data);
}

export async function updateVehicle(vehicleId: number, data: UpdateListingRequest): Promise<VehicleResponse> {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  if (data.address) formData.append('address', data.address);
  if (data.hourlyRate) formData.append('hourlyRate', String(data.hourlyRate));
  if (data.vehicleType) formData.append('vehicleType', data.vehicleType);
  if (data.region) formData.append('region', data.region);
  if (data.photo) formData.append('photo', data.photo);
  return api.patch<VehicleResponse>(`/${vehicleId}`, formData).then((r) => r.data);
}

export async function removeVehicle(vehicleId: number): Promise<VehicleResponse> {
  return api.delete<VehicleResponse>(`/${vehicleId}`).then((r) => r.data);
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

export async function executeListingCommands(operations: ListingCommand[]): Promise<ListingBatchResponse> {
  return api.post<ListingBatchResponse>('/batch', { operations }).then((r) => r.data);
}

