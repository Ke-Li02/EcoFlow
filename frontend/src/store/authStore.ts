import type { User } from '../models/types/auth';

const TOKEN_KEY = 'ecoflow_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export function getUser(): User | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.id, username: payload.username, isAdmin: payload.isAdmin };
  } catch {
    return null;
  }
}

