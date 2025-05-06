
import DashboardLayout from "@/components/DashboardLayout";
import AdminSetup from "@/components/AdminSetup";
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

        {/* Only show AdminSetup if user is not already an admin */}
        {!isAdmin && user?.email === "jrdeguzman3647@gmail.com" && (
          <AdminSetup />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
