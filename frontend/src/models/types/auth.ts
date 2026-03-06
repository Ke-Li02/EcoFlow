export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  isAdmin: boolean;
}

export interface AuthResponse {
  token: string;
}

export interface User {
  id: number;
  username: string;
  isAdmin: boolean;
}

