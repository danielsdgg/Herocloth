import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import createApiInstance from "../utils/api";
import { useCart } from "../Context/useCart";
import { useAuth } from "../components/useAuth";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Payment = () => {
  const { cartItems, clearCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();

  const api = createApiInstance(token);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [deliveryOption, setDeliveryOption] = useState<"nairobi" | "outside" | null>(null);
  const [paymentTiming, setPaymentTiming] = useState<"prepay" | "postpay">("prepay");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "card">("mpesa");

  // Delivery fee always added for Nairobi (as per your final rule)
  const deliveryFee = deliveryOption === "nairobi" ? 200 : 0;
  const total = subtotal + deliveryFee;

  const [mpesaPhone, setMpesaPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  const [address, setAddress] = useState({
    street: "",
    city: "",
    county: "",
    postal_code: "",
    instructions: "",
    contact_phone: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = useCallback(async () => {
    if (!token) {
      toast.error("Please log in to complete checkout");
      navigate("/login");
      return;
    }

    if (!deliveryOption) return toast.error("Please select delivery location");

    if (paymentMethod === "mpesa" && !mpesaPhone.trim()) {
      return toast.error("Please enter M-Pesa phone number");
    }

    if (paymentMethod === "card") {
      if (!cardNumber.trim() || !cardExpiry.trim() || !cardCVV.trim()) {
        return toast.error("Please complete card details");
      }
    }

    if (!address.street.trim() || !address.city.trim() || !address.contact_phone.trim()) {
      return toast.error("Please fill street, city, and contact phone");
    }

    setIsProcessing(true);

    try {
      // 1. Create the order
      const payload = {
        payment_method: paymentMethod,
        payment_timing: paymentTiming,
        delivery_option: deliveryOption,
        mpesa_phone: paymentMethod === "mpesa" ? mpesaPhone : null,
        card_details: paymentMethod === "card" ? { number: cardNumber, expiry: cardExpiry, cvv: cardCVV } : null,
        street: address.street,
        city: address.city,
        county: address.county,
        postal_code: address.postal_code,
        instructions: address.instructions,
        contact_phone: address.contact_phone,
      };

      const orderRes = await api.post("/order/create", payload);
      const orderId = orderRes.data.order_id;

      toast.success("Order created successfully!");

      // 2. Payment / confirmation flow
      if (paymentTiming === "postpay") {
        // Backend already sets 'cod' status — no extra call needed
        toast.success("Order placed! Pay KSh " + total.toFixed(2) + " on delivery.");
      } else {
        // Prepay
        if (paymentMethod === "mpesa") {
          toast.info("Initiating M-Pesa payment...");

          const darajaPayload = {
            phone: mpesaPhone.startsWith("0") ? "254" + mpesaPhone.slice(1) : mpesaPhone,
            amount: Math.round(total),
            order_id: orderId,
          };

          const stkRes = await api.post("/mpesa/stk-push", darajaPayload);

          if (stkRes.data.success) {
            toast.success("M-Pesa PIN prompt sent! Please complete payment on your phone.");
            // In real app: show waiting UI / poll status or wait for webhook
          } else {
            throw new Error(stkRes.data.message || "M-Pesa initiation failed");
          }
        } else {
          // Card (simulation for now)
          toast.info("Processing card payment...");
          await new Promise(r => setTimeout(r, 1500)); // short delay for UX
          toast.success("Card payment successful!");
        }
      }

      clearCart();
      navigate("/orders");
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || err.message || "Checkout failed. Please try again.";
      toast.error(errorMsg);
      console.error("Checkout error:", err);
    } finally {
      setIsProcessing(false);
    }
  }, [
    token, navigate, deliveryOption, paymentTiming, paymentMethod,
    mpesaPhone, cardNumber, cardExpiry, cardCVV, address,
    subtotal, clearCart, api
  ]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white text-gray-900 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-extralight tracking-wider text-center mb-12"
          >
            Secure Checkout
          </motion.h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-10">
              {/* Payment Timing */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-light mb-6">When do you want to pay?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button
                    onClick={() => setPaymentTiming("prepay")}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      paymentTiming === "prepay" ? "border-black bg-black text-white shadow-md" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-lg font-medium">Prepay Now</div>
                    <div className="text-sm mt-1 opacity-80">Pay full amount securely</div>
                  </button>
                  <button
                    onClick={() => setPaymentTiming("postpay")}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${
                      paymentTiming === "postpay" ? "border-black bg-black text-white shadow-md" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <div className="text-lg font-medium">Pay on Delivery</div>
                    <div className="text-sm mt-1 opacity-80">Cash or M-Pesa on arrival</div>
                  </button>
                </div>
              </motion.section>

              {/* Delivery Location */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-light mb-6">Delivery Location</h2>
                <div className="space-y-4">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="radio" name="delivery" checked={deliveryOption === "nairobi"} onChange={() => setDeliveryOption("nairobi")} className="mt-1.5 w-5 h-5 text-black focus:ring-black" />
                    <div>
                      <p className="font-medium">Within Nairobi</p>
                      <p className="text-sm text-gray-600">Delivery fee: KSh 200</p>
                    </div>
                  </label>
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="radio" name="delivery" checked={deliveryOption === "outside"} onChange={() => setDeliveryOption("outside")} className="mt-1.5 w-5 h-5 text-black focus:ring-black" />
                    <div>
                      <p className="font-medium">Outside Nairobi / Elsewhere</p>
                      <p className="text-sm text-gray-600">Delivery fee to be agreed via phone</p>
                    </div>
                  </label>
                </div>
              </motion.section>

              {/* Address Fields */}
              {deliveryOption && (
                <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                  <h2 className="text-2xl font-light mb-6">Delivery Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Street / Estate / Building *</label>
                      <input type="text" value={address.street} onChange={e => setAddress(p => ({ ...p, street: e.target.value }))} className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:border-black outline-none transition" placeholder="e.g. Ngong Road, Apt 3B" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input type="text" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:border-black outline-none transition" placeholder="e.g. Nairobi" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">County *</label>
                      <input type="text" value={address.county} onChange={e => setAddress(p => ({ ...p, county: e.target.value }))} className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:border-black outline-none transition" placeholder="e.g. Nairobi County" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Postal Code</label>
                      <input type="text" value={address.postal_code} onChange={e => setAddress(p => ({ ...p, postal_code: e.target.value }))} className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:border-black outline-none transition" placeholder="e.g. 00100" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Delivery Instructions</label>
                      <textarea value={address.instructions} onChange={e => setAddress(p => ({ ...p, instructions: e.target.value }))} className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:border-black outline-none resize-none h-28" placeholder="e.g. Call before delivery, leave at gate" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Phone *</label>
                      <input type="tel" value={address.contact_phone} onChange={e => setAddress(p => ({ ...p, contact_phone: e.target.value }))} className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:border-black outline-none transition" placeholder="e.g. 0712345678" required />
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Payment Method */}
              <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <h2 className="text-2xl font-light mb-6">Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <button onClick={() => setPaymentMethod("mpesa")} className={`p-8 rounded-2xl border-2 transition-all text-center ${paymentMethod === "mpesa" ? "border-black bg-black text-white shadow-md" : "border-gray-200 hover:border-gray-400"}`}>
                    <div className="text-2xl mb-2">M-Pesa</div>
                    <div className="text-sm opacity-80">Mobile money</div>
                  </button>
                  <button onClick={() => setPaymentMethod("card")} className={`p-8 rounded-2xl border-2 transition-all text-center ${paymentMethod === "card" ? "border-black bg-black text-white shadow-md" : "border-gray-200 hover:border-gray-400"}`}>
                    <div className="text-2xl mb-2">Visa / Mastercard</div>
                    <div className="text-sm opacity-80">Credit / Debit Card</div>
                  </button>
                </div>

                {paymentMethod === "mpesa" ? (
                  <div>
                    <label className="block text-sm font-medium mb-3">M-Pesa Phone Number</label>
                    <input type="tel" placeholder="e.g. 0712345678" value={mpesaPhone} onChange={e => setMpesaPhone(e.target.value)} className="w-full px-6 py-5 border border-gray-300 rounded-xl text-lg focus:border-black outline-none transition" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-3">Card Number</label>
                      <input type="text" placeholder="1234 5678 9012 3456" value={cardNumber} onChange={e => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())} maxLength={19} className="w-full px-6 py-5 border border-gray-300 rounded-xl text-lg focus:border-black outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">Expiry (MM/YY)</label>
                      <input type="text" placeholder="MM/YY" value={cardExpiry} onChange={e => setCardExpiry(e.target.value)} maxLength={5} className="w-full px-6 py-5 border border-gray-300 rounded-xl text-lg focus:border-black outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">CVV</label>
                      <input type="text" placeholder="123" value={cardCVV} onChange={e => setCardCVV(e.target.value.replace(/\D/g, ''))} maxLength={4} className="w-full px-6 py-5 border border-gray-300 rounded-xl text-lg focus:border-black outline-none transition" />
                    </div>
                  </div>
                )}
              </motion.section>

              {/* Pay / Place Order Button */}
              <div className="text-center mt-12">
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !deliveryOption}
                  className={`px-16 sm:px-32 py-6 text-xl font-medium uppercase tracking-widest rounded-3xl shadow-xl transition-all ${
                    isProcessing || !deliveryOption ? "bg-gray-400 text-white cursor-not-allowed" : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  {isProcessing
                    ? "Processing..."
                    : paymentTiming === "prepay"
                    ? `Pay KSh ${total.toFixed(2)}`
                    : `Place Order (Pay KSh ${total.toFixed(2)} on Delivery)`}
                </button>

                {paymentTiming === "postpay" && deliveryOption && (
                  <p className="mt-6 text-sm text-gray-600">
                    You will pay KSh {total.toFixed(2)} upon delivery
                  </p>
                )}
              </div>
            </div>

            {/* Right: Summary */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-gray-50 rounded-2xl p-8 shadow-sm sticky top-24">
                <h3 className="text-2xl font-light mb-8">Order Summary</h3>
                <div className="space-y-5 mb-10">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={item.image1} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium line-clamp-1">{item.name}</p>
                          <p className="text-gray-600 text-xs">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="font-medium">KSh {(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  <div className="flex justify-between text-lg">
                    <span className="font-light">Subtotal</span>
                    <span>KSh {subtotal.toFixed(2)}</span>
                  </div>
                  {deliveryOption === "nairobi" && (
                    <div className="flex justify-between text-lg">
                      <span className="font-light">Delivery (Nairobi)</span>
                      <span>KSh 200</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-bold pt-4 border-t border-gray-300">
                    <span>Total</span>
                    <span>KSh {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Payment;