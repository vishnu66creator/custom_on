import { Link } from "@tanstack/react-router";
import { Instagram, Twitter, Facebook, MapPin, Phone, Mail, Clock } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="bg-brand-black px-6 py-20 text-white">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-4">
        <div>
          <span className="mb-6 block font-display text-3xl font-extrabold tracking-tight">
            CUSTOM<span className="text-brand-orange">ON</span>
          </span>
          <p className="mb-8 max-w-sm text-xs leading-relaxed text-white/40">
            Your trusted online destination for premium quality products. We're committed to providing exceptional customer service and an outstanding shopping experience.
          </p>
          <div className="flex gap-3">
            {[
              { icon: Instagram, label: "Instagram" },
              { icon: Twitter, label: "Twitter" },
              { icon: Facebook, label: "Facebook" },
            ].map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid size-10 place-items-center border border-white/10 transition-colors hover:bg-brand-orange"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h5 className="mb-6 text-sm font-bold uppercase tracking-widest">The Catalog</h5>
          <ul className="space-y-4 text-sm text-white/50">
            <li><Link to="/products" className="hover:text-white">T-Shirts</Link></li>
            <li><Link to="/products" className="hover:text-white">Hoodies</Link></li>
            <li><Link to="/products" className="hover:text-white">Polo Shirts</Link></li>
            <li><Link to="/products" className="hover:text-white">Mugs</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-6 text-sm font-bold uppercase tracking-widest">Support</h5>
          <ul className="space-y-4 text-sm text-white/50">
            <li><Link to="/pricing" className="hover:text-white">Pricing</Link></li>
            <li><Link to="/about" className="hover:text-white">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
            <li><Link to="/studio" className="hover:text-white">Design Studio</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="mb-6 text-sm font-bold uppercase tracking-widest">Contact Us</h5>
          <ul className="space-y-4 text-xs text-white/50">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" />
              <span>145/8, 3rd Cross, Venkateshwara Layout, Bengaluru</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-brand-orange" />
              <span>7090637746</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 shrink-0 text-brand-orange" />
              <a href="mailto:Customon.in@gmail.com" className="hover:text-white truncate">Customon.in@gmail.com</a>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-orange" />
              <span>Mon–Sat: 9:00 AM - 8:00 PM</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-20 flex max-w-7xl flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 text-[10px] uppercase tracking-[0.2em] text-white/30 md:flex-row md:items-center">
        <p>&copy; {new Date().getFullYear()} Custom On Studios. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
}
