import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/api';    // ✅ đường dẫn đúng

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);

      try {
        const { data } = await authApi.getProfile();
        setUser(data);
      } catch {
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    localStorage.clear();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <svg className="h-8 w-8 animate-spin text-amber-600" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="none" strokeWidth="4" />
        </svg>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
