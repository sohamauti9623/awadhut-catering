import { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Users, Clock, MessageCircle, Phone } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import api from '../lib/api';

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollAnimation(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/events?active_only=true')
      .then(r => { setEvents(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch { return dateStr; }
  };

  return (
    <div data-testid="events-page" className="pt-24">
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Upcoming Events</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
              Special Events & Celebrations
            </h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-base">
              Join us for exciting events and festivals! Book your spot early to avoid disappointment.
            </p>
          </AnimatedSection>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map(i => <div key={i} className="h-80 rounded-2xl bg-stone-100 animate-pulse" />)}
            </div>
          ) : events.length === 0 ? (
            <AnimatedSection>
              <div className="text-center py-20">
                <CalendarDays className="w-16 h-16 text-stone-300 mx-auto mb-4" />
                <h3 className="font-serif text-xl font-semibold text-stone-700 mb-2">No Upcoming Events</h3>
                <p className="text-stone-400 text-sm max-w-md mx-auto">
                  We're planning something special! Follow us on WhatsApp to stay updated about upcoming events and celebrations.
                </p>
                <a
                  href="https://wa.me/919767286040?text=Hi%2C%20I%20want%20to%20know%20about%20upcoming%20events"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="events-whatsapp-btn"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-medium mt-6 hover:bg-green-600 transition-all duration-300"
                >
                  <MessageCircle className="w-4 h-4" /> Get Notified on WhatsApp
                </a>
              </div>
            </AnimatedSection>
          ) : (
            <div className="space-y-8">
              {events.map((event, i) => (
                <AnimatedSection key={event.id} delay={i * 150}>
                  <div data-testid={`event-card-${i}`} className="rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                      {/* Image */}
                      {event.image && (
                        <div className="lg:col-span-2 h-64 lg:h-auto">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      {/* Details */}
                      <div className={`${event.image ? 'lg:col-span-3' : 'lg:col-span-5'} p-8 lg:p-10 flex flex-col justify-center`}>
                        <div className="flex items-center gap-3 mb-4">
                          <span className="inline-block px-3 py-1 rounded-full bg-red-50 text-red-800 text-xs font-semibold uppercase tracking-wider">
                            Upcoming Event
                          </span>
                          {event.price && (
                            <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                              Rs {event.price.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                        <h2 className="font-serif text-2xl lg:text-3xl font-bold text-stone-900 mb-3">{event.title}</h2>
                        <p className="text-stone-500 text-sm leading-relaxed mb-6">{event.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                          <div className="flex items-center gap-2.5 text-stone-600">
                            <CalendarDays className="w-4 h-4 text-red-800" />
                            <span className="text-sm">{formatDate(event.eventDate)}</span>
                          </div>
                          {event.eventTime && (
                            <div className="flex items-center gap-2.5 text-stone-600">
                              <Clock className="w-4 h-4 text-red-800" />
                              <span className="text-sm">{event.eventTime}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2.5 text-stone-600">
                            <MapPin className="w-4 h-4 text-red-800" />
                            <span className="text-sm">{event.venue}</span>
                          </div>
                          {event.capacity && (
                            <div className="flex items-center gap-2.5 text-stone-600">
                              <Users className="w-4 h-4 text-red-800" />
                              <span className="text-sm">Capacity: {event.capacity} people</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <a
                            href={`https://wa.me/919767286040?text=Hi%2C%20I%20am%20interested%20in%20the%20event%3A%20${encodeURIComponent(event.title)}%20on%20${encodeURIComponent(event.eventDate)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid={`event-whatsapp-${i}`}
                            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-green-600 transition-all duration-300"
                          >
                            <MessageCircle className="w-4 h-4" /> Book via WhatsApp
                          </a>
                          <a
                            href="tel:+919767286040"
                            data-testid={`event-call-${i}`}
                            className="inline-flex items-center gap-2 bg-red-800 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-red-900 transition-all duration-300"
                          >
                            <Phone className="w-4 h-4" /> Call to Reserve
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}

          {/* Contact CTA */}
          <AnimatedSection className="mt-16">
            <div className="text-center p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">Want to Host Your Own Event?</h3>
              <p className="text-stone-500 text-sm mb-4">We organize Holi parties, Diwali celebrations, New Year events, and more. Contact us to plan yours!</p>
              <div className="flex flex-wrap justify-center gap-3">
                <a
                  href="https://wa.me/919767286040?text=Hi%2C%20I%20want%20to%20organize%20a%20special%20event"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-green-600 transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Us
                </a>
                <a
                  href="tel:+917219498226"
                  className="inline-flex items-center gap-2 bg-stone-800 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-stone-900 transition-all"
                >
                  <Phone className="w-4 h-4" /> +91 72194 98226
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
