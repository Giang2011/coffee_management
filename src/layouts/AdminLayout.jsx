import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X, LayoutDashboard, Package, Tag, Users, ReceiptText } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

/* -------------------------------------------------------------------------- */
/*                         ADMIN LAYOUT – SIDEBAR                             */
/* -------------------------------------------------------------------------- */
export default function AdminLayout() {
  const [open, setOpen] = useState(false); // mobile sidebar
  const { logout, user } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ---------- Sidebar ---------- */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-blue-600">Admin</h2>
          <button className="lg:hidden" onClick={() => setOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <nav className="mt-4 space-y-1 px-4 text-sm">
          <AdminLink to="." icon={<LayoutDashboard size={18} />}>Dashboard</AdminLink>
          <AdminLink to="products" icon={<Package size={18} />}>Products</AdminLink>
          <AdminLink to="categories" icon={<Package size={18} />}>Categories</AdminLink>
          <AdminLink to="vouchers" icon={<Tag size={18} />}>Vouchers</AdminLink>
          <AdminLink to="users" icon={<Users size={18} />}>Customers</AdminLink>
          <AdminLink to="orders" icon={<ReceiptText size={18} />}>Orders</AdminLink>
        </nav>
        <div className="mt-auto border-t p-4 text-xs text-gray-500">
          <p>Logged in as: {user?.email}</p>
          <button onClick={logout} className="mt-2 text-red-600 hover:underline">
            Logout
          </button>
        </div>
      </aside>

      {/* ---------- Main content ---------- */}
      <div className="flex flex-1 flex-col">
        {/* top bar */}
        <header className="flex items-center justify-between bg-white px-4 py-3 shadow lg:hidden">
          <button onClick={() => setOpen(true)}>
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">Admin Panel</h1>
          <div></div>{/* placeholder to balance flex */}
        </header>

        <main className="flex-1 flex flex-col items-center justify-start p-2 lg:p-4">
          <div className="w-full" style={{maxWidth: 900}}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ------------------------------ helper ------------------------------------ */
function AdminLink({ to, icon, children }) {
  const base = 'flex items-center gap-2 rounded px-3 py-2';
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `${base} ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'}`
      }
    >
      {icon} {children}
    </NavLink>
  );
}
