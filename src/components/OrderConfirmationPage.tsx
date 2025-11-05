import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
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

const deliveryStatusSteps = [
  { key: "ORDERED", label: "Ordered", icon: Package },
  { key: "PACKED", label: "Packed", icon: Package },
  { key: "SHIPPED", label: "Shipped", icon: Truck },
  { key: "IN_TRANSIT", label: "In Transit", icon: Truck },
  { key: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { key: "DELIVERED", label: "Delivered", icon: Home },
];

function getStatusIndex(status: string): number {
  return deliveryStatusSteps.findIndex((step) => step.key === status);
}

export function OrderConfirmationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    const processOrder = async () => {
      try {
        setLoading(true);
        
        // Check if we have a session_id from Stripe redirect
        const sessionId = searchParams.get("session_id");
        
        if (sessionId) {
          // Handle Stripe redirect - verify payment and create order
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
                
                // Redirect to order confirmation with order ID
                navigate(`/order-confirmation/${order.id}`, { replace: true });
                return;
              } else {
                setError("Payment successful but failed to create order. Please contact support.");
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
          const response = await apiService.getOrderById(id);
          if (response.success && response.data) {
            const orderData = (response.data as any).order || response.data;
            setOrder(orderData);
          } else {
            setError(response.error || "Failed to fetch order");
          }
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
  }, [id, searchParams, isAuthenticated, navigate]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
            <Button onClick={() => navigate("/")} className="bg-amber-600 hover:bg-amber-700">
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.deliveryTracking?.status || "ORDERED");

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-4">
            Thank you for your order. We've received your order and will begin processing it right away.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <span>Order Number: <strong className="text-gray-900">{order.orderNumber}</strong></span>
            <span>•</span>
            <span>Order Date: <strong className="text-gray-900">{formatDate(order.createdAt)}</strong></span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Status */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Delivery Status
              </h2>

              <div className="relative">
                {deliveryStatusSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div key={step.key} className="flex items-start mb-6 last:mb-0">
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
                        {isCurrent && order.deliveryTracking?.expectedDeliveryDate && (
                          <p className="text-sm text-gray-600">
                            Expected delivery: {formatDate(order.deliveryTracking.expectedDeliveryDate)}
                          </p>
                        )}
                        {step.key === "DELIVERED" && order.deliveryTracking?.actualDeliveryDate && (
                          <p className="text-sm text-gray-600">
                            Delivered on: {formatDate(order.deliveryTracking.actualDeliveryDate)}
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Courier Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Courier Partner:</span>
                      <span className="font-medium">{order.deliveryTracking.courierPartner}</span>
                    </div>
                    {order.deliveryTracking.awbNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">AWB Number:</span>
                        <span className="font-medium">{order.deliveryTracking.awbNumber}</span>
                      </div>
                    )}
                    {order.deliveryTracking.trackingUrl && (
                      <div className="mt-4">
                        <a
                          href={order.deliveryTracking.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-amber-600 hover:text-amber-700"
                        >
                          Track Package <ArrowRight className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Items
              </h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center p-4 border border-gray-200 rounded-lg"
                  >
                    <img
                      src={item.product.imageUrls[0] || "/placeholder.png"}
                      alt={item.product.product}
                      className="w-20 h-20 object-cover rounded-lg mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.product.product}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × ₹{item.price}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₹{(order.totalAmount - (order.totalAmount > 1000 ? 0 : 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className={`font-medium ${order.totalAmount > 1000 ? 'text-green-600' : ''}`}>
                      {order.totalAmount > 1000 ? 'FREE' : '₹100.00'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    Shipping Address
                  </h3>
                  <p className="text-sm text-gray-600">{order.shippingAddress}</p>
                  <p className="text-sm text-gray-600">Pincode: {order.pincode}</p>
                </div>

                {order.payment && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payment Details
                    </h3>
                    <p className="text-sm text-gray-600">
                      Method: {order.payment.paymentMethod}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: <span className="capitalize">{order.payment.status}</span>
                    </p>
                    {order.payment.transactionId && (
                      <p className="text-sm text-gray-600">
                        Transaction ID: {order.payment.transactionId}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6 space-y-3">
                <Link to="/products">
                  <Button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900">
                    Continue Shopping
                  </Button>
                </Link>
                <Link to={`/orders/${order.id}`}>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    View Order Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
