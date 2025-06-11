// src/layouts/AuthLayout.jsx
import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Outlet />        {/* Login / Register hiển thị ở đây */}
    </div>
  );
}
