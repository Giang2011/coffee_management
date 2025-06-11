import Navbar, { Footer } from '@/components/Navbar';
import { Outlet } from 'react-router-dom';

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-6"><Outlet /></main>
      <Footer />
    </div>
  );
}

