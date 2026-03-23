import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
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

function PackageCard({ pkg, index }) {
  const isFood = pkg.category === 'food';
  return (
    <AnimatedSection delay={index * 100}>
      <div data-testid={`package-card-${pkg.id}`} className="h-full rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col">
        {pkg.image && (
          <div className="h-48 overflow-hidden">
            <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium uppercase tracking-wider">
              {pkg.category}
            </span>
            {pkg.isFeatured && (
              <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-xs font-medium">Featured</span>
            )}
          </div>
          <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">{pkg.name}</h3>
          <p className="text-3xl font-bold text-red-800 mb-1">
            Rs {pkg.price.toLocaleString('en-IN')}{isFood ? '/plate' : ''}
          </p>
          <div className="flex items-center gap-2 text-stone-500 text-sm mb-4">
            <Users className="w-4 h-4" />
            <span>{isFood ? 'Per person' : `Up to ${pkg.guestCount} guests`}</span>
          </div>

          {pkg.notes && <p className="text-stone-400 text-xs italic mb-4">{pkg.notes}</p>}

          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Includes</p>
            <ul className="space-y-1.5 mb-4">
              {pkg.includes.map((item, j) => (
                <li key={j} className="text-sm text-stone-600 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {pkg.extras.length > 0 && (
              <>
                <p className="text-xs font-medium uppercase tracking-wider text-stone-400 mb-2">Extras Available</p>
                <ul className="space-y-1.5 mb-4">
                  {pkg.extras.map((item, j) => (
                    <li key={j} className="text-sm text-stone-400 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-stone-300 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <Link
            to="/booking"
            data-testid={`book-package-${pkg.id}`}
            className="mt-auto block text-center bg-red-800 text-white px-5 py-3 rounded-xl text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900"
          >
            Book This Package
          </Link>
        </div>
      </div>
    </AnimatedSection>
  );
}

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    api.get('/packages')
      .then(r => { setPackages(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'all' ? packages : packages.filter(p => p.category === activeTab);

  return (
    <div data-testid="packages-page" className="pt-24">
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Our Packages</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-4">
              Choose Your Perfect Package
            </h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-base">
              Explore our carefully curated packages designed for every type of celebration. All packages are customizable to your needs.
            </p>
          </AnimatedSection>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-1 rounded-full">
                <TabsTrigger value="all" data-testid="tab-all" className="rounded-full px-6 data-[state=active]:bg-red-800 data-[state=active]:text-white">All</TabsTrigger>
                <TabsTrigger value="wedding" data-testid="tab-wedding" className="rounded-full px-6 data-[state=active]:bg-red-800 data-[state=active]:text-white">Wedding</TabsTrigger>
                <TabsTrigger value="food" data-testid="tab-food" className="rounded-full px-6 data-[state=active]:bg-red-800 data-[state=active]:text-white">Food</TabsTrigger>
                <TabsTrigger value="corporate" data-testid="tab-corporate" className="rounded-full px-6 data-[state=active]:bg-red-800 data-[state=active]:text-white">Corporate</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-96 rounded-2xl bg-stone-100 animate-pulse" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-stone-400 text-lg">No packages found in this category.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filtered.map((pkg, i) => (
                    <PackageCard key={pkg.id} pkg={pkg} index={i} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <AnimatedSection className="text-center mt-16">
            <div className="p-8 rounded-2xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] max-w-xl mx-auto">
              <h3 className="font-serif text-xl font-semibold text-stone-900 mb-2">Need a Custom Package?</h3>
              <p className="text-stone-500 text-sm mb-5">We can tailor any package to perfectly match your requirements and budget.</p>
              <Link
                to="/contact"
                data-testid="custom-package-btn"
                className="inline-flex items-center gap-2 bg-red-800 text-white px-7 py-3 rounded-full text-sm font-medium btn-liquid transition-all duration-300 hover:bg-red-900"
              >
                Contact Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}
