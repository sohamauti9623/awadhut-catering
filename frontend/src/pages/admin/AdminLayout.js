import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Image, Star, CalendarDays, LogOut, Menu, X, MessageSquare, PartyPopper } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api';

const sidebarLinks = [
  { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { name: 'Packages', path: '/admin/packages', icon: Package },
  { name: 'Events', path: '/admin/events', icon: PartyPopper },
  { name: 'Gallery', path: '/admin/gallery', icon: Image },
  { name: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Messages', path: '/admin/messages', icon: MessageSquare },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    api.get('/auth/me')
      .then(({ data }) => {
        if (data?.role !== 'admin') {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminName');
          toast.error('Admin access required. Please login with an admin account.');
          navigate('/admin/login');
        }
      })
      .catch(() => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminName');
        navigate('/admin/login');
      });
  }, [navigate]);

  useEffect(() => { setSidebarOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    navigate('/admin/login');
  };

  const adminName = localStorage.getItem('adminName') || 'Admin';

  return (
    <div data-testid="admin-layout" className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200 transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-5 border-b border-stone-100 flex items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-red-800 flex items-center justify-center">
                <span className="text-white font-serif font-bold text-sm">A</span>
              </div>
              <span className="font-serif font-bold text-stone-900 text-sm">Admin Panel</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1">
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>

          <nav className="flex-1 p-3 space-y-1">
            {sidebarLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  data-testid={`admin-nav-${link.name.toLowerCase()}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-red-50 text-red-800' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-3 border-t border-stone-100">
            <div className="px-3 py-2 text-xs text-stone-400 mb-2">Signed in as {adminName}</div>
            <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-500 hover:bg-stone-50 mb-1">
              View Website
            </Link>
            <button
              onClick={handleLogout}
              data-testid="admin-logout-btn"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-stone-500 hover:bg-red-50 hover:text-red-800 w-full text-left"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 lg:px-6 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-stone-100">
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="font-medium text-stone-900 text-sm">
            {sidebarLinks.find(l => l.path === location.pathname)?.name || 'Dashboard'}
          </h2>
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-800 text-xs font-bold">{adminName[0]}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
