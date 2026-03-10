import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

interface ContactFormData {
  name: string;
  email: string;  // New: added email
  subject: string;
  message: string;
}

const Contact = () => {
  const { token, username } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    name: username || "",
    email: "",  // New: initial empty
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = useCallback(() => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!/\S+@\S+\.\S+/.test(formData.email)) return "Invalid email format.";
    if (!formData.subject.trim()) return "Subject is required.";
    if (!formData.message.trim()) return "Message is required.";
    return null;
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      toast.error(validationError);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const api = createApiInstance(token);
      await api.post("/contact", formData, { withCredentials: true });
      setFormData({ name: username || "", email: "", subject: "", message: "" });
      toast.success("Message sent successfully! We'll get back to you soon.");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
        "Failed to send message.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, token, username, validateForm]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-gray-900">
        {/* Elegant Hero Section - Black & White Luxury */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="relative py-10 overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/5" />
          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
            <motion.h1
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-5xl md:text-7xl font-extralight tracking-widest text-gray-900 mb-6"
            >
              Contact Us
            </motion.h1>
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="h-px w-32 bg-gray-400 mx-auto mb-8"
            />
            <motion.p
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-lg md:text-xl font-light text-gray-600 max-w-2xl mx-auto"
            >
              We’re here to assist you with any inquiries or feedback.
            </motion.p>
          </div>
        </motion.section>

        {/* Error */}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-red-600 mb-12 text-sm max-w-7xl mx-auto px-6"
          >
            {error}
          </motion.p>
        )}

        {/* Two Columns Layout */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
            {/* Left: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="bg-gray-50 rounded-3xl shadow-xl p-10 lg:p-12"
            >
              <h2 className="text-xl font-light tracking-wide mb-10 text-gray-800">
                Send us a message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div>
                  <label htmlFor="name" className="block text-xs font-light text-gray-600 uppercase tracking-widest mb-3">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none transition text-base"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>  
                  <label htmlFor="email" className="block text-xs font-light text-gray-600 uppercase tracking-widest mb-3">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none transition text-base"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-light text-gray-600 uppercase tracking-widest mb-3">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none transition text-base"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-light text-gray-600 uppercase tracking-widest mb-3">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-6 py-4 bg-white border border-gray-300 rounded-2xl text-gray-900 focus:border-gray-900 focus:ring-4 focus:ring-gray-900/10 outline-none resize-none transition text-base h-48"
                    disabled={isLoading}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-5 bg-gray-900 text-white text-sm font-medium uppercase tracking-widest rounded-2xl hover:bg-black transition disabled:opacity-60"
                >
                  {isLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </motion.div>

            {/* Right: Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col justify-center space-y-12"
            >
              <div>
                <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-3">Email</p>
                <a href="mailto:support@herocloth.com" className="text-lg font-light hover:opacity-70 transition block text-gray-900">
                  support@herocloth.com
                </a>
              </div>

              <div>
                <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-3">Phone</p>
                <a href="tel:+1234567890" className="text-lg font-light hover:opacity-70 transition block text-gray-900">
                  +1 (234) 567-890
                </a>
              </div>

              <div>
                <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-3">Address</p>
                <p className="text-lg font-light leading-relaxed text-gray-800">
                  123 Fashion Avenue<br />
                  Style District<br />
                  New York, NY 10001
                </p>
              </div>

              <div>
                <p className="text-xs font-light text-gray-600 uppercase tracking-widest mb-6">Follow Us</p>
                <div className="flex space-x-8">
                  {/* Facebook */}
                  <a 
                    href="https://facebook.com/herocloth" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition"
                    aria-label="Follow us on Facebook"
                  >
                    <svg className="w-10 h-10" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  </a>

                  {/* Instagram */}
                  <a 
                    href="https://instagram.com/herocloth" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition"
                    aria-label="Follow us on Instagram"
                  >
                    <svg className="w-10 h-10" fill="url(#instagram-gradient)" viewBox="0 0 24 24">
                      <defs>
                        <radialGradient id="instagram-gradient" r="150%" cx="30%" cy="107%">
                          <stop stopColor="#f58529" offset="0" />
                          <stop stopColor="#dd2a7b" offset="0.5" />
                          <stop stopColor="#515bd4" offset="1" />
                        </radialGradient>
                      </defs>
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 3.775.227 2.065 1.91 1.91 5.192.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.227 3.278 1.91 4.988 5.192 5.143 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c3.278-.227 4.988-1.91 5.143-5.192.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.227-3.278-1.91-4.988-5.192-5.143C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                    </svg>
                  </a>

                  {/* X (Twitter) */}
                  <a 
                    href="https://x.com/herocloth" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:opacity-70 transition"
                    aria-label="Follow us on X"
                  >
                    <svg className="w-10 h-10" fill="#000000" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Contact;