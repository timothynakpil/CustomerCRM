
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface ForgotPasswordFormProps {
  onBack: () => void;
}

const ForgotPasswordForm = ({ onBack }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get the base URL of the application
      const baseUrl = window.location.origin;
      
      // Send password reset email with the correct redirect URL
      // Make sure we redirect to the reset-password page and not dashboard
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${baseUrl}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetSent(true);
      toast({
        title: "Reset email sent",
        description: "Check your email for the password reset link",
      });
      
      console.log(`Reset email sent. Redirect URL: ${baseUrl}/reset-password`);
    } catch (error: any) {
      console.error("Error sending reset:", error);
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: error.message || "Failed to send reset email",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            disabled={isLoading}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <CardTitle>Reset Password</CardTitle>
        </div>
        <CardDescription>
          {resetSent 
            ? "Check your email for a reset link"
            : "Enter your email address to receive password reset instructions"}
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          {resetSent ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="bg-green-50 p-3 rounded-full mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                We've sent instructions to <span className="font-semibold">{email}</span>. 
                Please check your inbox and spam folder.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          {resetSent ? (
            <Button 
              className="w-full" 
              onClick={onBack}
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
                  Sending...
                </>
              ) : (
                "Send Reset Instructions"
              )}
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
};

export default ForgotPasswordForm;
