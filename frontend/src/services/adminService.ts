import axios from 'axios';
import { getToken } from '../store/authStore';

const api = axios.create({ baseURL: '/api/admin' });

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export type RequestVolumeEntry = {
    hour: string;
    count: number;
};

export type AdminDashboardData = {
    requestVolume: RequestVolumeEntry[];
};

export async function getAdminDashboard(): Promise<AdminDashboardData> {
    return api.get<AdminDashboardData>('/dashboard').then((r) => r.data);
}