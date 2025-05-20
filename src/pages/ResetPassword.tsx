
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasSessionChecked, setHasSessionChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check query parameters for password reset token
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // Try to extract access_token and type from hash parameters
        const hashParams = new URLSearchParams(
          location.hash.substring(1) // Remove the leading '#'
        );
        
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log("Reset params:", { accessToken: !!accessToken, refreshToken: !!refreshToken, type });
        
        // If we have a token and it's for password recovery, set the session
        if (accessToken && type === 'recovery') {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          
          if (error) {
            console.error("Error setting session:", error);
            setError("Invalid or expired password reset link. Please try again.");
            toast({
              variant: "destructive",
              title: "Session error",
              description: "Invalid or expired password reset link",
            });
          } else {
            console.log("Session set successfully:", data.session);
            toast({
              title: "Ready to reset",
              description: "Please enter your new password",
            });
          }
        } else if (!accessToken) {
          // Check if we already have a valid session
          const { data: sessionData } = await supabase.auth.getSession();
          
          if (!sessionData.session) {
            setError("No valid reset token found. Please request a new password reset.");
            toast({
              variant: "destructive",
              title: "Invalid reset link",
              description: "No valid reset token found. Please request a new password reset.",
            });
          }
        }
        
        setHasSessionChecked(true);
      } catch (err) {
        console.error("Error processing reset token:", err);
        setError("An error occurred while processing your password reset request.");
        setHasSessionChecked(true);
        toast({
          variant: "destructive",
          title: "Error",
          description: "There was a problem processing your password reset request",
        });
      }
    };

    fetchSession();
  }, [location, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields",
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Passwords don't match",
        description: "Make sure both passwords are the same",
      });
      return;
    }
    
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Password too short",
        description: "Password must be at least 6 characters long",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setIsSuccess(true);
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated",
      });
      
      // Sign out after successful password reset
      await supabase.auth.signOut();
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error: any) {
      console.error("Error resetting password:", error);
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: error.message || "Failed to reset password",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while checking the session
  if (!hasSessionChecked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verifying your password reset link...</p>
        </div>
      </div>
    );
  }

  // If there's an error with the reset link
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary">CustomerCRM</h1>
            <p className="mt-2 text-gray-600">Product Management System</p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Password Reset Error</CardTitle>
              <CardDescription>
                There was a problem with your password reset link
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center py-6">
              <div className="bg-red-50 p-3 rounded-full inline-block mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-gray-700 mb-4">{error}</p>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full"
                onClick={() => navigate("/login")}
              >
                Back to Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-primary">CustomerCRM</h1>
          <p className="mt-2 text-gray-600">Product Management System</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Create New Password</CardTitle>
            <CardDescription>
              Please enter and confirm your new password
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-4">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Password Successfully Reset
                  </h3>
                  <p className="text-sm text-gray-600">
                    You will be redirected to the login page shortly.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      required
                    />
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter>
              {isSuccess ? (
                <Button 
                  type="button" 
                  className="w-full"
                  onClick={() => navigate("/login")}
                >
                  Return to Login
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
