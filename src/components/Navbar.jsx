import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '@/store/cartStore';
import { useAuth } from '@/context/AuthContext';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faRightFromBracket, faClipboardList } from '@fortawesome/free-solid-svg-icons';
import { faFacebook, faInstagram, faTiktok } from '@fortawesome/free-brands-svg-icons';

/* -------------------------------------------------------------------------- */
/*                               NAVBAR v2                                    */
/*   - Tràn full‑width, logo bám sát mép trái, menu sát mép phải              */
/*   - Badge giỏ hàng, hamburger mobile                                      */
/*   - Footer cố định đáy -> xem ghi chú cuối file                           */
/* -------------------------------------------------------------------------- */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const itemCount = useCart((s) => s.items.reduce((t, i) => t + i.quantity, 0));
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setShowLogoutModal(true);
    setTimeout(() => setShowLogoutModal(false), 1000);
  };

  const navLink = (
    <>
      <NavLink to="/"        className={linkStyle}>Home</NavLink>
      <NavLink to="/products" className={linkStyle}>Products</NavLink>
      <NavLink to="/cart"     className={linkStyle + ' relative'}>
        <ShoppingCart size={18} />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-3 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs text-white">
            {itemCount}
          </span>
        )}
      </NavLink>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-white shadow">
      {/* full‑width flex */}
      <div className="flex items-center justify-between px-6 py-3">
        {/* logo */}
        <Link to="/" className="flex items-center text-2xl font-bold text-amber-600">
          <img src="/nus_logo_full-vertical.jpg" alt="Logo" className="h-12 mr-3" />
          NUS CoffeeShop
        </Link>

        {/* desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLink}
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm hover:text-amber-600">
                <FontAwesomeIcon icon={faClipboardList} size="lg" />
              </button>
              <button onClick={() => navigate('/profile')} className="flex items-center gap-1 text-sm hover:text-amber-600">
                <FontAwesomeIcon icon={faUser} size="lg" />
              </button>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-amber-600">
                <FontAwesomeIcon icon={faRightFromBracket} size="lg" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="rounded bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700">
              Login
            </Link>
          )}
        </nav>

        {/* hamburger */}
        <button className="lg:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* mobile menu */}
      {open && (
        <nav className="space-y-2 border-t px-6 pb-4 pt-2 lg:hidden">
          {navLink}
          {isAuthenticated ? (
            <>
              <button onClick={() => navigate('/orders')} className="flex items-center gap-1 text-sm hover:text-amber-600 w-full text-left">
                <FontAwesomeIcon icon={faClipboardList} size="lg" />
              </button>
              <button onClick={() => navigate('/profile')} className="flex items-center gap-1 text-sm hover:text-amber-600 w-full text-left">
                <FontAwesomeIcon icon={faUser} size="lg" />
              </button>
              <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:text-amber-600">
                <FontAwesomeIcon icon={faRightFromBracket} size="lg" /> Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="block rounded bg-amber-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-amber-700">
              Login
            </Link>
          )}
        </nav>
      )}

      {/* Modal thông báo logout thành công */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-xl shadow-lg px-8 py-6 text-2xl font-bold text-amber-700 animate-fade-in">
            Logout successful!
          </div>
        </div>
      )}
    </header>
  );
}

const linkStyle = ({ isActive }) =>
  `flex items-center gap-1 text-sm ${isActive ? 'text-amber-600' : 'text-gray-600 hover:text-amber-600'}`;

/* -------------------------------------------------------------------------- */
/*                                   FOOTER                                   */
/* -------------------------------------------------------------------------- */
export function Footer() {
  return (
    <footer className="bg-gray-100 py-8 text-sm text-gray-600">
      <div className="mx-auto grid w-full max-w-screen-xl grid-cols-1 gap-8 px-6 sm:grid-cols-2 lg:grid-cols-5">
        <div className="flex flex-row items-center justify-center min-h-[120px] gap-6 col-span-2 min-w-[320px]">
          <img src="/nus_logo_full-vertical.jpg" alt="Logo" className="h-28 object-contain" />
          <span className="text-3xl font-bold text-amber-700 whitespace-nowrap">NUS CoffeeShop</span>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-gray-800">Categories</h4>
          <ul className="space-y-1">
            <li><Link to="/products" className="hover:text-amber-600">Products</Link></li>
            <li><Link to="/cart" className="hover:text-amber-600">Cart</Link></li>
            <li><Link to="/" className="hover:text-amber-600">Promotions</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-gray-800">Contact</h4>
          <ul>
            <li>Hotline: +65 8590 3069</li>
            <li>Email: support@nuscoffeeshop.sg</li>
            <li>Address: 914, 91 Tampines Ave</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-2 font-semibold text-gray-800">Connect</h4>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/nhynhiinec" className="hover:text-amber-600" aria-label="Facebook"><FontAwesomeIcon icon={faFacebook} size="lg" /></a>
            <a href="https://www.instagram.com/kamabmakcan" className="hover:text-amber-600" aria-label="Instagram"><FontAwesomeIcon icon={faInstagram} size="lg" /></a>
            <a href="https://www.tiktok.com/@kamabmakcan" className="hover:text-amber-600" aria-label="TikTok"><FontAwesomeIcon icon={faTiktok} size="lg" /></a>
          </div>
        </div>
      </div>
      <p className="mt-8 text-center text-xs">© {new Date().getFullYear()} CoffeeShop. All rights reserved.</p>
    </footer>
  );
}

/*  FOOTER CỐ ĐỊNH ĐÁY
    Trong MainLayout.jsx, bọc toàn trang:
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1"> ... </main>
      <Footer />
    </div>
*/
