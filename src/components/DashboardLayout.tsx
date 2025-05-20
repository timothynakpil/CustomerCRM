
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
  UserCog,
  Shield,
  AlertCircle
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
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    if (user?.user_metadata?.role === 'blocked') {
      setIsBlocked(true);
    } else {
      setIsBlocked(false);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Extract user name from metadata with fallback
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  // Get first letter for avatar with fallback
  const userInitial = userName.charAt(0).toUpperCase();
  // Get user role with fallback
  const userRole = user?.user_metadata?.role || 'user';
  
  // Role label color
  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case "owner": return "text-purple-600 font-semibold";
      case "admin": return "text-green-600 font-medium";
      case "user": return "text-blue-600";
      case "blocked": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      showWhenBlocked: true
    },
    {
      name: "Customers",
      path: "/customers",
      icon: <Users className="h-5 w-5" />,
      showWhenBlocked: true
    },
    {
      name: "Reports",
      path: "/reports",
      icon: <FileText className="h-5 w-5" />,
      showWhenBlocked: false
    },
    {
      name: "User Management",
      path: "/users",
      icon: <UserCog className="h-5 w-5" />,
      showWhenBlocked: true
    }
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    !isBlocked || item.showWhenBlocked
  );

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
          
          {isBlocked && (
            <div className="mx-4 my-2 p-3 bg-red-50 border border-red-100 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-sm text-red-700">Your account is currently restricted</span>
            </div>
          )}
          
          <div className="flex flex-col flex-grow p-4 space-y-1">
            {filteredNavItems.map((item) => (
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
                <div className="flex items-center">
                  {userRole === 'owner' && <Shield className="h-3 w-3 mr-1 text-purple-600" />}
                  <p className={`text-xs ${getRoleBadgeColor(userRole)}`}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </p>
                </div>
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
