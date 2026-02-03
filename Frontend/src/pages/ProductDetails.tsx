import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useAuth } from "../components/useAuth";
import { useCart } from "../Context/useCart";
import { type Product } from "../types";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
  average_rating: number;
  review_count: number;
}

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<RatingSummary>({
    average_rating: 0,
    review_count: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const { token } = useAuth();
  const { addToCart, isLoading: cartLoading } = useCart();
  const navigate = useNavigate();

  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

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

  // Fetch reviews and rating summary
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
        setRatingSummary(summaryRes.data);
      } catch (error) {
        console.error("Failed to load reviews");
        // Don't show toast for reviews — product is main content
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [product, id, token]);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 1;
      if (product && value <= product.stock && value >= 1) {
        setQuantity(value);
      }
    },
    [product]
  );

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

      // Refresh reviews
      const [reviewsRes, summaryRes] = await Promise.all([
        api.get(`/review/product/${id}/reviews`),
        api.get(`/review/product/${id}/rating-summary`),
      ]);
      setReviews(reviewsRes.data);
      setRatingSummary(summaryRes.data);

      setUserRating(0);
      setUserComment("");
      toast.success("Thank you! Your review has been submitted.");
    } catch (error) {
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setSubmittingReview(false);
    }
  }, [token, userRating, userComment, id]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-600 text-sm font-light">Loading product...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white flex items-center justify-center">
          <p className="text-gray-900 text-lg font-light">
            {error || "Product not found."}
          </p>
        </div>
        <Footer />
      </>
    );
  }

  const images = [product.image1, product.image2, product.image3].filter(
    (img): img is string => !!img
  );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-gray-900">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
          {/* Breadcrumb */}
          <nav className="text-xs font-light text-gray-500 mb-10">
            <a href="/" className="hover:text-gray-900 transition">
              Home
            </a>
            <span className="mx-3">/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>

          {/* Product Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
            {/* Images */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="aspect-square bg-gray-50 rounded-3xl overflow-hidden shadow-2xl"
              >
                <img
                  src={
                    selectedImage ||
                    images[0] ||
                    "https://via.placeholder.com/1000x1000?text=No+Image"
                  }
                  alt={product.name}
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleImageSelect(image)}
                      className={`aspect-square rounded-2xl overflow-hidden border-4 transition-all ${
                        selectedImage === image
                          ? "border-gray-900 shadow-lg"
                          : "border-gray-200 hover:border-gray-400"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`View ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col justify-center"
            >
              <h1 className="text-5xl md:text-6xl font-extralight tracking-widest mb-8">
                {product.name}
              </h1>

              <div className="flex items-center gap-6 mb-10">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-2xl ${
                        star <= Math.round(ratingSummary.average_rating)
                          ? "text-gray-900"
                          : "text-gray-200"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-sm uppercase tracking-widest text-gray-600">
                  {ratingSummary.average_rating.toFixed(1)} ({ratingSummary.review_count} reviews)
                </p>
              </div>

              <p className="text-4xl font-extralight mb-10">
                KSh {product.price.toFixed(2)}
              </p>

              <p className="text-sm font-light text-gray-700 leading-relaxed mb-12 max-w-2xl">
                {product.description || "No description available."}
              </p>

              <p className="text-xs uppercase tracking-widest text-gray-500 mb-12">
                Availability: {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>

              {/* Add to Cart */}
              <div className="flex items-center gap-8 mb-12">
                <div className="flex items-center border border-gray-300 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="w-16 h-16 flex items-center justify-center text-2xl hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    −
                  </button>
                  <input
                    type="text"
                    value={quantity}
                    readOnly
                    className="w-20 text-center text-lg font-light bg-transparent py-4"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="w-16 h-16 flex items-center justify-center text-2xl hover:bg-gray-100 transition disabled:opacity-50"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={cartLoading || product.stock === 0}
                  className="flex-1 py-6 bg-gray-900 text-white text-sm font-medium uppercase tracking-widest rounded-2xl hover:bg-black transition shadow-lg disabled:opacity-60"
                >
                  {cartLoading ? "Adding to cart..." : "Add to Cart"}
                </button>
              </div>

              <button
                onClick={() => navigate(-1)}
                className="text-sm font-light text-gray-600 hover:text-gray-900 transition"
              >
                ← Back to collection
              </button>
            </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-gray-200 pt-20"
          >
            <h2 className="text-4xl font-extralight tracking-widest mb-16 text-center">
              Customer Reviews
            </h2>

            {/* Rating Overview */}
            <div className="text-center mb-20">
              <div className="text-7xl font-extralight mb-4">
                {ratingSummary.average_rating.toFixed(1)}
              </div>
              <div className="flex justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={`text-4xl ${
                      star <= Math.round(ratingSummary.average_rating)
                        ? "text-gray-900"
                        : "text-gray-200"
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-sm uppercase tracking-widest text-gray-600">
                Based on {ratingSummary.review_count} reviews
              </p>
            </div>

            {/* Write Review */}
            {token ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-3xl mx-auto bg-gray-50 rounded-3xl p-12 mb-20 shadow-xl"
              >
                <h3 className="text-xl font-light tracking-widest mb-8">
                  Write Your Review
                </h3>
                <div className="space-y-8">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">
                      Your Rating
                    </p>
                    <div className="flex gap-3 justify-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          className={`text-4xl transition-all ${
                            star <= userRating ? "text-gray-900" : "text-gray-200"
                          } hover:text-gray-900`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      rows={5}
                      placeholder="Share your experience with this product..."
                      value={userComment}
                      onChange={(e) => setUserComment(e.target.value)}
                      className="w-full px-8 py-6 bg-white border border-gray-200 rounded-2xl text-sm font-light focus:border-gray-900 outline-none transition resize-none"
                    />
                  </div>

                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || userRating === 0}
                    className="w-full py-6 bg-gray-900 text-white text-sm font-medium uppercase tracking-widest rounded-2xl hover:bg-black transition shadow-lg disabled:opacity-60"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </motion.div>
            ) : (
              <p className="text-center text-gray-600 text-sm mb-20">
                Please <a href="/login" className="underline hover:text-gray-900">log in</a> to write a review.
              </p>
            )}

            {/* Reviews List */}
            <div className="max-w-4xl mx-auto space-y-12">
              {reviewsLoading ? (
                <p className="text-center text-gray-500 py-20">Loading reviews...</p>
              ) : reviews.length === 0 ? (
                <p className="text-center text-gray-500 py-20 text-lg">
                  No reviews yet. Be the first to review this product!
                </p>
              ) : (
                reviews.map((review) => (
                  <motion.div
                    key={review.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-3xl p-10 shadow-lg"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-full" />
                          <div>
                            <p className="text-lg font-light">
                              {review.user.firstname} {review.user.lastname}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(review.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <span
                              key={s}
                              className={`text-lg ${s <= review.rating ? "text-gray-900" : "text-gray-200"}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm font-light text-gray-700 leading-relaxed">
                      {review.comment}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetails;