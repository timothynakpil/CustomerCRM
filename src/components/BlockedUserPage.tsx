
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

const BlockedUserPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md text-center">
        <div className="mx-auto bg-red-100 w-20 h-20 flex items-center justify-center rounded-full mb-6">
          <Lock className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Restricted</h1>
        
        <p className="text-gray-600 mb-6">
          Your account has been blocked from accessing certain features of this application. 
          Please contact your administrator for assistance.
        </p>
        
        <Button 
          onClick={() => navigate("/dashboard")}
          className="w-full"
        >
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default BlockedUserPage;
