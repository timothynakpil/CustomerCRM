
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  console.log("ProtectedRoute - loading:", loading, "isAuthenticated:", isAuthenticated);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p>Loading authentication status...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // All routes are accessible to all logged-in users
  return <Outlet />;
};

export default ProtectedRoute;
