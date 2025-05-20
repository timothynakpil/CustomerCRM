
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface BlockedRouteGuardProps {
  allowedRoles?: string[];
}

const BlockedRouteGuard = ({ allowedRoles = [] }: BlockedRouteGuardProps) => {
  const { user } = useAuth();
  
  // Check if user exists
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user is blocked
  const userRole = user.user_metadata?.role || 'user';
  const isBlocked = userRole === 'blocked';
  
  // If user is blocked and trying to access a restricted route
  if (isBlocked && !allowedRoles.includes('blocked')) {
    return <Navigate to="/blocked" replace />;
  }
  
  // User is allowed to access the route
  return <Outlet />;
};

export default BlockedRouteGuard;
