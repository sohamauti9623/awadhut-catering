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
    api.get('/reviews?approved=true')
      .then(r => { setReviews(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.token) {
      api.get('/reviews/my', { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => setMyReviews(r.data))
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { setAuthOpen(true); return; }
    if (!form.comment) { toast.error('Please write your review'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', form, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Thank you! Your review has been submitted for approval.');
      setForm({ rating: 5, comment: '', eventType: '' });
      // Refresh my reviews
      const r = await api.get('/reviews/my', { headers: { Authorization: `Bearer ${user.token}` } });
      setMyReviews(r.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit review.');
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div data-testid="reviews-page" className="pt-24">
      <UserAuthModal open={authOpen} onClose={() => setAuthOpen(false)} />

      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Client Reviews</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-4">What Our Clients Say</h1>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className="w-5 h-5 text-amber-500 fill-amber-500" />
                ))}
              </div>
              <span className="text-2xl font-bold text-stone-900">{avgRating}</span>
              <span className="text-stone-400 text-sm">({reviews.length} reviews)</span>
            </div>
          </AnimatedSection>

          {/* Reviews Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => <div key={i} className="h-48 rounded-2xl bg-stone-100 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {reviews.map((review, i) => (
                <AnimatedSection key={review.id} delay={i * 100}>
                  <div data-testid={`review-card-${i}`} className="p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full flex flex-col">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'}`} />
                      ))}
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed mb-5 flex-1 italic">"{review.comment}"</p>
                    <div className="border-t border-stone-100 pt-4">
                      <p className="font-semibold text-stone-900 text-sm">{review.name}</p>
                      {review.eventType && <p className="text-stone-400 text-xs mt-0.5">{review.eventType} Event</p>}
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}

          {/* Submit Review Section */}
          <AnimatedSection>
            <div className="max-w-xl mx-auto">
              <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2 text-center">Share Your Experience</h2>
                <p className="text-stone-500 text-sm text-center mb-6">Your feedback helps us improve and serve you better.</p>

                {/* User Auth Status */}
                {user ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-50 border border-green-100 mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <User className="w-4 h-4 text-green-700" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800">{user.name}</p>
                        <p className="text-xs text-green-600">{user.email}</p>
                      </div>
                    </div>
                    <button
                      data-testid="user-logout-btn"
                      onClick={logout}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-red-600 transition-colors"
                    >
                      <LogOut className="w-3 h-3" /> Logout
                    </button>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 mb-6 text-center">
                    <p className="text-sm text-amber-800 mb-2">Please login or create an account to submit a review</p>
                    <button
                      data-testid="login-to-review-btn"
                      onClick={() => setAuthOpen(true)}
                      className="inline-flex items-center gap-2 bg-red-800 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-red-900"
                    >
                      <LogIn className="w-4 h-4" /> Login / Sign Up
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Event Type</label>
                    <Input
                      data-testid="review-event-input"
                      value={form.eventType}
                      onChange={e => setForm({...form, eventType: e.target.value})}
                      placeholder="e.g., Wedding, Birthday, Corporate"
                      className="rounded-xl"
                      disabled={!user}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button
                          key={i}
                          type="button"
                          data-testid={`rating-star-${i}`}
                          onClick={() => user && setForm({...form, rating: i})}
                          className={`transition-transform hover:scale-110 ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                          disabled={!user}
                        >
                          <Star className={`w-7 h-7 ${i <= form.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Your Review</label>
                    <Textarea
                      data-testid="review-comment-input"
                      value={form.comment}
                      onChange={e => setForm({...form, comment: e.target.value})}
                      placeholder={user ? "Tell us about your experience..." : "Login to write a review..."}
                      rows={4}
                      className="rounded-xl"
                      disabled={!user}
                    />
                  </div>
                  <button
                    type="submit"
                    data-testid="submit-review-btn"
                    disabled={submitting || !user}
                    className="w-full flex items-center justify-center gap-2 bg-red-800 text-white py-3 rounded-xl text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    {!user ? 'Login Required to Submit' : submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>

                {/* My Reviews */}
                {user && myReviews.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-stone-200">
                    <h3 className="font-serif text-lg font-semibold text-stone-900 mb-4">Your Reviews</h3>
                    <div className="space-y-3">
                      {myReviews.map(r => (
                        <div key={r.id} className="p-4 rounded-xl bg-stone-50 border border-stone-100">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-200'}`} />
                              ))}
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${r.approved ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                              {r.approved ? 'Approved' : 'Pending Approval'}
                            </span>
                          </div>
                          <p className="text-sm text-stone-600">{r.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
