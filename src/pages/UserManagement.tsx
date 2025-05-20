
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type User = {
  id: string;
  email: string;
  role: "admin" | "user" | "blocked";
  created_at: string;
  last_sign_in_at: string | null;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | "blocked">("user");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const currentUserRole = currentUser?.user_metadata?.role || 'user';
  const isAdmin = currentUserRole === 'admin';

  useEffect(() => {
    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to fetch users from Supabase Edge Function
      const { data: supabaseUsers, error } = await supabase.functions.invoke('list-users');
      
      if (error) {
        console.error("Error fetching users:", error);
        setError("Failed to fetch users from the server. Using local data instead.");
        toast({
          title: "Error fetching users",
          description: "Could not load users from the server. Using local data instead.",
          variant: "destructive",
        });
        
        // Fall back to local data if the edge function fails
        const fallbackData = getFallbackUsers();
        setUsers(fallbackData);
        return;
      }
      
      if (supabaseUsers && Array.isArray(supabaseUsers)) {
        // Process users to ensure we have correct role information
        const formattedUsers = supabaseUsers.map(user => ({
          id: user.id,
          email: user.email || "",
          // Make sure to use the role from user_metadata, default to "user" if not available
          role: (user.user_metadata?.role || "user") as "admin" | "user" | "blocked",
          created_at: user.created_at || new Date().toISOString(),
          last_sign_in_at: user.last_sign_in_at || null
        }));
        
        // Ensure admin role is properly assigned
        const adminEmail = "jrdeguzman3647@gmail.com";
        const formattedUsersWithAdmin = formattedUsers.map(user => 
          user.email === adminEmail 
            ? { ...user, role: "admin" } 
            : user
        );
        
        console.log("Users loaded from server with roles:", formattedUsersWithAdmin);
        setUsers(formattedUsersWithAdmin);
      } else {
        setError("Received unexpected data format from server. Using local data instead.");
        // Fall back to local data if the response format is unexpected
        const fallbackData = getFallbackUsers();
        setUsers(fallbackData);
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      setError("An error occurred while fetching users. Using local data instead.");
      
      // Fall back to local data if there's any error
      const fallbackData = getFallbackUsers();
      setUsers(fallbackData);
      
      toast({
        title: "Error",
        description: "Failed to fetch users. Using local data instead.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get fallback users when API fails
  const getFallbackUsers = () => {
    // Create a fallback user array that includes the current user
    const fallbackUsers: User[] = [];
    
    // Always add the current user
    if (currentUser) {
      fallbackUsers.push({
        id: currentUser.id,
        email: currentUser.email!,
        role: currentUser.user_metadata?.role || 'user',
        created_at: currentUser.created_at || new Date().toISOString(),
        last_sign_in_at: currentUser.last_sign_in_at || null
      });
    }
    
    // Add designated admin if current user is not the admin
    if (currentUser?.email !== "jrdeguzman3647@gmail.com") {
      fallbackUsers.push({
        id: "admin-id",
        email: "jrdeguzman3647@gmail.com",
        role: "admin",
        created_at: new Date().toISOString(),
        last_sign_in_at: null
      });
    }
    
    // Add other sample users if needed
    const sampleEmails = ["sample.user@example.com", "ravenrillera2@gmail.com", "leozata032@gmail.com"];
    
    sampleEmails.forEach(email => {
      if (!fallbackUsers.some(u => u.email === email) && email !== currentUser?.email) {
        fallbackUsers.push({
          id: `sample-id-${email.split('@')[0]}`,
          email: email,
          role: email === "ravenrillera2@gmail.com" ? "user" : "user",
          created_at: new Date().toISOString(),
          last_sign_in_at: email === "leozata032@gmail.com" ? new Date().toISOString() : null
        });
      }
    });
    
    return fallbackUsers;
  };

  const handleRoleChange = async () => {
    if (!selectedUserId || !selectedRole) return;
    
    try {
      const targetUser = users.find(user => user.id === selectedUserId);
      
      // Check if current user is trying to change admin's role
      if (targetUser?.email === 'jrdeguzman3647@gmail.com' && selectedRole !== 'admin') {
        toast({
          title: "Permission Denied",
          description: "The designated admin's role cannot be changed.",
          variant: "destructive"
        });
        setIsDialogOpen(false);
        return;
      }
      
      // Check if non-admin is trying to assign admin role
      if (selectedRole === 'admin' && selectedUserEmail !== 'jrdeguzman3647@gmail.com') {
        toast({
          title: "Permission Denied",
          description: "Admin role can only be assigned to the designated admin email.",
          variant: "destructive"
        });
        setIsDialogOpen(false);
        return;
      }
      
      // Try to update the user role through the edge function
      const { data, error } = await supabase.functions.invoke("update-user-role", {
        body: {
          email: selectedUserEmail,
          role: selectedRole,
          requestingUserEmail: currentUser?.email
        }
      });
      
      if (error) {
        console.error("Error updating user role:", error);
        
        // Fall back to local update if edge function fails
        setUsers(users.map(user => 
          user.id === selectedUserId 
            ? { ...user, role: selectedRole }
            : user
        ));
        
        // Update local storage session if it's the current user
        if (selectedUserId === currentUser?.id) {
          updateLocalUserRole(selectedRole);
        }
        
        toast({
          title: "Warning",
          description: "Updated role locally, but couldn't update on the server.",
          variant: "default"
        });
      } else {
        // Update local state with the server response
        setUsers(users.map(user => 
          user.id === selectedUserId 
            ? { ...user, role: selectedRole }
            : user
        ));
        
        // If it's the current user, update local storage
        if (selectedUserId === currentUser?.id) {
          updateLocalUserRole(selectedRole);
        }
        
        toast({
          title: "Success",
          description: `User role updated to ${selectedRole}.`
        });
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error in handleRoleChange:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };
  
  // Helper function to update the user role in localStorage
  const updateLocalUserRole = (role: string) => {
    try {
      const session = JSON.parse(localStorage.getItem('sb-avocdhvgtmkguyboohkc-auth-token') || '{}');
      if (session.user) {
        session.user.user_metadata = {
          ...session.user.user_metadata,
          role: role
        };
        localStorage.setItem('sb-avocdhvgtmkguyboohkc-auth-token', JSON.stringify(session));
      }
    } catch (error) {
      console.error("Error updating local user role:", error);
    }
  };

  const openChangeRoleDialog = (userId: string, email: string, currentRole: "admin" | "user" | "blocked") => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setSelectedRole(currentRole);
    setIsDialogOpen(true);
  };

  // Role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case "admin": return "secondary"; // Green color for admin
      case "user": return "outline";
      case "blocked": return "destructive";
      default: return "outline";
    }
  };

  // Check if the current user can change a specific user's role
  const canChangeRole = (userEmail: string): boolean => {
    if (!isAdmin) return false;
    if (userEmail === "jrdeguzman3647@gmail.com" && currentUser?.email !== "jrdeguzman3647@gmail.com") return false;
    return true;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
          <Button variant="outline" onClick={fetchUsers} disabled={loading}>
            Refresh Users
          </Button>
        </div>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-md border shadow">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-500">Loading users...</p>
            </div>
          ) : (
            <Table>
              <TableCaption>List of system users and their roles.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Sign In</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24">
                      No users found.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role) as any}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {user.last_sign_in_at 
                          ? new Date(user.last_sign_in_at).toLocaleDateString() 
                          : "Never"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openChangeRoleDialog(user.id, user.email, user.role)}
                          disabled={!canChangeRole(user.email)}
                        >
                          {canChangeRole(user.email) ? "Change Role" : "No Permission"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Change Role Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Set a new role for {selectedUserEmail}. This will change their permissions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Select 
                value={selectedRole} 
                onValueChange={(value: "admin" | "user" | "blocked") => setSelectedRole(value)}
                disabled={selectedUserEmail === "jrdeguzman3647@gmail.com"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {/* Only show admin option for the designated admin email */}
                  {selectedUserEmail === "jrdeguzman3647@gmail.com" && <SelectItem value="admin">Admin</SelectItem>}
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleRoleChange}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
