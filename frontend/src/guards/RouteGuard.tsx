import { Navigate } from 'react-router-dom';
import { getGuardStrategy } from './strategies';
import type { GuardType } from './GuardStrategy';
import { isLoggedIn } from '../store/authStore';

interface RouteGuardProps {
  guardType: GuardType;
  children: React.ReactNode;
  redirect?: React.ReactNode;
}

export default function RouteGuard({ guardType, children, redirect }: RouteGuardProps) {
  const strategy = getGuardStrategy(guardType);
  if (strategy.canActivate()) {
    return <>{children}</>;
  }

  if (redirect && isLoggedIn()) {
    return <>{redirect}</>;
  }

  return <Navigate to={strategy.getRedirectPath()} replace />;
}

