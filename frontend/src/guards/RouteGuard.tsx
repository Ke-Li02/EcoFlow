import { Navigate } from 'react-router-dom';
import { getGuardStrategy } from './strategies';
import type { GuardType } from './GuardStrategy';

interface RouteGuardProps {
  guardType: GuardType;
  children: React.ReactNode;
}

export default function RouteGuard({ guardType, children }: RouteGuardProps) {
  const strategy = getGuardStrategy(guardType);
  if (strategy.canActivate()) {
    return <>{children}</>;
  }

  return <Navigate to={strategy.getRedirectPath()} replace />;
}

