import { useState, useCallback } from "react";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane } from "react-icons/fa";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const { token, firstname } = useAuth();
  const [formData, setFormData] = useState<ContactFormData>({
    name: firstname || "",
    email: "",
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
      setFormData({ name: firstname || "", email: "", subject: "", message: "" });
      toast.success("Message sent! We'll respond shortly.");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { msg: string } } }).response?.data?.msg ||
        "Failed to send message.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [formData, token, firstname, validateForm]);

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">

        {/* Hero / Header Section */}
        <section className="relative py-20 lg:py-28 bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 tracking-tight mb-6">
                Get in Touch
              </h1>
              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
                Have a question, suggestion, or just want to say hello? We'd love to hear from you.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 lg:py-24">
          <div className="max-w-5xl mx-auto px-6">
            <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
              {/* Form – Left side (larger column) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7 }}
                className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-12"
              >
                {error && (
                  <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-900 placeholder-gray-400"
                        placeholder="Your name"
                        disabled={isLoading}
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-900 placeholder-gray-400"
                        placeholder="your@email.com"
                        disabled={isLoading}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <input
                      id="subject"
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-900 placeholder-gray-400"
                      placeholder="How can we help?"
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full px-5 py-3.5 border border-gray-300 rounded-xl focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition text-gray-900 placeholder-gray-400 resize-none"
                      placeholder="Your message here..."
                      disabled={isLoading}
                      required
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition disabled:opacity-60 flex items-center justify-center gap-3 shadow-sm hover:shadow-md"
                  >
                    <FaPaperPlane className={isLoading ? "animate-pulse" : ""} />
                    {isLoading ? "Sending..." : "Send Message"}
                  </motion.button>
                </form>
              </motion.div>

              {/* Contact Info – Right side */}
              <motion.aside
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="lg:col-span-2 space-y-8"
              >
                {[
                  {
                    icon: <FaEnvelope className="text-2xl text-indigo-600" />,
                    title: "Email Us",
                    content: (
                      <a
                        href="mailto:support@herocloth.com"
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        support@herocloth.com
                      </a>
                    ),
                    desc: "We usually reply within 24 hours",
                  },
                  {
                    icon: <FaPhone className="text-2xl text-indigo-600" />,
                    title: "Call Us",
                    content: (
                      <a
                        href="tel:+254707319080"
                        className="text-indigo-600 hover:underline font-medium"
                      >
                        +254 707 319 080
                      </a>
                    ),
                    desc: "Mon–Fri, 9AM–6PM EAT",
                  },
                  {
                    icon: <FaMapMarkerAlt className="text-2xl text-indigo-600" />,
                    title: "Visit Us",
                    content: (
                      <span className="font-medium">
                        123 Fashion Avenue<br />
                        Nairobi, Kenya
                      </span>
                    ),
                    desc: "By appointment only",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-5">
                      <div className="mt-1">{item.icon}</div>
                      <div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">{item.title}</h3>
                        <div className="text-gray-700 mb-2">{item.content}</div>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.aside>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default Contact;