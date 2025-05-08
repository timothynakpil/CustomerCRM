
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "../components/ui/use-toast";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import { Session, User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session and set up auth listener
    const initializeAuth = async () => {
      setLoading(true);
      
      // Check if Supabase is configured
      if (!isSupabaseConfigured()) {
        console.warn("Supabase is not properly configured. Please set the environment variables.");
        setLoading(false);
        return;
      }
      
      try {
        // Set up auth listener FIRST to prevent missing auth events
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            
            // If user exists but doesn't have admin role, update it automatically
            if (currentSession?.user && currentSession.user.user_metadata?.role !== 'admin') {
              try {
                await supabase.functions.invoke("update-user-role", {
                  body: { email: currentSession.user.email, role: "admin" }
                });
                
                // Force refresh user data to get updated metadata
                const { data } = await supabase.auth.getUser();
                if (data?.user) {
                  setUser(data.user);
                }
              } catch (error) {
                console.error("Error updating user role:", error);
              }
            }
          }
        );
        
        // THEN check for existing session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        // Clean up subscription on unmount
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured()) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Supabase is not configured. Please set the environment variables.",
        });
        return false;
      }

      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Please enter both email and password",
        });
        return false;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        return false;
      }

      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An unexpected error occurred",
      });
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      if (!isSupabaseConfigured()) {
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Supabase is not configured. Please set the environment variables.",
        });
        return false;
      }

      if (!name || !email || !password) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "Please fill in all fields",
        });
        return false;
      }

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role: "admin", // Set role to admin by default for all new users
          },
        },
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: error.message,
        });
        return false;
      }

      // Check if email confirmation is required
      if (data?.user && data?.session) {
        // Session exists, so email confirmation is not required or already confirmed
        toast({
          title: "Account created",
          description: "Your account has been successfully created with admin privileges",
        });
      } else {
        // No session means confirmation is required
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account. You'll have admin privileges once confirmed.",
        });
      }
      
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: error.message || "Could not create account",
      });
      return false;
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    // Clear local user state even if Supabase is not configured
    setUser(null);
    setSession(null);
  };

  const value = {
    user,
    session,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
