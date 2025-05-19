
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// This component now just makes sure the user has a role assigned in their metadata
const AdminInitializer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const ensureUserRole = async () => {
      if (!user || initialized) return;
      
      // Check if user already has any role
      if (user.user_metadata?.role) {
        console.log("User already has a role, skipping initialization");
        setInitialized(true);
        return;
      }
      
      try {
        // Update user metadata locally to include a role
        const session = JSON.parse(localStorage.getItem('sb-avocdhvgtmkguyboohkc-auth-token') || '{}');
        if (session.user) {
          session.user.user_metadata = {
            ...session.user.user_metadata,
            role: 'user'  // Default role for new users
          };
          localStorage.setItem('sb-avocdhvgtmkguyboohkc-auth-token', JSON.stringify(session));
          
          toast({
            title: "User role initialized",
            description: "Your account has been initialized with a user role.",
          });
        }
      } catch (error) {
        console.error("Failed to initialize user role:", error);
      }
      
      setInitialized(true);
    };

    ensureUserRole();
  }, [user, toast, initialized]);

  return null; // This component doesn't render anything
};

export default AdminInitializer;
