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

  const safeAverage = typeof ratingSummary.average_rating === 'number' 
    ? ratingSummary.average_rating 
    : 0;

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-24">
          <div className="text-zinc-500 text-lg animate-pulse">Loading your piece...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center pt-24 px-6">
          <div className="text-center max-w-md">
            <p className="text-2xl text-zinc-800 mb-6">{error || "Product not found"}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-10 py-4 bg-zinc-900 text-white rounded-2xl hover:bg-zinc-800 transition"
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

      <main className="bg-zinc-50 min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-12">
          {/* Breadcrumb */}
          <div className="text-sm text-zinc-500 py-8 flex items-center gap-2">
            <Link to="/" className="hover:text-teal-600 transition">Home</Link>
            <span className="text-zinc-400">›</span>
            <span className="text-zinc-900 font-medium truncate">{product.name}</span>
          </div>

          {/* Main Content - Mobile-first stacked layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Image Gallery */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-xl border border-zinc-100 relative group"
              >
                <img
                  src={selectedImage || images[0] || "https://via.placeholder.com/1200x1500?text=Product"}
                  alt={product.name}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                />
              </motion.div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
                  {images.map((img, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleImageSelect(img)}
                      className={`flex-shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 snap-center transition-all ${
                        selectedImage === img
                          ? "border-teal-500 shadow-md"
                          : "border-transparent hover:border-zinc-300"
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">
              <div>
                <h1 className="text-4xl md:text-5xl font-light text-zinc-900 leading-tight tracking-tight">
                  {product.name}
                </h1>
                <p className="text-3xl font-medium text-teal-600 mt-3">
                  KSh {product.price.toFixed(0)}
                </p>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-6">
                <div className="flex text-3xl text-amber-500">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <FaStar
                      key={s}
                      className={s <= Math.round(safeAverage) ? "text-amber-500" : "text-zinc-200"}
                    />
                  ))}
                </div>
                <div>
                  <div className="text-2xl font-medium text-teal-600">{safeAverage.toFixed(1)}</div>
                  <p className="text-sm text-zinc-500">
                    {ratingSummary.review_count} review{ratingSummary.review_count !== 1 && "s"}
                  </p>
                </div>
              </div>

              <p className="text-zinc-600 leading-relaxed text-[17px]">
                {product.description || "A timeless piece crafted with precision and care — perfect for any wardrobe."}
              </p>

              <div className="flex flex-wrap gap-3">
                <span className={`px-6 py-2 rounded-full text-sm font-medium ${
                  product.stock > 0 
                    ? "bg-teal-100 text-teal-800" 
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {product.stock > 0 ? "In Stock" : "Sold Out"}
                </span>
                <span className="px-6 py-2 text-sm text-zinc-500">Ships in 1–3 business days</span>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <div className="flex border border-zinc-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="w-14 h-14 text-2xl hover:bg-zinc-100 disabled:opacity-40 transition"
                  >
                    −
                  </button>
                  <span className="w-16 flex items-center justify-center text-xl font-medium">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= (product.stock || 0) || product.stock === 0}
                    className="w-14 h-14 text-2xl hover:bg-zinc-100 disabled:opacity-40 transition"
                  >
                    +
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock === 0}
                  className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-2xl text-lg shadow-lg disabled:opacity-50 transition"
                >
                  {cartLoading ? "Adding to cart..." : `Add to Cart — KSh ${(product.price * quantity).toFixed(0)}`}
                </motion.button>
              </div>

              <button className="flex items-center gap-2 text-zinc-500 hover:text-rose-500 transition text-sm">
                <FaHeart size={20} /> Add to Wishlist
              </button>
            </div>
          </div>

          {/* Reviews Section */}
          <section className="mt-24 pb-24">
            <h2 className="text-4xl font-light text-center text-zinc-900 mb-12 tracking-tight">
              Real Voices, Real Style
            </h2>

            <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
              {/* Submit Review */}
              <div className="space-y-10">
                <div className="bg-white p-8 md:p-10 rounded-3xl shadow-sm border border-zinc-100">
                  <h3 className="text-2xl font-light text-center mb-8">Share Your Experience</h3>

                  <div className="text-center mb-8">
                    <p className="text-zinc-600 mb-4">How would you rate this product?</p>
                    <div className="flex justify-center gap-2 text-5xl">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <motion.button
                          key={s}
                          whileHover={{ scale: 1.15 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setUserRating(s)}
                          className={`transition-colors ${s <= userRating ? "text-amber-500" : "text-zinc-200 hover:text-amber-400"}`}
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
                    className="w-full border border-zinc-200 rounded-2xl p-5 focus:border-teal-500 focus:ring-1 focus:ring-teal-200 outline-none resize-none text-zinc-800 placeholder-zinc-400"
                  />

                  {token ? (
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || userRating === 0 || !userComment.trim()}
                      className="mt-6 w-full py-4 bg-zinc-900 hover:bg-black text-white font-medium rounded-2xl transition disabled:opacity-50"
                    >
                      {submittingReview ? "Posting..." : "Submit Review"}
                    </button>
                  ) : (
                    <p className="text-center text-zinc-500 mt-6">
                      <Link to="/login" className="text-teal-600 hover:underline">Log in</Link> to share your review.
                    </p>
                  )}
                </div>
              </div>

              {/* Reviews List */}
              <div className="space-y-8">
                {reviewsLoading ? (
                  <div className="text-center py-12 text-zinc-500">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                  <div className="bg-white rounded-3xl p-10 text-center text-zinc-600 border border-zinc-100">
                    No reviews yet. Be the first to share your experience!
                  </div>
                ) : (
                  reviews.map((r, i) => (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                      className="bg-white rounded-3xl p-7 md:p-9 shadow-sm border border-zinc-100"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-bold shrink-0">
                          {r.user.firstname[0]}{r.user.lastname[0]}
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-1">
                            <p className="font-medium text-zinc-900">
                              {r.user.firstname} {r.user.lastname}
                            </p>
                            <span className="text-xs text-zinc-500">
                              {new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                            </span>
                          </div>

                          <div className="flex gap-1 my-3 text-amber-500">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <FaStar key={s} className={s <= r.rating ? "text-amber-500" : "text-zinc-200"} />
                            ))}
                          </div>

                          <p className="text-zinc-700 leading-relaxed">{r.comment}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Mobile Floating Add to Cart Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 py-4 px-5 z-50 lg:hidden shadow-2xl">
          <div className="max-w-7xl mx-auto flex items-center gap-4">
            <div className="flex border border-zinc-200 rounded-2xl overflow-hidden">
              <button onClick={() => handleQuantityChange(-1)} className="w-11 h-11 text-2xl hover:bg-zinc-100">-</button>
              <span className="w-12 flex items-center justify-center font-medium">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} className="w-11 h-11 text-2xl hover:bg-zinc-100">+</button>
            </div>

            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock === 0}
              className="flex-1 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-medium rounded-2xl shadow-lg disabled:opacity-50"
            >
              {cartLoading ? "Adding..." : `Add to Cart — KSh ${(product.price * quantity).toFixed(0)}`}
            </motion.button>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetails;