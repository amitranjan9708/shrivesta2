import React, { useState, useEffect } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  size?: string;
  color?: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    images: string[];
    price: number;
    vipPrice: number;
    salePrice?: number;
  };
}

export function CartPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        const response = await apiService.getCart();
        if (response.success && response.data) {
          setCartItems(response.data.items || []);
        } else {
          setError("Failed to fetch cart items");
        }
      } catch (err) {
        setError("An error occurred while fetching cart items");
        console.error("Error fetching cart:", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCartItems();
    }
  }, [isAuthenticated]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeItem(productId);
      return;
    }

    try {
      setUpdating(productId);
      const response = await apiService.updateCartItem(productId, newQuantity);
      if (response.success) {
        setCartItems((items) =>
          items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      } else {
        alert("Failed to update quantity");
      }
    } catch (err) {
      alert("An error occurred while updating quantity");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setUpdating(productId);
      const response = await apiService.removeCartItem(productId);
      if (response.success) {
        setCartItems((items) =>
          items.filter((item) => item.productId !== productId)
        );
      } else {
        alert("Failed to remove item from cart");
      }
    } catch (err) {
      alert("An error occurred while removing item");
    } finally {
      setUpdating(null);
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateSavings = () => {
    return cartItems.reduce((total, item) => {
      const originalPrice = item.originalPrice || item.price;
      return total + (originalPrice - item.price) * item.quantity;
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-8">
            <Link
              to="/"
              className="flex items-center text-amber-600 hover:text-amber-700 mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              Continue Shopping
            </Link>
          </div>

          <div className="text-center py-16">
            <ShoppingBag className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your cart is empty
            </h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Link to="/products">
              <Button className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Link
            to="/"
            className="flex items-center text-amber-600 hover:text-amber-700"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Continue Shopping
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center p-6 border-b border-gray-200 last:border-b-0"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg mr-4"
                  />

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {item.size && <span>Size: {item.size}</span>}
                      {item.color && <span>Color: {item.color}</span>}
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          disabled={updating === item.productId}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <span className="w-8 text-center font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          disabled={updating === item.productId}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          ₹{item.price * item.quantity}
                        </div>
                        {item.originalPrice &&
                          item.originalPrice > item.price && (
                            <div className="text-sm text-gray-500 line-through">
                              ₹{item.originalPrice * item.quantity}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeItem(item.productId)}
                    disabled={updating === item.productId}
                    className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₹{calculateSubtotal()}</span>
                </div>

                {calculateSavings() > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>You Save</span>
                    <span className="font-medium">₹{calculateSavings()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">FREE</span>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>₹{calculateTotal()}</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-lg"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </Button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Free shipping on orders over ₹999
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
