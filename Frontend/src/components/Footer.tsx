import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-6">
              <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mr-4 shadow-lg">
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-black" aria-hidden="true">
                  <path d="M7 4h10l1 3h3v2h-1l-2 9H6L4 9H3V7h3l1-3zm2.2 5 1.5 7h7.1l1.6-7H9.2zM9 20a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm8 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>
                </svg>
              </div>
              <span className="text-2xl font-extralight tracking-widest">
                HEROCLOTH
              </span>
            </div>
            <p className="text-sm font-light text-gray-400 leading-relaxed">
              Elevating your style with premium, hand-picked collections.<br />
              Quality meets timeless elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-light uppercase tracking-widest text-gray-500 mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-base font-light text-white opacity-60 hover:opacity-100 transition">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-base font-light text-white opacity-60 hover:opacity-100 transition">
                  Cart
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-base font-light text-white opacity-60 hover:opacity-100 transition">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-base font-light text-white opacity-60 hover:opacity-100 transition">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-sm font-light uppercase tracking-widest text-gray-500 mb-5">
              Get in Touch
            </h3>
            <div className="space-y-3 text-base font-light text-white opacity-60">
              <p className="leading-relaxed">
                123 Fashion Avenue<br />
                Nairobi, Kenya
              </p>
              <p>
                <a href="mailto:support@herocloth.com" className="hover:opacity-100 transition">
                  support@herocloth.com
                </a>
              </p>
              <p>
                <a href="tel:+254700123456" className="hover:opacity-100 transition">
                  +254 700 123 456
                </a>
              </p>
            </div>

            <div className="mt-8 flex space-x-6">
              {/* Facebook - Official blue with white "f" */}
              <a 
                href="https://facebook.com/herocloth" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition"
              >
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>

              {/* Instagram - Official gradient with white icon */}
              <a 
                href="https://instagram.com/herocloth" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#405DE6] via-[#833AB4] to-[#E1306C] flex items-center justify-center hover:opacity-90 transition"
              >
                <svg className="w-6 h-6" fill="white" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 3.775.227 2.065 1.91 1.91 5.192.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.227 3.278 1.91 4.988 5.192 5.143 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c3.278-.227 4.988-1.91 5.143-5.192.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.227-3.278-1.91-4.988-5.192-5.143C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
              </a>

              {/* X - Black background with white X */}
              <a 
                href="https://x.com/herocloth" 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Follow us on X"
                className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:opacity-90 transition"
              >
                <svg className="w-6 h-6" fill="black" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="text-xs font-light text-gray-500 tracking-wider">
            © {new Date().getFullYear()} Herocloth. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;