
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

// This component now ensures users have a role and handles special owner role
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
        // Determine the initial role based on email
        const isOwner = user.email === "jrdeguzman3647@gmail.com";
        const initialRole = isOwner ? 'owner' : 'user';
        
        // Update user metadata locally to include a role
        const session = JSON.parse(localStorage.getItem('sb-avocdhvgtmkguyboohkc-auth-token') || '{}');
        if (session.user) {
          session.user.user_metadata = {
            ...session.user.user_metadata,
            role: initialRole
          };
          localStorage.setItem('sb-avocdhvgtmkguyboohkc-auth-token', JSON.stringify(session));
          
          toast({
            title: `User role initialized`,
            description: `Your account has been initialized with a ${initialRole} role.`,
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
