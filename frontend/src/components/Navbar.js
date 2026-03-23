import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import UserAuthModal from './UserAuthModal';

const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'About', path: '/about' },
  { name: 'Services', path: '/services' },
  { name: 'Packages', path: '/packages' },
  { name: 'Events', path: '/events' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Reviews', path: '/reviews' },
  { name: 'Contact', path: '/contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location]);

  return (
    <nav
      data-testid="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-xl border-b border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]'
          : 'bg-white/50 backdrop-blur-lg'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" data-testid="logo-link">
            <div className="w-9 h-9 rounded-full bg-red-800 flex items-center justify-center">
              <span className="text-white font-serif font-bold text-lg">A</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-serif font-bold text-stone-900 text-lg leading-tight tracking-tight">Awadhut</h1>
              <p className="text-[10px] text-stone-500 font-sans uppercase tracking-[0.2em] -mt-0.5">Banquets & Catering</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                data-testid={`nav-${link.name.toLowerCase()}`}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  location.pathname === link.path
                    ? 'text-red-800 bg-red-50/80'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/60'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* CTA + User + Mobile Toggle */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-100/80 text-stone-700">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">{user.name}</span>
                </div>
                <button
                  data-testid="navbar-logout-btn"
                  onClick={logout}
                  className="p-2 rounded-full hover:bg-stone-100 text-stone-500"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                data-testid="navbar-login-btn"
                onClick={() => setAuthOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <User className="w-4 h-4" /> Login
              </button>
            )}
            <Link
              to="/booking"
              data-testid="nav-book-event"
              className="hidden sm:inline-flex items-center gap-2 bg-red-800 text-white px-5 py-2.5 rounded-full text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900 hover:shadow-lg"
            >
              Book Your Event
            </Link>
            <a href="tel:+919767286040" className="lg:hidden p-2 rounded-full bg-stone-100 text-stone-700">
              <Phone className="w-4 h-4" />
            </a>
            <button
              data-testid="mobile-menu-toggle"
              onClick={() => setOpen(!open)}
              className="lg:hidden p-2 rounded-lg hover:bg-stone-100 transition-colors"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white/90 backdrop-blur-xl border-t border-stone-200/50 px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              data-testid={`mobile-nav-${link.name.toLowerCase()}`}
              className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === link.path
                  ? 'text-red-800 bg-red-50'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {link.name}
            </Link>
          ))}
          <Link
            to="/booking"
            className="block mt-3 text-center bg-red-800 text-white px-5 py-3 rounded-xl text-sm font-medium"
          >
            Book Your Event
          </Link>
          {user ? (
            <div className="flex items-center justify-between mt-3 px-4 py-3 rounded-xl bg-stone-50">
              <span className="text-sm text-stone-600">{user.name}</span>
              <button onClick={logout} className="text-xs text-red-600">Logout</button>
            </div>
          ) : (
            <button
              onClick={() => setAuthOpen(true)}
              className="block mt-2 w-full text-center border border-stone-200 text-stone-700 px-5 py-3 rounded-xl text-sm font-medium"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </div>

      <UserAuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </nav>
  );
}
