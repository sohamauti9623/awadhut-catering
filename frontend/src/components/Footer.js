import { Link } from 'react-router-dom';
import { MapPin, Phone as PhoneIcon, Mail, Clock } from 'lucide-react';

const MAPS_URL = 'https://www.google.com/maps/place/%E0%A4%85%E0%A4%B5%E0%A4%A7%E0%A5%82%E0%A4%A4+%E0%A4%AE%E0%A4%82%E0%A4%A1%E0%A4%AA+%E0%A4%A1%E0%A5%87%E0%A4%95%E0%A5%8B%E0%A4%B0%E0%A5%87%E0%A4%9F%E0%A4%B0%E0%A5%8D%E0%A4%B8+%E0%A4%85%E0%A4%81%E0%A4%A1+%E0%A4%95%E0%A5%85%E0%A4%9F%E0%A4%B0%E0%A5%8D%E0%A4%B8/@18.401586,76.5427096,17z/data=!3m1!4b1!4m6!3m5!1s0x3bcf81002d9dac75:0x869866a8e76a1816!8m2!3d18.401586!4d76.5427096!16s%2Fg%2F11xt2wm4x_?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDMyMi4wIKXMDSoASAFQAw%3D%3D';

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
                <a
                  href={MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-stone-400 hover:text-amber-400 transition-colors"
                >
                  Near Bus Stand, Latur, Maharashtra 413512
                </a>
              </li>
              <li className="flex items-center gap-3">
                <PhoneIcon className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="tel:+919767286040" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">+91 97672 86040</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <a href="mailto:chaitanyabanquetsmh24@gmail.com" className="text-sm text-stone-400 hover:text-amber-400 transition-colors">chaitanyabanquetsmh24@gmail.com</a>
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
