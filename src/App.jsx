// src/App.jsx
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/routes';
import { AuthProvider } from '@/context/AuthContext';

/**
 * Root component – chỉ bọc Router bởi AuthProvider.
 * Nếu bạn muốn thêm QueryClientProvider (react‑query) hoặc ThemeProvider, bọc tại đây.
 */
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
