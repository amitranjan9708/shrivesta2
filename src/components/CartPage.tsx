import React, { useState, useEffect, useCallback } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, RefreshCw, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Link, useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// Add CSS for mobile full-width cart items
const cartMobileStyles = `
  /* Base styles - Desktop first */
  .cart-item-mobile,
  .cart-item-content-mobile {
    display: none !important;
  }
  .cart-item-desktop {
    display: flex !important;
    align-items: center !important;
    gap: 1.5rem !important;
    padding: 1.5rem !important;
    width: 100% !important;
  }
  
  /* Mobile overrides */
  @media (max-width: 767px) {
    .cart-container-mobile {
      padding-left: 0 !important;
      padding-right: 0 !important;
      max-width: 100% !important;
    }
    .cart-item-mobile {
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
    }
    .cart-item-content-mobile {
      display: block !important;
      width: 100% !important;
      padding: 16px !important;
    }
    .cart-item-desktop {
      display: none !important;
    }
  }
`;

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
  const { isAuthenticated, isLoading } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  // Redirect to login if not authenticated (after auth check completes)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
      return;
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Refresh cart function
  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getCart();
      
      if (response.success && response.data) {
        // Handle nested response structure: response.data.data.items
        const nestedData = (response.data as any).data;
        const data = nestedData || response.data;
        const items = data.items || [];
        
        if (!items || items.length === 0) {
          setCartItems([]);
          setError("");
          setLoading(false);
          return;
        }
        
        const mappedItems = (items || []).map((item: any) => {
          return {
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
        });
        
        setCartItems([...mappedItems]);
      } else {
        const errorMsg = response.error || "Failed to fetch cart items";
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = "An error occurred while fetching cart items";
      setError(errorMsg);
    } finally {
      setLoading(false);
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

  // Listen for cart-cleared event (dispatched after successful order)
  useEffect(() => {
    const handleCartCleared = () => {
      if (isAuthenticated) {
        refreshCart();
      }
    };

    window.addEventListener('cart-cleared', handleCartCleared);

    return () => {
      window.removeEventListener('cart-cleared', handleCartCleared);
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

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

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
    <>
      <style>{cartMobileStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 py-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto cart-container-mobile">
        {/* Header with padding on mobile */}
        <div className="px-4 sm:px-6 lg:px-8">
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
        </div>

        <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Cart Items - Left Side */}
          <div className="w-full lg:w-auto lg:flex-1 min-w-0">
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
                    >
                      {/* Mobile Layout - Vertical Stack - Everything below image */}
                      <div className="cart-item-mobile">
                      <div className="cart-item-content-mobile">
                        {/* Image - Full width on mobile, at the top */}
                        <div style={{ width: '100%', marginBottom: '20px', display: 'block' }}>
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            style={{
                              width: '100%',
                              height: '280px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              display: 'block'
                            }}
                            className="shadow-sm"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                        </div>

                        {/* Title - Below image, full width */}
                        <div style={{ width: '100%', marginBottom: '12px', display: 'block' }}>
                          <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', margin: 0 }}>
                            {item.name}
                          </h3>
                        </div>

                        {/* Size/Color Info - Below title, full width */}
                        {(item.size || item.color) && (
                          <div style={{ width: '100%', marginBottom: '16px', display: 'block' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {item.size && (
                                <span style={{ 
                                  backgroundColor: '#f3f4f6', 
                                  padding: '6px 12px', 
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  color: '#4b5563'
                                }}>
                                  Size: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span style={{ 
                                  backgroundColor: '#f3f4f6', 
                                  padding: '6px 12px', 
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  color: '#4b5563'
                                }}>
                                  Color: {item.color}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Price - Below size/color, full width */}
                        <div style={{ width: '100%', marginBottom: '20px', display: 'block' }}>
                          <div style={{ fontSize: '24px', fontWeight: '700', color: '#111827' }}>
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <div style={{ fontSize: '14px', color: '#6b7280', textDecoration: 'line-through', marginTop: '4px' }}>
                                ₹{(item.originalPrice * item.quantity).toLocaleString()}
                              </div>
                            )}
                        </div>

                        {/* Quantity Controls - Below price, full width, centered */}
                        <div style={{ width: '100%', marginBottom: '20px', display: 'block' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              disabled={updating === item.productId}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                border: '2px solid #d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white',
                                cursor: updating === item.productId ? 'not-allowed' : 'pointer',
                                opacity: updating === item.productId ? 0.5 : 1
                              }}
                              onMouseEnter={(e) => {
                                if (!updating) {
                                  e.currentTarget.style.backgroundColor = '#fef3c7';
                                  e.currentTarget.style.borderColor = '#f59e0b';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#d1d5db';
                              }}
                            >
                              <Minus className="h-5 w-5" />
                            </button>

                            <span style={{ 
                              width: '80px', 
                              textAlign: 'center', 
                              fontWeight: '600', 
                              fontSize: '20px',
                              margin: '0 24px'
                            }}>
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              disabled={updating === item.productId}
                              style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '50%',
                                border: '2px solid #d1d5db',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'white',
                                cursor: updating === item.productId ? 'not-allowed' : 'pointer',
                                opacity: updating === item.productId ? 0.5 : 1
                              }}
                              onMouseEnter={(e) => {
                                if (!updating) {
                                  e.currentTarget.style.backgroundColor = '#fef3c7';
                                  e.currentTarget.style.borderColor = '#f59e0b';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'white';
                                e.currentTarget.style.borderColor = '#d1d5db';
                              }}
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Delete Button - Below quantity, full width, centered */}
                        <div style={{ width: '100%', display: 'block' }}>
                          <button
                            onClick={() => removeItem(item.productId)}
                            disabled={updating === item.productId}
                            style={{
                              width: '100%',
                              padding: '12px 24px',
                              color: '#dc2626',
                              backgroundColor: 'white',
                              border: '2px solid #fecaca',
                              borderRadius: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px',
                              fontWeight: '500',
                              cursor: updating === item.productId ? 'not-allowed' : 'pointer',
                              opacity: updating === item.productId ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                              if (!updating) {
                                e.currentTarget.style.backgroundColor = '#fef2f2';
                                e.currentTarget.style.color = '#b91c1c';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'white';
                              e.currentTarget.style.color = '#dc2626';
                            }}
                          >
                            <Trash2 className="h-5 w-5" />
                            <span>Remove Item</span>
                          </button>
                        </div>
                      </div>
                      </div>

                      {/* Desktop Layout - Horizontal */}
                      <div 
                        className="cart-item-desktop" 
                        style={{
                          background: 'linear-gradient(to right, #ffffff, #fefce8)',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          transition: 'all 0.3s ease',
                          border: '1px solid #fde68a',
                          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(251, 191, 36, 0.2)';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.borderColor = '#fbbf24';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(251, 191, 36, 0.1)';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = '#fde68a';
                        }}
                      >
                        {/* Image - Larger on desktop */}
                        <div style={{ 
                          flexShrink: 0,
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '12px',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                        }}>
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            style={{ 
                              width: '180px', 
                              height: '180px', 
                              objectFit: 'cover', 
                              borderRadius: '12px',
                              border: '2px solid #fbbf24',
                              transition: 'transform 0.3s ease'
                            }}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          />
                        </div>

                        {/* Product Info - Middle Section */}
                        <div style={{ 
                          flex: 1, 
                          minWidth: 0, 
                          paddingLeft: '1.5rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}>
                          {/* Top Section: Name and Attributes */}
                          <div>
                            <h3 style={{ 
                              fontSize: '1.5rem', 
                              fontWeight: '700', 
                              color: '#111827', 
                              marginBottom: '0.75rem',
                              letterSpacing: '-0.025em',
                              lineHeight: '1.3',
                              marginTop: 0
                            }}>
                              {item.name}
                            </h3>
                            {(item.size || item.color) && (
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '0.75rem', 
                                fontSize: '0.875rem', 
                                color: '#6b7280', 
                                marginBottom: '1.25rem',
                                flexWrap: 'wrap'
                              }}>
                                {item.size && (
                                  <span style={{
                                    padding: '0.375rem 0.875rem',
                                    background: '#fef3c7',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    border: '1px solid #fde68a',
                                    fontSize: '0.8125rem'
                                  }}>
                                    Size: {item.size}
                                  </span>
                                )}
                                {item.color && (
                                  <span style={{
                                    padding: '0.375rem 0.875rem',
                                    background: '#fef3c7',
                                    borderRadius: '8px',
                                    fontWeight: '600',
                                    border: '1px solid #fde68a',
                                    fontSize: '0.8125rem'
                                  }}>
                                    Color: {item.color}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Bottom Section: Quantity Controls */}
                          <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.75rem',
                            marginTop: 'auto'
                          }}>
                            <span style={{ 
                              fontSize: '0.9375rem', 
                              fontWeight: '600', 
                              color: '#92400e',
                              marginRight: '0.25rem'
                            }}>
                              Quantity:
                            </span>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: '0.5rem',
                              padding: '0.5rem',
                              background: 'white',
                              borderRadius: '10px',
                              border: '2px solid #fde68a',
                              boxShadow: '0 2px 4px rgba(251, 191, 36, 0.1)'
                            }}>
                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity - 1)
                                }
                                disabled={updating === item.productId}
                                style={{
                                  width: '2.25rem',
                                  height: '2.25rem',
                                  borderRadius: '8px',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: updating === item.productId ? 'not-allowed' : 'pointer',
                                  opacity: updating === item.productId ? 0.5 : 1,
                                  backgroundColor: '#fef3c7',
                                  transition: 'all 0.2s',
                                  color: '#92400e',
                                  fontWeight: 'bold'
                                }}
                                onMouseEnter={(e) => {
                                  if (!updating) {
                                    e.currentTarget.style.backgroundColor = '#fbbf24';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fef3c7';
                                  e.currentTarget.style.color = '#92400e';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <Minus className="h-4 w-4" />
                              </button>

                              <span style={{ 
                                width: '2.5rem', 
                                textAlign: 'center', 
                                fontWeight: '700', 
                                fontSize: '1.125rem',
                                color: '#92400e'
                              }}>
                                {item.quantity}
                              </span>

                              <button
                                onClick={() =>
                                  updateQuantity(item.productId, item.quantity + 1)
                                }
                                disabled={updating === item.productId}
                                style={{
                                  width: '2.25rem',
                                  height: '2.25rem',
                                  borderRadius: '8px',
                                  border: 'none',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: updating === item.productId ? 'not-allowed' : 'pointer',
                                  opacity: updating === item.productId ? 0.5 : 1,
                                  backgroundColor: '#fef3c7',
                                  transition: 'all 0.2s',
                                  color: '#92400e',
                                  fontWeight: 'bold'
                                }}
                                onMouseEnter={(e) => {
                                  if (!updating) {
                                    e.currentTarget.style.backgroundColor = '#fbbf24';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.backgroundColor = '#fef3c7';
                                  e.currentTarget.style.color = '#92400e';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Price - Desktop */}
                        <div style={{ 
                          flexShrink: 0, 
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'flex-end',
                          paddingLeft: '1.5rem',
                          paddingRight: '1rem',
                          minWidth: '180px'
                        }}>
                          {/* Current Price */}
                          <div style={{ 
                            fontSize: '1.875rem', 
                            fontWeight: '800', 
                            color: '#92400e',
                            marginBottom: '0.5rem',
                            letterSpacing: '-0.025em',
                            lineHeight: '1.2'
                          }}>
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                          
                          {/* Original Price and Savings */}
                          {item.originalPrice && item.originalPrice > item.price && (
                            <div style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-end',
                              gap: '0.375rem'
                            }}>
                              <div style={{ 
                                fontSize: '1rem', 
                                color: '#9ca3af', 
                                textDecoration: 'line-through',
                                lineHeight: '1.2'
                              }}>
                                ₹{(item.originalPrice * item.quantity).toLocaleString()}
                              </div>
                              <div style={{
                                fontSize: '0.8125rem',
                                color: '#059669',
                                fontWeight: '700',
                                padding: '0.375rem 0.75rem',
                                background: '#d1fae5',
                                borderRadius: '8px',
                                border: '1px solid #86efac',
                                whiteSpace: 'nowrap'
                              }}>
                                Save ₹{((item.originalPrice - item.price) * item.quantity).toLocaleString()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Delete Button - Desktop */}
                        <button
                          onClick={() => removeItem(item.productId)}
                          disabled={updating === item.productId}
                          title="Remove from cart"
                          style={{
                            flexShrink: 0,
                            padding: '0.875rem',
                            color: '#dc2626',
                            backgroundColor: '#fef2f2',
                            borderRadius: '12px',
                            cursor: updating === item.productId ? 'not-allowed' : 'pointer',
                            opacity: updating === item.productId ? 0.5 : 1,
                            border: '2px solid #fecaca',
                            transition: 'all 0.3s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          onMouseEnter={(e) => {
                            if (!updating) {
                              e.currentTarget.style.backgroundColor = '#dc2626';
                              e.currentTarget.style.color = 'white';
                              e.currentTarget.style.borderColor = '#dc2626';
                              e.currentTarget.style.transform = 'scale(1.1) rotate(5deg)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fef2f2';
                            e.currentTarget.style.color = '#dc2626';
                            e.currentTarget.style.borderColor = '#fecaca';
                            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Order Summary - Right Side */}
          <div className="w-full lg:w-96 lg:flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-100 lg:sticky lg:top-8">
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
      </div>
    </>
  );
}
