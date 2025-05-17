
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
      
      // Check if this is the target email account
      if (user.email === 'jrdeguzman3647@gmail.com') {
        try {
          console.log("AdminInitializer: Detected target email, setting up admin role");
          
          const { data, error } = await supabase.functions.invoke("update-user-role", {
            body: {
              email: 'jrdeguzman3647@gmail.com',
              role: 'admin'
            }
          });
          
          if (error) throw error;
            
          console.log("Admin initialization response:", data);
          
          toast({
            title: "Admin access granted",
            description: "Your account has been set as an admin user.",
          });
          
          // Force page reload to update the UI with new permissions
          window.location.reload();
        } catch (error) {
          console.error("Failed to initialize admin:", error);
        }
        
        setInitialized(true);
      }
    };

    initializeAdmin();
  }, [user, toast, initialized]);

  return null; // This component doesn't render anything
};

export default AdminInitializer;
