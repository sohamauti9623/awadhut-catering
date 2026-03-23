import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import api from '../../lib/api';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminName', data.name);
      toast.success('Login successful!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <div data-testid="admin-login-page" className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-red-800 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-serif font-bold text-2xl">A</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">Admin Login</h1>
          <p className="text-stone-500 text-sm mt-1">Awadhut Banquets & Catering</p>
        </div>

        <div className="p-8 rounded-2xl bg-white border border-stone-200 shadow-sm">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  data-testid="admin-email-input"
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="admin@awadhut.com"
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  data-testid="admin-password-input"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  placeholder="Enter password"
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
            <button
              type="submit"
              data-testid="admin-login-btn"
              disabled={loading}
              className="w-full bg-red-800 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-red-900 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
        <p className="text-center text-xs text-stone-400 mt-4">Admin access only</p>
      </div>
    </div>
  );
}
