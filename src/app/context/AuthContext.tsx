import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, User } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await auth.getSession();
      setUser(session);
    } catch (error) {
      console.error('Session check error:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const session = await auth.getSession();
      setUser(session);
    } catch (error) {
      console.error('Refresh user error:', error);
      setUser(null);
    }
  };

  const logout = async () => {
    await auth.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
