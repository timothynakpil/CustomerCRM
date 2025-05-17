
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Users, FileText, ShoppingCart } from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  
  // Check if the user has admin role
  const isAdmin = user?.user_metadata?.role === "admin";
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Welcome to your dashboard, {user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'}
          </p>
        </div>

        {/* Show admin confirmation message only for admin users */}
        {isAdmin && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-2xl font-bold text-green-700 mb-2">Admin Access Granted</h2>
            <p className="text-green-600">
              Your account has admin privileges. You can access the User Management page from the sidebar.
            </p>
          </div>
        )}

        {/* Dashboard Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Customers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12</div>
              <p className="text-xs text-muted-foreground">
                Total registered customers
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Products
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+24</div>
              <p className="text-xs text-muted-foreground">
                Products in inventory
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Sales
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">
                Total sales transactions
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Menu Access
              </CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isAdmin ? 'Full' : 'Limited'}</div>
              <p className="text-xs text-muted-foreground">
                {isAdmin ? 'Admin access with all features' : 'Standard user access'}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
