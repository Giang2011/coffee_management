// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { authApi } from '@/api';

/* -------------------------------------------------------------------------- */
/*                        AUTH CONTEXT – v2 (hoàn chỉnh)                     */
/* -------------------------------------------------------------------------- */
const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);          // thông tin người dùng
  const [loading, setLoading] = useState(true);    // kiểm tra token lần đầu

  /* ----------------------- Khởi động: kiểm tra JWT ----------------------- */
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);
      try {
        const { data } = await authApi.getProfile(); // GET /user
        setUser(data);
      } catch (err) {
        console.error('Token invalid:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  /* ------------------------- Hàm đăng nhập ------------------------------- */
  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password }); // { token, user }
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;                       //  trả về user (có .role)
  };

  /* ------------------------- Hàm đăng ký --------------------------------- */
  const register = async (payload) => {
    const { data } = await authApi.register(payload); // { token, user }
    localStorage.setItem('token', data.token);
    setUser(data.user);
    return data.user;
  };

  /* ------------------------- Hàm đăng xuất -------------------------------- */
  const logout = async () => {
    try { await authApi.logout(); } catch (_) {}
    localStorage.removeItem('token');
    setUser(null);
  };

  /* ------------------------- Giá trị cung cấp ---------------------------- */
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
