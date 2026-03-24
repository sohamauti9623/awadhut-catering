import { useEffect, useState } from 'react';
import { Star, Send, LogIn, LogOut, User } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { Input } from '../components/ui/input';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import UserAuthModal from '../components/UserAuthModal';
import api from '../lib/api';

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollAnimation(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '', eventType: '' });
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    api.get('/reviews?approved=true').then(r => { setReviews(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.token) {
      api.get('/reviews/my', { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => setMyReviews(r.data)).catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setAuthOpen(true); return; }
    if (!form.comment) { toast.error('Please write your review'); return; }
    setSubmitting(true);
    try {
      // Fix: Ensure payload matches ReviewCreate model
      const payload = { ...form, name: user.name };
      await api.post('/reviews', payload);
      toast.success('Submitted for approval!');
      setForm({ rating: 5, comment: '', eventType: '' });
      const r = await api.get('/reviews/my', { headers: { Authorization: `Bearer ${user.token}` } });
      setMyReviews(r.data);
    } catch (err) {
      const msg = err.response?.data?.detail;
      toast.error(typeof msg === 'string' ? msg : 'Failed to submit.');
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div className="pt-24">
      <UserAuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <section className="py-16 max-w-7xl mx-auto px-4">
        <AnimatedSection className="text-center mb-16">
          <h1 className="font-serif text-4xl font-bold mb-4">What Our Clients Say</h1>
          <div className="flex items-center justify-center gap-2">
            <Star className="text-amber-500 fill-amber-500" />
            <span className="text-2xl font-bold">{avgRating}</span>
            <span className="text-stone-400">({reviews.length} reviews)</span>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {reviews.map((r) => (
            <div key={r.id} className="p-6 bg-white rounded-2xl shadow-sm border italic">
              <div className="flex mb-2">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-200'}`} />)}
              </div>
              <p>"{r.comment}"</p>
              <p className="mt-4 font-bold not-italic">— {r.name}</p>
            </div>
          ))}
        </div>

        <div className="max-w-xl mx-auto bg-stone-50 p-8 rounded-2xl border">
          <h2 className="text-2xl font-bold mb-6 text-center">Share Your Experience</h2>
          {!user ? (
            <button onClick={() => setAuthOpen(true)} className="w-full bg-red-800 text-white p-3 rounded-xl">Login to Review</button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Event Type" value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} />
              <div className="flex gap-2">
                {[1,2,3,4,5].map(i => <Star key={i} onClick={() => setForm({...form, rating: i})} className={`cursor-pointer ${i <= form.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}`} />)}
              </div>
              <Textarea placeholder="Your experience..." value={form.comment} onChange={e => setForm({...form, comment: e.target.value})} />
              <button type="submit" disabled={submitting} className="w-full bg-red-800 text-white p-3 rounded-xl">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}