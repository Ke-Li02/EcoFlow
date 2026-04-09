import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getGuardStrategy } from '../../src/guards/strategies.ts';
import * as authStore from '../../src/store/authStore';

describe('Guard Strategies', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('RequireAdminStrategy', () => {
    it('should allow admin access', () => {
      vi.spyOn(authStore, 'isLoggedIn').mockReturnValue(true);
      vi.spyOn(authStore, 'getUser').mockReturnValue({ isAdmin: true } as any);

      const strategy = getGuardStrategy('admin');
      expect(strategy.canActivate()).toBe(true);
    });

    it('should redirect to /home if logged in but not admin', () => {
      vi.spyOn(authStore, 'isLoggedIn').mockReturnValue(true);
      vi.spyOn(authStore, 'getUser').mockReturnValue({ isAdmin: false } as any);

      const strategy = getGuardStrategy('admin');
      expect(strategy.getRedirectPath()).toBe('/home');
    });

    it('should redirect to /login if not logged in', () => {
      vi.spyOn(authStore, 'isLoggedIn').mockReturnValue(false);
      
      const strategy = getGuardStrategy('admin');
      expect(strategy.getRedirectPath()).toBe('/login');
    });
  });
});