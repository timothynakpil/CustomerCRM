
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

const AdminInitializer = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeAdmin = async () => {
      if (!user || initialized) return;
      
      // Check if the user already has admin role before making the API call
      if (user.user_metadata?.role === "admin") {
        console.log("User is already an admin, skipping initialization");
        setInitialized(true);
        return;
      }
      
      try {
        console.log("AdminInitializer: Setting user as admin");
        
        const { data, error } = await supabase.functions.invoke("update-user-role", {
          body: {
            email: user.email,
            role: 'admin'
          }
        });
        
        if (error) throw error;
          
        console.log("Admin initialization response:", data);
        
        toast({
          title: "Admin access granted",
          description: "Your account has been set as an admin user.",
        });
        
        // Update user metadata locally to avoid page reload
        const updatedUser = {
          ...user,
          user_metadata: {
            ...user.user_metadata,
            role: 'admin'
          }
        };
        
        // Update local session data (this can vary depending on your auth context)
        localStorage.setItem('supabase.auth.token', JSON.stringify({
          currentSession: {
            user: updatedUser
          }
        }));
      } catch (error) {
        console.error("Failed to initialize admin:", error);
      }
      
      setInitialized(true);
    };

    initializeAdmin();
  }, [user, toast, initialized]);

  return null; // This component doesn't render anything
};

export default AdminInitializer;
