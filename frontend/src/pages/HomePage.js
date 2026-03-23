import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, UtensilsCrossed, Sparkles, Star, ChevronRight } from 'lucide-react';
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
  { icon: Users, title: 'Banquet Hall', desc: 'Spacious, elegant hall for up to 500 guests with premium amenities and ambiance.', link: '/services' },
  { icon: UtensilsCrossed, title: 'Catering Services', desc: 'Multi-cuisine menus crafted by expert chefs with live cooking stations.', link: '/services' },
  { icon: Sparkles, title: 'Event Decoration', desc: 'Stunning floral and themed decorations to make your event magical.', link: '/services' },
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
      <section data-testid="hero-section" className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1763553113391-a659bee36e06?w=1600&q=80"
            alt="Premium wedding banquet hall in Latur with elegant decorations"
            className="w-full h-full object-cover"
          />
          <div className="hero-overlay absolute inset-0" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="max-w-2xl animate-fade-in-up">
            <p className="text-amber-400 font-sans text-sm font-medium uppercase tracking-[0.25em] mb-4">
              Premium Events in Latur
            </p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Where Every Celebration Becomes
              <span className="text-amber-400"> Unforgettable</span>
            </h1>
            <p className="text-stone-200 text-base sm:text-lg font-sans font-light leading-relaxed mb-8 max-w-xl">
              Latur's finest banquet hall and catering services. From grand weddings to intimate gatherings, we craft experiences that last a lifetime.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/booking"
                data-testid="hero-book-event-btn"
                className="inline-flex items-center gap-2 bg-red-800 text-white px-8 py-4 rounded-full text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900 hover:shadow-xl"
              >
                Book Your Event <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/packages"
                data-testid="hero-view-packages-btn"
                className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-8 py-4 rounded-full text-sm font-medium border border-white/30 transition-all duration-300 hover:bg-white/25"
              >
                View Packages <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section data-testid="services-preview" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">What We Offer</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">Our Premium Services</h2>
            <p className="text-stone-500 max-w-lg mx-auto text-base">Everything you need to create the perfect event, all under one roof.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, i) => (
              <AnimatedSection key={service.title} delay={i * 150}>
                <Link
                  to={service.link}
                  data-testid={`service-card-${i}`}
                  className="block p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-6 group-hover:bg-red-100 transition-colors">
                    <service.icon className="w-7 h-7 text-red-800" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-stone-900 mb-3">{service.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{service.desc}</p>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Packages */}
      {featuredPackages.length > 0 && (
        <section data-testid="featured-packages" className="py-20 lg:py-28 bg-stone-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Popular Choices</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">Featured Packages</h2>
              <p className="text-stone-500 max-w-lg mx-auto text-base">Handpicked packages designed to make your event truly special.</p>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredPackages.map((pkg, i) => (
                <AnimatedSection key={pkg.id} delay={i * 150}>
                  <div data-testid={`featured-package-${i}`} className="rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                    {pkg.image && (
                      <div className="h-48 overflow-hidden">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                      </div>
                    )}
                    <div className="p-6">
                      <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium uppercase tracking-wider mb-3">
                        {pkg.category}
                      </span>
                      <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2">{pkg.name}</h3>
                      <p className="text-2xl font-bold text-red-800 mb-3">
                        {pkg.category === 'food' ? `Rs ${pkg.price.toLocaleString()}/plate` : `Rs ${pkg.price.toLocaleString()}`}
                      </p>
                      <p className="text-stone-500 text-sm mb-4">{pkg.category === 'food' ? 'Per person' : `Up to ${pkg.guestCount} guests`}</p>
                      <ul className="space-y-1.5 mb-5">
                        {pkg.includes.slice(0, 4).map((item, j) => (
                          <li key={j} className="text-sm text-stone-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <Link
                        to="/booking"
                        className="block text-center bg-red-800 text-white px-5 py-2.5 rounded-xl text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900"
                      >
                        Book This Package
                      </Link>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection className="text-center mt-12">
              <Link to="/packages" data-testid="view-all-packages-btn" className="inline-flex items-center gap-2 text-red-800 font-medium text-sm hover:gap-3 transition-all duration-300">
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
              <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Our Work</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">Event Gallery</h2>
            </AnimatedSection>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryItems.map((item, i) => (
                <AnimatedSection key={item.id} delay={i * 100}>
                  <div className="rounded-2xl overflow-hidden aspect-[4/3] group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </AnimatedSection>
              ))}
            </div>
            <AnimatedSection className="text-center mt-12">
              <Link to="/gallery" data-testid="view-gallery-btn" className="inline-flex items-center gap-2 text-red-800 font-medium text-sm hover:gap-3 transition-all duration-300">
                View Full Gallery <ArrowRight className="w-4 h-4" />
              </Link>
            </AnimatedSection>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section data-testid="testimonials-section" className="py-20 lg:py-28 bg-stone-100/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection className="text-center mb-16">
              <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Testimonials</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">What Our Clients Say</h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review, i) => (
                <AnimatedSection key={review.id} delay={i * 150}>
                  <div data-testid={`testimonial-${i}`} className="p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < review.rating ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                      ))}
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed mb-5 italic">"{review.comment}"</p>
                    <div>
                      <p className="font-semibold text-stone-900 text-sm">{review.name}</p>
                      <p className="text-stone-400 text-xs">{review.eventType} Event</p>
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
            <div className="relative rounded-3xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=1600&q=80"
                alt="Beautiful wedding decoration"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-red-900/80 to-red-800/60" />
              <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                <div>
                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
                    Ready to Plan Your Dream Event?
                  </h2>
                  <p className="text-stone-200 text-base mb-8 max-w-lg mx-auto">
                    Let us make your special day truly magical. Get in touch for a personalized quote.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <Link
                      to="/booking"
                      data-testid="cta-book-btn"
                      className="inline-flex items-center gap-2 bg-white text-red-800 px-8 py-4 rounded-full text-sm font-semibold transition-all duration-300 hover:bg-stone-100 hover:shadow-xl"
                    >
                      Book Now <ArrowRight className="w-4 h-4" />
                    </Link>
                    <a
                      href="tel:+919767286040"
                      className="inline-flex items-center gap-2 bg-transparent text-white px-8 py-4 rounded-full text-sm font-medium border border-white/50 transition-all duration-300 hover:bg-white/10"
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
