
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useAuth();
  const email = user?.email;

  const makeAdmin = async () => {
    if (!email) return;
    setLoading(true);
    try {
      // Get the current session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("No active session found");
      }

      const { data, error } = await supabase.functions.invoke("update-user-role", {
        body: { email, role: "admin" }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your account has been updated to admin status. Please log out and log back in to see changes."
      });
      setDone(true);
    } catch (error) {
      console.error("Error making admin:", error);
      toast({
        title: "Error",
        description: "Failed to update your role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAfterAdminSetup = async () => {
    if (done) {
      await logout();
    }
  };

  if (!email) return null;

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Admin Access Setup</h2>
      <p className="mb-6">
        Click the button below to grant admin privileges to your account ({email}).
        This will allow you to access the User Management page.
      </p>
      {!done ? (
        <Button
          onClick={makeAdmin}
          disabled={loading}
          className="w-full"
        >
          {loading ? "Processing..." : "Make Me Admin"}
        </Button>
      ) : (
        <div className="space-y-4">
          <p className="text-green-600 font-medium">
            Your account has been granted admin privileges. Please log out and log back in to see the changes.
          </p>
          <Button 
            onClick={handleLogoutAfterAdminSetup} 
            className="w-full bg-blue-500 hover:bg-blue-600"
          >
            Logout Now
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminSetup;
