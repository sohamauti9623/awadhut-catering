import { Link } from 'react-router-dom';
import { MapPin, Phone as PhoneIcon, Mail, Clock } from 'lucide-react';

export default function Footer() {
  return (
    <footer data-testid="main-footer" className="bg-stone-900 text-stone-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-800 flex items-center justify-center">
                <span className="text-white font-serif font-bold text-xl">A</span>
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-lg">Awadhut</h3>
                <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em]">Banquets & Catering</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-stone-400 mt-4">
              Premium banquet hall and catering services in Latur, Maharashtra. Making your special moments unforgettable since 2010.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-semibold text-white text-base mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { name: 'About Us', path: '/about' },
                { name: 'Services', path: '/services' },
                { name: 'Packages', path: '/packages' },
                { name: 'Gallery', path: '/gallery' },
                { name: 'Book Event', path: '/booking' },
                { name: 'Contact', path: '/contact' },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm text-stone-400 hover:text-amber-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif font-semibold text-white text-base mb-4">Our Services</h4>
            <ul className="space-y-2.5">
              {['Banquet Hall', 'Catering Services', 'Wedding Decoration', 'Corporate Events', 'Birthday Parties'].map((s) => (
                <li key={s} className="text-sm text-stone-400">{s}</li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-white text-base mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-stone-400">Near Bus Stand, Latur, Maharashtra 413512</span>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">+91 98765 43210</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="mailto:info@awadhutbanquets.com" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">info@awadhutbanquets.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-sm text-stone-400">Mon - Sun: 9:00 AM - 10:00 PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-stone-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-stone-500">
            &copy; {new Date().getFullYear()} Awadhut Banquets & Catering. All rights reserved.
          </p>
          <p className="text-xs text-stone-500">
            Serving Latur, Ausa, Nilanga, Udgir & surrounding areas
          </p>
        </div>
      </div>
    </footer>
  );
}
