import { useEffect, useState } from 'react';
import { Calendar, Send } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
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

export default function BookingPage() {
  const [packages, setPackages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', eventType: '', eventDate: '', guests: '', packageId: '', message: '',
  });

  useEffect(() => {
    api.get('/packages').then(r => setPackages(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.eventType || !form.eventDate || !form.guests) {
      toast.error('Please fill all required fields');
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/bookings', { ...form, guests: parseInt(form.guests) });
      toast.success('Booking request submitted successfully! We will contact you shortly.');
      setForm({ name: '', email: '', phone: '', eventType: '', eventDate: '', guests: '', packageId: '', message: '' });
    } catch {
      toast.error('Failed to submit booking. Please try again.');
    }
    setSubmitting(false);
  };

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div data-testid="booking-page" className="pt-24">
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Book Your Event</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-4">Make a Reservation</h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-base">
              Fill in the details below and our team will get back to you within 24 hours to confirm your booking.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="max-w-2xl mx-auto">
              <div className="p-8 sm:p-10 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Full Name *</label>
                      <Input data-testid="booking-name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your full name" className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Phone Number *</label>
                      <Input data-testid="booking-phone" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+91 98765 43210" className="rounded-xl" />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Email</label>
                    <Input data-testid="booking-email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="your@email.com" type="email" className="rounded-xl" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Event Type *</label>
                      <Select value={form.eventType} onValueChange={v => update('eventType', v)}>
                        <SelectTrigger data-testid="booking-event-type" className="rounded-xl">
                          <SelectValue placeholder="Select event type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wedding">Wedding</SelectItem>
                          <SelectItem value="reception">Reception</SelectItem>
                          <SelectItem value="engagement">Engagement</SelectItem>
                          <SelectItem value="birthday">Birthday Party</SelectItem>
                          <SelectItem value="corporate">Corporate Event</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Event Date *</label>
                      <div className="relative">
                        <Input data-testid="booking-date" type="date" value={form.eventDate} onChange={e => update('eventDate', e.target.value)} className="rounded-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Number of Guests *</label>
                      <Input data-testid="booking-guests" type="number" value={form.guests} onChange={e => update('guests', e.target.value)} placeholder="Approx. guests" className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Select Package</label>
                      <Select value={form.packageId} onValueChange={v => update('packageId', v)}>
                        <SelectTrigger data-testid="booking-package" className="rounded-xl">
                          <SelectValue placeholder="Choose a package (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {packages.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name} - Rs {p.price.toLocaleString('en-IN')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Additional Message</label>
                    <Textarea data-testid="booking-message" value={form.message} onChange={e => update('message', e.target.value)} placeholder="Any special requirements..." rows={4} className="rounded-xl" />
                  </div>

                  <button
                    type="submit"
                    data-testid="submit-booking-btn"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-red-800 text-white py-4 rounded-xl text-sm font-semibold btn-liquid transition-all duration-300 hover:bg-red-900 disabled:opacity-50"
                  >
                    <Calendar className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Submit Booking Request'}
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
