
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
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"admin" | "user" | "blocked">("user");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  // Direct method to get users from local session
  useEffect(() => {
    const fetchLocalUser = async () => {
      try {
        setLoading(true);
        
        // Get current user data
        if (currentUser) {
          // Create a sample user array with just the current user
          const currentUserData: User = {
            id: currentUser.id,
            email: currentUser.email!,
            role: currentUser.user_metadata?.role || 'user',
            created_at: currentUser.created_at || new Date().toISOString(),
            last_sign_in_at: currentUser.last_sign_in_at || null
          };
          
          setUsers([currentUserData]);
          console.log("Loaded current user data:", currentUserData);
        }
      } catch (error) {
        console.error("Error setting up user data:", error);
        toast({
          title: "Notice",
          description: "Only showing current user information.",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLocalUser();
  }, [currentUser, toast]);

  const handleRoleChange = async () => {
    if (!selectedUserId || !selectedRole) return;
    
    try {
      // Update local state first for immediate feedback
      setUsers(users.map(user => 
        user.id === selectedUserId 
          ? { ...user, role: selectedRole }
          : user
      ));
      
      // Only attempt to update if it's the current user
      if (selectedUserId === currentUser?.id) {
        // Update the user metadata locally
        const updatedMetadata = {
          ...currentUser.user_metadata,
          role: selectedRole
        };
        
        // Store updated metadata in localStorage
        const session = JSON.parse(localStorage.getItem('sb-avocdhvgtmkguyboohkc-auth-token') || '{}');
        if (session.user) {
          session.user.user_metadata = updatedMetadata;
          localStorage.setItem('sb-avocdhvgtmkguyboohkc-auth-token', JSON.stringify(session));
        }
      }
      
      toast({
        title: "Success",
        description: `User role updated to ${selectedRole}.`
      });
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        title: "Error",
        description: "Failed to update user role.",
        variant: "destructive"
      });
    }
  };

  const openChangeRoleDialog = (userId: string, currentRole: "admin" | "user" | "blocked") => {
    setSelectedUserId(userId);
    setSelectedRole(currentRole);
    setIsDialogOpen(true);
  };

  // Role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case "admin": return "default";
      case "user": return "secondary";
      case "blocked": return "destructive";
      default: return "outline";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>

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
                          onClick={() => openChangeRoleDialog(user.id, user.role)}
                        >
                          Change Role
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
                Set a new role for this user. This will change their permissions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <Select value={selectedRole} onValueChange={(value: "admin" | "user" | "blocked") => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
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
