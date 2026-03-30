import axios from 'axios';
import type { CreateRentalRequest, GroupedRentals, RentalPeriodStatus, RentalRecord } from '../models/types/rental';
import { getToken } from '../store/authStore';

const api = axios.create({ baseURL: '/api/rental' });

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function parseDateOrNull(value: string): number | null {
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
}

export async function createRental(data: CreateRentalRequest): Promise<{ id: number }> {
  return api.post<{ id: number }>('/create', data).then((r) => r.data);
}

export async function getMyRentals(): Promise<RentalRecord[]> {
  return api.get<RentalRecord[]>('/my-rentals').then((r) => r.data);
}

export async function getMyVehicleRentals(): Promise<RentalRecord[]> {
  return api.get<RentalRecord[]>('/my-vehicles/rentals').then((r) => r.data);
}

export async function returnRental(rentalId: number): Promise<RentalRecord> {
  return api.patch<RentalRecord>(`/${rentalId}/return`).then((r) => r.data);
}

export function getRentalPeriodStatus(rental: RentalRecord): RentalPeriodStatus {
  if (rental.returnedAt) {
    return 'Past';
  }

  const now = Date.now();
  const start = parseDateOrNull(rental.startDateTime);
  const end = parseDateOrNull(rental.endDateTime);

  if (start === null || end === null) {
    return 'Future';
  }

  if (now < start) return 'Future';
  if (now > end) return 'Past';
  return 'Current';
}

export function groupRentalsByPeriod(rentals: RentalRecord[]): GroupedRentals {
  const grouped: GroupedRentals = { past: [], current: [], future: [] };

  rentals.forEach((rental) => {
    const status = getRentalPeriodStatus(rental);
    if (status === 'Past') grouped.past.push(rental);
    if (status === 'Current') grouped.current.push(rental);
    if (status === 'Future') grouped.future.push(rental);
  });

  grouped.future.sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime());
  grouped.current.sort((a, b) => new Date(a.endDateTime).getTime() - new Date(b.endDateTime).getTime());
  grouped.past.sort((a, b) => new Date(b.endDateTime).getTime() - new Date(a.endDateTime).getTime());

  return grouped;
}




