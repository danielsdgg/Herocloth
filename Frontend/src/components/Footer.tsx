import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-10 border-b border-white/10 pb-12">
        
        {/* Brand Section */}
        <div>
          <div className="flex items-center mb-4">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-cyan-500/20">
              <svg
                viewBox="0 0 24 24"
                className="h-6 w-6 fill-slate-900"
                aria-hidden="true"
              >
                <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
              </svg>
            </div>
            <span className="ml-3 text-xl font-semibold tracking-tight text-white">
              Herocloth
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Elevating your style with premium, hand-picked collections.  
            Quality meets elegance.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="hover:text-cyan-400 transition">Home</Link></li>
            <li><Link to="/cart" className="hover:text-cyan-400 transition">Cart</Link></li>
            <li><Link to="/profile" className="hover:text-cyan-400 transition">Profile</Link></li>
            <li><Link to="/register" className="hover:text-cyan-400 transition">Sign Up</Link></li>
          </ul>
        </div>

        {/* Support & Policies */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/faq" className="hover:text-cyan-400 transition">FAQs</Link></li>
            <li><Link to="/returns" className="hover:text-cyan-400 transition">Returns</Link></li>
            <li><Link to="/privacy" className="hover:text-cyan-400 transition">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-cyan-400 transition">Terms & Conditions</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Get in Touch</h3>
          <p className="text-sm text-slate-400">123 Fashion Street, Nairobi, Kenya</p>
          <p className="text-sm text-slate-400 mt-2">Email: support@herocloth.com</p>
          <p className="text-sm text-slate-400">Phone: +254 700 123 456</p>
          <div className="flex space-x-4 mt-4">
            <a href="#" aria-label="Facebook" className="hover:text-cyan-400 transition"><FaFacebookF /></a>
            <a href="#" aria-label="Twitter" className="hover:text-cyan-400 transition"><FaTwitter /></a>
            <a href="#" aria-label="Instagram" className="hover:text-cyan-400 transition"><FaInstagram /></a>
            <a href="#" aria-label="LinkedIn" className="hover:text-cyan-400 transition"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Herocloth. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
