import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
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

const serviceData = [
  {
    type: 'banquet',
    title: 'Premium Banquet Hall',
    subtitle: 'The Perfect Venue for Your Celebrations',
    image: 'https://images.pexels.com/photos/36028895/pexels-photo-36028895.jpeg?w=800',
    description: 'Our grand banquet hall is designed to host everything from intimate gatherings to lavish weddings. With capacity for over 500 guests, state-of-the-art facilities, and elegant interiors, we provide the ideal setting for your special day.',
    defaultFeatures: ['500+ Guest Capacity', 'Central Air Conditioning', 'Premium Sound System', 'Valet Parking', 'Bridal Room', 'Generator Backup'],
  },
  {
    type: 'catering',
    title: 'Catering Excellence',
    subtitle: 'A Feast for Every Occasion',
    image: 'https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg?w=800',
    description: 'From traditional Maharashtrian thalis to multi-cuisine buffets, our experienced chefs prepare mouth-watering dishes using the freshest ingredients. We offer customizable menus tailored to your preferences and dietary requirements.',
    defaultFeatures: ['Multi-Cuisine Menu', 'Live Cooking Stations', 'Customizable Menus', 'Experienced Chefs', 'Hygiene Certified', 'Minimum 50 Guests'],
  },
  {
    type: 'decoration',
    title: 'Wedding & Event Decoration',
    subtitle: 'Transforming Spaces Into Magic',
    image: 'https://images.unsplash.com/photo-1587271636175-90d58cdad458?w=800',
    description: 'Our expert decoration team brings your vision to life with stunning floral arrangements, themed setups, lighting designs, and creative installations. Every detail is carefully crafted to create a magical ambiance for your event.',
    defaultFeatures: ['Custom Theme Design', 'Floral Arrangements', 'Stage & Mandap Setup', 'Lighting Design', 'Entrance Decoration', 'Photo Booth Setup'],
  },
];

export default function ServicesPage() {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    api.get('/listings').then(r => setListings(r.data)).catch(() => {});
  }, []);

  const getFeatures = (type) => {
    const listing = listings.find(l => l.type === type);
    const service = serviceData.find(s => s.type === type);
    return listing?.features?.length > 0 ? listing.features : service.defaultFeatures;
  };

  const getDescription = (type) => {
    const listing = listings.find(l => l.type === type);
    const service = serviceData.find(s => s.type === type);
    return listing?.description || service.description;
  };

  return (
    <div data-testid="services-page" className="pt-24">
      {/* Hero */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <AnimatedSection>
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Our Services</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
              Complete Event Solutions
            </h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-base leading-relaxed">
              From venue to food to decoration, we handle everything so you can enjoy your celebration stress-free.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services */}
      {serviceData.map((service, i) => (
        <section key={service.type} data-testid={`service-section-${service.type}`} className={`py-16 lg:py-24 ${i % 2 === 1 ? 'bg-stone-100/50' : ''}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${i % 2 === 1 ? 'lg:[direction:rtl]' : ''}`}>
              <AnimatedSection className={i % 2 === 1 ? 'lg:[direction:ltr]' : ''}>
                <div className="rounded-2xl overflow-hidden shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                  <img src={service.image} alt={`${service.title} in Latur`} className="w-full h-[350px] lg:h-[420px] object-cover" />
                </div>
              </AnimatedSection>
              <AnimatedSection delay={200} className={i % 2 === 1 ? 'lg:[direction:ltr]' : ''}>
                <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">{service.subtitle}</p>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-5">{service.title}</h2>
                <p className="text-stone-500 text-base leading-relaxed mb-8">{getDescription(service.type)}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {getFeatures(service.type).map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3 text-red-800" />
                      </span>
                      <span className="text-stone-600 text-sm">{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to="/booking"
                  className="inline-flex items-center gap-2 bg-red-800 text-white px-7 py-3 rounded-full text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900"
                >
                  Enquire Now <ArrowRight className="w-4 h-4" />
                </Link>
              </AnimatedSection>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
