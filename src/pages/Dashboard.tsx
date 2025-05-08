
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.user_metadata?.role === "admin";
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-500 mt-2">
            Welcome to your dashboard
          </p>
        </div>

        {/* Show admin confirmation message for all users */}
        {isAdmin && (
          <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-2xl font-bold text-green-700 mb-2">Admin Access Granted</h2>
            <p className="text-green-600">
              Your account has admin privileges. You can access the User Management page from the sidebar.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
