import { getUser, isLoggedIn } from '../store/authStore';
import type { GuardStrategy, GuardType } from './GuardStrategy';

class RequireAuthStrategy implements GuardStrategy {
  canActivate(): boolean {
    return isLoggedIn();
  }

  getRedirectPath(): string {
    return '/login';
  }
}

class RequireAdminStrategy implements GuardStrategy {
  canActivate(): boolean {
    const user = getUser();
    return isLoggedIn() && !!user?.isAdmin;
  }

  getRedirectPath(): string {
    return isLoggedIn() ? '/home' : '/login';
  }
}

const strategyRegistry: Record<GuardType, GuardStrategy> = {
  auth: new RequireAuthStrategy(),
  admin: new RequireAdminStrategy(),
};

export function getGuardStrategy(type: GuardType): GuardStrategy {
  return strategyRegistry[type];
}

