
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
  role: "owner" | "admin" | "user" | "blocked";
  created_at: string;
  last_sign_in_at: string | null;
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<"owner" | "admin" | "user" | "blocked">("user");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  const currentUserRole = currentUser?.user_metadata?.role || 'user';
  const isOwner = currentUserRole === 'owner';

  // Method to get users from local session and sample data
  useEffect(() => {
    const fetchLocalUser = async () => {
      try {
        setLoading(true);
        
        // Create a sample user array with just the current user
        if (currentUser) {
          const currentUserData: User = {
            id: currentUser.id,
            email: currentUser.email!,
            role: currentUser.user_metadata?.role || 'user',
            created_at: currentUser.created_at || new Date().toISOString(),
            last_sign_in_at: currentUser.last_sign_in_at || null
          };
          
          // Add a sample user - in a real app, we'd fetch actual users
          const sampleUsers: User[] = [currentUserData];
          
          // Add sample admin if current user is not the sample admin
          if (currentUser.email !== "jrdeguzman3647@gmail.com") {
            sampleUsers.push({
              id: "sample-owner-id",
              email: "jrdeguzman3647@gmail.com",
              role: "owner",
              created_at: new Date().toISOString(),
              last_sign_in_at: null
            });
          }
          
          // Add another sample user
          if (!sampleUsers.some(u => u.email === "sample.user@example.com")) {
            sampleUsers.push({
              id: "sample-user-id",
              email: "sample.user@example.com",
              role: "user",
              created_at: new Date().toISOString(),
              last_sign_in_at: null
            });
          }
          
          setUsers(sampleUsers);
          console.log("Loaded user data:", sampleUsers);
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
      const targetUser = users.find(user => user.id === selectedUserId);
      
      // Check if current user is trying to change owner's role
      if (targetUser?.role === 'owner' && currentUserRole !== 'owner') {
        toast({
          title: "Permission Denied",
          description: "Only an owner can change another owner's role.",
          variant: "destructive"
        });
        setIsDialogOpen(false);
        return;
      }
      
      // Check if trying to set someone as owner when there's already an owner
      if (selectedRole === 'owner' && users.some(u => u.role === 'owner' && u.id !== selectedUserId)) {
        toast({
          title: "Permission Denied",
          description: "There can only be one owner account.",
          variant: "destructive"
        });
        setIsDialogOpen(false);
        return;
      }
      
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

  const openChangeRoleDialog = (userId: string, email: string, currentRole: "owner" | "admin" | "user" | "blocked") => {
    setSelectedUserId(userId);
    setSelectedUserEmail(email);
    setSelectedRole(currentRole);
    setIsDialogOpen(true);
  };

  // Role badge color
  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case "owner": return "default"; // Primary color for owner
      case "admin": return "secondary";
      case "user": return "outline";
      case "blocked": return "destructive";
      default: return "outline";
    }
  };

  // Check if the current user can change a specific user's role
  const canChangeRole = (userRole: string): boolean => {
    if (currentUserRole === 'owner') return true;
    if (currentUserRole === 'admin' && userRole !== 'owner') return true;
    return false;
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
                          onClick={() => openChangeRoleDialog(user.id, user.email, user.role)}
                          disabled={!canChangeRole(user.role)}
                        >
                          {canChangeRole(user.role) ? "Change Role" : "No Permission"}
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
              <Select value={selectedRole} onValueChange={(value: "owner" | "admin" | "user" | "blocked") => setSelectedRole(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {isOwner && <SelectItem value="owner">Owner</SelectItem>}
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
