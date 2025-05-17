
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Users,
  LogOut, 
  Menu, 
  X,
  FileText,
  Settings,
  UserCog
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Extract user name from metadata with fallback
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  // Get first letter for avatar with fallback
  const userInitial = userName.charAt(0).toUpperCase();
  
  // Check if user is admin (for conditional menu items)
  const isAdmin = user?.user_metadata?.role === "admin";
  
  console.log("DashboardLayout: User metadata:", user?.user_metadata);
  console.log("DashboardLayout: Is admin?", isAdmin);

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <Users className="h-5 w-5" />,
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileText className="h-5 w-5" />,
    }
  ];
  
  // Add User Management for admins only
  if (isAdmin) {
    navigationItems.push({
      name: "User Management",
      path: "/users",
      icon: <UserCog className="h-5 w-5" />,
    });
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-full"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-white border-r transition-transform duration-300 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b">
            <Link to="/dashboard" className="text-xl font-bold text-primary">
              CustomerCRM
            </Link>
          </div>
          
          <div className="flex flex-col flex-grow p-4 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-4 py-3 rounded-md text-sm transition-colors",
                  location.pathname === item.path
                    ? "bg-primary text-white font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                {userInitial}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
                {isAdmin && <p className="text-xs text-green-600 font-medium">Admin</p>}
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 ml-0 md:ml-64 transition-all duration-300 ease-in-out">
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
