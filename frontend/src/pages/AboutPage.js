import { Award, Heart, Clock, Users, Shield, ThumbsUp } from 'lucide-react';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

function AnimatedSection({ children, className = '', delay = 0 }) {
  const [ref, visible] = useScrollAnimation(0.1);
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const values = [
  { icon: Heart, title: '15+ Years Experience', desc: 'Over a decade of creating memorable celebrations in Latur and surrounding areas.' },
  { icon: Users, title: '1000+ Events Hosted', desc: 'From intimate gatherings to grand weddings, we have done it all successfully.' },
  { icon: Award, title: 'Award-Winning Service', desc: 'Recognized for our exceptional service quality and customer satisfaction.' },
  { icon: Shield, title: 'Trusted by Families', desc: 'Generations of families in Latur trust us with their most special celebrations.' },
  { icon: ThumbsUp, title: '100% Satisfaction', desc: 'We go above and beyond to ensure every detail is perfect for your event.' },
  { icon: Clock, title: 'On-Time Delivery', desc: 'Punctual and reliable service, because your time matters to us.' },
];

export default function AboutPage() {
  return (
    <div data-testid="about-page" className="pt-24">
      {/* Hero */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">About Us</p>
              <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 leading-tight mb-6">
                Crafting Celebrations Since 2010
              </h1>
              <p className="text-stone-500 text-base leading-relaxed mb-6">
                Awadhut Banquets & Catering has been the cornerstone of premium event hosting in Latur, Maharashtra. What started as a passionate venture to provide the finest banquet services has grown into Latur's most trusted name in event management.
              </p>
              <p className="text-stone-500 text-base leading-relaxed mb-6">
                Our journey began with a simple belief: every celebration deserves to be extraordinary. With our state-of-the-art banquet hall, world-class catering, and creative decoration services, we transform ordinary events into unforgettable experiences.
              </p>
              <p className="text-stone-500 text-base leading-relaxed">
                Located in the heart of Latur, we proudly serve families and organizations across Latur, Ausa, Nilanga, Udgir, and surrounding areas.
              </p>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <div className="rounded-2xl overflow-hidden shadow-[0_20px_40px_rgb(0,0,0,0.08)]">
                <img
                  src="https://images.pexels.com/photos/36028895/pexels-photo-36028895.jpeg?w=800"
                  alt="Awadhut Banquets grand hall in Latur"
                  className="w-full h-[400px] object-cover"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: '15+', label: 'Years Experience' },
              { num: '1000+', label: 'Events Hosted' },
              { num: '500+', label: 'Guest Capacity' },
              { num: '98%', label: 'Client Satisfaction' },
            ].map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 100}>
                <div data-testid={`stat-${i}`}>
                  <p className="font-serif text-3xl sm:text-4xl font-bold text-white mb-1">{stat.num}</p>
                  <p className="text-red-200 text-sm">{stat.label}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Why Choose Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mb-4">The Awadhut Advantage</h2>
            <p className="text-stone-500 max-w-lg mx-auto text-base">What makes us the preferred choice for celebrations in Latur.</p>
          </AnimatedSection>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((item, i) => (
              <AnimatedSection key={item.title} delay={i * 100}>
                <div data-testid={`value-card-${i}`} className="p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-5">
                    <item.icon className="w-6 h-6 text-red-800" />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
