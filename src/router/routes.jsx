// src/router/routes.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';

/* ----- Layouts ----- */
import MainLayout   from '@/layouts/MainLayout';
import AdminLayout  from '@/layouts/AdminLayout';
import AuthLayout   from '@/layouts/AuthLayout';

/* ----- Guards ----- */
import RequireAuth  from '@/components/RequireAuth';

/* ----- Pages (user) ----- */
import Home         from '@/pages/Home';
import Products     from '@/pages/Products';
import ProductDetail from '@/pages/ProductDetail';  // nếu có
import Cart         from '@/pages/Cart';
import Checkout     from '@/pages/Checkout';
import Profile      from '@/pages/Profile';
import UserOrders   from '@/pages/UserOrders';

/* ----- Pages (auth) ----- */
import Login        from '@/pages/Login';

/* ----- Pages (admin) ----- */
import Dashboard        from '@/pages/Admin/Dashboard';
import ProductsCRUD     from '@/pages/Admin/ProductsCRUD';
import CategoriesCRUD   from '@/pages/Admin/CategoriesCRUD';
import VouchersCRUD     from '@/pages/Admin/VouchersCRUD';
import UsersCRUD        from '@/pages/Admin/UsersCRUD';
import OrdersCRUD       from '@/pages/Admin/OrdersCRUD';

export const router = createBrowserRouter([
  /* ======================================================================== */
  /*                       0. HOME – PUBLIC                                  */
  /* ======================================================================== */
  {
    path: '/',
    element: <MainLayout />, // Home uses MainLayout (Navbar + Footer)
    children: [
      { index: true, element: <Home /> },
    ],
  },

  /* ======================================================================== */
  /*                       1. KHU BẢO VỆ – USER SAU ĐĂNG NHẬP                */
  /* ======================================================================== */
  {
    element: (
      <RequireAuth>                {/* kiểm tra JWT */}
        <MainLayout />             {/* Navbar + Footer */}
      </RequireAuth>
    ),
    children: [
      { path: 'products',     element: <Products /> },
      { path: 'products/:id', element: <ProductDetail /> },
      { path: 'cart',         element: <Cart /> },
      { path: 'checkout',     element: <Checkout /> },
      { path: 'profile',      element: <Profile /> },
      { path: 'orders',       element: <UserOrders /> },
    ],
  },

  /* ======================================================================== */
  /*                       2. KHU ADMIN – ROLE = 'admin'                      */
  /* ======================================================================== */
  {
    path: '/admin',
    element: (
      <RequireAuth role="admin">   {/* phải login + role admin */}
        <AdminLayout />
      </RequireAuth>
    ),
    children: [
      { index: true,          element: <Dashboard /> },
      { path: 'products',     element: <ProductsCRUD /> },
      { path: 'categories',   element: <CategoriesCRUD /> },
      { path: 'vouchers',     element: <VouchersCRUD /> },
      { path: 'users',        element: <UsersCRUD /> },
      { path: 'orders',       element: <OrdersCRUD /> },
    ],
  },

  /* ======================================================================== */
  /*                     3. KHU AUTH – KHÔNG NAVBAR/FOOTER                    */
  /* ======================================================================== */
  {
    element: <AuthLayout />,        // layout trống
    children: [
      { path: '/login', element: <Login /> },
    ],
  },

  /* ------------------- fallback 404: về / (hoặc /login) ------------------- */
  { path: '*', element: <Navigate to="/" replace /> },
]);
