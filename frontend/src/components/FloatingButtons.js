import { Phone, MessageCircle } from 'lucide-react';

export default function FloatingButtons() {
  return (
    <div data-testid="floating-buttons" className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* WhatsApp Button */}
      <a
        href="https://wa.me/919767286040?text=Hi%2C%20I%20would%20like%20to%20inquire%20about%20your%20banquet%20and%20catering%20services."
        target="_blank"
        rel="noopener noreferrer"
        data-testid="whatsapp-button"
        className="w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 animate-pulse-soft"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </a>

      {/* Call Now Button */}
      <a
        href="tel:+919767286040"
        data-testid="call-now-button"
        className="w-14 h-14 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-lg hover:bg-amber-600 transition-all duration-300 hover:scale-110"
        title="Call Now"
      >
        <Phone className="w-6 h-6" />
      </a>
    </div>
  );
}
