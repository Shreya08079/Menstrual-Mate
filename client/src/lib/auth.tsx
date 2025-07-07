import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { storeAuthData, getStoredAuthData, clearAuthData } from "./auth-utils";
import type { User } from "@shared/schema";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    name: string;
    email: string;
    username: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  loading: boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app startup
    const storedUser = getStoredAuthData();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest('POST', '/api/auth/login', {
        email,
        password,
      });

      const data = await response.json();
      const { user: authenticatedUser } = data;
      
      setUser(authenticatedUser);
      storeAuthData(authenticatedUser);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error("Invalid email or password. Please try again.");
    }
  };

  const register = async (userData: {
    name: string;
    email: string;
    username: string;
    password: string;
  }) => {
    try {
      const response = await apiRequest('POST', '/api/auth/register', userData);

      const data = await response.json();
      const { user: newUser } = data;
      
      setUser(newUser);
      storeAuthData(newUser);
    } catch (error: any) {
      console.error('Registration error:', error);
      // Try to parse error message from response
      if (error.message.includes('User already exists')) {
        throw new Error("An account with this email already exists.");
      } else if (error.message.includes('400')) {
        throw new Error("Please check your information and try again.");
      } else {
        throw new Error("Registration failed. Please try again.");
      }
    }
  };

  const logout = () => {
    setUser(null);
    clearAuthData();
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      storeAuthData(updatedUser);
    }
  };

  const contextValue: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Additional utility hooks for common auth patterns
export function useAuthenticatedUser() {
  const { user } = useAuth();
  if (!user) {
    throw new Error("User is not authenticated");
  }
  return user;
}

export function useIsAuthenticated() {
  const { user } = useAuth();
  return user !== null;
}

export function useAuthActions() {
  const { login, register, logout } = useAuth();
  return { login, register, logout };
}

// Hook for conditional rendering based on auth state
export function useAuthState() {
  const { user, loading } = useAuth();
  
  return {
    isAuthenticated: user !== null,
    isLoading: loading,
    user,
  };
}
