import React, { useState, useEffect, useCallback } from "react";
import {
  useParams,
  useNavigate,
  Link,
  useSearchParams,
} from "react-router-dom";
import {
  CheckCircle,
  Package,
  Truck,
  Home,
  Calendar,
  MapPin,
  CreditCard,
  Loader,
  ArrowRight,
  Download,
  Share2,
  Printer,
  ShoppingBag,
  RefreshCw,
} from "lucide-react";
import { Button } from "./ui/button";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    product: string;
    imageUrls: string[];
    salePrice: number;
  };
}

interface DeliveryTracking {
  id: number;
  status: string;
  expectedDeliveryDate: string;
  actualDeliveryDate?: string;
  courierPartner?: string;
  awbNumber?: string;
  trackingUrl?: string;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionId?: string;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  shippingAddress: string;
  pincode: string;
  paymentMethod: string;
  createdAt: string;
  items: OrderItem[];
  payment?: Payment;
  deliveryTracking?: DeliveryTracking;
}

// Status mapping - dynamically generated based on backend enum
const getStatusConfig = (statusKey: string) => {
  const statusMap: Record<string, { label: string; icon: any }> = {
    ORDERED: { label: "Ordered", icon: Package },
    PACKED: { label: "Packed", icon: Package },
    SHIPPED: { label: "Shipped", icon: Truck },
    IN_TRANSIT: { label: "In Transit", icon: Truck },
    OUT_FOR_DELIVERY: { label: "Out for Delivery", icon: Truck },
    DELIVERED: { label: "Delivered", icon: Home },
    RETURNED: { label: "Returned", icon: Package },
  };
  return statusMap[statusKey] || { label: statusKey, icon: Package };
};

// Get all possible status steps in order
const getAllStatusSteps = () => {
  const statusOrder = ["ORDERED", "PACKED", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED"];
  return statusOrder.map((key) => ({
    key,
    ...getStatusConfig(key),
  }));
};

function getStatusIndex(status: string, statusSteps: Array<{ key: string }>): number {
  return statusSteps.findIndex((step) => step.key === status);
}

export function OrderConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (isLoading) {
      return;
    }

    // Check if we have a session_id from Stripe redirect
    const sessionId = searchParams.get("session_id");

    // If not authenticated and we have a session_id, save it and redirect to login
    if (!isAuthenticated && sessionId) {
      // Save session_id to localStorage so we can retrieve it after login
      localStorage.setItem("pendingSessionId", sessionId);
      navigate("/login?redirect=/order-confirmation", { replace: true });
      return;
    }

    // If not authenticated and no session_id, redirect to login
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const processOrder = async () => {
      try {
        setLoading(true);

        // Check for session_id from query params or localStorage (after login redirect)
        const sessionIdFromQuery = searchParams.get("session_id");
        const sessionIdFromStorage = localStorage.getItem("pendingSessionId");
        const sessionId = sessionIdFromQuery || sessionIdFromStorage;

        if (sessionId) {
          // Clear it from localStorage if it was there
          if (sessionIdFromStorage) {
            localStorage.removeItem("pendingSessionId");
          }

          // Handle Stripe redirect - verify payment and create order
          const verifyResponse = await apiService.verifyPaymentSession(
            sessionId
          );

          if (verifyResponse.success && verifyResponse.data) {
            const sessionData = verifyResponse.data as any;
            const session = sessionData.session || sessionData;

            if (session.status === "paid") {
              // Payment successful, create order
              const orderResponse = await apiService.createOrder({
                shippingAddress:
                  localStorage.getItem("pendingShippingAddress") || "",
                pincode: localStorage.getItem("pendingPincode") || "",
                paymentMethod: "card",
                paymentIntentId:
                  session.payment_intent || session.id || sessionId,
              });

              if (orderResponse.success && orderResponse.data) {
                const orderData = orderResponse.data as any;
                const order = orderData.order || orderData;

                // Clear pending data
                localStorage.removeItem("pendingShippingAddress");
                localStorage.removeItem("pendingPincode");

                // Dispatch event to notify cart that it should be cleared
                window.dispatchEvent(new CustomEvent("cart-cleared"));

                // Redirect to order confirmation with order ID
                navigate(`/order-confirmation/${order.id}`, { replace: true });
                return;
              } else {
                // Show the actual error message from backend
                const errorMessage = 
                  orderResponse.error || 
                  orderResponse.message || 
                  "Payment successful but failed to create order. Please contact support.";
                console.error("Order creation failed - Full response:", JSON.stringify(orderResponse, null, 2));
                setError(errorMessage);
                setLoading(false);
                return;
              }
            } else {
              setError("Payment not completed. Please try again.");
              setLoading(false);
              return;
            }
          } else {
            setError("Failed to verify payment. Please contact support.");
            setLoading(false);
            return;
          }
        }

        // If we have an order ID, fetch the order
        if (id) {
          await fetchOrderDetails(id);
        } else {
          setError("Order ID not found");
        }
      } catch (err) {
        console.error("Error processing order:", err);
        setError("An error occurred while processing your order");
      } finally {
        setLoading(false);
      }
    };

    processOrder();
  }, [id, searchParams, isAuthenticated, isLoading, navigate]);

  // Function to fetch order details
  const fetchOrderDetails = useCallback(async (orderId: string) => {
    try {
      const response = await apiService.getOrderById(orderId);
      if (response.success && response.data) {
        const orderData = (response.data as any).order || response.data;
        setOrder(orderData);
      } else {
        setError(response.error || "Failed to fetch order");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to fetch order details");
    }
  }, []);

  // Function to refresh order status
  const refreshOrderStatus = useCallback(async () => {
    if (!id) return;
    try {
      setRefreshing(true);
      await fetchOrderDetails(id);
    } catch (err) {
      console.error("Error refreshing order:", err);
    } finally {
      setRefreshing(false);
    }
  }, [id, fetchOrderDetails]);

  // Auto-refresh order status every 30 seconds
  useEffect(() => {
    if (!id || !order) return;

    const interval = setInterval(() => {
      fetchOrderDetails(id);
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [id, fetchOrderDetails, order]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handlePrintOrder = () => {
    window.print();
  };

  const handleShareOrder = async () => {
    if (!order) return;

    const shareData = {
      title: `Order ${order.orderNumber} - Shrivesta`,
      text: `I just placed an order on Shrivesta! Order Number: ${
        order.orderNumber
      }, Total: ₹${order.totalAmount.toFixed(2)}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error: any) {
        // User cancelled or error occurred - fallback to clipboard
        if (error.name !== "AbortError") {
          // Only try clipboard if it wasn't a user cancellation
          try {
            await navigator.clipboard.writeText(
              `Order Number: ${
                order.orderNumber
              }\nTotal: ₹${order.totalAmount.toFixed(2)}\n${
                window.location.href
              }`
            );
            alert("Order details copied to clipboard!");
          } catch (clipboardError) {
            console.error("Failed to copy to clipboard:", clipboardError);
          }
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `Order Number: ${
            order.orderNumber
          }\nTotal: ₹${order.totalAmount.toFixed(2)}\n${window.location.href}`
        );
        alert("Order details copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
        alert(
          "Unable to share. Please copy the order number manually: " +
            order.orderNumber
        );
      }
    }
  };

  const handleDownloadInvoice = () => {
    // This would typically generate and download a PDF invoice
    // For now, we'll just print the page
    window.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ORDERED":
        return "bg-blue-100 text-blue-800";
      case "PACKED":
        return "bg-purple-100 text-purple-800";
      case "SHIPPED":
      case "IN_TRANSIT":
        return "bg-yellow-100 text-yellow-800";
      case "OUT_FOR_DELIVERY":
        return "bg-orange-100 text-orange-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto mb-4 text-amber-500" />
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-red-600 mb-4">{error || "Order not found"}</p>
            <Button
              onClick={() => navigate("/")}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get all status steps dynamically
  const deliveryStatusSteps = getAllStatusSteps();
  
  // Get current status from backend
  const currentStatus = order.deliveryTracking?.status || "ORDERED";
  const currentStatusIndex = getStatusIndex(currentStatus, deliveryStatusSteps);

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden print:border-0 print:shadow-none">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-8 py-6 border-b border-amber-200">
            <div className="flex flex-col items-center text-center">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-amber-300 rounded-full animate-ping opacity-30"></div>
                <div className="relative bg-amber-600 rounded-full p-3">
                  <CheckCircle className="h-12 w-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Order Placed Successfully!
              </h1>
              <p className="text-base text-gray-700 max-w-2xl">
                Thank you for your order! We've received your order and will begin
                processing it right away. You'll receive an email confirmation shortly.
              </p>
            </div>
          </div>

          {/* Order Info Cards */}
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Order Number
                </p>
                <p className="text-xl font-bold text-gray-900 font-mono">
                  {order.orderNumber}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Order Date
                </p>
                <p className="text-xl font-bold text-gray-900">
                  {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="bg-amber-50 rounded-lg p-5 border border-amber-200 hover:shadow-md transition-shadow">
                <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">
                  Total Amount
                </p>
                <p className="text-xl font-bold text-amber-600">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-4 border-t border-gray-200 print:hidden">
              <Button
                onClick={handlePrintOrder}
                variant="outline"
                className="gap-2 border-gray-300 hover:bg-gray-50"
              >
                <Printer className="h-4 w-4" />
                Print Order
              </Button>
              <Button
                onClick={handleShareOrder}
                variant="outline"
                className="gap-2 border-gray-300 hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4" />
                Share Order
              </Button>
              <Button
                onClick={handleDownloadInvoice}
                variant="outline"
                className="gap-2 border-gray-300 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download Invoice
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="bg-amber-600 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-white" />
                  </div>
                  <span>Order Items ({order.items.length})</span>
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div
                      key={item.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-sm transition-all ${
                        index !== order.items.length - 1 ? "mb-4" : ""
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <img
                          src={item.product.imageUrls[0] || "/placeholder.png"}
                          alt={item.product.product}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-gray-200"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-base md:text-lg mb-1.5 line-clamp-2">
                          {item.product.product}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Qty:</span>
                            <span>{item.quantity}</span>
                          </span>
                          <span className="text-gray-400">•</span>
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Unit Price:</span>
                            <span>₹{item.price.toFixed(2)}</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-gray-900 text-lg md:text-xl">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Delivery Status Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="bg-amber-600 p-2 rounded-lg">
                      <Truck className="h-5 w-5 text-white" />
                    </div>
                    <span>Delivery Status</span>
                  </h2>
                  <Button
                    onClick={refreshOrderStatus}
                    variant="outline"
                    size="sm"
                    disabled={refreshing}
                    className="gap-2 border-gray-300 hover:bg-gray-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    {refreshing ? "Refreshing..." : "Refresh"}
                  </Button>
                </div>
                {order.deliveryTracking?.status && (
                  <p className="text-sm text-gray-600 mt-2">
                    Current Status: <span className="font-semibold text-amber-600 capitalize">
                      {getStatusConfig(order.deliveryTracking.status).label}
                    </span>
                  </p>
                )}
              </div>
              <div className="p-6">

              <div className="relative">
                {deliveryStatusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div
                      key={step.key}
                      className="flex items-start mb-6 last:mb-0"
                    >
                      <div className="flex flex-col items-center mr-4">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-amber-600 text-white"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                        </div>
                        {index < deliveryStatusSteps.length - 1 && (
                          <div
                            className={`w-0.5 h-16 ${
                              isCompleted ? "bg-amber-600" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div
                          className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-1 ${getStatusColor(
                            step.key
                          )}`}
                        >
                          {step.label}
                        </div>
                        {isCurrent &&
                          order.deliveryTracking?.expectedDeliveryDate && (
                            <p className="text-sm text-gray-600">
                              Expected delivery:{" "}
                              {formatDate(
                                order.deliveryTracking.expectedDeliveryDate
                              )}
                            </p>
                          )}
                        {step.key === "DELIVERED" &&
                          order.deliveryTracking?.actualDeliveryDate && (
                            <p className="text-sm text-gray-600">
                              Delivered on:{" "}
                              {formatDate(
                                order.deliveryTracking.actualDeliveryDate
                              )}
                            </p>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>

                {/* Courier Details */}
                {order.deliveryTracking?.courierPartner && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">
                      Courier Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3 border border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Courier Partner:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {order.deliveryTracking.courierPartner}
                        </span>
                      </div>
                      {order.deliveryTracking.awbNumber && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">AWB Number:</span>
                          <span className="text-sm font-semibold text-gray-900 font-mono">
                            {order.deliveryTracking.awbNumber}
                          </span>
                        </div>
                      )}
                      {order.deliveryTracking.trackingUrl && (
                        <div className="pt-3 border-t border-gray-200">
                          <a
                            href={order.deliveryTracking.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium text-sm"
                          >
                            Track Package <ArrowRight className="h-4 w-4 ml-2" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* What's Next Section */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg shadow-sm border border-amber-200 overflow-hidden">
              <div className="px-6 py-4 bg-amber-100 border-b border-amber-200">
                <h2 className="text-xl font-bold text-gray-900">
                  What's Next?
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    1
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      Order Confirmation
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      You'll receive an email confirmation with your order details.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    2
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      Order Processing
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      We'll start processing your order and prepare it for shipment.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                    3
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 mb-1">
                      Shipping Updates
                    </p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {order.deliveryTracking?.expectedDeliveryDate
                        ? `Expected delivery: ${formatDate(
                            order.deliveryTracking.expectedDeliveryDate
                          )}`
                        : "You'll receive tracking information once your order ships."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-8 overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>
              <div className="p-6">

                {/* Order Breakdown */}
                <div className="space-y-4 mb-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-gray-600">
                        Subtotal (
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        items)
                      </span>
                      <span className="font-semibold text-gray-900">
                        ₹
                        {(
                          order.totalAmount - (order.totalAmount > 1000 ? 0 : 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm py-2">
                      <span className="text-gray-600">Shipping</span>
                      <span
                        className={`font-semibold ${
                          order.totalAmount > 1000
                            ? "text-amber-600"
                            : "text-gray-900"
                        }`}
                      >
                        {order.totalAmount > 1000 ? "FREE" : "₹100.00"}
                      </span>
                    </div>
                    {order.totalAmount > 1000 && (
                      <div className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                        🎉 You saved ₹100 on shipping!
                      </div>
                    )}
                  </div>

                  <div className="border-t-2 border-gray-300 pt-4 mt-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-lg font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-amber-600">
                        ₹{order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 text-right">
                      Inclusive of all taxes
                    </p>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-600" />
                    Shipping Address
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {order.shippingAddress}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Pincode:{" "}
                      <span className="font-semibold">{order.pincode}</span>
                    </p>
                  </div>
                </div>

                {/* Payment Details */}
                {order.payment && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-600" />
                      Payment Details
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Method:</span>
                        <span className="text-sm font-semibold text-gray-900 capitalize">
                          {order.payment.paymentMethod}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Status:</span>
                        <span className="text-sm font-semibold text-amber-600 capitalize flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          {order.payment.status}
                        </span>
                      </div>
                      {order.payment.transactionId && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500 mb-1.5">
                            Transaction ID:
                          </p>
                          <p className="text-xs font-mono text-gray-700 break-all bg-white p-2 rounded border border-gray-200">
                            {order.payment.transactionId}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Date & Time */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-xs">Order placed on {formatDateTime(order.createdAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 space-y-3 print:hidden">
                  <Link to="/products" className="block">
                    <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 h-11 text-sm font-medium">
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Continue Shopping
                    </Button>
                  </Link>
                  <Link to="/account/orders" className="block">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white h-11 text-sm font-medium">
                      View All Orders
                    </Button>
                  </Link>
                  <Link to={`/account/orders`} className="block">
                    <Button variant="outline" className="w-full h-11 text-sm font-medium border-gray-300">
                      Track This Order
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
