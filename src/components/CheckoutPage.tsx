import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Loader } from "lucide-react";
import { Button } from "./ui/button";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { config } from "../config/env";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe with publishable key - only if key exists and is valid
let stripePromise: Promise<any> | null = null;
if (config.STRIPE_PUBLISHABLE_KEY && config.STRIPE_PUBLISHABLE_KEY.trim() !== "") {
  // Check if it's a secret key (should never be in frontend!)
  if (config.STRIPE_PUBLISHABLE_KEY.startsWith("sk_")) {
    console.error("❌ ERROR: You're using a SECRET key (sk_test_...) in the frontend!");
    console.error("   Frontend needs PUBLISHABLE key (pk_test_...)");
    stripePromise = null;
  } else if (config.STRIPE_PUBLISHABLE_KEY.startsWith("pk_")) {
    console.log("✅ Initializing Stripe with publishable key");
    stripePromise = loadStripe(config.STRIPE_PUBLISHABLE_KEY);
  } else {
    console.warn("⚠️ Invalid Stripe key format");
    stripePromise = null;
  }
} else {
  console.warn("⚠️ Stripe publishable key not configured");
}

interface CheckoutFormProps {
  amount: number;
  shippingAddress: string;
  pincode: string;
  onSuccess: (orderId: number, orderNumber: string) => void;
  onError: (error: string) => void;
}

function CheckoutForm({
  amount,
  shippingAddress,
  pincode,
  onSuccess,
  onError,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("CheckoutForm mounted, amount:", amount);
    console.log("Stripe instance:", stripe ? "Loaded" : "Not loaded");
    
    // Create payment intent when component mounts
    const createPaymentIntent = async () => {
      try {
        console.log("Creating payment intent for amount:", amount);
        const response = await apiService.createPaymentIntent(amount, "inr");
        console.log("Payment intent response:", response);
        
        if (response.success && response.data) {
          setClientSecret(response.data.clientSecret);
          setPaymentIntentId(response.data.paymentIntentId);
          setError(null);
        } else {
          const errorMsg = response.error || "Failed to initialize payment";
          setError(errorMsg);
          onError(errorMsg);
        }
      } catch (error) {
        const errorMsg = "Failed to initialize payment";
        console.error("Payment intent error:", error);
        setError(errorMsg);
        onError(errorMsg);
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    }
  }, [amount]);

  useEffect(() => {
    console.log("CheckoutForm render - stripe:", !!stripe, "elements:", !!elements, "clientSecret:", !!clientSecret);
    if (stripe && elements) {
      console.log("✅ Stripe and Elements loaded successfully");
    } else {
      console.warn("⚠️ Stripe or Elements not loaded yet");
    }
  }, [stripe, elements, clientSecret]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret || !paymentIntentId) {
      const missing: string[] = [];
      if (!stripe) missing.push("Stripe");
      if (!elements) missing.push("Elements");
      if (!clientSecret) missing.push("Client Secret");
      if (!paymentIntentId) missing.push("Payment Intent ID");
      onError(`Missing: ${missing.join(", ")}`);
      return;
    }

    // Prevent double submission
    if (processing) {
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    if (!cardElement) {
      onError("Card element not found");
      setProcessing(false);
      return;
    }

    try {
      // First, check if payment intent is already succeeded
      let paymentIntent;
      try {
        paymentIntent = await stripe.retrievePaymentIntent(clientSecret);
      } catch (retrieveError) {
        console.error("Error retrieving payment intent:", retrieveError);
        // Continue to try confirming
      }

      // If payment intent is already succeeded, skip confirmation
      if (paymentIntent?.paymentIntent?.status === "succeeded") {
        console.log("Payment already succeeded, proceeding to order creation");
        // Create order directly
        const orderResponse = await apiService.createOrder({
          shippingAddress,
          pincode,
          paymentMethod: "card",
          paymentIntentId: paymentIntentId,
        });

        if (orderResponse.success && orderResponse.data) {
          const orderData = orderResponse.data as any;
          const order = orderData.order || orderData;
          onSuccess(order.id, order.orderNumber);
        } else {
          const errorMsg = orderResponse.error || "Failed to create order";
          setError(errorMsg);
          onError(errorMsg);
        }
        setProcessing(false);
        return;
      }

      // Confirm payment with Stripe if not already succeeded
      const { error: stripeError, paymentIntent: confirmedPaymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: cardElement as any,
          },
        }
      );

      if (stripeError) {
        // Handle specific error for already succeeded payment
        if (stripeError.code === "payment_intent_unexpected_state") {
          console.log("Payment already succeeded, proceeding to order creation");
          // Payment is already succeeded, try to create order
          const orderResponse = await apiService.createOrder({
            shippingAddress,
            pincode,
            paymentMethod: "card",
            paymentIntentId: paymentIntentId,
          });

          if (orderResponse.success && orderResponse.data) {
            const orderData = orderResponse.data as any;
            const order = orderData.order || orderData;
            onSuccess(order.id, order.orderNumber);
          } else {
            const errorMsg = orderResponse.error || "Failed to create order";
            setError(errorMsg);
            onError(errorMsg);
          }
        } else {
          const errorMsg = stripeError.message || "Payment failed";
          setError(errorMsg);
          onError(errorMsg);
        }
        setProcessing(false);
        return;
      }

      if (confirmedPaymentIntent?.status === "succeeded") {
        // Create order after successful payment
        const orderResponse = await apiService.createOrder({
          shippingAddress,
          pincode,
          paymentMethod: "card",
          paymentIntentId: confirmedPaymentIntent.id,
        });

        if (orderResponse.success && orderResponse.data) {
          const orderData = orderResponse.data as any;
          const order = orderData.order || orderData;
          onSuccess(order.id, order.orderNumber);
        } else {
          const errorMsg = orderResponse.error || "Failed to create order";
          setError(errorMsg);
          onError(errorMsg);
        }
      } else {
        const errorMsg = `Payment status: ${confirmedPaymentIntent?.status || "unknown"}`;
        setError(errorMsg);
        onError(errorMsg);
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      const errorMsg = error.message || "An error occurred during payment";
      setError(errorMsg);
      onError(errorMsg);
    } finally {
      setProcessing(false);
    }
  };

  // Show loading state while Stripe initializes
  if (!stripe || !elements) {
    return (
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin text-yellow-600" />
            <p className="text-sm text-yellow-800">
              Loading payment form... {!stripe && "(Stripe initializing)"} {!elements && "(Elements loading)"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg border-2 border-gray-200">
        <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
        <div className="border rounded-lg p-4 bg-gray-50">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#424770",
                  "::placeholder": {
                    color: "#aab7c4",
                  },
                },
                invalid: {
                  color: "#9e2146",
                },
              },
            }}
          />
        </div>
        {!clientSecret && (
          <p className="text-xs text-gray-500 mt-2">Initializing payment...</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={!stripe || processing || !paymentIntentId || !clientSecret}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-4 rounded-lg font-bold text-lg shadow-lg"
      >
        {processing ? (
          <>
            <Loader className="h-5 w-5 mr-2 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay ₹{amount.toFixed(2)}
          </>
        )}
      </Button>
    </form>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [cartData, setCartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  useEffect(() => {
    // Wait for auth to finish loading before checking
    if (authLoading) {
      return;
    }

    // Only redirect if we're sure user is not authenticated
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchCart = async () => {
      try {
        const response = await apiService.getCart();
        if (response.success && response.data) {
          const nestedData = (response.data as any).data;
          const data = nestedData || response.data;
          const items = data.items || [];

          if (items.length === 0) {
            navigate("/cart");
            return;
          }

          // Calculate totals
          const subtotal = items.reduce(
            (sum: number, item: any) =>
              sum + (item.product?.salePrice || item.price) * item.quantity,
            0
          );
          const shipping = subtotal > 1000 ? 0 : 100;
          const total = subtotal + shipping;

          setCartData({ items, summary: { subtotal, shipping, total } });
          setTotalAmount(total);
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
        navigate("/cart");
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isAuthenticated, authLoading, navigate]);

  const handlePaymentSuccess = (orderId: number, orderNumber: string) => {
    navigate(`/order-confirmation/${orderId}`, {
      state: { orderNumber },
    });
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment Error: ${error}`);
  };

  // Show loading while auth is checking or cart is loading
  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-500" />
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/cart")}
            className="flex items-center text-amber-600 hover:text-amber-700 mr-4"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                Checkout
              </h1>

              {/* Shipping Address */}
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Shipping Address
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Enter your complete address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      rows={3}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Enter 6-digit pincode"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      maxLength={6}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              {shippingAddress && pincode.length === 6 ? (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Payment Details
                  </h2>
                  
                  {!config.STRIPE_PUBLISHABLE_KEY || config.STRIPE_PUBLISHABLE_KEY.trim() === "" ? (
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                      <p className="text-sm text-red-800 font-semibold mb-3">
                        ⚠️ Stripe Configuration Missing
                      </p>
                      <p className="text-xs text-red-700 mb-3">
                        Please add your Stripe publishable key to the .env file:
                      </p>
                      <code className="text-xs bg-red-100 p-3 rounded block mb-3 font-mono">
                        VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
                      </code>
                      <p className="text-xs text-red-700 mb-2">
                        Get your key from:{" "}
                        <a
                          href="https://dashboard.stripe.com/apikeys"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-semibold"
                        >
                          Stripe Dashboard
                        </a>
                      </p>
                      <p className="text-xs text-red-600 mt-3 pt-3 border-t border-red-200">
                        <strong>Steps:</strong>
                        <br />1. Create a .env file in frontend/shrivesta2/
                        <br />2. Add: VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
                        <br />3. Restart your dev server
                      </p>
                    </div>
                  ) : config.STRIPE_PUBLISHABLE_KEY.startsWith("sk_") ? (
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                      <p className="text-sm text-red-800 font-semibold mb-3">
                        ❌ WRONG KEY TYPE!
                      </p>
                      <p className="text-xs text-red-700 mb-3">
                        You're using a <strong>SECRET key</strong> (sk_test_...) in the frontend!
                      </p>
                      <p className="text-xs text-red-700 mb-3">
                        Frontend needs a <strong>PUBLISHABLE key</strong> (pk_test_...)
                      </p>
                      <p className="text-xs text-red-600 mb-3">
                        <strong>Fix:</strong>
                        <br />1. Go to <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard</a>
                        <br />2. Copy the <strong>Publishable key</strong> (starts with pk_test_)
                        <br />3. Update your .env file:
                        <code className="block bg-red-100 p-2 rounded mt-2 font-mono">
                          VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
                        </code>
                        <br />4. Keep your secret key (sk_test_...) ONLY in backend/.env
                      </p>
                    </div>
                  ) : stripePromise ? (
                    <Elements stripe={stripePromise}>
                      <CheckoutForm
                        amount={totalAmount}
                        shippingAddress={shippingAddress}
                        pincode={pincode}
                        onSuccess={handlePaymentSuccess}
                        onError={handlePaymentError}
                      />
                    </Elements>
                  ) : (
                    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
                      <p className="text-sm text-red-800 font-semibold">
                        ⚠️ Stripe failed to initialize. Please check your publishable key.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Please fill in your shipping address and pincode to proceed with payment.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              {cartData?.items && (
                <div className="space-y-4">
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {cartData.items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.product?.product || item.name} x {item.quantity}
                        </span>
                        <span className="font-medium">
                          ₹{(item.product?.salePrice || item.price) * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">₹{cartData.summary?.subtotal || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className={`font-medium ${cartData.summary?.shipping === 0 ? 'text-green-600' : ''}`}>
                        {cartData.summary?.shipping === 0 ? 'FREE' : `₹${cartData.summary?.shipping || 0}`}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>₹{cartData.summary?.total || totalAmount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
