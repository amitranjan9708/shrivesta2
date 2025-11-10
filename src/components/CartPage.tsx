import React, { useState, useEffect, useCallback } from "react";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, RefreshCw, ArrowRight, Check, Share2, Heart, Clock, X } from "lucide-react";
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
    .cart-page-wrapper {
      padding-top: 0 !important;
      background: #f5f5f5 !important;
    }
    .cart-container-mobile {
      padding-left: 0 !important;
      padding-right: 0 !important;
      padding-top: 0 !important;
      max-width: 100% !important;
      background: #f5f5f5 !important;
    }
    .cart-items-container {
      display: flex !important;
      flex-direction: column !important;
      gap: 8px !important;
      padding: 0 !important;
      background: #f5f5f5 !important;
    }
    .cart-item-mobile {
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      display: block !important;
      background: white !important;
      border-radius: 0 !important;
      border: none !important;
      box-shadow: none !important;
    }
    .cart-item-content-mobile {
      display: block !important;
      width: 100% !important;
      padding: 14px 16px !important;
      background: white !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .cart-item-desktop {
      display: none !important;
    }
    .cart-item-image {
      width: 100% !important;
      height: auto !important;
      aspect-ratio: 3/4 !important;
      object-fit: cover !important;
      border-radius: 0 !important;
      margin-bottom: 12px !important;
    }
    .cart-item-title {
      font-size: 14px !important;
      font-weight: 400 !important;
      color: #000000 !important;
      line-height: 1.5 !important;
      margin-bottom: 8px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .cart-item-price {
      font-size: 18px !important;
      font-weight: 500 !important;
      color: #000000 !important;
      margin-bottom: 12px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .cart-item-old-price {
      font-size: 14px !important;
      color: #666666 !important;
      text-decoration: line-through !important;
      font-weight: 400 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .cart-order-summary {
      background: white !important;
      border-radius: 0 !important;
      border: none !important;
      box-shadow: none !important;
      padding: 14px 16px !important;
      margin-top: 8px !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .cart-order-summary h2 {
      font-size: 14px !important;
      font-weight: 500 !important;
      color: #000000 !important;
      letter-spacing: 0.3px !important;
      margin-bottom: 16px !important;
      padding-bottom: 12px !important;
      border-bottom: 1px solid #e5e7eb !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .cart-order-summary div {
      font-size: 12px !important;
      color: #1a1a1a !important;
      font-weight: 400 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .cart-order-summary span {
      font-size: 12px !important;
      color: #1a1a1a !important;
      font-weight: 400 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    }
    .cart-order-summary .total-text {
      font-size: 13px !important;
      font-weight: 500 !important;
      color: #000000 !important;
    }
    .cart-order-summary .total-amount {
      font-size: 18px !important;
      font-weight: 500 !important;
      color: #000000 !important;
    }
    .cart-header-mobile {
      background: #f5f5f5 !important;
      padding-top: 16px !important;
      padding-bottom: 16px !important;
    }
    .cart-header-mobile h1 {
      font-size: 18px !important;
      font-weight: 500 !important;
      color: #000000 !important;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
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
  const [pincode, setPincode] = useState("");

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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50 pb-24 pt-0 lg:pb-8 lg:pt-8 md:bg-gradient-to-br md:from-gray-50 md:to-amber-50 md:py-8 cart-page-wrapper">
        <div className="max-w-7xl mx-auto cart-container-mobile">
        {/* Header with padding on mobile - Hidden on mobile, shown on desktop */}
        <div className="hidden md:block px-4 sm:px-6 lg:px-8 md:px-6 cart-header-mobile md:bg-transparent md:py-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4 md:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 md:text-3xl md:font-bold md:text-gray-900">Shopping Cart</h1>
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

        <div className="px-0 sm:px-6 lg:px-8 md:px-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start md:flex-row md:gap-8">
          {/* Cart Items - Left Side */}
          <div className="w-full lg:w-auto lg:flex-1 min-w-0 md:w-auto md:flex-1">
            {/* Myntra-style Mobile Header */}
            <div className="md:hidden mb-2">
              <div className="bg-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Link to="/" className="text-black">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                  <span style={{ fontSize: '14px', fontWeight: '500', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>SHOPPING BAG</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '400', color: '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>STEP 1/3</span>
              </div>
            </div>

            {/* Check Delivery Section - Mobile Only */}
            {cartItems.length > 0 && (
              <div className="md:hidden mb-2">
                <div className="bg-white px-4 py-3">
                  <h3 style={{ fontSize: '13px', fontWeight: '500', color: '#000', marginBottom: '12px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                    Check delivery time & services
                  </h3>
                  <input
                    type="text"
                    placeholder="ENTER PIN CODE"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      setPincode(value);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items Selected Summary - Mobile Only */}
            {cartItems.length > 0 && (
              <div className="md:hidden mb-2">
                <div className="bg-white px-4 py-3 flex items-center justify-between">
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '400', color: '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                      {cartItems.length}/{cartItems.length} ITEMS SELECTED
                    </span>
                    <div style={{ fontSize: '16px', fontWeight: '500', color: '#000', marginTop: '4px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                      ₹{calculateSubtotal().toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Share2 className="h-5 w-5 text-gray-600" />
                    <Trash2 className="h-5 w-5 text-gray-600" />
                    <Heart className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md overflow-hidden md:bg-white md:rounded-xl md:shadow-md">
              {cartItems.length === 0 ? (
                  <div className="p-12 text-center">
                  <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
                  <p className="text-sm text-gray-400 mb-6">Add some items to get started</p>
                  <Link to="/products">
                    <button 
                      style={{
                        background: 'linear-gradient(to right, #F59E0B, #FBBF24)',
                        color: '#000',
                        padding: '16px 32px',
                        borderRadius: '9999px',
                        fontSize: '1.125rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Browse Products
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 cart-items-container md:divide-y md:divide-gray-200">
                  {cartItems.map((item, index) => (
                    <div
                      key={`${item.id}-${item.productId}-${index}`}
                    >
                      {/* Mobile Layout - Vertical Stack - Everything below image */}
                      <div className="cart-item-mobile">
                      <div className="cart-item-content-mobile">
                        {/* Image - Full width on mobile, at the top with checkmark overlay */}
                        <div style={{ width: '100%', marginBottom: '12px', display: 'block', position: 'relative' }}>
                          <img
                            src={item.image || '/placeholder.png'}
                            alt={item.name}
                            className="cart-item-image"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.png';
                            }}
                          />
                          <div style={{
                            position: 'absolute',
                            top: '8px',
                            left: '8px',
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: '#ff3f6c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white'
                          }}>
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          {/* Remove Button - Top Right */}
                          <button
                            onClick={() => removeItem(item.productId)}
                            disabled={updating === item.productId}
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: 'white',
                              border: '1px solid #d1d5db',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: updating === item.productId ? 'not-allowed' : 'pointer',
                              opacity: updating === item.productId ? 0.6 : 1,
                              transition: 'all 0.2s',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => {
                              if (!updating) {
                                e.currentTarget.style.background = '#f3f4f6';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'white';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Remove item"
                          >
                            <X className="h-4 w-4 text-gray-700" />
                          </button>
                        </div>

                        {/* Brand Name */}
                        <div style={{ width: '100%', marginBottom: '4px', display: 'block' }}>
                          <span style={{ fontSize: '12px', fontWeight: '400', color: '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                            {item.name.split(' ').slice(0, 3).join(' ')}
                          </span>
                        </div>

                        {/* Product Name - Below brand, full width */}
                        <div style={{ width: '100%', marginBottom: '8px', display: 'block' }}>
                          <h3 className="cart-item-title" style={{ fontSize: '13px', fontWeight: '400', color: '#000', lineHeight: '1.4' }}>
                            {item.name}
                          </h3>
                        </div>

                        {/* Sold By */}
                        <div style={{ width: '100%', marginBottom: '12px', display: 'block' }}>
                          <span style={{ fontSize: '11px', fontWeight: '400', color: '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                            Sold by: SHRIVESTA
                          </span>
                        </div>

                        {/* Size and Quantity Dropdowns */}
                        <div style={{ width: '100%', marginBottom: '12px', display: 'flex', gap: '12px' }}>
                          {item.size && (
                            <div style={{ flex: 1 }}>
                              <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'space-between',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '12px',
                                color: '#000',
                                fontWeight: '400',
                                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                background: 'white'
                              }}>
                                <span>Size: {item.size}</span>
                                <span style={{ fontSize: '12px' }}>▼</span>
                              </div>
                            </div>
                          )}
                          <div style={{ flex: 1, position: 'relative' }}>
                            <div style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '12px',
                              color: '#000',
                              fontWeight: '400',
                              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                              background: 'white',
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              // Toggle dropdown or show quantity controls
                              const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                              if (dropdown) {
                                // Close all other dropdowns first
                                document.querySelectorAll('.quantity-dropdown').forEach((d) => {
                                  if (d !== dropdown) {
                                    (d as HTMLElement).style.display = 'none';
                                  }
                                });
                                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                              }
                            }}
                            >
                              <span>Qty: {item.quantity}</span>
                              <span style={{ fontSize: '12px' }}>▼</span>
                            </div>
                            {/* Quantity Dropdown Menu */}
                            <div style={{
                              position: 'absolute',
                              top: '100%',
                              left: 0,
                              right: 0,
                              marginTop: '4px',
                              background: 'white',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                              zIndex: 10,
                              display: 'none'
                            }}
                            className={`quantity-dropdown quantity-dropdown-${item.productId}`}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((qty) => (
                                <div
                                  key={qty}
                                  onClick={() => {
                                    if (qty === 0) {
                                      removeItem(item.productId);
                                    } else {
                                      updateQuantity(item.productId, qty);
                                    }
                                    const dropdown = document.querySelector(`.quantity-dropdown-${item.productId}`) as HTMLElement;
                                    if (dropdown) dropdown.style.display = 'none';
                                  }}
                                  style={{
                                    padding: '10px 12px',
                                    fontSize: '12px',
                                    color: '#000',
                                    cursor: 'pointer',
                                    borderBottom: '1px solid #f3f4f6',
                                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f9fafb';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'white';
                                  }}
                                >
                                  {qty}
                                </div>
                              ))}
                              <div
                                onClick={() => {
                                  removeItem(item.productId);
                                  const dropdown = document.querySelector(`.quantity-dropdown-${item.productId}`) as HTMLElement;
                                  if (dropdown) dropdown.style.display = 'none';
                                }}
                                style={{
                                  padding: '10px 12px',
                                  fontSize: '12px',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                                  fontWeight: '500'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#fef2f2';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'white';
                                }}
                              >
                                Remove
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Price - Below size/color, full width */}
                        <div style={{ width: '100%', marginBottom: '12px', display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: '16px', fontWeight: '500', color: '#000', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </div>
                          {item.originalPrice &&
                            item.originalPrice > item.price && (
                              <>
                                <div style={{ fontSize: '13px', color: '#666', textDecoration: 'line-through', fontWeight: '400', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                                  ₹{(item.originalPrice * item.quantity).toLocaleString()}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#ff3f6c', 
                                  fontWeight: '500',
                                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
                                }}>
                                  ₹{((item.originalPrice - item.price) * item.quantity).toLocaleString()} OFF
                                </div>
                              </>
                            )}
                        </div>

                        {/* Return Policy */}
                        <div style={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Clock className="h-4 w-4 text-gray-600" />
                          <span style={{ fontSize: '11px', fontWeight: '400', color: '#666', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                            14 days return available
                          </span>
                        </div>

                      </div>
                      </div>

                      {/* Desktop Layout - Horizontal */}
                      <div 
                        className="cart-item-desktop" 
                        style={{
                          background: 'linear-gradient(to right, #ffffff, #fefce8)',
                          borderRadius: '12px',
                          
                          transition: 'all 0.3s ease',
                          border: '1px solid #fde68a',
                          boxShadow: '0 2px 8px rgba(251, 191, 36, 0.1)'
                        }}
                        
                      >
                        {/* Image - Larger on desktop */}
                        <div style={{ 
                          flexShrink: 0,
                          position: 'relative',
                          overflow: 'hidden',
                          borderRadius: '8px',
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
          <div className="w-full lg:w-96 lg:flex-shrink-0 md:w-96 md:flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-amber-100 lg:sticky lg:top-8 cart-order-summary md:bg-white md:rounded-xl md:shadow-lg md:p-6 md:border-2 md:border-amber-100 md:sticky md:top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200 md:text-2xl md:font-bold md:text-gray-900 md:mb-6 md:pb-4 md:border-b md:border-gray-200">
                Order Summary
              </h2>

              {cartItems.length > 0 ? (
                <>
                  <div className="space-y-4 mb-6 md:space-y-4 md:mb-6">
                    <div className="flex justify-between text-gray-700 md:flex md:justify-between md:text-gray-700">
                      <span className="font-medium md:font-medium" style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: '400', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Subtotal</span>
                      <span className="font-semibold md:font-semibold" style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: '400', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>₹{calculateSubtotal().toLocaleString()}</span>
                    </div>

                    {calculateSavings() > 0 && (
                      <div className="flex justify-between text-green-600 md:flex md:justify-between md:text-green-600">
                        <span className="font-medium md:font-medium" style={{ fontSize: '12px', color: '#059669', fontWeight: '400', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>You Save</span>
                        <span className="font-bold md:font-bold" style={{ fontSize: '12px', color: '#059669', fontWeight: '400', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>₹{calculateSavings().toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-gray-700 md:flex md:justify-between md:text-gray-700">
                      <span className="font-medium md:font-medium" style={{ fontSize: '12px', color: '#1a1a1a', fontWeight: '400', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>Shipping</span>
                      <span className={`font-semibold md:font-semibold ${calculateShipping() === 0 ? 'text-green-600' : ''}`} style={{ fontSize: '12px', color: calculateShipping() === 0 ? '#059669' : '#1a1a1a', fontWeight: '400', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                        {calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping()}`}
                      </span>
                    </div>

                    <div className="border-t-2 border-amber-200 pt-4 mt-4 md:border-t-2 md:border-amber-200 md:pt-4 md:mt-4">
                      <div className="flex justify-between text-xl font-bold text-gray-900 md:flex md:justify-between md:text-xl md:font-bold md:text-gray-900">
                        <span className="total-text">Total</span>
                        <span className="total-amount">₹{calculateTotal().toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Checkout Button - Prominent and Always Visible */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/checkout");
                    }}
                    className="w-full mt-6 flex items-center justify-center gap-2"
                    style={{ 
                      background: 'linear-gradient(to right, #F59E0B, #FBBF24)',
                      color: '#000',
                      padding: '16px 32px',
                      borderRadius: '9999px',
                      fontSize: '1.125rem',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
                      border: 'none',
                      minHeight: '56px',
                      position: 'relative',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.3)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
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
                    <button 
                      style={{
                        width: '100%',
                        background: 'linear-gradient(to right, #F59E0B, #FBBF24)',
                        color: '#000',
                        padding: '16px 32px',
                        borderRadius: '9999px',
                        fontSize: '1.125rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        boxShadow: '0 10px 15px rgba(0,0,0,0.2)',
                        border: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow = '0 12px 20px rgba(0,0,0,0.3)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.2)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      Continue Shopping
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        
        </div>
        </div>
      </div>
    </>
  );
}
