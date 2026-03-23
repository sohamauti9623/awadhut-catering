import { useEffect, useState } from 'react';
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

const categories = ['All', 'Wedding', 'Decoration', 'Food', 'Events'];

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [active, setActive] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/gallery')
      .then(r => { setItems(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = active === 'All' ? items : items.filter(i => i.category === active);

  return (
    <div data-testid="gallery-page" className="pt-24">
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-12">
            <p className="text-red-800 text-sm font-medium uppercase tracking-[0.2em] mb-3">Our Portfolio</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-stone-900 mb-4">Event Gallery</h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-base">
              Browse through our collection of beautifully executed events and celebrations.
            </p>
          </AnimatedSection>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map(cat => (
              <button
                key={cat}
                data-testid={`gallery-filter-${cat.toLowerCase()}`}
                onClick={() => setActive(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  active === cat
                    ? 'bg-red-800 text-white shadow-lg'
                    : 'bg-white/60 backdrop-blur-sm text-stone-600 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="rounded-2xl bg-stone-100 animate-pulse" style={{ height: `${200 + Math.random() * 150}px` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-stone-400 text-lg">No items found in this category.</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {filtered.map((item, i) => (
                <AnimatedSection key={item.id} delay={i * 80}>
                  <div
                    data-testid={`gallery-item-${i}`}
                    className="rounded-2xl overflow-hidden group cursor-pointer relative"
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      style={{ minHeight: '200px' }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-5">
                      <div>
                        <h3 className="text-white font-serif font-semibold text-base">{item.title}</h3>
                        <p className="text-stone-300 text-xs mt-1">{item.category}</p>
                      </div>
                    </div>
                  </div>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
