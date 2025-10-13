import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";

interface ContactFormData {
  name: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const { token, username } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    name: username || "",
    subject: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate form inputs
  const validateForm = useCallback(() => {
    if (!formData.name.trim()) return "Name is required.";
    if (!formData.subject.trim()) return "Subject is required.";
    if (!formData.message.trim()) return "Message is required.";
    return null;
  }, [formData]);

  // Handle form submission
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
      setFormData({ name: username || "", subject: "", message: "" });
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
      <div className="min-h-screen bg-slate-950 text-slate-100">
        {/* Ambient gradient glows */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-20 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-12 text-center"
          >
            <div className="relative inline-block">
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500">
                Contact Us
              </h1>
              <motion.div
                className="absolute -bottom-2 left-10 h-1 w-32 rounded bg-gradient-to-r from-cyan-400 to-indigo-500 opacity-50"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
            </div>
            <p className="text-lg text-slate-300 mt-3 max-w-2xl mx-auto">
              We're here to help! Reach out with any questions or feedback.
            </p>
          </motion.header>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="alert"
              aria-live="assertive"
              className="mb-8 rounded-lg bg-rose-500/10 px-6 py-4 text-sm text-rose-300 text-center shadow-md shadow-black/20"
            >
              {error}
            </motion.div>
          )}

          {/* Contact Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contact Form */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10 p-8"
            >
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="text-sm text-slate-300">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    placeholder="Your name"
                    aria-label="Name"
                    disabled={isLoading}
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="text-sm text-slate-300">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200"
                    placeholder="Subject of your message"
                    aria-label="Subject"
                    disabled={isLoading}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="message" className="text-sm text-slate-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 w-full rounded-lg bg-slate-800/70 border border-white/10 px-4 py-3 text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/40 focus:border-transparent transition-all duration-200 resize-y"
                    placeholder="Your message"
                    aria-label="Message"
                    rows={5}
                    disabled={isLoading}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group w-full relative inline-flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 px-6 py-3 font-medium text-white shadow-lg shadow-cyan-500/20 transition-all duration-200 hover:from-cyan-400 hover:via-sky-400 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  aria-label="Send message"
                >
                  <span className="absolute inset-0 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-30 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-indigo-500" />
                  {isLoading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </motion.section>

            {/* Contact Information */}
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="rounded-2xl bg-slate-900/70 backdrop-blur-lg shadow-xl shadow-black/30 border border-white/10 p-8"
            >
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 mb-6">
                Get in Touch
              </h2>
              <div className="space-y-6">
                <div>
                  <p className="text-sm text-slate-400">Email</p>
                  <a
                    href="mailto:support@herocloth.com"
                    className="text-lg text-cyan-300 hover:text-cyan-200 transition underline-offset-4 hover:underline"
                  >
                    support@herocloth.com
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Phone</p>
                  <a
                    href="tel:+1234567890"
                    className="text-lg text-cyan-300 hover:text-cyan-200 transition underline-offset-4 hover:underline"
                  >
                    +1 (234) 567-890
                  </a>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Address</p>
                  <p className="text-lg text-slate-100">
                    123 Fashion Street, Style City, SC 12345
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Follow Us</p>
                  <div className="flex gap-4 mt-2">
                    <a
                      href="https://twitter.com/herocloth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:text-cyan-200 transition"
                      aria-label="Follow us on Twitter"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </a>
                    <a
                      href="https://facebook.com/herocloth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:text-cyan-200 transition"
                      aria-label="Follow us on Facebook"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                      </svg>
                    </a>
                    <a
                      href="https://instagram.com/herocloth"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-300 hover:text-cyan-200 transition"
                      aria-label="Follow us on Instagram"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.332.014 7.052.072 3.775.227 2.065 1.91 1.91 5.192.014 8.332 0 8.741 0 12c0 3.259.014 3.668.072 4.948.227 3.278 1.91 4.988 5.192 5.143 1.28.058 1.689.072 4.948.072s3.668-.014 4.948-.072c3.278-.227 4.988-1.91 5.143-5.192.058-1.28.072-1.689.072-4.948s-.014-3.668-.072-4.948c-.227-3.278-1.91-4.988-5.192-5.143C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998zm6.406-11.845a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;