import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Navigation, Send } from 'lucide-react';
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

const MAPS_URL = 'https://maps.app.goo.gl/RJ86S8f5RvxPYuva6?g_st=atm';

const contactInfo = [
  { icon: MapPin, title: 'Visit Us', detail: 'Near Bus Stand, Latur,\nMaharashtra 413512', color: 'bg-red-50 text-red-800', link: MAPS_URL },
  { icon: Phone, title: 'Call Us', detail: '+91 97672 86040\n+91 72194 98226', color: 'bg-amber-50 text-amber-700', link: 'tel:+919767286040' },
  { icon: Mail, title: 'Email Us', detail: 'chaitanyabanquetsmh24@gmail.com', color: 'bg-blue-50 text-blue-700', link: 'mailto:chaitanyabanquetsmh24@gmail.com' },
  { icon: Clock, title: 'Working Hours', detail: 'Monday - Sunday\n9:00 AM - 10:00 PM', color: 'bg-green-50 text-green-700' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return; }
    setSubmitting(true);
    try {
      await api.post('/contact', form);
      toast.success('Message sent successfully! We will get back to you soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch {
      toast.error('Failed to send message. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div data-testid="contact-page" className="pt-24">
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Get In Touch</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-4">Contact Us</h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-base">
              Have questions or ready to book? We'd love to hear from you. Reach out and our team will respond promptly.
            </p>
          </AnimatedSection>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactInfo.map((info, i) => (
              <AnimatedSection key={info.title} delay={i * 100}>
                <div data-testid={`contact-card-${i}`} className="p-6 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-xl ${info.color} flex items-center justify-center mx-auto mb-4`}>
                    <info.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif font-semibold text-stone-900 text-base mb-2">{info.title}</h3>
                  {info.link ? (
                    <a href={info.link} className="text-stone-500 text-sm whitespace-pre-line hover:text-red-800 transition-colors">{info.detail}</a>
                  ) : (
                    <p className="text-stone-500 text-sm whitespace-pre-line">{info.detail}</p>
                  )}
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Map + Form */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <AnimatedSection>
              <div className="rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full min-h-[400px]">
                <iframe
                  data-testid="google-map-embed"
                  src={`https://www.google.com/maps?output=embed&q=${encodeURIComponent(MAPS_URL)}`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, minHeight: '400px' }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Awadhut Banquets Location - Latur, Maharashtra"
                />
              </div>
              <a
                href={MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="get-directions-btn"
                className="mt-4 inline-flex items-center gap-2 bg-red-800 text-white px-6 py-3 rounded-full text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900"
              >
                <Navigation className="w-4 h-4" /> Get Directions
              </a>
            </AnimatedSection>

            {/* Contact Form */}
            <AnimatedSection delay={200}>
              <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
                <h2 className="font-serif text-2xl font-bold text-stone-900 mb-6">Send Us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Name *</label>
                      <Input data-testid="contact-name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Your name" className="rounded-xl" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-stone-700 mb-1.5 block">Phone</label>
                      <Input data-testid="contact-phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98765 43210" className="rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Email *</label>
                    <Input data-testid="contact-email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} type="email" placeholder="your@email.com" className="rounded-xl" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Subject</label>
                    <Input data-testid="contact-subject" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} placeholder="How can we help?" className="rounded-xl" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700 mb-1.5 block">Message *</label>
                    <Textarea data-testid="contact-message" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Tell us about your event requirements..." rows={5} className="rounded-xl" />
                  </div>
                  <button
                    type="submit"
                    data-testid="contact-submit-btn"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-red-800 text-white py-3.5 rounded-xl text-sm font-semibold btn-liquid transition-all duration-300 hover:bg-red-900 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              </div>
            </AnimatedSection>
          </div>

          {/* Areas Served */}
          <AnimatedSection className="mt-16 text-center">
            <p className="text-stone-400 text-sm">
              Proudly serving Latur, Ausa, Nilanga, Udgir, Ahmedpur, Chakur and surrounding areas in Maharashtra
            </p>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
