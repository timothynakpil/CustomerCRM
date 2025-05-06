
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminSetup = () => {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();
  const email = "jrdeguzman3647@gmail.com"; // The email of the user to be made admin

  const makeAdmin = async () => {
    setLoading(true);
    try {
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

  return (
    <div className="p-6 bg-white rounded-lg border shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Admin Access Setup</h2>
      <p className="mb-6">
        Click the button below to grant admin privileges to your account ({email}).
        This will allow you to access the User Management page.
      </p>
      <Button
        onClick={makeAdmin}
        disabled={loading || done}
        className="w-full"
      >
        {loading ? "Processing..." : done ? "Admin Access Granted" : "Make Me Admin"}
      </Button>
      {done && (
        <p className="mt-4 text-green-600 font-medium">
          Your account has been granted admin privileges. Please log out and log back in to see the changes.
        </p>
      )}
    </div>
  );
};

export default AdminSetup;
