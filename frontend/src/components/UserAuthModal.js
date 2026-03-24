import { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, ShieldCheck, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function UserAuthModal({ open, onClose }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') {
        const userData = await login(form.email, form.password);
        toast.success('Welcome back!');
        if (userData.role === 'admin') {
          onClose();
          navigate('/admin/dashboard');
        } else {
          onClose();
        }
      } else {
        await register(form.name, form.email, form.password);
        toast.success('Account created! Please sign in.');
        setMode('login');
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end">
      {/* Darkened Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Main Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
        
        {/* Elegant Header with Brand Theme */}
        <div className="bg-red-800 p-10 pt-16 text-white relative overflow-hidden shrink-0">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-700 rounded-full blur-3xl opacity-30" />
          
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 text-red-200 hover:text-white transition-all hover:bg-white/10 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-serif font-bold tracking-tight">
              {mode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-red-100/80 text-sm mt-2 font-light">
              {mode === 'login' 
                ? 'Sign in to manage your banquet bookings.' 
                : 'Join us to start planning your premium event.'}
            </p>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-8 md:p-10 custom-scrollbar bg-stone-50/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-red-800 transition-colors" />
                  <Input 
                    placeholder="Soham Auti" 
                    className="pl-11 h-12 rounded-xl bg-white border-stone-200 focus:ring-red-800/10 focus:border-red-800 transition-all shadow-sm" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-red-800 transition-colors" />
                <Input 
                  type="email" 
                  placeholder="admin@example.com" 
                  className="pl-11 h-12 rounded-xl bg-white border-stone-200 focus:ring-red-800/10 focus:border-red-800 transition-all shadow-sm" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 group-focus-within:text-red-800 transition-colors" />
                <Input 
                  type="password" 
                  placeholder="••••••••" 
                  className="pl-11 h-12 rounded-xl bg-white border-stone-200 focus:ring-red-800/10 focus:border-red-800 transition-all shadow-sm" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-red-800 text-white py-4 rounded-xl font-bold hover:bg-red-900 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-red-900/10 active:scale-[0.98] mt-4"
            >
              {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Register Now'}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Mode Switcher */}
          <div className="mt-12 text-center pb-8 border-t border-stone-100 pt-8">
            <button 
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')} 
              className="text-sm font-medium text-stone-500 hover:text-red-800 transition-colors py-2 px-4 rounded-lg hover:bg-stone-100"
            >
              {mode === 'login' ? (
                <>New to Awadhut? <span className="text-red-800 font-bold ml-1 underline decoration-red-800/30 underline-offset-4">Create Account</span></>
              ) : (
                <>Already have an account? <span className="text-red-800 font-bold ml-1 underline decoration-red-800/30 underline-offset-4">Sign In</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}