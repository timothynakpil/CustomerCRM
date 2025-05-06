
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">User Details</h1>
        <Button variant="outline" onClick={() => navigate('/users')}>
          Back to Users
        </Button>
      </div>
      
      <div className="bg-white p-6 rounded-md border">
        <p className="text-center text-gray-500 py-10">
          User ID: {id}<br/>
          (User detail page to be implemented)
        </p>
      </div>
    </div>
  );
};

export default UserDetail;
