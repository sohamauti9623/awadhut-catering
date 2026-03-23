import { useState } from 'react';
import { X, Mail, Lock, User } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function UserAuthModal({ open, onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all required fields'); return; }
    if (mode === 'register' && !form.name) { toast.error('Please enter your name'); return; }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Logged in successfully!');
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created successfully!');
      }
      setForm({ name: '', email: '', password: '' });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Authentication failed');
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div data-testid="user-auth-modal" className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 animate-scale-in">
        <button onClick={onClose} data-testid="close-auth-modal" className="absolute top-4 right-4 p-1 rounded-lg hover:bg-stone-100 text-stone-400">
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-red-800 flex items-center justify-center mx-auto mb-3">
            <span className="text-white font-serif font-bold text-lg">A</span>
          </div>
          <h2 className="font-serif text-xl font-bold text-stone-900">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-stone-500 text-sm mt-1">
            {mode === 'login' ? 'Login to submit your review' : 'Sign up to share your experience'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="text-sm font-medium text-stone-700 mb-1 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  data-testid="auth-name-input"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  placeholder="Your full name"
                  className="pl-10 rounded-xl"
                />
              </div>
            </div>
          )}
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                data-testid="auth-email-input"
                type="email"
                value={form.email}
                onChange={e => setForm({...form, email: e.target.value})}
                placeholder="your@email.com"
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-stone-700 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                data-testid="auth-password-input"
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
            data-testid="auth-submit-btn"
            disabled={loading}
            className="w-full bg-red-800 text-white py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:bg-red-900 disabled:opacity-50"
          >
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center mt-5">
          <p className="text-sm text-stone-500">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              data-testid="auth-toggle-mode"
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-red-800 font-medium ml-1 hover:underline"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
