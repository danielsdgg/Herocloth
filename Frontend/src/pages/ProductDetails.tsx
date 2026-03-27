import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import { useCart } from "../Context/useCart";
import { type Product } from "../types";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { FaStar, FaHeart } from "react-icons/fa";

interface Review {
  id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string | null;
  };
}

interface RatingSummary {
  average_rating: number | null;
  review_count: number;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    average_rating: null,
    review_count: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const { token } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();
  const navigate = useNavigate();

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const api = createApiInstance(token);
        const response = await api.get(`/product/${id}`);
        setProduct(response.data);
        setSelectedImage(response.data.image1 || null);
      } catch (error) {
        const message =
          (error as AxiosError<{ msg: string }>).response?.data?.msg ||
          "Failed to fetch product details.";
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, token]);

  // Fetch reviews & rating summary
  useEffect(() => {
    if (!product) return;

    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const api = createApiInstance(token);
        const [reviewsRes, summaryRes] = await Promise.all([
          api.get(`/review/product/${id}/reviews`),
          api.get(`/review/product/${id}/rating-summary`),
        ]);

        setReviews(reviewsRes.data);
        setRatingSummary({
          average_rating: summaryRes.data.average_rating ?? 0,
          review_count: summaryRes.data.review_count ?? 0,
        });
      } catch {
        setRatingSummary({ average_rating: 0, review_count: 0 });
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product, id, token]);

  const handleQuantityChange = useCallback((delta: number) => {
    if (!product) return;
    setQuantity((prev) => Math.max(1, Math.min(product.stock || 0, prev + delta)));
  }, [product]);

  const handleImageSelect = useCallback((image: string) => {
    setSelectedImage(image);
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      await addToCart(product.id, quantity);
      toast.success(`${product.name} added to cart!`);
      navigate("/cart");
    } catch {
      toast.error("Failed to add item to cart.");
    }
  }, [product, quantity, addToCart, navigate]);

  const handleSubmitReview = useCallback(async () => {
    if (!token) {
      toast.error("Please log in to submit a review.");
      return;
    }
    if (userRating === 0) {
      toast.error("Please select a rating.");
      return;
    }
    if (!userComment.trim()) {
      toast.error("Please write a comment.");
      return;
    }

    setSubmittingReview(true);
    try {
      const api = createApiInstance(token);
      await api.post("/review/", {
        product_id: Number(id),
        rating: userRating,
        comment: userComment.trim(),
      });

      const [reviewsRes, summaryRes] = await Promise.all([
        api.get(`/review/product/${id}/reviews`),
        api.get(`/review/product/${id}/rating-summary`),
      ]);

      setReviews(reviewsRes.data);
      setRatingSummary({
        average_rating: summaryRes.data.average_rating ?? 0,
        review_count: summaryRes.data.review_count ?? 0,
      });

      setUserRating(0);
      setUserComment("");
      toast.success("Thank you! Your review has been submitted.");
    } catch {
      toast.error("Failed to submit review.");
    } finally {
      setSubmittingReview(false);
    }
  }, [token, userRating, userComment, id]);

  // FIXED: Properly ensure safeAverage is always a number
  const safeAverage = typeof ratingSummary.average_rating === 'number' 
    ? ratingSummary.average_rating 
    : 0;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24">
          <div className="text-gray-600 text-lg animate-pulse">Loading your piece...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 px-6">
          <div className="text-center max-w-md">
            <p className="text-2xl text-gray-800 mb-6">{error || "Product not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-10 py-4 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition shadow-md"
            >
              Return to Shop
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const images = [product.image1, product.image2, product.image3].filter((img): img is string => !!img);

  return (
    <>
      <Navbar />

      <main className="bg-gray-50 min-h-screen pt-20 lg:pt-28">
        <div className="max-w-7xl mx-auto px-5 lg:px-12">
          {/* Breadcrumb */}
          <div className="text-sm text-gray-500 mb-8 flex items-center gap-2">
            <Link to="/" className="hover:text-teal-600 transition">Home</Link>
            <span className="text-gray-400">›</span>
            <span className="text-gray-900 font-medium truncate max-w-[300px]">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Gallery */}
            <div className="lg:col-span-3 space-y-6 order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="aspect-[4/5] lg:aspect-[5/6] bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 relative group"
              >
                <img
                  src={selectedImage || images[0] || "https://via.placeholder.com/1200x1500?text=Product"}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>

              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleImageSelect(img)}
                      className={`flex-shrink-0 w-24 h-24 lg:w-28 lg:h-28 rounded-2xl overflow-hidden border-2 snap-center transition-all ${
                        selectedImage === img
                          ? "border-teal-500 shadow-lg scale-105"
                          : "border-transparent hover:border-teal-300"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:col-span-2 space-y-8 order-1 lg:order-2">
              <div>
                <h1 className="text-3xl lg:text-4xl font-light text-gray-900 leading-tight mb-3">
                  {product.name}
                </h1>
                <p className="text-2xl font-medium text-teal-600">
                  KSh {product.price.toFixed(0)}
                </p>
              </div>

              {/* Rating Section */}
              <div className="flex items-center gap-5">
                <div className="relative w-20 h-20">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                      className="text-gray-200"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                    <circle
                      className="text-teal-500"
                      strokeWidth="8"
                      strokeDasharray={264}
                      strokeDashoffset={264 - (264 * safeAverage) / 5}
                      strokeLinecap="round"
                      fill="transparent"
                      r="42"
                      cx="50"
                      cy="50"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-2xl font-medium text-teal-600">
                    {safeAverage.toFixed(1)}
                  </div>
                </div>

                <div>
                  <div className="flex text-2xl">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <FaStar
                        key={s}
                        className={s <= Math.round(safeAverage) ? "text-amber-500" : "text-gray-200"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {ratingSummary.review_count} review{ratingSummary.review_count !== 1 && "s"}
                  </p>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed text-base lg:text-lg">
                {product.description || "A timeless piece crafted with precision and care — perfect for any wardrobe."}
              </p>

              <div className="flex gap-4 items-center text-sm">
                <span className={`px-5 py-2 rounded-full font-medium ${product.stock > 0 ? "bg-teal-100 text-teal-800" : "bg-rose-100 text-rose-800"}`}>
                  {product.stock > 0 ? "In Stock" : "Sold Out"}
                </span>
                <span className="text-gray-500">Ships in 1–3 business days</span>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="flex items-center gap-6">
                <div className="flex border border-gray-200 rounded-full overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="w-12 h-12 text-xl hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 transition"
                  >
                    −
                  </button>
                  <span className="w-16 text-center text-xl font-medium py-3">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 0) || product.stock === 0}
                    className="w-12 h-12 text-xl hover:bg-gray-50 active:bg-gray-100 disabled:opacity-40 transition"
                  >
                    +
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock === 0}
                  className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-full hover:brightness-110 transition shadow-lg disabled:opacity-50"
                >
                  {cartLoading ? "Adding..." : `Add to Cart — KSh ${(product.price * quantity).toFixed(0)}`}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <section className="mt-24 lg:mt-32 pt-16 lg:pt-24 bg-gray-300 mb-4">
            <div className="max-w-7xl mx-auto px-5 lg:px-12">
              <h2 className="text-3xl lg:text-4xl font-light text-gray-900 text-center mb-16 tracking-tight">
                Real Voices, Real Style
              </h2>

              <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
                {/* LEFT: Rating + Submit Form */}
                <div className="space-y-12 mb-2">
                  <div className="flex justify-center">
                    <div className="relative w-44 h-44">
                      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="48" fill="none" stroke="#d4af37" strokeWidth="5" />
                      </svg>

                      <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="ratingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#14b8a6" />
                            <stop offset="100%" stopColor="#0ea5e9" />
                          </linearGradient>
                        </defs>
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="url(#ratingGrad)"
                          strokeWidth="10"
                          strokeDasharray={283}
                          strokeDashoffset={283 - (283 * safeAverage) / 5}
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-light text-teal-700">
                          {safeAverage.toFixed(1)}
                        </span>
                        <span className="text-sm text-teal-600 mt-1 font-medium">
                          {ratingSummary.review_count} reviews
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Review Form */}
                  {token && (
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      className="bg-white p-8 lg:p-10 rounded-2xl shadow-md border border-teal-100"
                    >
                      <h3 className="text-2xl font-light text-teal-800 mb-8 text-center">
                        Your Opinion Matters
                      </h3>

                      <div className="space-y-8">
                        <div className="text-center">
                          <p className="text-base text-gray-600 mb-5">Rate this product</p>
                          <div className="flex justify-center gap-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <motion.button
                                key={s}
                                whileHover={{ scale: 1.2 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setUserRating(s)}
                                className={`text-5xl transition-colors duration-200 ${
                                  s <= userRating ? "text-amber-500" : "text-gray-200 hover:text-amber-400"
                                }`}
                              >
                                ★
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          rows={5}
                          value={userComment}
                          onChange={(e) => setUserComment(e.target.value)}
                          placeholder="What did you think? We value your honest feedback."
                          className="w-full border border-teal-200 rounded-xl p-5 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none resize-none text-gray-800 placeholder-gray-400"
                        />

                        <button
                          onClick={handleSubmitReview}
                          disabled={submittingReview || userRating === 0}
                          className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-xl hover:brightness-110 transition shadow-md disabled:opacity-50"
                        >
                          {submittingReview ? "Posting..." : "Submit Review"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {!token && (
                    <p className="text-center text-gray-600 py-8">
                      <Link to="/login" className="text-teal-600 hover:underline font-medium">
                        Log in
                      </Link>{" "}
                      to share your review.
                    </p>
                  )}
                </div>

                {/* RIGHT: Reviews List */}
                <div className="space-y-10">
                  {reviewsLoading ? (
                    <div className="text-center text-gray-500 py-12">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center text-gray-600 py-12 bg-white/60 rounded-2xl border border-teal-50 shadow-sm">
                      No reviews yet. Be the first to share your experience!
                    </div>
                  ) : (
                    reviews.map((r, i) => (
                      <motion.div
                        key={r.id}
                        initial={{ opacity: 0, x: 30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-2xl shadow-md border border-teal-50/70 p-6 lg:p-8 hover:shadow-xl hover:border-teal-200 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
                            {r.user.firstname[0]}
                            {r.user.lastname[0]}
                          </div>

                          <div className="flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
                              <p className="font-medium text-gray-900">
                                {r.user.firstname} {r.user.lastname}
                              </p>
                              <span className="text-sm text-gray-500">
                                {new Date(r.created_at).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>

                            <div className="flex gap-1 mb-4">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <FaStar
                                  key={s}
                                  className={`text-xl drop-shadow-sm ${
                                    s <= r.rating ? "text-amber-500" : "text-gray-200"
                                  }`}
                                />
                              ))}
                            </div>

                            <p className="text-gray-700 leading-relaxed">{r.comment}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-xl shadow-2xl border border-gray-200 rounded-3xl px-6 py-4 flex items-center gap-6 z-50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleQuantityChange(-1)}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xl hover:bg-gray-100 active:bg-gray-200 transition"
            >
              −
            </button>
            <span className="font-semibold text-xl w-8 text-center">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              className="w-10 h-10 rounded-full border flex items-center justify-center text-xl hover:bg-gray-100 active:bg-gray-200 transition"
            >
              +
            </button>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleAddToCart}
            disabled={cartLoading || product.stock === 0}
            className="flex-1 px-10 py-3.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-2xl hover:brightness-110 transition shadow-lg disabled:opacity-50 min-w-[220px]"
          >
            {cartLoading ? "Adding..." : `Add to Cart — KSh ${(product.price * quantity).toFixed(0)}`}
          </motion.button>

          <button className="p-3 text-rose-500 hover:text-rose-600 active:scale-110 transition">
            <FaHeart size={24} />
          </button>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetails;