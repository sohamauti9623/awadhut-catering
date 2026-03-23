import { useEffect, useState } from 'react';
import { Star, Send } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import { toast } from 'sonner';
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
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 5, comment: '', eventType: '' });

  useEffect(() => {
    api.get('/reviews?approved=true')
      .then(r => { setReviews(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.comment) { toast.error('Please fill name and comment'); return; }
    setSubmitting(true);
    try {
      await api.post('/reviews', form);
      toast.success('Thank you! Your review has been submitted for approval.');
      setForm({ name: '', rating: 5, comment: '', eventType: '' });
    } catch {
      toast.error('Failed to submit review. Please try again.');
    }
    setSubmitting(false);
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <div data-testid="reviews-page" className="pt-24">
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

          {/* Submit Review */}
          <AnimatedSection>
            <div className="max-w-xl mx-auto">
              <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2 text-center">Share Your Experience</h2>
                <p className="text-stone-500 text-sm text-center mb-8">Your feedback helps us improve and serve you better.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Your Name</label>
                    <Input
                      data-testid="review-name-input"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Enter your name"
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Event Type</label>
                    <Input
                      data-testid="review-event-input"
                      value={form.eventType}
                      onChange={e => setForm({...form, eventType: e.target.value})}
                      placeholder="e.g., Wedding, Birthday, Corporate"
                      className="rounded-xl"
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
                          onClick={() => setForm({...form, rating: i})}
                          className="transition-transform hover:scale-110"
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
                      placeholder="Tell us about your experience..."
                      rows={4}
                      className="rounded-xl"
                    />
                  </div>
                  <button
                    type="submit"
                    data-testid="submit-review-btn"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-red-800 text-white py-3 rounded-xl text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
