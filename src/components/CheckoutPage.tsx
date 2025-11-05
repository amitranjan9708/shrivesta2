import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, CreditCard, Loader, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// Payment Button Component - Redirects to Stripe Checkout
function PaymentButton({
  amount,
  shippingAddress,
  pincode,
  customerEmail,
  customerName,
  onError,
}: {
  amount: number;
  shippingAddress: string;
  pincode: string;
  customerEmail?: string;
  customerName?: string;
  onError: (error: string) => void;
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    if (!shippingAddress || pincode.length !== 6) {
      setError("Please fill in shipping address and pincode");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Save shipping address and pincode to localStorage before redirecting
      localStorage.setItem("pendingShippingAddress", shippingAddress);
      localStorage.setItem("pendingPincode", pincode);

      // Create Stripe Checkout Session
      const response = await apiService.createCheckoutSession({
        amount,
        customerEmail,
        customerName,
      });

      if (response.success && response.data?.url) {
        // Redirect to Stripe Checkout page
        window.location.href = response.data.url;
      } else {
        const errorMsg = response.error || "Failed to initialize payment";
        setError(errorMsg);
        onError(errorMsg);
        setProcessing(false);
      }
    } catch (error: any) {
      const errorMsg = error.message || "Failed to initialize payment";
      setError(errorMsg);
      onError(errorMsg);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold mb-2 flex items-center text-blue-900">
          <CreditCard className="h-5 w-5 mr-2" />
          Payment Options
        </h3>
        <p className="text-sm text-blue-800 mb-2">
          You'll be redirected to Stripe's secure payment page where you can pay using:
        </p>
        <ul className="text-sm text-blue-700 list-disc list-inside space-y-1">
          <li>Credit/Debit Cards</li>
          <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
          <li>Net Banking</li>
          <li>Wallets</li>
        </ul>
      </div>

      <Button
        type="button"
        onClick={handlePayment}
        disabled={processing || !shippingAddress || pincode.length !== 6}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-4 rounded-lg font-bold text-lg shadow-lg"
      >
        {processing ? (
          <>
            <Loader className="h-5 w-5 mr-2 animate-spin" />
            Redirecting to Payment...
          </>
        ) : (
          <>
            <ExternalLink className="h-5 w-5 mr-2" />
            Pay ₹{amount.toFixed(2)} - Continue to Payment
          </>
        )}
      </Button>
    </div>
  );
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [cartData, setCartData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [shippingAddress, setShippingAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  // Handle payment success callback from Stripe Checkout
  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    const canceled = searchParams.get("canceled");

    if (canceled === "true") {
      // User canceled payment
      console.log("Payment canceled by user");
      return;
    }

    if (sessionId) {
      // Verify payment session and create order
      const verifyAndCreateOrder = async () => {
        try {
          setLoading(true);
          const verifyResponse = await apiService.verifyPaymentSession(sessionId);
          
          if (verifyResponse.success && verifyResponse.data) {
            const sessionData = verifyResponse.data as any;
            const session = sessionData.session || sessionData;
            
            if (session.status === "paid") {
              // Payment successful, create order
              const orderResponse = await apiService.createOrder({
                shippingAddress: localStorage.getItem("pendingShippingAddress") || "",
                pincode: localStorage.getItem("pendingPincode") || "",
                paymentMethod: "card",
                paymentIntentId: session.payment_intent || session.id || sessionId,
              });

              if (orderResponse.success && orderResponse.data) {
                const orderData = orderResponse.data as any;
                const order = orderData.order || orderData;
                
                // Clear pending data
                localStorage.removeItem("pendingShippingAddress");
                localStorage.removeItem("pendingPincode");
                
                // Redirect to order confirmation
                navigate(`/order-confirmation/${order.id}`, {
                  state: { orderNumber: order.orderNumber },
                });
              } else {
                alert("Payment successful but failed to create order. Please contact support.");
                navigate("/cart");
              }
            } else {
              alert("Payment not completed. Please try again.");
              navigate("/checkout");
            }
          } else {
            alert("Failed to verify payment. Please contact support.");
            navigate("/checkout");
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          alert("An error occurred while processing your payment.");
          navigate("/checkout");
        } finally {
          setLoading(false);
        }
      };

      verifyAndCreateOrder();
    }
  }, [searchParams, navigate]);

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
                  <PaymentButton
                    amount={totalAmount}
                    shippingAddress={shippingAddress}
                    pincode={pincode}
                    customerEmail={user?.email}
                    customerName={user?.name}
                    onError={handlePaymentError}
                  />
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
