import React, { useState, useEffect, useRef } from "react";
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
  savedAddress,
  savedPincode,
  onError,
}: {
  amount: number;
  shippingAddress: string;
  pincode: string;
  customerEmail?: string;
  customerName?: string;
  savedAddress?: string | null;
  savedPincode?: string | null;
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
      // Save shipping address and pincode to user's profile if they're different from saved values
      if (shippingAddress !== savedAddress || pincode !== savedPincode) {
        try {
          await apiService.updateShippingAddress(shippingAddress, pincode);
        } catch (error) {
          console.error("Error saving shipping address and pincode:", error);
          // Continue with payment even if address save fails
        }
      }

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
        // Redirect to Stripe Checkout page in the same tab
        // Using replace() instead of href to ensure same-tab navigation
        window.location.replace(response.data.url);
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
        className="w-full flex items-center justify-center gap-2"
        style={{
          background: processing || !shippingAddress || pincode.length !== 6 
            ? 'linear-gradient(to right, #d1d5db, #9ca3af)' 
            : 'linear-gradient(to right, #F59E0B, #FBBF24)',
          color: '#000',
          padding: '16px 32px',
          borderRadius: '9999px',
          fontSize: '1.125rem',
          fontWeight: 500,
          cursor: processing || !shippingAddress || pincode.length !== 6 ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s',
          boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
          border: 'none',
          opacity: processing || !shippingAddress || pincode.length !== 6 ? 0.6 : 1
        }}
        onMouseEnter={(e) => {
          if (!processing && shippingAddress && pincode.length === 6) {
            e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.3)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {processing ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            Redirecting to Payment...
          </>
        ) : (
          <>
            <ExternalLink className="h-5 w-5" />
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
  const [addressLoading, setAddressLoading] = useState(true);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [savedPincode, setSavedPincode] = useState<string | null>(null);
  const addressFetchedRef = useRef(false);

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
                
                // Dispatch event to notify cart that it should be cleared
                window.dispatchEvent(new CustomEvent("cart-cleared"));
                
                // Redirect to order confirmation
                navigate(`/order-confirmation/${order.id}`, {
                  state: { orderNumber: order.orderNumber },
                });
              } else {
                // Show the actual error message from backend
                const errorMessage = 
                  orderResponse.error || 
                  orderResponse.message || 
                  "Payment successful but failed to create order. Please contact support.";
                console.error("Order creation failed - Full response:", JSON.stringify(orderResponse, null, 2));
                alert(errorMessage);
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

    const fetchShippingAddress = async () => {
      // Prevent multiple fetches
      if (addressFetchedRef.current) {
        return;
      }
      
      try {
        setAddressLoading(true);
        addressFetchedRef.current = true;
        
        console.log("=== Fetching Shipping Address ===");
        const response = await apiService.getShippingAddress();
        console.log("Full API response:", JSON.stringify(response, null, 2));
        
        if (response.success && response.data) {
          // The API service wraps the response: { success: true, data: backendResponse }
          // Backend returns: { success: true, shippingAddress: "..." }
          // So response.data = { success: true, shippingAddress: "..." }
          const backendResponse = response.data;
          console.log("Backend response object:", backendResponse);
          console.log("Backend response keys:", Object.keys(backendResponse));
          
          const address = backendResponse.shippingAddress;
          const pincode = backendResponse.pincode;
          console.log("Extracted address value:", address);
          console.log("Extracted pincode value:", pincode);
          console.log("Address type:", typeof address);
          console.log("Address is null?", address === null);
          console.log("Address is undefined?", address === undefined);
          
          if (address !== undefined && address !== null && typeof address === 'string') {
            // Address exists and is a string
            console.log("✅ Address found! Setting state...");
            setSavedAddress(address);
            
            // Only set shippingAddress if address is not empty after trimming
            if (address.trim().length > 0) {
              console.log("✅ Setting shippingAddress state to:", address);
              setShippingAddress(address);
              console.log("✅ Shipping address state updated");
            } else {
              console.log("⚠️ Address is empty string, not setting");
            }
          } else {
            console.log("❌ No saved address found for user (address value:", address, ", type:", typeof address, ")");
            setSavedAddress(null);
          }

          // Handle pincode separately
          if (pincode !== undefined && pincode !== null && typeof pincode === 'string' && pincode.trim().length === 6) {
            console.log("✅ Pincode found! Setting state...");
            setSavedPincode(pincode);
            setPincode(pincode);
            console.log("✅ Pincode state updated:", pincode);
          } else {
            console.log("❌ No saved pincode found for user (pincode value:", pincode, ", type:", typeof pincode, ")");
            setSavedPincode(null);
          }
        } else {
          console.warn("❌ Failed to fetch shipping address. Success:", response.success, "Error:", response.error || "Unknown error");
          setSavedAddress(null);
        }
      } catch (error) {
        console.error("❌ Error fetching shipping address:", error);
        setSavedAddress(null);
        addressFetchedRef.current = false; // Allow retry on error
      } finally {
        setAddressLoading(false);
      }
    };

    fetchCart();
    fetchShippingAddress();
  }, [isAuthenticated, authLoading, navigate]);

  // Debug effect to track address state changes
  useEffect(() => {
    console.log("Address state changed - shippingAddress:", shippingAddress, "savedAddress:", savedAddress);
  }, [shippingAddress, savedAddress]);

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
                
                {user && (
                  <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Delivering to:</span> {user.name}
                    </p>
                    {savedAddress && !addressLoading && (
                      <p className="text-xs text-amber-700 mt-1">
                        Your saved address has been pre-filled below. You can edit it if needed.
                      </p>
                    )}
                  </div>
                )}

                {addressLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-amber-500 mr-2" />
                    <span className="text-gray-600">Loading your saved address...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address {savedAddress && <span className="text-green-600 text-xs">(Pre-filled from your profile)</span>}
                      </label>
                      <textarea
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Enter your complete address including street, city, state, and pincode"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        rows={4}
                        required
                      />
                      {!savedAddress && (
                        <p className="text-xs text-gray-500 mt-1">
                          This address will be saved to your profile for future orders.
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pincode {savedPincode && <span className="text-green-600 text-xs">(Pre-filled from your profile)</span>}
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
                      {!savedPincode && (
                        <p className="text-xs text-gray-500 mt-1">
                          This pincode will be saved to your profile for future orders.
                        </p>
                      )}
                    </div>
                    {savedAddress && shippingAddress !== savedAddress && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          Your address has been updated. It will be saved to your profile when you complete the payment.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Section */}
              {!addressLoading && shippingAddress && pincode.length === 6 ? (
                <div className="mb-6">
                  <PaymentButton
                    amount={totalAmount}
                    shippingAddress={shippingAddress}
                    pincode={pincode}
                    customerEmail={user?.email}
                    customerName={user?.name}
                    savedAddress={savedAddress}
                    savedPincode={savedPincode}
                    onError={handlePaymentError}
                  />
                </div>
              ) : !addressLoading ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    Please fill in your shipping address and pincode to proceed with payment.
                  </p>
                </div>
              ) : null}
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
