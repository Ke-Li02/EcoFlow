export interface GuardStrategy {
  canActivate(): boolean;
  getRedirectPath(): string;
}

export type GuardType = 'auth' | 'admin';

