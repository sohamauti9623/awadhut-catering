import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, UtensilsCrossed, Sparkles, Star, ChevronRight, Award, Calendar, Heart } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import api from '../lib/api';

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollAnimation(0.1);
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const services = [
  {
    icon: Users,
    title: 'Banquet Hall',
    desc: 'Spacious, elegant hall for up to 500 guests with premium amenities and ambiance.',
    link: '/services',
    glow: 'rgba(16,185,129,0.15)',
  },
  {
    icon: UtensilsCrossed,
    title: 'Catering Services',
    desc: 'Multi-cuisine menus crafted by expert chefs with live cooking stations.',
    link: '/services',
    glow: 'rgba(212,175,55,0.15)',
  },
  {
    icon: Sparkles,
    title: 'Event Decoration',
    desc: 'Stunning floral and themed decorations to make your event magical.',
    link: '/services',
    glow: 'rgba(16,185,129,0.15)',
  },
];

const stats = [
  { icon: Calendar, value: '15+', label: 'Years of Excellence' },
  { icon: Heart, value: '1000+', label: 'Events Celebrated' },
  { icon: Users, value: '500', label: 'Guest Capacity' },
  { icon: Award, value: '50+', label: 'Expert Staff' },
];

export default function HomePage() {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api.get('/packages?featured=true').then(r => setFeaturedPackages(r.data.slice(0, 3))).catch(() => {});
    api.get('/gallery').then(r => setGalleryItems(r.data.slice(0, 6))).catch(() => {});
    api.get('/reviews?approved=true').then(r => setReviews(r.data.slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">

      {/* Hero Section */}
      <section data-testid="hero-section" className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1763553113391-a659bee36e06?w=1600&q=80"
            alt="Premium wedding banquet hall in Latur with elegant decorations"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
          {/* Emerald glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-surface-900/80 via-surface-900/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-900 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl animate-fade-in-up">
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-gold-500/30 bg-gold-500/10 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse-soft" />
              <span className="text-gold-400 font-sans text-xs font-medium uppercase tracking-[0.25em]">Premium Events in Latur</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Where Every{' '}
              <span className="block">Celebration Becomes</span>
              <span className="text-gold-shimmer italic">Unforgettable</span>
            </h1>

            <p className="text-emerald-100/70 text-base sm:text-lg font-sans font-light leading-relaxed mb-10 max-w-xl">
              Latur's finest banquet hall and catering services. From grand weddings to intimate gatherings, we craft experiences that last a lifetime.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/booking"
                data-testid="hero-book-event-btn"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-surface-900 px-8 py-4 rounded-full text-sm font-semibold btn-liquid hover:shadow-[0_20px_40px_rgba(212,175,55,0.4)] transition-shadow duration-300"
              >
                Book Your Event <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/packages"
                data-testid="hero-view-packages-btn"
                className="inline-flex items-center gap-2 bg-emerald-900/30 backdrop-blur-sm text-emerald-200 px-8 py-4 rounded-full text-sm font-medium border border-emerald-700/40 transition-all duration-300 hover:bg-emerald-900/50 hover:border-emerald-600/60"
              >
                View Packages <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Floating stats bar */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-emerald-800/20 rounded-t-2xl overflow-hidden border border-emerald-800/30 border-b-0">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3 px-6 py-4 bg-surface-900/80 backdrop-blur-xl">
                  <stat.icon className="w-5 h-5 text-gold-500 flex-shrink-0" />
                  <div>
                    <p className="font-serif text-xl font-bold text-gold-400">{stat.value}</p>
                    <p className="text-emerald-400/60 text-xs">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section data-testid="services-preview" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-gold-500 text-xs font-medium uppercase tracking-[0.3em] mb-3">What We Offer</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-50 mb-4">Our Premium Services</h2>
            <div className="gold-divider my-4" />
            <p className="text-emerald-400/60 max-w-lg mx-auto text-base mt-4">Everything you need to create the perfect event, all under one roof.</p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} delay={i * 150}>
                <Link
                  to={service.link}
                  data-testid={`service-card-${i}`}
                  className="block p-8 rounded-2xl card-dark hover:-translate-y-2 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-emerald-900/60 border border-emerald-700/30 flex items-center justify-center mb-6 group-hover:border-emerald-500/50 group-hover:bg-emerald-900/80 transition-all duration-300">
                    <service.icon className="w-7 h-7 text-emerald-400 group-hover:text-gold-400 transition-colors duration-300" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-emerald-50 mb-3 group-hover:text-gold-400 transition-colors duration-300">{service.title}</h3>
                  <p className="text-emerald-400/60 text-sm leading-relaxed">{service.desc}</p>
                  <div className="mt-6 flex items-center gap-2 text-emerald-500 text-xs font-medium group-hover:text-gold-400 transition-colors duration-300">
                    Learn More <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      {featuredPackages.length > 0 && (
        <section data-testid="featured-packages" className="py-20 lg:py-28 relative">
          {/* Section bg glow */}
          <div className="absolute inset-0 bg-emerald-950/30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection className="text-center mb-16">
              <p className="text-gold-500 text-xs font-medium uppercase tracking-[0.3em] mb-3">Popular Choices</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-50 mb-4">Featured Packages</h2>
              <div className="gold-divider my-4" />
              <p className="text-emerald-400/60 max-w-lg mx-auto text-base mt-4">Handpicked packages designed to make your event truly special.</p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredPackages.map((pkg, i) => (
                <AnimatedSection key={pkg.id} delay={i * 150}>
                  <div data-testid={`featured-package-${i}`} className="rounded-2xl card-dark overflow-hidden hover:-translate-y-2 transition-all duration-300 group">
                    {pkg.image && (
                      <div className="h-48 overflow-hidden relative">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-900/80 to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-gold-500/10 text-gold-400 text-xs font-medium uppercase tracking-wider mb-3 border border-gold-500/20">
                        {pkg.category}
                      </span>
                      <h3 className="font-serif text-lg font-semibold text-emerald-50 mb-2">{pkg.name}</h3>
                      <p className="text-2xl font-bold text-gold-400 mb-1">
                        {pkg.category === 'food' ? `₹${pkg.price.toLocaleString()}/plate` : `₹${pkg.price.toLocaleString()}`}
                      </p>
                      <p className="text-emerald-400/50 text-sm mb-4">{pkg.category === 'food' ? 'Per person' : `Up to ${pkg.guestCount} guests`}</p>
                      <ul className="space-y-2 mb-5">
                        {pkg.includes.slice(0, 4).map((item, j) => (
                          <li key={j} className="text-sm text-emerald-300/70 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold-500/70 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/booking"
                        className="block text-center bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-surface-900 px-5 py-2.5 rounded-xl text-sm font-semibold btn-liquid transition-shadow duration-300 hover:shadow-[0_8px_24px_rgba(212,175,55,0.35)]"
                      >
                        Book This Package
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="text-center mt-12">
              <Link
                to="/packages"
                data-testid="view-all-packages-btn"
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium text-sm hover:gap-3 transition-all duration-300"
              >
                View All Packages <ArrowRight className="w-4 h-4" />
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Gallery Preview */}
      {galleryItems.length > 0 && (
        <section data-testid="gallery-preview" className="py-20 lg:py-28">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <p className="text-gold-500 text-xs font-medium uppercase tracking-[0.3em] mb-3">Our Work</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-50 mb-4">Event Gallery</h2>
              <div className="gold-divider my-4" />
            </AnimatedSection>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {galleryItems.map((item, i) => (
                <AnimatedSection key={item.id} delay={i * 100}>
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] group relative border border-emerald-800/30">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-surface-900/0 group-hover:bg-surface-900/50 transition-all duration-300 flex items-end p-4">
                      <p className="text-white text-sm font-medium font-serif opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">{item.title}</p>
                    </div>
                    <div className="absolute inset-0 border border-emerald-500/0 group-hover:border-emerald-500/30 rounded-2xl transition-colors duration-300 pointer-events-none" />
                  </div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="text-center mt-12">
              <Link
                to="/gallery"
                data-testid="view-gallery-btn"
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium text-sm hover:gap-3 transition-all duration-300"
              >
                View Full Gallery <ArrowRight className="w-4 h-4" />
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section data-testid="testimonials-section" className="py-20 lg:py-28 relative">
          <div className="absolute inset-0 bg-emerald-950/30 pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <AnimatedSection className="text-center mb-16">
              <p className="text-gold-500 text-xs font-medium uppercase tracking-[0.3em] mb-3">Testimonials</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-emerald-50 mb-4">What Our Clients Say</h2>
              <div className="gold-divider my-4" />
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, i) => (
                <AnimatedSection key={review.id} delay={i * 150}>
                  <div data-testid={`testimonial-${i}`} className="p-8 rounded-2xl card-dark relative overflow-hidden">
                    {/* Subtle quote mark */}
                    <span className="absolute top-4 right-6 text-6xl font-serif text-emerald-800/30 leading-none select-none">"</span>
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-gold-400 fill-gold-400' : 'text-emerald-800'}`} />
                      ))}
                    </div>
                    <p className="text-emerald-300/70 text-sm leading-relaxed mb-6 italic">"{review.comment}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-900/60 border border-emerald-700/40 flex items-center justify-center flex-shrink-0">
                        <span className="text-emerald-400 text-sm font-serif font-bold">{review.name?.[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-emerald-100 text-sm">{review.name}</p>
                        <p className="text-emerald-600 text-xs">{review.eventType} Event</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section data-testid="cta-section" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="relative rounded-3xl overflow-hidden border border-emerald-800/30">
              <img
                src="https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=1600&q=80"
                alt="Beautiful wedding decoration"
                className="w-full h-[440px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-900/95 via-surface-900/75 to-surface-900/40" />
              {/* Emerald glow */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent" />
              <div className="absolute inset-0 flex items-center px-8 sm:px-16">
                <div className="max-w-xl">
                  <p className="text-gold-500 text-xs font-medium uppercase tracking-[0.3em] mb-4">Plan Your Event</p>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                    Ready to Plan Your<br />
                    <span className="text-gold-shimmer italic">Dream Event?</span>
                  </h2>
                  <p className="text-emerald-200/60 text-base mb-8 leading-relaxed">
                    Let us make your special day truly magical. Get in touch for a personalized quote and experience Latur's finest.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      to="/booking"
                      data-testid="cta-book-btn"
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-500 text-surface-900 px-8 py-4 rounded-full text-sm font-semibold btn-liquid hover:shadow-[0_20px_40px_rgba(212,175,55,0.4)] transition-shadow duration-300"
                    >
                      Book Now <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="tel:+919767286040"
                      className="inline-flex items-center gap-2 bg-emerald-900/40 backdrop-blur-sm text-emerald-200 px-8 py-4 rounded-full text-sm font-medium border border-emerald-700/40 transition-all duration-300 hover:bg-emerald-900/60 hover:border-emerald-600/60"
                    >
                      Call Us
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
