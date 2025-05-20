
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-5xl font-bold mb-6 text-primary">CustomerCRM</h1>
        <p className="text-xl text-gray-600 mb-8">
          A modern customer relationship management system designed for small and medium businesses
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/login">Log In</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/signup">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
