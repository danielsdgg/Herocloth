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

      if (paymentTiming === "postpay") {
        toast.success(`Order placed! Pay KSh ${total.toFixed(0)} on delivery.`);
      } else {
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
          } else {
            throw new Error(stkRes.data.message || "M-Pesa initiation failed");
          }
        } else {
          toast.info("Processing card payment...");
          await new Promise(r => setTimeout(r, 1500));
          toast.success("Card payment successful!");
        }
      }

      clearCart();
      navigate("/orders");
    } catch (err: any) {
      const errorMsg = err.response?.data?.msg || err.message || "Checkout failed. Please try again.";
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  }, [
    token, navigate, deliveryOption, paymentTiming, paymentMethod,
    mpesaPhone, cardNumber, cardExpiry, cardCVV, address,
    total, clearCart, api
  ]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-zinc-50 pb-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8 pt-18 sm:pt-24">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl font-light tracking-tight text-center text-zinc-900 mb-4"
          >
            Secure Checkout
          </motion.h1>
          <p className="text-center text-zinc-600 mb-12">Complete your order securely</p>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
            {/* Main Form Section */}
            <div className="lg:col-span-7 space-y-10">
              {/* Payment Timing */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-sm p-7 sm:p-10"
              >
                <h2 className="text-2xl font-light mb-6">When do you want to pay?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <button
                    onClick={() => setPaymentTiming("prepay")}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      paymentTiming === "prepay"
                        ? "border-teal-600 bg-teal-50 shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="font-medium text-lg">Prepay Now</div>
                    <div className="text-sm text-zinc-600 mt-1">Pay full amount securely</div>
                  </button>

                  <button
                    onClick={() => setPaymentTiming("postpay")}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      paymentTiming === "postpay"
                        ? "border-teal-600 bg-teal-50 shadow-sm"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="font-medium text-lg">Pay on Delivery</div>
                    <div className="text-sm text-zinc-600 mt-1">Cash or M-Pesa on arrival</div>
                  </button>
                </div>
              </motion.section>

              {/* Delivery Location */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-3xl shadow-sm p-7 sm:p-10"
              >
                <h2 className="text-2xl font-light mb-6">Delivery Location</h2>
                <div className="space-y-4">
                  <label className="flex items-start gap-4 cursor-pointer p-4 rounded-2xl hover:bg-zinc-50 transition">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryOption === "nairobi"}
                      onChange={() => setDeliveryOption("nairobi")}
                      className="mt-1.5 w-5 h-5 accent-teal-600"
                    />
                    <div>
                      <p className="font-medium">Within Nairobi</p>
                      <p className="text-sm text-zinc-600">Delivery fee: KSh 200</p>
                    </div>
                  </label>

                  <label className="flex items-start gap-4 cursor-pointer p-4 rounded-2xl hover:bg-zinc-50 transition">
                    <input
                      type="radio"
                      name="delivery"
                      checked={deliveryOption === "outside"}
                      onChange={() => setDeliveryOption("outside")}
                      className="mt-1.5 w-5 h-5 accent-teal-600"
                    />
                    <div>
                      <p className="font-medium">Outside Nairobi</p>
                      <p className="text-sm text-zinc-600">Delivery fee to be agreed via phone</p>
                    </div>
                  </label>
                </div>
              </motion.section>

              {/* Delivery Address */}
              {deliveryOption && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-3xl shadow-sm p-7 sm:p-10"
                >
                  <h2 className="text-2xl font-light mb-6">Delivery Address</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Street / Estate / Building *</label>
                      <input
                        type="text"
                        value={address.street}
                        onChange={(e) => setAddress(p => ({ ...p, street: e.target.value }))}
                        className="w-full px-5 py-4 border border-zinc-300 rounded-2xl focus:border-teal-600 outline-none transition"
                        placeholder="e.g. Ngong Road, Apt 3B"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">City *</label>
                      <input
                        type="text"
                        value={address.city}
                        onChange={(e) => setAddress(p => ({ ...p, city: e.target.value }))}
                        className="w-full px-5 py-4 border border-zinc-300 rounded-2xl focus:border-teal-600 outline-none transition"
                        placeholder="e.g. Nairobi"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">County</label>
                      <input
                        type="text"
                        value={address.county}
                        onChange={(e) => setAddress(p => ({ ...p, county: e.target.value }))}
                        className="w-full px-5 py-4 border border-zinc-300 rounded-2xl focus:border-teal-600 outline-none transition"
                        placeholder="e.g. Nairobi County"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Postal Code</label>
                      <input
                        type="text"
                        value={address.postal_code}
                        onChange={(e) => setAddress(p => ({ ...p, postal_code: e.target.value }))}
                        className="w-full px-5 py-4 border border-zinc-300 rounded-2xl focus:border-teal-600 outline-none transition"
                        placeholder="e.g. 00100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2">Delivery Instructions</label>
                      <textarea
                        value={address.instructions}
                        onChange={(e) => setAddress(p => ({ ...p, instructions: e.target.value }))}
                        className="w-full px-5 py-4 border border-zinc-300 rounded-2xl focus:border-teal-600 outline-none resize-none h-28"
                        placeholder="e.g. Call before delivery, leave at gate"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Contact Phone *</label>
                      <input
                        type="tel"
                        value={address.contact_phone}
                        onChange={(e) => setAddress(p => ({ ...p, contact_phone: e.target.value }))}
                        className="w-full px-5 py-4 border border-zinc-300 rounded-2xl focus:border-teal-600 outline-none transition"
                        placeholder="e.g. 0712345678"
                      />
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Payment Method */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-sm p-7 sm:p-10"
              >
                <h2 className="text-2xl font-light mb-6">Payment Method</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
                  <button
                    onClick={() => setPaymentMethod("mpesa")}
                    className={`p-8 rounded-2xl border-2 transition-all text-center ${
                      paymentMethod === "mpesa" ? "border-teal-600 bg-teal-50" : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">📱</div>
                    <div className="font-medium">M-Pesa</div>
                    <div className="text-sm text-zinc-600">Mobile money</div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`p-8 rounded-2xl border-2 transition-all text-center ${
                      paymentMethod === "card" ? "border-teal-600 bg-teal-50" : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="text-2xl mb-2">💳</div>
                    <div className="font-medium">Visa / Mastercard</div>
                    <div className="text-sm text-zinc-600">Credit / Debit Card</div>
                  </button>
                </div>

                {paymentMethod === "mpesa" ? (
                  <div>
                    <label className="block text-sm font-medium mb-3">M-Pesa Phone Number</label>
                    <input
                      type="tel"
                      placeholder="0712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full px-6 py-5 border border-zinc-300 rounded-2xl text-lg focus:border-teal-600 outline-none transition"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-3">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                        maxLength={19}
                        className="w-full px-6 py-5 border border-zinc-300 rounded-2xl text-lg focus:border-teal-600 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">Expiry (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        maxLength={5}
                        className="w-full px-6 py-5 border border-zinc-300 rounded-2xl text-lg focus:border-teal-600 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-3">CVV</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value.replace(/\D/g, ''))}
                        maxLength={4}
                        className="w-full px-6 py-5 border border-zinc-300 rounded-2xl text-lg focus:border-teal-600 outline-none transition"
                      />
                    </div>
                  </div>
                )}
              </motion.section>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl shadow-sm p-7 sm:p-10 sticky top-24">
                <h3 className="text-2xl font-light mb-8">Order Summary</h3>

                <div className="space-y-6 mb-10">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="w-20 h-20 bg-zinc-100 rounded-2xl overflow-hidden flex-shrink-0">
                        <img src={item.image1} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium leading-tight">{item.name}</p>
                        <p className="text-sm text-zinc-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-right">KSh {(item.price * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-100 pt-6 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-600">Subtotal</span>
                    <span>KSh {subtotal.toFixed(0)}</span>
                  </div>

                  {deliveryOption === "nairobi" && (
                    <div className="flex justify-between">
                      <span className="text-zinc-600">Delivery (Nairobi)</span>
                      <span>KSh 200</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-medium pt-4 border-t border-zinc-200">
                    <span>Total</span>
                    <span className="text-teal-600">KSh {total.toFixed(0)}</span>
                  </div>
                </div>

                {/* Final Pay Button */}
                <button
                  onClick={handlePayment}
                  disabled={isProcessing || !deliveryOption}
                  className={`mt-10 w-full py-5 text-lg font-medium rounded-2xl transition-all ${
                    isProcessing || !deliveryOption
                      ? "bg-zinc-300 text-zinc-500 cursor-not-allowed"
                      : "bg-teal-600 hover:bg-teal-700 text-white"
                  }`}
                >
                  {isProcessing
                    ? "Processing..."
                    : paymentTiming === "prepay"
                    ? `Pay KSh ${total.toFixed(0)}`
                    : `Place Order • Pay KSh ${total.toFixed(0)} on Delivery`}
                </button>

                {paymentTiming === "postpay" && deliveryOption && (
                  <p className="text-center text-sm text-zinc-600 mt-4">
                    You will pay upon delivery
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default Payment;