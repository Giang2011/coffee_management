// src/components/RequireAuth.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Guard component – bọc quanh mọi layout/route cần bảo vệ.
 * - Nếu `loading` (lấy từ AuthContext) ⇒ hiển thị spinner full‑screen
 * - Nếu chưa đăng nhập ⇒ redirect tới /login (lưu vị trí cũ)
 * - Nếu prop `role` được truyền và user không khớp ⇒ redirect về trang chủ
 */
export default function RequireAuth({ children, role }) {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  /* 1️⃣ Đang kiểm tra token */
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <svg viewBox="0 0 100 100" className="h-12 w-12 animate-spin text-amber-600" fill="none">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="10" />
        </svg>
      </div>
    );
  }

  /* 2️⃣ Chưa đăng nhập → /login (lưu from:location) */
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  /* 3️⃣ Đã login nhưng sai role → về Home */
  if (role && user?.role !== role) {
    return <Navigate to="/" replace />;
  }

  /* 4️⃣ Thoả mãn → render children */
  return children;
}
