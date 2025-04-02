
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "../components/ui/use-toast";

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      // For demo purposes, accept any valid-looking email/password
      if (!email || !password) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: "Please enter both email and password",
        });
        return false;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock user data - in real app, this would come from the backend
      const mockUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 11),
        email,
        name: email.split("@")[0],
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "Invalid email or password",
      });
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      // In a real app, this would be an API call
      if (!name || !email || !password) {
        toast({
          variant: "destructive",
          title: "Signup failed",
          description: "Please fill in all fields",
        });
        return false;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Mock user data - in real app, this would come from the backend
      const mockUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 11),
        email,
        name,
      };

      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      return true;
    } catch (error) {
      console.error("Signup error:", error);
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "Could not create account",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
