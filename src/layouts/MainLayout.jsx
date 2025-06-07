import { Outlet, Link } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-4 bg-amber-600 text-white">
        <Link to="/" className="font-bold">CoffeeShop</Link>
      </header>

      <main className="flex-1 container mx-auto p-4">
        <Outlet />   {/* trang con hiển thị ở đây */}
      </main>

      <footer className="p-4 text-center text-sm text-gray-500">
        © 2025 CoffeeShop
      </footer>
    </div>
  );
}
