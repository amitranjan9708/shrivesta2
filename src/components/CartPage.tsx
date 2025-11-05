import React, { useState, useEffect, useCallback } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, RefreshCw, ArrowRight } from "lucide-react";
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

  // Refresh cart function
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getCart();
      console.log("=== CART REFRESH DEBUG ===");
      console.log("Full API Response:", JSON.stringify(response, null, 2));
      
      if (response.success && response.data) {
        // Handle nested response structure: response.data.data.items
        const nestedData = (response.data as any).data;
        const data = nestedData || response.data;
        const items = data.items || [];
        
        console.log("Cart data object:", data);
        console.log("Cart items:", items);
        console.log("Cart items type:", typeof items);
        console.log("Cart items is array?", Array.isArray(items));
        console.log("Cart items length:", items?.length);
        
        if (!items || items.length === 0) {
          console.log("Cart is empty - setting empty array");
          setCartItems([]);
          setError("");
          setLoading(false);
          return;
        }
        
        console.log("Processing", items.length, "cart items");
        const mappedItems = (items || []).map((item: any, index: number) => {
          console.log(`Mapping item ${index}:`, item);
          console.log(`Item ${index} product:`, item.product);
          const mapped = {
            id: item.id.toString(),
            productId: item.productId.toString(),
            name: item.product?.product || item.product?.name || "Product",
            price: item.product?.salePrice || item.product?.price || 0,
            originalPrice: item.product?.oldPrice || item.product?.originalPrice,
            image: item.product?.imageUrls?.[0] || item.product?.image || "",
            quantity: item.quantity || 1,
            product: {
              id: item.product?.id?.toString() || item.productId.toString(),
              name: item.product?.product || item.product?.name || "Product",
              images: item.product?.imageUrls || [],
              price: item.product?.salePrice || item.product?.price || 0,
              vipPrice: item.product?.oldPrice || item.product?.vipPrice || 0,
              salePrice: item.product?.salePrice || item.product?.price || 0,
            },
          };
          console.log(`Mapped item ${index}:`, mapped);
          return mapped;
        });
        
        console.log("=== MAPPED ITEMS ===");
        console.log("Total mapped items:", mappedItems.length);
        console.log("Mapped items array:", mappedItems);
        console.log("Setting cartItems state...");
        
        // Create new array reference to ensure React detects the change
        setCartItems([...mappedItems]);
        console.log("Cart items state set successfully");
      } else {
        const errorMsg = response.error || "Failed to fetch cart items";
        console.error("Cart fetch failed:", errorMsg);
        console.error("Response:", response);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = "An error occurred while fetching cart items";
      console.error("Error fetching cart:", err);
      setError(errorMsg);
    } finally {
      setLoading(false);
      console.log("=== END CART REFRESH DEBUG ===");
    }
  }, [isAuthenticated]);

  // Fetch cart items on mount and when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      setCartItems([]);
      setLoading(false);
    }
  }, [isAuthenticated, refreshCart]);

  // Refresh cart when component becomes visible (user navigates to cart page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        refreshCart();
      }
    };

    // Listen for visibility changes (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Refresh on focus (when user returns to tab)
    window.addEventListener('focus', refreshCart);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshCart);
    };
  }, [isAuthenticated, refreshCart]);

  const updateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      await removeItem(productId);
      return;
    }

    try {
      setUpdating(productId);
      const response = await apiService.updateCartItem(productId, newQuantity);
      if (response.success) {
        // Refresh cart to get latest data from server
        await refreshCart();
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
        // Refresh cart to get latest data from server
        await refreshCart();
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

  const calculateShipping = () => {
    const subtotal = calculateSubtotal();
    return subtotal > 1000 ? 0 : 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping();
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
            onClick={refreshCart}
            className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Cart
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
            
            {/* Debug Info */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm font-semibold mb-2">Debug Info:</p>
              <p className="text-xs text-gray-600">Cart Items Count: {cartItems.length}</p>
              <p className="text-xs text-gray-600">Loading: {loading ? "Yes" : "No"}</p>
              <p className="text-xs text-gray-600">Error: {error || "None"}</p>
              <p className="text-xs text-gray-600">Authenticated: {isAuthenticated ? "Yes" : "No"}</p>
              <button
                onClick={refreshCart}
                className="mt-4 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 text-sm"
              >
                Refresh Cart
              </button>
            </div>
            
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-8 pb-24 lg:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 bg-clip-text text-transparent">Shopping Cart</h1>
              <div className="flex items-center gap-4">
            <button
              onClick={refreshCart}
              className="flex items-center text-gray-600 hover:text-amber-600 gap-2 transition-colors p-2 rounded-lg hover:bg-amber-50"
              title="Refresh cart"
            >
              <RefreshCw className="h-5 w-5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <Link
              to="/"
              className="flex items-center text-amber-600 hover:text-amber-700 font-medium transition-colors p-2 rounded-lg hover:bg-amber-50"
            >
              <ArrowLeft className="h-5 w-5 mr-1" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {cartItems.length === 0 ? (
                  <div className="p-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mb-6">Add some items to get started</p>
                  <Link to="/products">
                    <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
                      Browse Products
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.id}-${item.productId}-${index}`}
                      className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                    >
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.name}
                        className="w-32 h-32 sm:w-36 sm:h-36 object-cover rounded-lg mr-4 mb-4 sm:mb-0 flex-shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.png';
                        }}
                      />

                    <div className="flex-1 w-full sm:w-auto">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {item.name}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            disabled={updating === item.productId}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>

                          <span className="w-12 text-center font-semibold text-lg">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={updating === item.productId}
                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-amber-50 hover:border-amber-400 disabled:opacity-50 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <div className="text-sm text-gray-500 line-through">
                                ₹{(item.originalPrice * item.quantity).toLocaleString()}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        disabled={updating === item.productId}
                        className="ml-auto sm:ml-4 mt-4 sm:mt-0 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg disabled:opacity-50 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8 border-2 border-amber-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                Order Summary
              </h2>

              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Subtotal</span>
                      <span className="font-semibold">₹{calculateSubtotal().toLocaleString()}</span>
                    </div>

                    {calculateSavings() > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span className="font-medium">You Save</span>
                        <span className="font-bold">₹{calculateSavings().toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-700">
                      <span className="font-medium">Shipping</span>
                      <span className={`font-semibold ${calculateShipping() === 0 ? 'text-green-600' : ''}`}>
                        {calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping()}`}
                      </span>
                    </div>

                    <div className="border-t-2 border-amber-200 pt-4 mt-4">
                      <div className="flex justify-between text-xl font-bold text-gray-900">
                        <span>Total</span>
                        <span className="text-amber-600">₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button - Prominent and Always Visible */}
                  <button
                    type="button"
                    onClick={() => {
                      console.log("Checkout button clicked, cartItems.length:", cartItems.length);
                      navigate("/checkout");
                    }}
                    className="w-full mt-6 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] border-2 border-amber-800 flex items-center justify-center gap-2"
                    style={{ 
                      minHeight: '56px',
                      position: 'relative',
                      zIndex: 10
                    }}
                  >
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <span className="text-green-600 font-semibold">✓</span>
                      Free shipping on orders over ₹999
                    </p>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">Add items to proceed</p>
                  <Link to="/products">
                    <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 py-3 px-6 rounded-lg font-semibold transition-colors">
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile/Sticky Checkout Button - Always visible when items exist */}
        {cartItems.length > 0 && (
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-amber-200 shadow-2xl p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-600">Total</p>
                <p className="text-xl font-bold text-amber-600">₹{calculateTotal().toLocaleString()}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  console.log("Mobile checkout button clicked");
                  navigate("/checkout");
                }}
                className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white py-3 px-6 rounded-xl font-bold text-lg shadow-lg"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
