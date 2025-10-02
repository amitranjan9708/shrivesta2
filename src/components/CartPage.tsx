import React, { useState } from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

// Mock cart data - in a real app, this would come from a state management solution
const initialCartItems = [
  {
    id: 1,
    name: "Pure Cotton Kurti",
    price: 2999,
    originalPrice: 4999,
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
    size: "M",
    color: "Pink",
    quantity: 2
  },
  {
    id: 2,
    name: "Royal Rajasthani Kurti",
    price: 3499,
    originalPrice: 5999,
    image: "https://images.unsplash.com/photo-1717585679395-bbe39b5fb6bc?q=80&w=400&auto=format&fit=crop",
    size: "L",
    color: "Blue",
    quantity: 1
  },
  {
    id: 3,
    name: "Office to Evening Kurti",
    price: 2799,
    originalPrice: 4299,
    image: "https://images.unsplash.com/photo-1697685070059-4b8d49125af1?q=80&w=400&auto=format&fit=crop",
    size: "S",
    color: "Black",
    quantity: 1
  }
];

export function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000 ? 0 : 299;
  const total = subtotal + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto h-24 w-24 text-gray-300 mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
            <Link to="/collections">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white px-8 py-3 rounded-full text-lg font-semibold">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/">
            <Button variant="ghost" className="hover:bg-amber-100">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent">
            Shopping Cart ({cartItems.length} items)
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 hover:shadow-xl transition-shadow">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full sm:w-32 h-48 sm:h-32 object-cover rounded-xl"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                      <div className="flex gap-4 text-sm text-gray-600 mt-1">
                        <span>Size: {item.size}</span>
                        <span>Color: {item.color}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-amber-600">₹{item.price.toLocaleString()}</span>
                      <span className="text-lg text-gray-400 line-through">₹{item.originalPrice.toLocaleString()}</span>
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {Math.round((1 - item.price / item.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-8 w-8 rounded-full border-amber-300 hover:bg-amber-50"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold text-lg w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-8 w-8 rounded-full border-amber-300 hover:bg-amber-50"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-amber-100 p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between text-lg">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-lg">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-600 font-semibold" : ""}>
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>
                
                {shipping > 0 && (
                  <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                    Add ₹{(5000 - subtotal).toLocaleString()} more for free shipping!
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span className="text-amber-600">₹{total.toLocaleString()}</span>
                </div>
              </div>
              
              <Button className="w-full mt-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-3 rounded-full text-lg font-semibold">
                Proceed to Checkout
              </Button>
              
              <div className="mt-4 text-center">
                <Link to="/collections" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
